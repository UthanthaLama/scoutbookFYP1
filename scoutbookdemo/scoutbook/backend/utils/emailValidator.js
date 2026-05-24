const dns = require('dns').promises;

/**
 * Validate if an email domain exists and can receive emails
 * @param {string} email - Email address to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateEmailDomain(email) {
  try {
    // Extract domain from email
    const domain = email.split('@')[1];
    
    if (!domain) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Check if domain has MX records (mail exchange records)
    try {
      const mxRecords = await dns.resolveMx(domain);
      
      if (!mxRecords || mxRecords.length === 0) {
        return { valid: false, error: 'Email domain cannot receive emails' };
      }
      
      return { valid: true };
    } catch (dnsError) {
      // DNS lookup failed - domain doesn't exist or has no MX records
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
        return { valid: false, error: 'Invalid email domain. Please use a real email address.' };
      }
      
      // Other DNS errors - log but allow (to avoid blocking legitimate emails)
      console.warn('⚠️ DNS lookup warning for', domain, ':', dnsError.message);
      return { valid: true }; // Allow on DNS errors to avoid false negatives
    }
  } catch (error) {
    console.error('❌ Email validation error:', error);
    return { valid: true }; // Allow on unexpected errors
  }
}

/**
 * List of common disposable/temporary email domains to block
 */
const disposableEmailDomains = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'mailinator.com',
  'maildrop.cc',
  'temp-mail.org',
  'fakeinbox.com',
  'trashmail.com',
  'yopmail.com'
];

/**
 * Check if email is from a disposable email service
 * @param {string} email - Email address to check
 * @returns {boolean}
 */
function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
}

/**
 * Comprehensive email validation
 * @param {string} email - Email address to validate
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
async function validateEmail(email) {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for disposable email
  if (isDisposableEmail(email)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' };
  }

  // Validate domain exists
  return await validateEmailDomain(email);
}

module.exports = {
  validateEmail,
  validateEmailDomain,
  isDisposableEmail
};
