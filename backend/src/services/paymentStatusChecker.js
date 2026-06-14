const paypack = require('./paypack.service');

async function checkPendingPayments() {
  try {
    const connection = global.dbConnection;
    if (!connection) return;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [pendingPayments] = await connection.execute(`
      SELECT * FROM payments
      WHERE status = 'pending' AND provider = 'paypack' AND provider_reference IS NOT NULL
        AND created_at >= ?
      LIMIT 50
    `, [oneDayAgo]);

    if (!pendingPayments.length) return;

    for (const payment of pendingPayments) {
      try {
        const result = await paypack.checkPaymentStatus(payment.provider_reference);

        if (result.status === 'successful') {
          await connection.execute(
            `UPDATE payments SET status = 'completed', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [payment.id]
          );

          if (payment.transaction_reference) {
            await connection.execute(
              `UPDATE transactions SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE reference_number = ?`,
              [payment.transaction_reference]
            );

            if (payment.payment_type === 'deposit') {
              await connection.execute(
                `UPDATE users SET balance = balance + ? WHERE id = ?`,
                [payment.amount, payment.user_id]
              );
              try {
                await connection.execute(
                  `UPDATE accounts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
                  [payment.amount, payment.user_id]
                );
              } catch (_) {}
            } else if (payment.payment_type === 'withdrawal') {
              const [userRows] = await connection.execute(
                `SELECT balance FROM users WHERE id = ?`,
                [payment.user_id]
              );
              if (userRows[0] && parseFloat(userRows[0].balance) >= parseFloat(payment.amount)) {
                await connection.execute(
                  `UPDATE users SET balance = balance - ? WHERE id = ?`,
                  [payment.amount, payment.user_id]
                );
              }
            }
          }
            }

            if (payment.payment_type === 'deposit') {
              await connection.execute(
                `UPDATE users SET balance = balance + ? WHERE id = ?`,
                [payment.amount, payment.user_id]
              );
              await connection.execute(
                `UPDATE transactions SET balance_after = balance_before + ? WHERE reference_number = ?`,
                [payment.amount, payment.transaction_reference]
              );
            }
          }
        } else if (result.status === 'failed') {
          await connection.execute(
            `UPDATE payments SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [payment.id]
          );
          if (payment.transaction_reference) {
            await connection.execute(
              `UPDATE transactions SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE reference_number = ?`,
              [payment.transaction_reference]
            );

            if (payment.payment_type === 'deposit') {
              const [userRows] = await connection.execute(
                `SELECT balance FROM users WHERE id = ?`,
                [payment.user_id]
              );
              if (userRows[0] && parseFloat(userRows[0].balance) >= parseFloat(payment.amount)) {
                await connection.execute(
                  `UPDATE users SET balance = balance - ? WHERE id = ?`,
                  [payment.amount, payment.user_id]
                );
              }
            }
          }
        }
      } catch (err) {
        console.error(`[PaymentChecker] Error checking payment ${payment.id}:`, err.message);
      }
    }

    const [updateResult] = await connection.execute(`
      UPDATE payments SET status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'pending' AND provider = 'paypack' AND created_at < ?
    `, [oneDayAgo]);
    if (updateResult.affectedRows > 0) console.log(`[PaymentChecker] Expired ${updateResult.affectedRows} old pending payments`);
  } catch (error) {
    console.error('[PaymentChecker] Error:', error.message);
  }
}

function startPaymentStatusChecker() {
  console.log('[PaymentChecker] Started — runs every 2 minutes');
  checkPendingPayments();
  setInterval(checkPendingPayments, 2 * 60 * 1000);
}

module.exports = { startPaymentStatusChecker };