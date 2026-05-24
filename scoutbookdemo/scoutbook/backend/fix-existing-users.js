/**
 * Script to fix existing users who might have incorrect verification status
 * Run with: node fix-existing-users.js
 */

const pool = require('./config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixExistingUsers() {
  console.log('🔧 Fix Existing Users - Email Verification Status\n');
  
  try {
    // Find problematic users
    const query = `
      SELECT 
        id,
        email, 
        auth_provider, 
        email_verified,
        password IS NOT NULL as has_password,
        created_at
      FROM users
      ORDER BY created_at DESC;
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('ℹ️  No users found in database\n');
      rl.close();
      await pool.end();
      return;
    }
    
    console.log('Current Users:');
    console.log('─'.repeat(80));
    
    const issues = [];
    
    result.rows.forEach((user, idx) => {
      const status = user.email_verified ? '✅ VERIFIED' : '❌ UNVERIFIED';
      const authType = user.auth_provider === 'google' ? '🔵 Google' : '🔐 Local';
      const pwdStatus = user.has_password ? 'Has Password' : 'No Password';
      
      console.log(`${idx + 1}. ${user.email}`);
      console.log(`   ${authType} | ${status} | ${pwdStatus}`);
      console.log(`   Created: ${user.created_at}`);
      
      // Detect issues
      if (user.auth_provider === 'google' && !user.email_verified) {
        console.log('   ⚠️  ISSUE: Google user should be auto-verified');
        issues.push({ type: 'google_unverified', user });
      }
      
      if ((user.auth_provider === 'local' || !user.auth_provider) && user.email_verified && !user.has_password) {
        console.log('   ⚠️  ISSUE: Local user verified but no password');
        issues.push({ type: 'local_no_password', user });
      }
      
      console.log('');
    });
    
    if (issues.length === 0) {
      console.log('✅ No issues found! All users have correct verification status.\n');
      rl.close();
      await pool.end();
      return;
    }
    
    console.log(`\n⚠️  Found ${issues.length} issue(s)\n`);
    
    // Ask if user wants to fix
    const answer = await question('Do you want to fix these issues? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Cancelled. No changes made.\n');
      rl.close();
      await pool.end();
      return;
    }
    
    console.log('\n🔧 Applying fixes...\n');
    
    for (const issue of issues) {
      if (issue.type === 'google_unverified') {
        // Fix: Mark Google users as verified
        await pool.query(
          'UPDATE users SET email_verified = TRUE WHERE id = $1',
          [issue.user.id]
        );
        console.log(`✅ Fixed: ${issue.user.email} - marked as verified (Google user)`);
      }
      
      if (issue.type === 'local_no_password') {
        console.log(`⚠️  Warning: ${issue.user.email} - local user with no password`);
        console.log('   This user should either:');
        console.log('   1. Set a password through password reset');
        console.log('   2. Be converted to Google auth');
        console.log('   No automatic fix applied.');
      }
    }
    
    console.log('\n✅ Fixes applied!\n');
    
    // Show updated status
    console.log('Updated User Status:');
    console.log('─'.repeat(80));
    
    const updatedResult = await pool.query(query);
    updatedResult.rows.forEach((user, idx) => {
      const status = user.email_verified ? '✅ VERIFIED' : '❌ UNVERIFIED';
      const authType = user.auth_provider === 'google' ? '🔵 Google' : '🔐 Local';
      
      console.log(`${idx + 1}. ${user.email} - ${authType} | ${status}`);
    });
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

// Additional utility functions
async function manualVerifyUser(email) {
  try {
    const result = await pool.query(
      'UPDATE users SET email_verified = TRUE WHERE email = $1 RETURNING email',
      [email]
    );
    
    if (result.rows.length > 0) {
      console.log(`✅ Manually verified: ${email}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  if (args[0] === '--verify' && args[1]) {
    // Manual verification mode
    console.log(`🔧 Manually verifying user: ${args[1]}\n`);
    manualVerifyUser(args[1]).then(() => pool.end());
  } else if (args[0] === '--help') {
    console.log('Usage:');
    console.log('  node fix-existing-users.js              # Interactive mode');
    console.log('  node fix-existing-users.js --verify EMAIL  # Manually verify a user');
    console.log('  node fix-existing-users.js --help       # Show this help');
    process.exit(0);
  } else {
    console.log('Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
} else {
  // Interactive mode
  fixExistingUsers();
}
