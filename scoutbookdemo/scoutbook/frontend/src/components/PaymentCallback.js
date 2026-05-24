import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your payment...');

  const refreshUserData = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        // Update user data in localStorage or context
        localStorage.setItem('user', JSON.stringify(userData));
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('userUpdated'));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentMethod = window.location.pathname.includes('khalti') ? 'khalti' : 'esewa';
        
        if (paymentMethod === 'khalti') {
          await verifyKhaltiPayment();
        } else if (paymentMethod === 'esewa') {
          await verifyEsewaPayment();
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const verifyKhaltiPayment = async () => {
    const pidx = searchParams.get('pidx');
    const purchase_order_id = searchParams.get('purchase_order_id');

    console.log('Khalti callback params:', { pidx, purchase_order_id });

    if (pidx && purchase_order_id) {
      try {
        console.log('Sending verification request...');
        const response = await fetch('/api/payments/khalti/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
          },
          body: JSON.stringify({
            pidx,
            sessionId: purchase_order_id
          })
        });

        const result = await response.json();
        console.log('Verification response:', result);

        if (response.ok && result.success) {
          // Refresh user data after successful payment
          await refreshUserData();
          // Redirect immediately to dashboard without showing success screen
          navigate('/dashboard');
        } else {
          console.error('Verification failed:', result);
          throw new Error(result.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Payment verification failed');
      }
    } else {
      console.error('Missing parameters:', { pidx, purchase_order_id });
      setStatus('error');
      setMessage('Payment was not completed successfully');
    }
  };

  const verifyEsewaPayment = async () => {
    const oid = searchParams.get('oid');
    const amt = searchParams.get('amt');
    const refId = searchParams.get('refId');

    console.log('eSewa callback params:', { oid, amt, refId });

    if (oid && amt && refId) {
      try {
        console.log('Sending verification request...');
        const response = await fetch(
          `/api/payments/esewa/verify?oid=${oid}&amt=${amt}&refId=${refId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
            }
          }
        );

        const result = await response.json();
        console.log('Verification response:', result);

        if (response.ok && result.success) {
          // Refresh user data after successful payment
          await refreshUserData();
          // Redirect immediately to dashboard without showing success screen
          navigate('/dashboard');
        } else {
          console.error('Verification failed:', result);
          throw new Error(result.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Payment verification failed');
      }
    } else {
      console.error('Missing parameters:', { oid, amt, refId });
      setStatus('error');
      setMessage('Invalid payment parameters');
    }
  };

  return (
    <div className="payment-callback-container">
      <div className="payment-callback-card">
        {status === 'processing' && (
          <>
            <div className="payment-spinner"></div>
            <h2>Processing Payment</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="payment-success-icon">
              <span className="material-icons">check_circle</span>
            </div>
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            <p>Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="payment-error-icon">
              <span className="material-icons">error</span>
            </div>
            <h2>Payment Failed</h2>
            <p>{message}</p>
            <button 
              className="retry-btn"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .payment-callback-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 20px;
        }

        .payment-callback-card {
          background: white;
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .payment-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 30px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .payment-success-icon {
          color: #22c55e;
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .payment-success-icon .material-icons {
          font-size: 4rem;
        }

        .payment-error-icon {
          color: #ef4444;
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .payment-error-icon .material-icons {
          font-size: 4rem;
        }

        h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1a1a1a;
        }

        p {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .retry-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.3s;
        }

        .retry-btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .payment-callback-card {
            padding: 40px 20px;
          }

          h2 {
            font-size: 1.6rem;
          }

          p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
