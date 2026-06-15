const { Template } = require('../models');

async function getTemplates(req, res) {
  try {
    const templates = await Template.findAll({
      where: { is_public: true },
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: templates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getTemplates };
