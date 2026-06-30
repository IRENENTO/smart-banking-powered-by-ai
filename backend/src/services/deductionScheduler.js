async function processDeductions() {
    const connection = global.dbConnection;
    if (!connection) return;

    try {
        await processLoanDeductions(connection);
        await processPaymentSchedules(connection);
        await processSavingsGoals(connection);
    } catch (error) {
        console.error('[DeductionScheduler] Error:', error.message);
    }
}

async function processLoanDeductions(connection) {
    const [loans] = await connection.execute(`
        SELECT l.*, a.id AS account_id, a.balance
        FROM loans l
        JOIN accounts a ON a.user_id = l.user_id
        WHERE l.status IN ('approved', 'disbursed')
          AND l.deduction_amount IS NOT NULL
          AND l.next_deduction_date IS NOT NULL
          AND l.next_deduction_date <= CURDATE()
        FOR UPDATE
    `);

    for (const loan of loans) {
        try {
            const deductionAmount = parseFloat(loan.deduction_amount);
            const balance = parseFloat(loan.balance);
            const paidAmount = parseFloat(loan.paid_amount || 0);
            const totalAmount = parseFloat(loan.total_amount) || parseFloat(loan.amount) * (1 + parseFloat(loan.interest_rate || 10) / 100);

            if (balance < deductionAmount) {
                console.log(`[DeductionScheduler] Insufficient balance for loan #${loan.id}, user #${loan.user_id}`);
                continue;
            }

            const newPaidAmount = paidAmount + deductionAmount;
            const isCompleted = newPaidAmount >= totalAmount;

            const nextDate = isCompleted ? null : calculateNextDate(loan.deduction_period);
            const newStatus = isCompleted ? 'completed' : loan.status;

            await connection.execute(
                'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?',
                [deductionAmount, loan.account_id, deductionAmount]
            );

            await connection.execute(
                'UPDATE users SET balance = GREATEST(balance - ?, 0) WHERE id = ?',
                [deductionAmount, loan.user_id]
            );

            await connection.execute(`
                UPDATE loans
                SET paid_amount = ?, next_deduction_date = ?, status = ?
                WHERE id = ?
            `, [newPaidAmount, nextDate, newStatus, loan.id]);

            const refNumber = `AUTO-LN-${loan.id}-${Date.now()}`;
            await connection.execute(`
                INSERT INTO transactions (user_id, type, amount, description, reference_number, status, created_at)
                VALUES (?, 'loan_repayment', ?, ?, ?, 'completed', NOW())
            `, [loan.user_id, deductionAmount, `Auto-deduction: Loan #${loan.id}`, refNumber]);

            console.log(`[DeductionScheduler] Loan #${loan.id}: deducted ${deductionAmount}, total paid ${newPaidAmount}/${totalAmount}`);
        } catch (err) {
            console.error(`[DeductionScheduler] Error processing loan #${loan.id}:`, err.message);
        }
    }
}

