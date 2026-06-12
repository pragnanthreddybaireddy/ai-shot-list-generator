const { getDb } = require('../config/database');

function getTemplates(req, res) {
  try {
    const db = getDb();
    const templates = db.prepare('SELECT * FROM templates WHERE is_public = 1 ORDER BY name').all();
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getTemplates };
