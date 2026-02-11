import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../services/eventService';
import { ticketService } from '../services/ticketService';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';
import { Event } from '../types';
import { format } from 'date-fns';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiTag, FiShare2, FiArrowLeft } from 'react-icons/fi';
import QRCodeDisplay from '../components/tickets/QRCodeDisplay';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, _setQrCode] = useState<string | null>(null); 
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
    } catch (err: any) {
      console.error('Failed to fetch event:', err);
      setError(err.response?.data?.error || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTicket = async () => {
    if (!isAuthenticated) {
      if (confirm('You need to be logged in to purchase tickets. Go to login page?')) {
        navigate('/login', { state: { from: `/events/${id}` } });
      }
      return;
    }

    if (!event) return;


    try {
      const tickets = await ticketService.getMyTickets();
      const existingTicket = tickets.find(t => t.eventId === event.id && t.status !== 'CANCELLED');
      
      if (existingTicket) {
        if (existingTicket.status === 'PAID') {
          alert('You already have a ticket for this event!');
          setShowQR(true);
        } else if (existingTicket.status === 'PENDING') {
          alert('You have a pending ticket for this event. Please complete payment.');
        }
        return;
      }
    } catch (err) {
      
    }

    
    if (event.ticketsSold && event.ticketsSold >= event.capacity) {
      alert('Sorry, this event is sold out!');
      return;
    }

    if (new Date(event.startTime) < new Date()) {
      alert('This event has already started or ended.');
      return;
    }

    setPurchasing(true);
    try {
      const ticket = await ticketService.purchaseTicket(event.id);
      
      const paymentData = await paymentService.initializePayment({
        ticketId: ticket.id,
        email: currentUser?.email || '',
        amount: event.price * 100 
      });

      
      window.location.href = paymentData.authorizationUrl;
    } catch (err: any) {
      console.error('Failed to purchase ticket:', err);
      alert(err.response?.data?.error || 'Failed to purchase ticket. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleShareEvent = async () => {
    const shareData = {
      title: event?.title || 'Event on Eventful',
      text: event?.description || 'Check out this amazing event!',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
       
      }
    } else {
      
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error || 'Event not found'}
        </div>
        <div className="mt-6">
          <Link to="/events" className="text-primary-600 hover:text-primary-700">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isPastEvent = new Date(event.endTime) < new Date();
  const isSoldOut = event.ticketsSold && event.ticketsSold >= event.capacity;
  const canPurchase = !isPastEvent && !isSoldOut && event.status === 'PUBLISHED';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6">
          <Link
            to="/events"
            className="inline-flex items-center text-gray-600 hover:text-primary-600"
          >
            <FiArrowLeft className="mr-2" /> Back to Events
          </Link>
        </div>

 
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                    event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {event.status}
                  </span>
                  {isSoldOut && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      Sold Out
                    </span>
                  )}
                  {isPastEvent && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      Past Event
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleShareEvent}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                title="Share this event"
              >
                <FiShare2 className="h-6 w-6" />
              </button>
            </div>

            {event.description && (
              <p className="text-gray-600 mt-4 leading-relaxed">{event.description}</p>
            )}
          </div>

          
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-6">
                <div className="flex items-start">
                  <FiCalendar className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(event.startTime), 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start">
                  <FiClock className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start">
                  <FiMapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="p-6">
                  <div className="flex items-start">
                    <FiUsers className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Capacity</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {event.ticketsSold || 0} / {event.capacity} tickets sold
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start">
                    <FiTag className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {event.price === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          <span>₦{event.price.toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start">
                    <div className="h-5 w-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xs font-bold mt-1 flex-shrink-0">
                      {event.creator.firstName?.charAt(0) || '?'}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">Organized by</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {event.creator.firstName} {event.creator.lastName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Get Your Ticket</h2>
              <p className="text-gray-600">
                {event.price === 0 
                  ? 'This event is free. Register now to secure your spot!'
                  : `Only ₦${event.price.toLocaleString()} per ticket`}
              </p>
            </div>
            
            <div className="flex gap-3">
              {canPurchase ? (
                <button
                  onClick={handlePurchaseTicket}
                  disabled={purchasing}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {purchasing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {event.price === 0 ? 'Register Free' : 'Buy Ticket'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center px-8 py-4 border border-gray-300 text-base font-medium rounded-lg text-gray-500 bg-gray-100 cursor-not-allowed"
                >
                  {isSoldOut ? 'Sold Out' : isPastEvent ? 'Event Ended' : 'Not Available'}
                </button>
              )}
              
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-4 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                Browse Other Events
              </Link>
            </div>
          </div>
        </div>

        
        {showQR && qrCode && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Ticket QR Code</h2>
            <div className="flex justify-center">
              <QRCodeDisplay qrCode={qrCode} eventName={event.title} />
            </div>
            <p className="text-center text-gray-600 mt-4">
              Show this QR code at the event entrance for scanning
            </p>
          </div>
        )}

        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <p className="text-gray-500 text-center py-8">More events coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}