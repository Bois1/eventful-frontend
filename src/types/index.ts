export interface User {
  id: string;
  email: string;
  role: 'CREATOR' | 'EVENTEE';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  price: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  ticketsSold?: number;
  creator: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  status: 'PENDING' | 'PAID' | 'SCANNED' | 'CANCELLED';
  qrCode?: string;
  qrToken: string;
  scannedAt?: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    price: number;
  };
  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    paystackReference?: string;
    createdAt: string;
  };
}

export interface Payment {
  id: string;
  ticketId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paystackReference?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
}

export interface EventAnalytics {
  eventId: string;
  totalTickets: number;
  scannedTickets: number;
  scanRate: number;
  totalRevenue: number;
}

export interface CreatorAnalytics {
  creatorId: string;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
}