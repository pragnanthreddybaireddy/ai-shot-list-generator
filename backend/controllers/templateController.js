const Template = require('../models/Template');

async function getTemplates(req, res) {
  try {
    const templates = await Template.find({ is_public: true }).sort({ name: 1 });
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getTemplates };
