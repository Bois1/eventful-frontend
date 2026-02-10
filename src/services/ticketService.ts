import api from './api';
import { Ticket } from '../types';

export const ticketService = {
  async purchaseTicket(eventId: string): Promise<Ticket> {
    const response = await api.post('/tickets', { eventId });
    return response.data.data;
  },

  async generateQRCode(ticketId: string): Promise<string> {
    const response = await api.post(`/tickets/${ticketId}/generate-qr`);
    return response.data.data.qrCode;
  },

  async verifyTicket(token: string): Promise<any> {
    const response = await api.get(`/tickets/verify/${token}`);
    return response.data.data;
  },

  async getMyTickets(): Promise<Ticket[]> {
    const response = await api.get('/tickets/my-tickets');
    return response.data.data;
  },

  async cancelTicket(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  }
};