const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Payment configuration
const KHALTI_CONFIG = {
  live: {
    secret_key: 'e040db085a064fb8825fc01a854f8cf6',
    public_key: '1792dc764fc64dfba7d4fe19c4c91316',
    base_url: 'https://khalti.com/api/v2/'
  },
  sandbox: {
    secret_key: 'test_secret_key_f59e8b7d18b4499ca40f68195a846e9b',
    public_key: 'test_public_key_dc74e0fd57cb46cd93832aee0a507256',
    base_url: 'https://a.khalti.com/api/v2/'
  }
};

const ESEWA_CONFIG = {
  live: {
    merchant_code: 'EPAYTEST', // Replace with your live merchant code
    base_url: 'https://esewa.com.np/epay/main'
  },
  sandbox: {
    merchant_code: 'EPAYTEST',
    base_url: 'https://uat.esewa.com.np/epay/main'
  }
};

// Payment plans
const PAYMENT_PLANS = {
  player_premium: {
    name: 'Premium Player',
    amount: 2499, // Amount in paisa (NPR 24.99)
    currency: 'NPR',
    features: ['Coach Mentorship', 'Advanced Analytics', 'Priority Listing']
  },
  scout_verified: {
    name: 'Verified Scout',
    amount: 4999, // Amount in paisa (NPR 49.99)
    currency: 'NPR',
    features: ['Verified Badge', 'Advanced Search', 'Priority Opportunities']
  }
};

