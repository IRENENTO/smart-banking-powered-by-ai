const Paypack = require('paypack-js').default;

class PaypackService {
  constructor() {
    this.paypack = new Paypack({
      client_id: process.env.PAYPACK_CLIENT_ID,
      client_secret: process.env.PAYPACK_CLIENT_SECRET,
    });
  }

  async initiateCashin(phoneNumber, amount) {
    try {
      const response = await this.paypack.cashin({
        number: phoneNumber,
        amount: amount,
        environment: process.env.PAYPACK_ENVIRONMENT || 'production'
      });
      return response.data;
    } catch (error) {
      console.error('Paypack cashin error:', error);
      throw error;
    }
  }

  async initiateCashout(phoneNumber, amount) {
    try {
      const response = await this.paypack.cashout({
        number: phoneNumber,
        amount: amount,
        environment: process.env.PAYPACK_ENVIRONMENT || 'production'
      });
      return response.data;
    } catch (error) {
      console.error('Paypack cashout error:', error);
      throw error;
    }
  }

  async checkPaymentStatus(transactionRef) {
    try {
      const response = await this.paypack.events({ ref: transactionRef });

      const transactions = response.data?.transactions;
      if (!transactions?.length) return { status: 'pending', eventKind: null };

      const latest = transactions[0];
      if (latest.event_kind === 'transaction:processed') {
        return { status: latest.data.status, eventKind: latest.event_kind };
      }
      return { status: 'pending', eventKind: latest.event_kind };
    } catch (error) {
      console.error('Paypack check status error:', error);
      throw error;
    }
  }
}

module.exports = new PaypackService();
