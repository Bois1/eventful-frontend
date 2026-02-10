import { Routes as ReactRouterRoutes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetailPage from './pages/EventDetailPage';
import MyTickets from './pages/MyTickets';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import PaymentCallback from './pages/PaymentCallback';

export default function Routes() {
  return (
    <ReactRouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/my-tickets" element={<MyTickets />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />
    </ReactRouterRoutes>
  );
}