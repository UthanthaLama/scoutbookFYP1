const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async createTable() {
    try {
      // First create the basic table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'scout', 'admin')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await pool.query(createTableQuery);
      
      // Then add Google OAuth columns if they don't exist
      const addColumnsQueries = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local'`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP`,
        `ALTER TABLE users ALTER COLUMN password DROP NOT NULL`
      ];
      
      for (const query of addColumnsQueries) {
        try {
          await pool.query(query);
        } catch (error) {
          // Ignore errors for columns that might already exist or constraints
          if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
            console.warn('⚠️ Warning adding column:', error.message);
          }
        }
      }
      
      // Create indexes
      const indexQueries = [
        `CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`,
        `CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider)`,
        `CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token)`
      ];
      
      for (const query of indexQueries) {
        try {
          await pool.query(query);
        } catch (error) {
          console.warn('⚠️ Warning creating index:', error.message);
        }
      }
      
      console.log('✅ Users table created/updated successfully with Google OAuth and email verification support');
    } catch (error) {
      console.error('❌ Error creating/updating users table:', error);
      throw error;
    }
  }

  static async create(userData) {
    const { email, password, role, google_id, name, profile_picture, auth_provider = 'local' } = userData;
    
    let hashedPassword = null;
    if (password) {
      // Hash password only if provided (for local auth)
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }
    
    const query = `
      INSERT INTO users (email, password, role, google_id, name, profile_picture, auth_provider)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role, name, profile_picture, auth_provider, created_at
    `;
    
    try {
      const result = await pool.query(query, [
        email, 
        hashedPassword, 
        role, 
        google_id, 
        name, 
        profile_picture, 
        auth_provider
      ]);
      console.log('✅ User created successfully:', result.rows[0].email);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error finding user by email:', error);
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findById(id) {
    const query = 'SELECT id, email, role, name, profile_picture, auth_provider, created_at FROM users WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    
    try {
      const result = await pool.query(query, [googleId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error finding user by Google ID:', error);
      throw error;
    }
  }

  static async findOrCreateGoogleUser(profile) {
    try {
      // First, try to find user by Google ID
      let user = await this.findByGoogleId(profile.id);
      
      if (user) {
        return user;
      }
      
      // If not found by Google ID, check by email
      user = await this.findByEmail(profile.emails[0].value);
      
      if (user) {
        // Update existing user with Google info
        const query = `
          UPDATE users 
          SET google_id = $1, name = $2, profile_picture = $3, auth_provider = 'google'
          WHERE email = $4
          RETURNING id, email, role, name, profile_picture, auth_provider, created_at
        `;
        
        const result = await pool.query(query, [
          profile.id,
          profile.displayName,
          profile.photos[0]?.value,
          profile.emails[0].value
        ]);
        
        return result.rows[0];
      }
      
      // Create new user without role - will be set in role selection
      const newUser = await this.create({
        email: profile.emails[0].value,
        role: 'player', // Temporary default, will be updated in role selection
        google_id: profile.id,
        name: profile.displayName,
        profile_picture: profile.photos[0]?.value,
        auth_provider: 'google'
      });
      
      // Mark Google users as verified automatically
      await pool.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [newUser.id]);
      
      // Remove role for new users to trigger role selection
      newUser.role = null;
      
      return newUser;
    } catch (error) {
      console.error('❌ Error in findOrCreateGoogleUser:', error);
      throw error;
    }
  }

  static async updateLastLogin(userId) {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
    
    try {
      await pool.query(query, [userId]);
    } catch (error) {
      console.error('❌ Error updating last login:', error);
      // Don't throw error - login should still succeed even if this fails
    }
  }

  static generateVerificationToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  static async setVerificationToken(userId) {
    const token = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const query = `
      UPDATE users 
      SET verification_token = $1, verification_token_expires = $2
      WHERE id = $3
      RETURNING verification_token
    `;

    try {
      const result = await pool.query(query, [token, expiresAt, userId]);
      return result.rows[0].verification_token;
    } catch (error) {
      console.error('❌ Error setting verification token:', error);
      throw error;
    }
  }

  static async verifyEmail(token) {
    const query = `
      UPDATE users 
      SET email_verified = TRUE, 
          verification_token = NULL, 
          verification_token_expires = NULL
      WHERE verification_token = $1 
        AND verification_token_expires > NOW()
      RETURNING id, email, role, name, email_verified
    `;

    try {
      const result = await pool.query(query, [token]);
      if (result.rows.length === 0) {
        return null; // Invalid or expired token
      }
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error verifying email:', error);
      throw error;
    }
  }

  static async findByVerificationToken(token) {
    const query = `
      SELECT id, email, role, name, verification_token_expires 
      FROM users 
      WHERE verification_token = $1
    `;

    try {
      const result = await pool.query(query, [token]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error finding user by verification token:', error);
      throw error;
    }
  }
}

module.exports = User;