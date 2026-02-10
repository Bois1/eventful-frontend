import api from './api';
import { Event } from '../types';

interface CreateEventData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  price: number;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  capacity?: number;
  price?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export const eventService = {
  async getEvents(params?: { 
    page?: number; 
    limit?: number; 
    status?: string 
  }): Promise<{ data: Event[]; meta: any }> {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getEventById(id: string): Promise<Event> {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },

  async createEvent(data: CreateEventData): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data.data;
  },

  async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
    const response = await api.put(`/events/${id}`, data);
    return response.data.data;
  },

  async deleteEvent(id: string): Promise<void> {
    await api.delete(`/events/${id}`);
  },

  async publishEvent(id: string): Promise<Event> {
    const response = await api.patch(`/events/${id}/publish`);
    return response.data.data;
  },

  async getMyEvents(params?: { page?: number; limit?: number }): Promise<{ data: Event[]; meta: any }> {
    const response = await api.get('/events/my-events', { params });
    return response.data;
  }
};