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
      // Determine plan type based on plan name
      const planType = plan.toLowerCase().includes('premium') ? 'player_premium' : 'scout_verified';
      
      // Convert amount to paisa (NPR)
      const amountInPaisa = Math.round(parseFloat(amount) * 100);

      console.log('Creating payment session...', { planType, selectedMethod });

      // Create payment session (always sandbox)
      const sessionResponse = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({
          planType,
          paymentMethod: selectedMethod,
          environment: 'sandbox'
        })
      });

      console.log('Session response status:', sessionResponse.status);
      console.log('Session response headers:', Object.fromEntries(sessionResponse.headers.entries()));

      const responseText = await sessionResponse.text();
      console.log('Raw response:', responseText);

      let sessionData;
      try {
        sessionData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response from server: ' + responseText.substring(0, 100));
      }

      if (!sessionResponse.ok) {
        throw new Error(sessionData.error || 'Failed to create payment session');
      }

      console.log('Session created:', sessionData);

      // Initiate payment based on selected method
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
      console.log('Initiating Khalti payment for session:', sessionId);
      
      const response = await fetch('/api/payments/khalti/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({ sessionId, environment: 'sandbox' })
      });

      console.log('Khalti response status:', response.status);
      
      const responseText = await response.text();
      console.log('Khalti raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Khalti JSON parse error:', parseError);
        throw new Error('Invalid response from Khalti API: ' + responseText.substring(0, 100));
      }

      if (response.ok) {
        console.log('Redirecting to Khalti:', data.payment_url);
        // Redirect to Khalti payment page
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.error || 'Khalti payment initiation failed');
      }
    } catch (err) {
      console.error('Khalti error:', err);
      throw new Error(err.message || 'Khalti payment failed');
    }
  };

  const initiateEsewaPayment = async (sessionId) => {
    try {
      console.log('Initiating eSewa payment for session:', sessionId);
      
      const response = await fetch('/api/payments/esewa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({ sessionId, environment: 'sandbox' })
      });

      console.log('eSewa response status:', response.status);
      
      const responseText = await response.text();
      console.log('eSewa raw response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('eSewa JSON parse error:', parseError);
        throw new Error('Invalid response from eSewa API: ' + responseText.substring(0, 100));
      }

      if (response.ok) {
        console.log('Creating eSewa form with params:', data.params);
        // Create and submit eSewa form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payment_url;

        Object.keys(data.params).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = data.params[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error(data.error || 'eSewa payment initiation failed');
      }
    } catch (err) {
      console.error('eSewa error:', err);
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
          <div className="test-mode-indicator">
            <span className="material-icons">science</span>
            Test Mode - No real money will be charged
          </div>
          
          <h2 className="payment-subtitle">Choose Payment Method</h2>
          <p className="payment-description">Select your preferred payment option</p>

          {/* Payment Methods */}
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
            <div className="payment-detail-row">
              <span className="payment-detail-label">Mode:</span>
              <span className="payment-detail-value">Test Mode (Sandbox)</span>
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
