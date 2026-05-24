/**
 * Quick diagnostic check for email verification
 * Run with: node quick-check.js
 */

const pool = require('./config/database');

async function quickCheck() {
  console.log('🔍 Quick Email Verification Check\n');
  
  try {
    // Check users
    const query = `
      SELECT 
        email, 
        auth_provider, 
        email_verified,
        password IS NOT NULL as has_password,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5;
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('ℹ️  No users in database\n');
    } else {
      console.log('Recent Users:');
      console.log('─'.repeat(80));
      result.rows.forEach((user, idx) => {
        const status = user.email_verified ? '✅ VERIFIED' : '❌ UNVERIFIED';
        const authType = user.auth_provider === 'google' ? '🔵 Google' : '🔐 Local';
        const pwdStatus = user.has_password ? 'Has Password' : 'No Password';
        
        console.log(`${idx + 1}. ${user.email}`);
        console.log(`   ${authType} | ${status} | ${pwdStatus}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    // Check for problematic cases
    const problemQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE (auth_provider = 'local' OR auth_provider IS NULL)
      AND email_verified = FALSE;
    `;
    
    const problemResult = await pool.query(problemQuery);
    const unverifiedCount = problemResult.rows[0].count;
    
    if (unverifiedCount > 0) {
      console.log(`⚠️  ${unverifiedCount} unverified local user(s) - they CANNOT log in`);
      console.log('   This is CORRECT behavior - they need to verify their email first\n');
    } else {
      console.log('✅ No unverified local users\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

quickCheck();
