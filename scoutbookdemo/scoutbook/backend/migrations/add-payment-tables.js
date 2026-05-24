const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function createPaymentTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create payment_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) DEFAULT 'NPR',
        payment_method VARCHAR(20) NOT NULL,
        environment VARCHAR(20) DEFAULT 'sandbox',
        status VARCHAR(20) DEFAULT 'pending',
        khalti_pidx VARCHAR(255),
        esewa_ref_id VARCHAR(255),
        expires_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payment_logs table for audit trail
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_logs (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) REFERENCES payment_sessions(id),
        action VARCHAR(50) NOT NULL,
        status VARCHAR(20),
        response_data JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_sessions_user_id ON payment_sessions(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
    `);

    await client.query('COMMIT');
    console.log('Payment tables created successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating payment tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  createPaymentTables()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = createPaymentTables;