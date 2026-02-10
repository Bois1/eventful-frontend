import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ticketService } from '../services/ticketService';
import { paymentService } from '../services/paymentService'; 
import { authService } from '../services/authService';
import { Ticket } from '../types';
import { format } from 'date-fns';
import { 
  FiCalendar, 
  FiMapPin, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiEye, 
  FiTrash2, 
  FiDownload,
  FiArrowLeft,
  FiRefreshCw, 
  FiCreditCard
} from 'react-icons/fi';
import { HiTicket } from 'react-icons/hi';

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null); 
  const [retryingId, setRetryingId] = useState<string | null>(null); 
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser(); 
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-tickets' } });
      return;
    }
    fetchTickets();
  }, [isAuthenticated, navigate]);

  
  const fetchTickets = async (): Promise<Ticket[]> => {
    try {
      setLoading(true);
      setError(null);
      const ticketsData = await ticketService.getMyTickets();
      setTickets(ticketsData || []);
      return ticketsData || []; 
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setError(err.response?.data?.error || 'Failed to load your tickets. Please try again.');
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');

    if (paymentStatus === 'success') {
  
      fetchTickets()
        .then(() => {
          alert('Payment successful! Your ticket is ready.');
          navigate('/my-tickets', { replace: true });
        })
        .catch(() => {
     
          alert('Payment successful! Refreshing ticket status...');
          navigate('/my-tickets', { replace: true });
        });
    } else if (paymentStatus === 'failed') {
      alert('Payment failed. No charges were made.');
      navigate('/my-tickets', { replace: true });
    }
  }, [searchParams, navigate]);

 
  const handleVerifyPayment = async (ticketId: string) => {
    setVerifyingId(ticketId);
    try {
      const updatedTickets = await fetchTickets();
      
      const updatedTicket = updatedTickets.find(t => t.id === ticketId);
      
      if (!updatedTicket) {
        alert('Ticket not found. Please refresh the page.');
        return;
      }

     
      switch (updatedTicket.status) {
        case 'PAID':
          alert('Payment confirmed! Your ticket is now active with QR code.');
          break;
        case 'SCANNED':
          alert('Ticket already scanned and admitted to event.');
          break;
        case 'CANCELLED':
          alert('This ticket was cancelled. You can purchase a new one.');
          break;
        case 'PENDING':

          if (updatedTicket.payment?.status === 'SUCCESS') {
            alert('Payment received but ticket still processing. Check back in 30 seconds or contact support.');
          } else {
            alert('Payment status is still pending. If you just paid, wait 10-15 seconds and try again.');
          }
          break;
        default:
          alert(`ℹCurrent status: ${updatedTicket.status}`);
      }
    } catch (err: any) {
      console.error('Verification failed:', err);
      const msg = err.response?.data?.error || 'Failed to verify payment. Please try again.';
      setError(msg);
      alert(`${msg}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRetryPayment = async (ticket: Ticket) => {
    if (!currentUser?.email) {
      alert('Please log in again to complete payment.');
      navigate('/login');
      return;
    }

    if (!window.confirm(`Cancel your current pending ticket for "${ticket.event.title}" and retry payment?`)) {
      return;
    }

    setRetryingId(ticket.id);
    try {
      await ticketService.cancelTicket(ticket.id);
      const newTicket = await ticketService.purchaseTicket(ticket.eventId);
      
      const paymentData = await paymentService.initializePayment({
        ticketId: newTicket.id,
        email: currentUser.email,
        amount: Math.round(ticket.event.price * 100) 
      });
      
      window.location.href = paymentData.authorizationUrl;
    } catch (err: any) {
      console.error('Failed to retry payment:', err);
      alert(err.response?.data?.error || 'Failed to retry payment. Please try again.');
      await fetchTickets();
    } finally {
      setRetryingId(null);
    }
  };

  const handleCancelTicket = async (ticketId: string, eventName: string) => {
    if (!window.confirm(`Cancel your ticket for "${eventName}"? This action cannot be undone.`)) {
      return;
    }

    setCancellingId(ticketId);
    try {
      await ticketService.cancelTicket(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      alert('Ticket cancelled successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel ticket. Please try again.');
      await fetchTickets();
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewQR = (ticket: Ticket) => {
    if (!ticket.qrCode) {
      alert('QR code not available yet. Please complete payment first.');
      return;
    }
    setSelectedTicket(ticket);
    setQrModalOpen(true);
  };

  const handleDownloadQR = () => {
    if (!selectedTicket?.qrCode) return;
    
    const link = document.createElement('a');
    link.href = selectedTicket.qrCode.startsWith('data:image') 
      ? selectedTicket.qrCode 
      : `data:image/png;base64,${selectedTicket.qrCode}`;
    link.download = `ticket-${selectedTicket.event.title.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('QR code downloaded successfully!');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      SCANNED: 'bg-blue-100 text-blue-800 border-blue-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const icons: any = {
      PENDING: <FiClock className="mr-1 h-3 w-3" />,
      PAID: <FiCheckCircle className="mr-1 h-3 w-3" />,
      SCANNED: <FiCheckCircle className="mr-1 h-3 w-3" />,
      CANCELLED: <FiXCircle className="mr-1 h-3 w-3" />
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const canCancelTicket = (ticket: Ticket) => {
    return ticket.status !== 'SCANNED' && 
           ticket.status !== 'CANCELLED' && 
           new Date(ticket.event.startTime) > new Date();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-gray-600 mt-1">View and manage your event tickets</p>
            </div>
            <Link
              to="/events"
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <HiTicket className="mr-2" /> Browse Events
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {tickets.some(t => t.status === 'PENDING') && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <FiAlertCircle className="h-5 w-5 text-yellow-700 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Pending Payments</h3>
              <p className="text-yellow-700 mt-1 text-sm">
                Some tickets are pending payment. Use "Verify Payment" to check status or "Retry Payment" to complete your purchase.
              </p>
            </div>
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100">
              <HiTicket className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tickets yet</h3>
            <p className="mt-2 text-gray-500">
              You haven't purchased any tickets yet. Browse events to get started!
            </p>
            <div className="mt-6">
              <Link
                to="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                <HiTicket className="mr-2" /> Browse Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden border ${
                  ticket.status === 'PENDING' ? 'border-yellow-300 border-2' : 'border-gray-200'
                } hover:shadow-lg transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{ticket.event.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getStatusBadge(ticket.status)}
                        {ticket.status === 'SCANNED' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <FiCheckCircle className="mr-1 h-3 w-3" /> Admitted
                          </span>
                        )}
                        {ticket.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse">
                            <FiClock className="mr-1 h-3 w-3" /> Action Required
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {ticket.event.price === 0 ? 'FREE' : `₦${ticket.event.price.toLocaleString()}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Ticket #{ticket.id.slice(0, 8)}
                        {ticket.payment?.paystackReference && (
                          <div className="mt-1 text-[10px] text-gray-400">
                            Ref: {ticket.payment.paystackReference.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-gray-600 mb-5">
                    <div className="flex items-start">
                      <FiCalendar className="mt-1 mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div>{format(new Date(ticket.event.startTime), 'EEEE, MMMM dd, yyyy')}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiClock className="mt-1 mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Time</div>
                        <div>
                          {format(new Date(ticket.event.startTime), 'h:mm a')} -{' '}
                          {format(new Date(ticket.event.endTime), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiMapPin className="mt-1 mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div>{ticket.event.location}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    {ticket.status === 'PENDING' ? (
                      <div className="space-y-3">
                        <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                          <p className="font-medium flex items-center">
                            <FiAlertCircle className="mr-2 h-4 w-4" />
                            Payment Required
                          </p>
                          <p className="mt-1">
                            Complete your payment to activate this ticket. If you already paid, verify your payment status.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => handleVerifyPayment(ticket.id)}
                            disabled={verifyingId === ticket.id}
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              verifyingId === ticket.id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500'
                            }`}
                          >
                            {verifyingId === ticket.id ? (
                              <>
                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                                Verifying...
                              </>
                            ) : (
                              <>
                                <FiRefreshCw className="mr-2 h-4 w-4" />
                                Verify Payment
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleRetryPayment(ticket)}
                            disabled={retryingId === ticket.id}
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              retryingId === ticket.id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border border-primary-300 text-primary-700 bg-primary-50 hover:bg-primary-100 focus:ring-primary-500'
                            }`}
                          >
                            {retryingId === ticket.id ? (
                              <>
                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></span>
                                Processing...
                              </>
                            ) : (
                              <>
                                <FiCreditCard className="mr-2 h-4 w-4" />
                                Retry Payment
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="pt-2">
                          <button
                            onClick={() => handleCancelTicket(ticket.id, ticket.event.title)}
                            disabled={cancellingId === ticket.id}
                            className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              cancellingId === ticket.id
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-500'
                            }`}
                          >
                            {cancellingId === ticket.id ? (
                              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></span>
                            ) : (
                              <FiTrash2 className="mr-2 h-4 w-4" />
                            )}
                            Cancel Ticket
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex space-x-2">
                          {ticket.qrCode && ticket.status === 'PAID' && (
                            <button
                              onClick={() => handleViewQR(ticket)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              <FiEye className="mr-1.5 h-4 w-4" />
                              View QR
                            </button>
                          )}
                          
                          {canCancelTicket(ticket) && (
                            <button
                              onClick={() => handleCancelTicket(ticket.id, ticket.event.title)}
                              disabled={cancellingId === ticket.id}
                              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                cancellingId === ticket.id
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'border border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-500'
                              }`}
                            >
                              {cancellingId === ticket.id ? (
                                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1.5"></span>
                              ) : (
                                <FiTrash2 className="mr-1.5 h-4 w-4" />
                              )}
                              Cancel Ticket
                            </button>
                          )}
                        </div>
                        
                        <Link
                          to={`/events/${ticket.eventId}`}
                          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          View Event Details
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {qrModalOpen && selectedTicket && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setQrModalOpen(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-primary-50 rounded-full mb-4">
                  <HiTicket className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your Ticket QR Code</h3>
                <p className="text-gray-600 mt-1">{selectedTicket.event.title}</p>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="border-4 border-primary-100 rounded-lg p-4 bg-white">
                  <img 
                    src={selectedTicket.qrCode?.startsWith('image') 
                      ? selectedTicket.qrCode 
                      : `data:image/png;base64,${selectedTicket.qrCode || ''}`} 
                    alt="Ticket QR Code" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-500 px-4">
                  Show this QR code at the event entrance for scanning. 
                  <span className="block mt-1 font-medium text-gray-700">
                    Ticket ID: {selectedTicket.id.slice(0, 8)}
                  </span>
                </p>
                
                <div className="flex flex-col sm:flex-row sm:space-x-3">
                  <button
                    onClick={handleDownloadQR}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mb-2 sm:mb-0"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Download QR
                  </button>
                  <button
                    onClick={() => setQrModalOpen(false)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                <p>This QR code is unique to your ticket. Do not share it publicly.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Ticket Management Tips</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <span className="mr-2 mt-1">•</span>
              <span><strong>After payment:</strong> Click "Verify Payment" if your ticket still shows as pending. Webhook processing may take 5-15 seconds.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1">•</span>
              <span><strong>Payment reference:</strong> Each ticket shows its Paystack reference (truncated) for support inquiries.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1">•</span>
              <span><strong>QR codes</strong> appear immediately after payment confirmation. Download and save them before the event.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-1">•</span>
              <span>If payment succeeded but ticket remains pending after 1 minute, contact support with your payment reference.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}