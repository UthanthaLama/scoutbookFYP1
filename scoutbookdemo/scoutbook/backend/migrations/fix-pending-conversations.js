const pool = require('../config/database');

async function fixPendingConversations() {
  try {
    console.log('🔄 Fixing pending conversations...');
    
    const result = await pool.query(`
      UPDATE conversations 
      SET status = 'active' 
      WHERE status = 'pending'
      RETURNING id, scout_id, player_id, status
    `);
    
    console.log(`✅ Updated ${result.rowCount} conversations from pending to active`);
    console.log('Updated conversations:', result.rows);
    
    return result.rowCount;
  } catch (error) {
    console.error('❌ Error fixing pending conversations:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixPendingConversations()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = fixPendingConversations;
