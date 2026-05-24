const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Simple payment plans
const PAYMENT_PLANS = {
  player_premium: {
    name: 'Premium Player',
    amount: 2499, // NPR 24.99 in paisa
    currency: 'NPR'
  },
  scout_verified: {
    name: 'Verified Scout', 
    amount: 329900, // NPR 3,299.00 in paisa
    currency: 'NPR'
  }
};

// Create payment session - SIMPLIFIED
router.post('/create-session', authenticateToken, async (req, res) => {
  try {
    console.log('Creating payment session for user:', req.user.id);
    
    const { planType, paymentMethod } = req.body;
    
    // Validate plan
    const plan = PAYMENT_PLANS[planType];
    if (!plan) {
      console.log('Invalid plan type:', planType);
      return res.status(400).json({ error: 'Invalid payment plan' });
    }

    // Generate session ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    console.log('Generated session ID:', sessionId);

    // Store in database
    const query = `
      INSERT INTO payment_sessions (
        id, user_id, plan_type, amount, currency, payment_method, 
        environment, status, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      sessionId, 
      req.user.id, 
      planType, 
      plan.amount, 
      plan.currency,
      paymentMethod, 
      'sandbox', 
      'pending', 
      expiresAt
    ];

    await pool.query(query, values);
    
    console.log('Payment session created successfully');

    res.json({
      success: true,
      sessionId,
      plan,
      amount: plan.amount,
      expiresAt
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ 
      error: 'Failed to create payment session',
      details: error.message 
    });
  }
});

// Khalti payment initiation - Real Sandbox API
router.post('/khalti/initiate', authenticateToken, async (req, res) => {
  try {
    console.log('Initiating Khalti payment for user:', req.user.id);
    
    const { sessionId } = req.body;
    
    // Get session
    const sessionResult = await pool.query(
      'SELECT * FROM payment_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      console.log('Payment session not found');
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const session = sessionResult.rows[0];
    
    // Khalti API configuration
    const khaltiConfig = {
      secret_key: process.env.KHALTI_SANDBOX_SECRET_KEY,
      public_key: process.env.KHALTI_SANDBOX_PUBLIC_KEY
    };

    // Prepare Khalti payment request
    const paymentData = {
      return_url: `${process.env.FRONTEND_URL}/payment/khalti/callback`,
      website_url: process.env.FRONTEND_URL,
      amount: session.amount, // Amount in paisa
      purchase_order_id: sessionId,
      purchase_order_name: session.plan_type,
      customer_info: {
        name: 'Test User',
        email: req.user.email,
        phone: '9800000000'
      }
    };

    console.log('Calling Khalti API...');

    // Call Khalti API
    const khaltiResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      paymentData,
      {
        headers: {
          'Authorization': `Key ${khaltiConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Khalti API success');

    // Store pidx in session
    await pool.query(
      'UPDATE payment_sessions SET khalti_pidx = $1 WHERE id = $2',
      [khaltiResponse.data.pidx, sessionId]
    );

    res.json({
      success: true,
      payment_url: khaltiResponse.data.payment_url,
      pidx: khaltiResponse.data.pidx
    });

  } catch (error) {
    console.error('❌ Khalti API error:', error.response?.data || error.message);
    
    // Fallback to mock payment if API fails
    const { sessionId } = req.body;
    const sessionResult = await pool.query(
      'SELECT * FROM payment_sessions WHERE id = $1',
      [sessionId]
    );
    const session = sessionResult.rows[0];
    
    const mockUrl = `/mock-payment.html?pidx=test_${sessionId}&amount=${session.amount}&purchase_order_id=${sessionId}&method=Khalti`;
    
    console.log('⚠️ Falling back to mock payment');
    
    res.json({
      success: true,
      payment_url: mockUrl,
      pidx: `test_${sessionId}`
    });
  }
});

// eSewa payment initiation - Smart Fallback (Mock on localhost, Real in production)
router.post('/esewa/initiate', authenticateToken, async (req, res) => {
  try {
    console.log('Initiating eSewa payment for user:', req.user.id);
    
    const { sessionId } = req.body;
    
    // Get session
    const sessionResult = await pool.query(
      'SELECT * FROM payment_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const session = sessionResult.rows[0];
    
    // Check if running on localhost (eSewa has CORS restrictions)
    const isLocalhost = process.env.FRONTEND_URL && 
                       (process.env.FRONTEND_URL.includes('localhost') || 
                        process.env.FRONTEND_URL.includes('127.0.0.1'));
    
    if (isLocalhost) {
      // Use mock payment on localhost to avoid CORS issues
      console.log('⚠️ Localhost detected - Using mock payment for eSewa (CORS workaround)');
      
      const mockUrl = `/mock-payment.html?pidx=test_${sessionId}&amount=${session.amount}&purchase_order_id=${sessionId}&method=eSewa`;
      
      return res.json({
        success: true,
        payment_url: mockUrl,
        method: 'mock',
        note: 'Using mock payment on localhost (eSewa sandbox has CORS restrictions)'
      });
    }
    
    // Production: Use real eSewa Sandbox
    const esewaConfig = {
      merchant_code: process.env.ESEWA_SANDBOX_MERCHANT_CODE,
      success_url: `${process.env.FRONTEND_URL}/payment/esewa/success`,
      failure_url: `${process.env.FRONTEND_URL}/payment/esewa/failure`
    };

    const amount = (session.amount / 100).toFixed(2);
    const esewaParams = {
      amt: amount,
      psc: '0',
      pdc: '0',
      txAmt: '0',
      tAmt: amount,
      pid: sessionId,
      scd: esewaConfig.merchant_code,
      su: esewaConfig.success_url,
      fu: esewaConfig.failure_url
    };

    console.log('✅ Using real eSewa Sandbox (production environment)');

    const redirectUrl = `/esewa-redirect.html?${new URLSearchParams(esewaParams).toString()}`;

    res.json({
      success: true,
      payment_url: redirectUrl,
      method: 'redirect'
    });

  } catch (error) {
    console.error('❌ eSewa initiation error:', error.message);
    
    // Final fallback to mock payment
    const { sessionId } = req.body;
    const sessionResult = await pool.query(
      'SELECT * FROM payment_sessions WHERE id = $1',
      [sessionId]
    );
    const session = sessionResult.rows[0];
    
    const mockUrl = `/mock-payment.html?pidx=test_${sessionId}&amount=${session.amount}&purchase_order_id=${sessionId}&method=eSewa`;
    
    console.log('✅ Error fallback - Using mock payment');
    
    res.json({
      success: true,
      payment_url: mockUrl,
      method: 'mock'
    });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Payment routes are working!',
    timestamp: new Date().toISOString(),
    status: 'active'
  });
});

// Khalti payment verification - Real Sandbox API
router.post('/khalti/verify', authenticateToken, async (req, res) => {
  try {
    const { pidx, sessionId } = req.body;

    console.log('Verifying Khalti payment:', { pidx, sessionId });

    // For mock payments (pidx starts with "test_"), auto-approve
    if (pidx && pidx.startsWith('test_')) {
      console.log('✅ Mock payment detected - auto-approving');
      
      await pool.query(
        'UPDATE payment_sessions SET status = $1, khalti_pidx = $2 WHERE id = $3',
        ['completed', pidx, sessionId]
      );

      const sessionResult = await pool.query(
        'SELECT * FROM payment_sessions WHERE id = $1',
        [sessionId]
      );
      const session = sessionResult.rows[0];

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await pool.query(`
        INSERT INTO user_subscriptions (user_id, plan_type, status, expires_at)
        VALUES ($1, $2, 'active', $3)
        ON CONFLICT (user_id, plan_type) 
        DO UPDATE SET status = 'active', expires_at = $3, updated_at = CURRENT_TIMESTAMP
      `, [req.user.id, session.plan_type, expiresAt]);

      console.log('✅ Subscription activated for user:', req.user.id);

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        subscription: {
          plan_type: session.plan_type,
          expires_at: expiresAt
        }
      });
    }

    // Real Khalti payment verification
    const khaltiConfig = {
      secret_key: process.env.KHALTI_SANDBOX_SECRET_KEY
    };

    console.log('Calling Khalti lookup API for pidx:', pidx);

    // Call Khalti lookup API
    const khaltiResponse = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': `Key ${khaltiConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Khalti lookup response:', khaltiResponse.data);

    // Check if payment is completed
    if (khaltiResponse.data.status === 'Completed') {
      // Update payment session
      await pool.query(
        'UPDATE payment_sessions SET status = $1, khalti_pidx = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['completed', pidx, sessionId]
      );

      // Get session details
      const sessionResult = await pool.query(
        'SELECT * FROM payment_sessions WHERE id = $1',
        [sessionId]
      );
      const session = sessionResult.rows[0];

      // Create or update subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await pool.query(`
        INSERT INTO user_subscriptions (user_id, plan_type, status, expires_at)
        VALUES ($1, $2, 'active', $3)
        ON CONFLICT (user_id, plan_type) 
        DO UPDATE SET status = 'active', expires_at = $3, updated_at = CURRENT_TIMESTAMP
      `, [req.user.id, session.plan_type, expiresAt]);

      console.log('✅ Subscription activated for user:', req.user.id);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        subscription: {
          plan_type: session.plan_type,
          expires_at: expiresAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment not completed',
        status: khaltiResponse.data.status
      });
    }

  } catch (error) {
    console.error('Khalti verification error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Payment verification failed',
      details: error.response?.data || error.message
    });
  }
});

// eSewa payment verification - Real Sandbox API
router.get('/esewa/verify', authenticateToken, async (req, res) => {
  try {
    const { oid, amt, refId } = req.query;

    console.log('Verifying eSewa payment:', { oid, amt, refId });

    // For mock payments (refId starts with "test_"), auto-approve
    if (refId && refId.startsWith('test_')) {
      console.log('✅ Mock payment detected - auto-approving');
      
      await pool.query(
        'UPDATE payment_sessions SET status = $1, esewa_ref_id = $2 WHERE id = $3',
        ['completed', refId, oid]
      );

      const sessionResult = await pool.query(
        'SELECT * FROM payment_sessions WHERE id = $1',
        [oid]
      );
      const session = sessionResult.rows[0];

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await pool.query(`
        INSERT INTO user_subscriptions (user_id, plan_type, status, expires_at)
        VALUES ($1, $2, 'active', $3)
        ON CONFLICT (user_id, plan_type) 
        DO UPDATE SET status = 'active', expires_at = $3, updated_at = CURRENT_TIMESTAMP
      `, [session.user_id, session.plan_type, expiresAt]);

      console.log('✅ Subscription activated for user:', session.user_id);

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        subscription: {
          plan_type: session.plan_type,
          expires_at: expiresAt
        }
      });
    }

    // Real eSewa payment verification
    const esewaConfig = {
      merchant_code: process.env.ESEWA_SANDBOX_MERCHANT_CODE
    };

    // eSewa verification URL
    const verificationUrl = `https://uat.esewa.com.np/epay/transrec`;
    
    console.log('Calling eSewa verification API');

    // Call eSewa verification API
    const esewaResponse = await axios.get(verificationUrl, {
      params: {
        amt: amt,
        rid: refId,
        pid: oid,
        scd: esewaConfig.merchant_code
      }
    });

    console.log('eSewa verification response:', esewaResponse.data);

    // eSewa returns XML, check for success
    if (esewaResponse.data.includes('Success')) {
      // Update payment session
      await pool.query(
        'UPDATE payment_sessions SET status = $1, esewa_ref_id = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['completed', refId, oid]
      );

      // Get session details
      const sessionResult = await pool.query(
        'SELECT * FROM payment_sessions WHERE id = $1',
        [oid]
      );
      const session = sessionResult.rows[0];

      // Create or update subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await pool.query(`
        INSERT INTO user_subscriptions (user_id, plan_type, status, expires_at)
        VALUES ($1, $2, 'active', $3)
        ON CONFLICT (user_id, plan_type) 
        DO UPDATE SET status = 'active', expires_at = $3, updated_at = CURRENT_TIMESTAMP
      `, [session.user_id, session.plan_type, expiresAt]);

      console.log('✅ Subscription activated for user:', session.user_id);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        subscription: {
          plan_type: session.plan_type,
          expires_at: expiresAt
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('eSewa verification error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Payment verification failed',
      details: error.response?.data || error.message
    });
  }
});

// Check subscription status
router.get('/subscription/status', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM user_subscriptions 
      WHERE user_id = $1 AND status = 'active' AND expires_at > CURRENT_TIMESTAMP
      ORDER BY expires_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      subscriptions: result.rows
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      error: 'Failed to fetch subscription status',
      details: error.message
    });
  }
});

module.exports = router;