const { getDb } = require('../config/database');

function getAnalytics(req, res) {
  try {
    const db = getDb();

    // 1. Basic Counts
    const totalGenerations = db.prepare('SELECT COUNT(*) as count FROM generations WHERE user_id = ?').get(req.user.id).count;
    const totalFeedback = db.prepare('SELECT COUNT(*) as count FROM feedback f JOIN generations g ON f.generation_id = g.id WHERE g.user_id = ?').get(req.user.id).count;
    const avgRatingRow = db.prepare('SELECT AVG(f.rating) as avgRating FROM feedback f JOIN generations g ON f.generation_id = g.id WHERE g.user_id = ?').get(req.user.id);
    const avgRating = avgRatingRow.avgRating ? Number(avgRatingRow.avgRating).toFixed(1) : 0;

    // 2. Daily Generations (Last 30 days)
    const dailyGenerations = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM generations
      WHERE user_id = ? AND created_at >= date('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `).all(req.user.id);

    // 3. Quality Trend (Average rating per day, Last 30 days)
    const qualityTrend = db.prepare(`
      SELECT date(f.created_at) as date, AVG(f.rating) as avg_rating
      FROM feedback f
      JOIN generations g ON f.generation_id = g.id
      WHERE g.user_id = ? AND f.created_at >= date('now', '-30 days')
      GROUP BY date(f.created_at)
      ORDER BY date(f.created_at) ASC
    `).all(req.user.id).map(row => ({
      date: row.date,
      avg_rating: Number(Number(row.avg_rating).toFixed(1))
    }));

    // 4. Rating Distribution
    const ratingDistribution = db.prepare(`
      SELECT f.rating, COUNT(*) as count
      FROM feedback f
      JOIN generations g ON f.generation_id = g.id
      WHERE g.user_id = ?
      GROUP BY f.rating
      ORDER BY f.rating DESC
    `).all(req.user.id);

    // 5. Recent Feedback
    const recentFeedback = db.prepare(`
      SELECT f.rating, f.comment, f.created_at, g.inputs
      FROM feedback f
      JOIN generations g ON f.generation_id = g.id
      WHERE g.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT 10
    `).all(req.user.id).map(row => {
      const inputs = JSON.parse(row.inputs);
      return {
        rating: row.rating,
        comment: row.comment,
        created_at: row.created_at,
        scene_description: inputs.scene_description || 'Untitled Generation'
      };
    });

    res.json({
      success: true,
      data: {
        totalGenerations,
        totalFeedback,
        avgRating,
        dailyGenerations,
        qualityTrend,
        ratingDistribution,
        recentFeedback
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getAnalytics };
