const { getDb } = require('../config/database');

function createFeedback(req, res) {
  try {
    const { generation_id, rating, comment } = req.body;
    const db = getDb();
    
    const stmt = db.prepare(`
      INSERT INTO feedback (user_id, generation_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, generation_id, rating, comment || null);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { createFeedback };
