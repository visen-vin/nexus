const db = require('./db');

function calculateXP(progress) {
  const doneTopics = progress.filter(p => p.status === 'done').length;
  const highConfidenceBonus = progress.filter(p => p.confidence === 'high').length * 20;
  return (doneTopics * 100) + highConfidenceBonus;
}

function getLevel(xp) {
  // Level 1: 0-500
  // Level 2: 501-1500
  // Level 3: 1501-3000
  // Level 4: 3001-5000
  if (xp <= 500) return { level: 1, label: 'Neophyte', nextThreshold: 500 };
  if (xp <= 1500) return { level: 2, label: 'Apprentice', nextThreshold: 1500 };
  if (xp <= 3000) return { level: 3, label: 'Adept', nextThreshold: 3000 };
  if (xp <= 6000) return { level: 4, label: 'Master', nextThreshold: 6000 };
  return { level: 5, label: 'Grandmaster', nextThreshold: 10000 };
}

function getBadges(progress, streak) {
  const badges = [];
  const doneCount = progress.filter(p => p.status === 'done').length;
  
  if (doneCount >= 1) badges.push({ id: 'first_blood', label: 'First Blood', description: 'Completed your first topic!' });
  if (doneCount >= 10) badges.push({ id: 'ten_topics', label: 'Knowledge Seeker', description: 'Completed 10 topics.' });
  if (streak >= 3) badges.push({ id: 'streak_3', label: 'On Fire', description: 'Maintained a 3-day learning streak.' });
  if (progress.some(p => p.confidence === 'high')) badges.push({ id: 'confidence', label: 'Confident Learner', description: 'Mastered a topic with high confidence.' });
  
  return badges;
}

async function getDetailedReport(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return null;

  const progress = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(userId);
  const topics = db.prepare('SELECT id, module_id, title, group_name FROM topics').all();
  
  // Group progress by module
  const moduleStats = {};
  topics.forEach(t => {
    if (!moduleStats[t.module_id]) {
      moduleStats[t.module_id] = { id: t.module_id, total: 0, done: 0, percentage: 0 };
    }
    moduleStats[t.module_id].total++;
    const p = progress.find(p => p.topic_id === t.id);
    if (p && p.status === 'done') {
      moduleStats[t.module_id].done++;
    }
  });

  Object.values(moduleStats).forEach(m => {
    m.percentage = Math.round((m.done / m.total) * 100);
  });

  // Calculate streak (copied logic from server.js for consistency)
  const dates = [...new Set(
    db.prepare("SELECT date(updated_at) as d FROM progress WHERE user_id = ? ORDER BY d DESC").all(userId).map(r => r.d)
  )];
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (dates[i] === expected.toISOString().split('T')[0]) streak++;
    else break;
  }

  const xp = calculateXP(progress);
  const levelInfo = getLevel(xp);
  const badges = getBadges(progress, streak);

  return {
    user: { id: userId, xp, level: levelInfo.level, levelLabel: levelInfo.label, nextThreshold: levelInfo.nextThreshold },
    streak,
    badges,
    modules: Object.values(moduleStats),
    summary: {
      totalTopics: topics.length,
      completedTopics: progress.filter(p => p.status === 'done').length,
      strugglingTopics: progress.filter(p => p.status === 'struggling').length,
    }
  };
}

module.exports = { getDetailedReport };