// Create payment session
router.post('/create-session', authenticateToken, async (req, res) => {
  try {
    const { planType, paymentMethod, environment = 'sandbox' } = req.body;
    const userId = req.user.id;

    // Validate plan
    const plan = PAYMENT_PLANS[planType];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid payment plan' });
    }

    // Generate unique payment session
    const sessionId = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store payment session in database
    await pool.query(`
      INSERT INTO payment_sessions (
        id, user_id, plan_type, amount, currency, payment_method, 
        environment, status, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      sessionId, userId, planType, plan.amount, plan.currency,
      paymentMethod, environment, 'pending', expiresAt
    ]);

    res.json({
      sessionId,
      plan,
      amount: plan.amount,
      expiresAt
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// Khalti payment initiation
router.post('/khalti/initiate', authenticateToken, async (req, res) => {
  try {
    const { sessionId, environment = 'sandbox' } = req.body;
    
    // Get payment session
    const sessionResult = await require('../config/database').query(
      'SELECT * FROM payment_sessions WHERE id = $1 AND user_id = $2 AND status = $3',
      [sessionId, req.user.id, 'pending']
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const session = sessionResult.rows[0];
    const config = KHALTI_CONFIG[environment];
    const plan = PAYMENT_PLANS[session.plan_type];

    // Khalti payment payload
    const paymentData = {
      return_url: `${process.env.FRONTEND_URL}/payment/khalti/callback`,
      website_url: process.env.FRONTEND_URL,
      amount: session.amount,
      purchase_order_id: sessionId,
      purchase_order_name: plan.name,
      customer_info: {
        name: req.user.name,
        email: req.user.email
      }
    };

    // Make request to Khalti API
    const fetch = require('node-fetch');
    const response = await fetch(`${config.base_url}epayment/initiate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.secret_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (response.ok) {
      // Update session with Khalti payment URL
      await require('../config/database').query(
        'UPDATE payment_sessions SET khalti_pidx = $1 WHERE id = $2',
        [result.pidx, sessionId]
      );

      res.json({
        success: true,
        payment_url: result.payment_url,
        pidx: result.pidx
      });
    } else {
      res.status(400).json({ error: result.detail || 'Khalti payment initiation failed' });
    }

  } catch (error) {
    console.error('Khalti initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// Khalti payment verification
router.post('/khalti/verify', authenticateToken, async (req, res) => {
  try {
    const { pidx, sessionId, environment = 'sandbox' } = req.body;
    const config = KHALTI_CONFIG[environment];

    // Verify payment with Khalti
    const fetch = require('node-fetch');
    const response = await fetch(`${config.base_url}epayment/lookup/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.secret_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pidx })
    });

    const result = await response.json();

    if (response.ok && result.status === 'Completed') {
      // Update payment session
      await require('../config/database').query(
        'UPDATE payment_sessions SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['completed', sessionId]
      );

      // Update user subscription
      const session = await require('../config/database').query(
        'SELECT * FROM payment_sessions WHERE id = $1',
        [sessionId]
      );

      if (session.rows.length > 0) {
        const planType = session.rows[0].plan_type;
        await activateSubscription(session.rows[0].user_id, planType);
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('Khalti verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// eSewa payment initiation
router.post('/esewa/initiate', authenticateToken, async (req, res) => {
  try {
    const { sessionId, environment = 'sandbox' } = req.body;
    
    // Get payment session
    const sessionResult = await require('../config/database').query(
      'SELECT * FROM payment_sessions WHERE id = $1 AND user_id = $2 AND status = $3',
      [sessionId, req.user.id, 'pending']
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    const session = sessionResult.rows[0];
    const config = ESEWA_CONFIG[environment];
    const plan = PAYMENT_PLANS[session.plan_type];

    // eSewa payment parameters
    const esewaParams = {
      amt: (session.amount / 100).toFixed(2), // Convert paisa to rupees
      pdc: '0',
      psc: '0',
      txAmt: '0',
      tAmt: (session.amount / 100).toFixed(2),
      pid: sessionId,
      scd: config.merchant_code,
      su: `${process.env.FRONTEND_URL}/payment/esewa/success`,
      fu: `${process.env.FRONTEND_URL}/payment/esewa/failure`
    };

    res.json({
      success: true,
      payment_url: config.base_url,
      params: esewaParams
    });

  } catch (error) {
    console.error('eSewa initiation error:', error);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

// eSewa payment verification
router.post('/esewa/verify', authenticateToken, async (req, res) => {
  try {
    const { oid, amt, refId, environment = 'sandbox' } = req.body;
    const config = ESEWA_CONFIG[environment];

    // Verify payment with eSewa
    const verificationUrl = environment === 'live' 
      ? 'https://esewa.com.np/epay/transrec'
      : 'https://uat.esewa.com.np/epay/transrec';

    const fetch = require('node-fetch');
    const params = new URLSearchParams({
      amt,
      scd: config.merchant_code,
      rid: refId,
      pid: oid
    });

    const response = await fetch(`${verificationUrl}?${params}`);
    const result = await response.text();

    if (result.includes('Success')) {
      // Update payment session
      await require('../config/database').query(
        'UPDATE payment_sessions SET status = $1, completed_at = CURRENT_TIMESTAMP, esewa_ref_id = $2 WHERE id = $3',
        ['completed', refId, oid]
      );

      // Update user subscription
      const session = await require('../config/database').query(
        'SELECT * FROM payment_sessions WHERE id = $1',
        [oid]
      );

      if (session.rows.length > 0) {
        const planType = session.rows[0].plan_type;
        await activateSubscription(session.rows[0].user_id, planType);
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('eSewa verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Activate user subscription
async function activateSubscription(userId, planType) {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

  await require('../config/database').query(`
    INSERT INTO user_subscriptions (user_id, plan_type, status, expires_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id) 
    DO UPDATE SET plan_type = $2, status = $3, expires_at = $4, updated_at = CURRENT_TIMESTAMP
  `, [userId, planType, 'active', expiresAt]);

  // Update user profile based on plan
  if (planType === 'scout_verified') {
    await require('../config/database').query(
      'UPDATE profiles SET verified = true WHERE user_id = $1',
      [userId]
    );
  }
}

// Get user subscription status
router.get('/subscription/status', authenticateToken, async (req, res) => {
  try {
    const result = await require('../config/database').query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1 AND status = $2 AND expires_at > CURRENT_TIMESTAMP',
      [req.user.id, 'active']
    );

    if (result.rows.length > 0) {
      res.json({
        hasSubscription: true,
        subscription: result.rows[0]
      });
    } else {
      res.json({ hasSubscription: false });
    }

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

module.exports = router;