const pool = require('../config/database');

async function addEmailVerification() {
  try {
    console.log('🔄 Adding email verification fields...');

    // Add email verification columns
    const queries = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP`,
      `CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)`
    ];

    for (const query of queries) {
      try {
        await pool.query(query);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.warn('⚠️ Warning:', error.message);
        }
      }
    }

    // Set existing users as verified (for backward compatibility)
    await pool.query(`
      UPDATE users 
      SET email_verified = TRUE 
      WHERE email_verified IS NULL OR email_verified = FALSE
    `);

    console.log('✅ Email verification fields added successfully');
  } catch (error) {
    console.error('❌ Error adding email verification fields:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addEmailVerification()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addEmailVerification;
