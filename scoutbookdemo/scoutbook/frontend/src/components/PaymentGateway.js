import React, { useState } from 'react';
import '../styles/payment-gateway.css';

export default function PaymentGateway({ isOpen, onClose, plan, amount }) {
  const [selectedMethod, setSelectedMethod] = useState('khalti');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Determine plan type
      const planType = plan.toLowerCase().includes('premium') ? 'player_premium' : 'scout_verified';
      
      console.log('Starting payment process...', { planType, selectedMethod });

      // Step 1: Create payment session
      const sessionResponse = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({
          planType,
          paymentMethod: selectedMethod
        })
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        throw new Error(errorData.error || 'Failed to create payment session');
      }

      const sessionData = await sessionResponse.json();
      console.log('Payment session created:', sessionData);

      // Step 2: Initiate payment
      if (selectedMethod === 'khalti') {
        await initiateKhaltiPayment(sessionData.sessionId);
      } else if (selectedMethod === 'esewa') {
        await initiateEsewaPayment(sessionData.sessionId);
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const initiateKhaltiPayment = async (sessionId) => {
    try {
      const response = await fetch('/api/payments/khalti/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Khalti payment failed');
      }

      const data = await response.json();
      console.log('Redirecting to Khalti:', data.payment_url);
      
      // Redirect to payment page
      window.location.href = data.payment_url;
      
    } catch (err) {
      throw new Error(err.message || 'Khalti payment failed');
    }
  };

  const initiateEsewaPayment = async (sessionId) => {
    try {
      const response = await fetch('/api/payments/esewa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'eSewa payment failed');
      }

      const data = await response.json();
      console.log('eSewa payment response:', data);
      
      if (data.note) {
        console.log('Note:', data.note);
      }
      
      // Redirect to payment page (either mock or real eSewa)
      window.location.href = data.payment_url;
      
    } catch (err) {
      throw new Error(err.message || 'eSewa payment failed');
    }
  };

  return (
    <div className="payment-gateway-overlay" onClick={onClose}>
      <div className="payment-gateway-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-close-btn" onClick={onClose}>
          <span className="material-icons">close</span>
        </button>

        <h1 className="payment-title">Payment Gateway</h1>

        <div className="payment-card">
          <h2 className="payment-subtitle">Choose Payment Method</h2>
          <p className="payment-description">Select your preferred payment option</p>

          <div className="payment-methods">
            <div 
              className={`payment-method ${selectedMethod === 'esewa' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('esewa')}
            >
              <div className="payment-radio">
                {selectedMethod === 'esewa' && <div className="payment-radio-dot"></div>}
              </div>
              <span className="payment-method-name">eSewa</span>
            </div>

            <div 
              className={`payment-method ${selectedMethod === 'khalti' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('khalti')}
            >
              <div className="payment-radio">
                {selectedMethod === 'khalti' && <div className="payment-radio-dot"></div>}
              </div>
              <span className="payment-method-name">Khalti</span>
            </div>
          </div>

          <div className="payment-details">
            <div className="payment-detail-row">
              <span className="payment-detail-label">Plan:</span>
              <span className="payment-detail-value">{plan}</span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Amount:</span>
              <span className="payment-detail-value">NPR {amount}/month</span>
            </div>
          </div>

          {error && (
            <div className="payment-error">
              <span className="material-icons">error</span>
              {error}
            </div>
          )}

          <button 
            className="payment-submit-btn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              `Pay with ${selectedMethod === 'khalti' ? 'Khalti' : 'eSewa'}`
            )}
          </button>

          <div className="payment-security">
            <span className="material-icons">security</span>
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}