async function processPaymentSchedules(connection) {
    const [schedules] = await connection.execute(`
        SELECT s.*, a.id AS account_id, a.balance
        FROM payment_schedules s
        JOIN accounts a ON a.user_id = s.user_id
        WHERE s.status = 'active'
          AND s.next_payment_date <= CURDATE()
        FOR UPDATE
    `);

    for (const schedule of schedules) {
        try {
            const amount = parseFloat(schedule.amount);
            const balance = parseFloat(schedule.balance);

            if (balance < amount) {
                console.log(`[DeductionScheduler] Insufficient balance for schedule #${schedule.id}, user #${schedule.user_id}`);
                continue;
            }

            await connection.execute(
                'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?',
                [amount, schedule.account_id, amount]
            );

            await connection.execute(
                'UPDATE users SET balance = GREATEST(balance - ?, 0) WHERE id = ?',
                [amount, schedule.user_id]
            );

            const nextDate = calculateNextDate(schedule.frequency);

            let newStatus = 'active';
            if (schedule.end_date && new Date(nextDate) > new Date(schedule.end_date)) {
                newStatus = 'completed';
            }

            await connection.execute(`
                UPDATE payment_schedules
                SET next_payment_date = ?, status = ?
                WHERE id = ?
            `, [newStatus === 'completed' ? null : nextDate, newStatus, schedule.id]);

            const refNumber = `AUTO-SCH-${schedule.id}-${Date.now()}`;
            await connection.execute(`
                INSERT INTO transactions (user_id, type, amount, description, reference_number, status, created_at)
                VALUES (?, 'payment', ?, ?, ?, 'completed', NOW())
            `, [schedule.user_id, amount, `Auto-deduction: ${schedule.name}`, refNumber]);

            console.log(`[DeductionScheduler] Schedule #${schedule.id} (${schedule.name}): deducted ${amount}`);
        } catch (err) {
            console.error(`[DeductionScheduler] Error processing schedule #${schedule.id}:`, err.message);
        }
    }
}

async function processSavingsGoals(connection) {
    const [goals] = await connection.execute(`
        SELECT g.*, a.id AS account_id, a.balance
        FROM savings_goals g
        JOIN accounts a ON a.user_id = g.user_id
        WHERE g.status = 'active'
          AND g.auto_deduction_amount IS NOT NULL
          AND g.auto_deduction_period IS NOT NULL
          AND (g.last_deduction_date IS NULL OR g.last_deduction_date < CURDATE())
        FOR UPDATE
    `);

    for (const goal of goals) {
        try {
            const amount = parseFloat(goal.auto_deduction_amount);
            const balance = parseFloat(goal.balance);

            if (balance < amount) {
                console.log(`[DeductionScheduler] Insufficient balance for savings goal #${goal.id}, user #${goal.user_id}`);
                continue;
            }

            const currentAmount = parseFloat(goal.current_amount || 0);
            const targetAmount = parseFloat(goal.target_amount);
            const newCurrent = Math.min(currentAmount + amount, targetAmount);
            const isCompleted = newCurrent >= targetAmount;

            await connection.execute(
                'UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?',
                [amount, goal.account_id, amount]
            );

            await connection.execute(
                'UPDATE users SET balance = GREATEST(balance - ?, 0) WHERE id = ?',
                [amount, goal.user_id]
            );

            await connection.execute(`
                UPDATE savings_goals
                SET current_amount = ?, last_deduction_date = CURDATE(), status = ?
                WHERE id = ?
            `, [newCurrent, isCompleted ? 'completed' : 'active', goal.id]);

            const refNumber = `AUTO-GOAL-${goal.id}-${Date.now()}`;
            await connection.execute(`
                INSERT INTO transactions (user_id, type, amount, description, reference_number, status, created_at)
                VALUES (?, 'savings_contribution', ?, ?, ?, 'completed', NOW())
            `, [goal.user_id, amount, `Auto-deduction: ${goal.name}`, refNumber]);

            console.log(`[DeductionScheduler] Goal #${goal.id} (${goal.name}): deducted ${amount}, total ${newCurrent}/${targetAmount}`);
        } catch (err) {
            console.error(`[DeductionScheduler] Error processing goal #${goal.id}:`, err.message);
        }
    }
}

function calculateNextDate(period) {
    const d = new Date();
    switch (period) {
        case 'daily': d.setDate(d.getDate() + 1); break;
        case 'weekly': d.setDate(d.getDate() + 7); break;
        case 'monthly': d.setMonth(d.getMonth() + 1); break;
    }
    return d.toISOString().split('T')[0];
}

function startDeductionScheduler() {
    console.log('[DeductionScheduler] Started — runs every 60 seconds');
    processDeductions();
    setInterval(processDeductions, 60 * 1000);
}

module.exports = { startDeductionScheduler };
