import api from './api';

interface InitializePaymentData {
  ticketId: string;
  email: string;
  amount: number;
}

export const paymentService = {
  async initializePayment(data: InitializePaymentData): Promise<{
    authorizationUrl: string;
    paymentId: string;
    reference: string;
  }> {
    const response = await api.post('/payments/initialize', data);
    return response.data.data;
  },

  async verifyPayment(reference: string): Promise<any> {
    const response = await api.get('/payments/verify', { params: { reference } });
    return response.data.data;
  }
};