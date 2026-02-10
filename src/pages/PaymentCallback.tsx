import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { ticketService } from '../services/ticketService';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'processing' | 'success' | 'failed' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const [detailedMessage, setDetailedMessage] = useState('');
  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    if (!reference) {
      setStatus('error');
      setMessage('Payment reference missing');
      setDetailedMessage('Unable to verify payment. Please check your tickets page for status.');
      const timer = setTimeout(() => navigate('/my-tickets'), 5000);
      return () => clearTimeout(timer);
      return;
    }

    const verifyAndProcessPayment = async () => {
      try {
       
        setStatus('verifying');
        setMessage('Verifying payment with Paystack...');
        setDetailedMessage('This may take a few seconds');

        const paystackData = await paymentService.verifyPayment(reference);
        
        if (paystackData.status !== 'success') {
          throw new Error(paystackData.gateway_response || 'Payment not successful');
        }

        
        setStatus('processing');
        setMessage('Processing your ticket...');
        setDetailedMessage('Generating your QR code and updating your ticket status');
        
       
        const maxAttempts = 15;
        let attempts = 0;
        let ticketUpdated = false;
        
        while (attempts < maxAttempts && !ticketUpdated) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
          
          try {
            const tickets = await ticketService.getMyTickets();
            const paidTicket = tickets.find(t => 
              t.payment?.paystackReference === reference && t.status === 'PAID'
            );
            
            if (paidTicket) {
              ticketUpdated = true;
              setStatus('success');
              setMessage('Payment successful!');
              setDetailedMessage(`Your ticket for "${paidTicket.event.title}" is ready. Redirecting to your tickets...`);
              
              
              const timer = setTimeout(() => {
                navigate('/my-tickets?payment=success', { replace: true });
              }, 2000);
              return () => clearTimeout(timer);
            }
          } catch (error) {
            console.warn('Ticket status check failed (attempt', attempts, '):', error);
          }
        }

        
        if (!ticketUpdated) {
          setStatus('success');
          setMessage('Payment confirmed with Paystack!');
          setDetailedMessage('Your ticket is being processed. You may need to click "Verify Payment" on your tickets page.');
          
          const timer = setTimeout(() => {
            navigate('/my-tickets?payment=success', { replace: true });
          }, 3000);
          return () => clearTimeout(timer);
        }
      } catch (error: any) {
        console.error('Payment verification failed:', error);
        setStatus('failed');
        
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        setMessage('Payment verification failed');
        
        if (errorMessage.includes('not found')) {
          setDetailedMessage('Payment reference not found. Please contact support if you were charged.');
        } else if (errorMessage.includes('not successful')) {
          setDetailedMessage('Payment was declined by your bank. No charges were made.');
        } else {
          setDetailedMessage(`Error: ${errorMessage.substring(0, 100)}`);
        }
        
        const timer = setTimeout(() => {
          navigate('/my-tickets?payment=failed', { replace: true });
        }, 5000);
        return () => clearTimeout(timer);
      }
    };

    verifyAndProcessPayment();
  }, [reference, navigate]);

  
  const getStatusDisplay = () => {
    switch (status) {
      case 'success':
        return {
          icon: <FiCheckCircle className="h-16 w-16 text-green-500" />,
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'failed':
      case 'error':
        return {
          icon: <FiXCircle className="h-16 w-16 text-red-500" />,
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'processing':
        return {
          icon: <FiClock className="h-16 w-16 text-blue-500 animate-spin" />,
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
      default: 
        return {
          icon: <FiClock className="h-16 w-16 text-primary-500 animate-spin" />,
          bg: 'bg-primary-50',
          border: 'border-primary-200'
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-white rounded-lg shadow-lg border ${display.border} overflow-hidden`}>
        <div className={`px-6 py-4 ${display.bg}`}>
          <div className="flex justify-center mb-4">
            {display.icon}
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {status === 'verifying' && 'Verifying Payment'}
            {status === 'processing' && 'Processing Ticket'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'error' && 'Verification Error'}
          </h1>
          
          <p className="text-center text-gray-600 mb-1">{message}</p>
          <p className="text-center text-sm text-gray-500 px-4">{detailedMessage}</p>
        </div>
        
        <div className="px-6 py-4">
          {status === 'verifying' || status === 'processing' ? (
            <div className="flex justify-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <button
              onClick={() => navigate(status === 'success' ? '/my-tickets' : '/events')}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                status === 'success'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {status === 'success' ? (
                <>
                  Go to My Tickets
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                <>
                  Browse Events
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {status === 'verifying' && 'Contact support if this takes more than 30 seconds'}
              {status === 'processing' && 'Your QR code is being generated...'}
              {status === 'success' && 'Redirecting automatically...'}
              {status === 'failed' && 'No charges were made to your card'}
            </p>
          </div>
          
          {status === 'failed' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-start">
                <FiAlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="ml-2 text-sm text-yellow-700">
                  <p className="font-medium">Need help?</p>
                  <p className="mt-1">
                    If you believe this is an error, contact support with your reference: 
                    <span className="block font-mono bg-yellow-100 px-1 py-0.5 rounded mt-1 break-all">
                      {reference || trxref}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}