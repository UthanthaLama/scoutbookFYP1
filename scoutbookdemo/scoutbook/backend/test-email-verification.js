/**
 * Test script to verify email verification system
 * Run with: node test-email-verification.js
 */

const pool = require('./config/database');

async function testEmailVerification() {
  console.log('🔍 Testing Email Verification System\n');
  
  try {
    // 1. Check if email_verified column exists
    console.log('1️⃣ Checking database schema...');
    const schemaQuery = `
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' 
      AND column_name IN ('email_verified', 'verification_token', 'verification_token_expires', 'auth_provider')
      ORDER BY column_name;
    `;
    const schemaResult = await pool.query(schemaQuery);
    
    if (schemaResult.rows.length === 0) {
      console.log('❌ Email verification columns not found!');
      console.log('   Run migrations to add these columns.');
      return;
    }
    
    console.log('✅ Schema check passed:');
    schemaResult.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (default: ${col.column_default || 'none'})`);
    });
    
    // 2. Check existing users
    console.log('\n2️⃣ Checking existing users...');
    const usersQuery = `
      SELECT 
        id, 
        email, 
        auth_provider, 
        email_verified,
        verification_token IS NOT NULL as has_token,
        verification_token_expires,
        password IS NOT NULL as has_password
      FROM users
      ORDER BY created_at DESC
      LIMIT 10;
    `;
    const usersResult = await pool.query(usersQuery);
    
    if (usersResult.rows.length === 0) {
      console.log('ℹ️  No users found in database');
    } else {
      console.log(`✅ Found ${usersResult.rows.length} users:`);
      usersResult.rows.forEach((user, idx) => {
        console.log(`\n   User ${idx + 1}:`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Auth Provider: ${user.auth_provider || 'local'}`);
        console.log(`   - Email Verified: ${user.email_verified ? '✅ YES' : '❌ NO'}`);
        console.log(`   - Has Password: ${user.has_password ? 'YES' : 'NO'}`);
        console.log(`   - Has Verification Token: ${user.has_token ? 'YES' : 'NO'}`);
        if (user.verification_token_expires) {
          const expired = new Date(user.verification_token_expires) < new Date();
          console.log(`   - Token Expires: ${user.verification_token_expires} ${expired ? '(EXPIRED)' : '(VALID)'}`);
        }
      });
    }
    
    // 3. Check for problematic users (local auth without verification)
    console.log('\n3️⃣ Checking for unverified local users...');
    const unverifiedQuery = `
      SELECT id, email, created_at, email_verified
      FROM users
      WHERE (auth_provider = 'local' OR auth_provider IS NULL)
      AND email_verified = FALSE;
    `;
    const unverifiedResult = await pool.query(unverifiedQuery);
    
    if (unverifiedResult.rows.length === 0) {
      console.log('✅ No unverified local users found');
    } else {
      console.log(`⚠️  Found ${unverifiedResult.rows.length} unverified local users:`);
      unverifiedResult.rows.forEach(user => {
        console.log(`   - ${user.email} (created: ${user.created_at})`);
      });
    }
    
    // 4. Check password reset codes
    console.log('\n4️⃣ Checking password reset codes...');
    const resetQuery = `
      SELECT 
        email, 
        code, 
        expires_at,
        used,
        created_at,
        expires_at > NOW() as is_valid
      FROM password_resets
      ORDER BY created_at DESC
      LIMIT 5;
    `;
    const resetResult = await pool.query(resetQuery);
    
    if (resetResult.rows.length === 0) {
      console.log('ℹ️  No password reset codes found');
    } else {
      console.log(`✅ Found ${resetResult.rows.length} recent reset codes:`);
      resetResult.rows.forEach((reset, idx) => {
        console.log(`\n   Code ${idx + 1}:`);
        console.log(`   - Email: ${reset.email}`);
        console.log(`   - Code: ${reset.code}`);
        console.log(`   - Used: ${reset.used ? 'YES' : 'NO'}`);
        console.log(`   - Valid: ${reset.is_valid ? '✅ YES' : '❌ EXPIRED'}`);
        console.log(`   - Created: ${reset.created_at}`);
      });
    }
    
    // 5. Summary and recommendations
    console.log('\n📊 SUMMARY:');
    console.log('─'.repeat(50));
    
    const totalUsers = usersResult.rows.length;
    const googleUsers = usersResult.rows.filter(u => u.auth_provider === 'google').length;
    const localUsers = usersResult.rows.filter(u => u.auth_provider === 'local' || !u.auth_provider).length;
    const verifiedUsers = usersResult.rows.filter(u => u.email_verified).length;
    
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Google OAuth Users: ${googleUsers}`);
    console.log(`Local Auth Users: ${localUsers}`);
    console.log(`Verified Users: ${verifiedUsers}`);
    console.log(`Unverified Users: ${totalUsers - verifiedUsers}`);
    
    if (unverifiedResult.rows.length > 0) {
      console.log('\n⚠️  RECOMMENDATIONS:');
      console.log('1. Unverified local users cannot log in (this is correct behavior)');
      console.log('2. They need to click the verification link sent to their email');
      console.log('3. Or use the "Resend Verification" feature');
      console.log('\n💡 To manually verify a user for testing:');
      console.log(`   UPDATE users SET email_verified = TRUE WHERE email = 'user@example.com';`);
    }
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testEmailVerification();
