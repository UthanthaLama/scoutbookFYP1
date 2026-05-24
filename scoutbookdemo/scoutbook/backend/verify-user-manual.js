/**
 * Manually verify a user for testing
 * Usage: node verify-user-manual.js shoumantkhadka8@gmail.com
 */

const pool = require('./config/database');

async function verifyUser(email) {
  try {
    const result = await pool.query(
      'UPDATE users SET email_verified = TRUE WHERE email = $1 RETURNING email, email_verified',
      [email]
    );
    
    if (result.rows.length > 0) {
      console.log(' User verified:', result.rows[0]);
    } else {
      console.log(' User not found:', email);
    }
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await pool.end();
  }
}

const email = process.argv[2];

if (!email) {
  console.log('Usage: node verify-user-manual.js EMAIL');
  console.log('Example: node verify-user-manual.js shoumantkhadka8@gmail.com');
  process.exit(1);
}

verifyUser(email);
