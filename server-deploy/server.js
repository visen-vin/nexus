const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');
const { app: agent } = require('./agent');
const { HumanMessage, AIMessage, SystemMessage } = require('@langchain/core/messages');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── DOMAINS ─────────────────────────────────────────────────────────
app.get('/api/domains', (_req, res) => {
  res.json(db.prepare('SELECT * FROM domains ORDER BY order_num ASC').all());
});

app.post('/api/domains', (req, res) => {
  const { id, label, color, order, created_by } = req.body;
  if (!id || !label) return res.status(400).json({ error: 'Missing id or label' });
  db.prepare('INSERT OR REPLACE INTO domains (id,label,color,order_num) VALUES (?,?,?,?)')
    .run(id, label, color || '#4db8ff', order ?? 99);
  res.json({ success: true, id });
});

app.delete('/api/domains/:id', (req, res) => {
  db.prepare('DELETE FROM domains WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── MODULES ─────────────────────────────────────────────────────────
app.get('/api/modules', (_req, res) => {
  res.json(db.prepare('SELECT * FROM modules ORDER BY order_num ASC').all());
});

app.post('/api/modules', (req, res) => {
  const { id, domainId, label, version, order } = req.body;
  if (!id || !domainId || !label) return res.status(400).json({ error: 'Missing fields' });
  db.prepare('INSERT OR REPLACE INTO modules (id,domain_id,label,version,order_num) VALUES (?,?,?,?,?)')
    .run(id, domainId, label, version || 'v1.0', order ?? 99);
  res.json({ success: true, id });
});

app.delete('/api/modules/:id', (req, res) => {
  db.prepare('DELETE FROM modules WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── TOPICS ──────────────────────────────────────────────────────────
app.get('/api/topics', (_req, res) => {
  const rows = db.prepare('SELECT * FROM topics ORDER BY order_num ASC').all();
  res.json(rows.map(t => ({
    id: t.id, moduleId: t.module_id, order: t.order_num,
    group: t.group_name, title: t.title, description: t.description,
    sections: JSON.parse(t.sections),
  })));
});

app.post('/api/topics', (req, res) => {
  const { id, moduleId, order, group, title, description, sections } = req.body;
  if (!id || !moduleId || !title || !Array.isArray(sections))
    return res.status(400).json({ error: 'Missing required fields' });
  db.prepare('INSERT OR REPLACE INTO topics (id,module_id,order_num,group_name,title,description,sections) VALUES (?,?,?,?,?,?,?)')
    .run(id, moduleId, order ?? 99, group ?? 'Dynamic', title, description ?? '', JSON.stringify(sections));
  res.json({ success: true, id });
});

app.delete('/api/topics/:id', (req, res) => {
  db.prepare('DELETE FROM topics WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── USERS ────────────────────────────────────────────────────────────
app.post('/api/users', (req, res) => {
  const id = req.body.id || randomUUID();
  db.prepare('INSERT OR IGNORE INTO users (id) VALUES (?)').run(id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json(user);
});

app.patch('/api/users/:id', (req, res) => {
  const { monthly_goal, learning_style } = req.body;
  if (monthly_goal !== undefined)
    db.prepare('UPDATE users SET monthly_goal = ? WHERE id = ?').run(monthly_goal, req.params.id);
  if (learning_style !== undefined)
    db.prepare('UPDATE users SET learning_style = ? WHERE id = ?').run(learning_style, req.params.id);
  res.json({ success: true });
});

// Guru Ji full context summary for a user
app.get('/api/users/:id/summary', (req, res) => {
  const uid = req.params.id;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(uid);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const progress = db.prepare('SELECT * FROM progress WHERE user_id = ? ORDER BY updated_at DESC').all(uid);
  const recentMessages = db.prepare(
    'SELECT role, content, topic_id FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(uid);

  const done = progress.filter(p => p.status === 'done');
  const struggling = progress.filter(p => p.status === 'struggling');
  const shaky = progress.filter(p => p.confidence === 'shaky');

  const dates = [...new Set(
    db.prepare("SELECT date(updated_at) as d FROM progress WHERE user_id = ? ORDER BY d DESC").all(uid).map(r => r.d)
  )];
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (dates[i] === expected.toISOString().split('T')[0]) streak++;
    else break;
  }

  const subjectSummaries = db.prepare('SELECT module_id, summary_md FROM subject_summaries WHERE user_id = ?').all(uid);

  res.json({
    user,
    stats: { total: progress.length, done: done.length, struggling: struggling.length, shaky: shaky.length, streak },
    strongTopics: done.filter(p => p.confidence === 'high').map(p => p.topic_id),
    weakTopics: [...struggling, ...shaky].map(p => p.topic_id),
    recentMessages: recentMessages.reverse(),
    subjectSummaries,
  });
});

// ── PROGRESS ──────────────────────────────────────────────────────────
app.get('/api/users/:id/progress', (req, res) => {
  const rows = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(req.params.id);
  const map = {};
  rows.forEach(r => { map[r.topic_id] = { status: r.status, confidence: r.confidence, date: r.updated_at }; });
  res.json(map);
});

app.post('/api/users/:id/progress', (req, res) => {
  const { topicId, status, confidence } = req.body;
  if (!topicId || !status || !confidence) return res.status(400).json({ error: 'Missing fields' });
  db.prepare("INSERT OR REPLACE INTO progress (user_id,topic_id,status,confidence,updated_at) VALUES (?,?,?,?,datetime('now'))")
    .run(req.params.id, topicId, status, confidence);
  res.json({ success: true });
});

// ── MESSAGES ──────────────────────────────────────────────────────────
app.get('/api/users/:id/messages', (req, res) => {
  const limit = parseInt(req.query.limit) || 30;
  const topicId = req.query.topicId || null;
  const rows = topicId
    ? db.prepare('SELECT * FROM messages WHERE user_id = ? AND topic_id = ? ORDER BY created_at ASC LIMIT ?').all(req.params.id, topicId, limit)
    : db.prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(req.params.id, limit);
  res.json(topicId ? rows : rows.reverse());
});

app.post('/api/users/:id/messages', (req, res) => {
  const { topicId, role, content } = req.body;
  if (!role || !content) return res.status(400).json({ error: 'Missing role or content' });
  const result = db.prepare('INSERT INTO messages (user_id,topic_id,role,content) VALUES (?,?,?,?)')
    .run(req.params.id, topicId || null, role, content);
  res.json({ success: true, id: result.lastInsertRowid });
});

// ── STUDENT MEMORY ────────────────────────────────────────────────────
app.get('/api/users/:id/memory', (req, res) => {
  const rows = db.prepare('SELECT key, value, updated_at FROM student_memory WHERE user_id = ? ORDER BY updated_at DESC').all(req.params.id);
  res.json(rows);
});

app.put('/api/users/:id/memory/:key', (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'Missing value' });
  db.prepare("INSERT OR REPLACE INTO student_memory (user_id,key,value,updated_at) VALUES (?,?,?,datetime('now'))")
    .run(req.params.id, req.params.key, value.slice(0, 500));
  res.json({ success: true });
});

app.delete('/api/users/:id/memory/:key', (req, res) => {
  db.prepare('DELETE FROM student_memory WHERE user_id = ? AND key = ?').run(req.params.id, req.params.key);
  res.json({ success: true });
});

// ── WEAKNESSES ────────────────────────────────────────────────────────
app.get('/api/users/:id/weaknesses', (req, res) => {
  const rows = db.prepare('SELECT concept, topic_id, severity, created_at FROM weaknesses WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(rows);
});

// ── ROADMAPS ──────────────────────────────────────────────────────────
app.get('/api/users/:id/roadmaps', (req, res) => {
  const rows = db.prepare('SELECT * FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(rows.map(r => ({ ...r, steps: JSON.parse(r.steps_json) })));
});

app.put('/api/users/:id/roadmaps/:roadmapId/step/:stepId', (req, res) => {
  const { status } = req.body;
  const row = db.prepare('SELECT steps_json FROM roadmaps WHERE id = ? AND user_id = ?').get(req.params.roadmapId, req.params.id);
  if (!row) return res.status(404).json({ error: 'Roadmap not found' });
  
  const steps = JSON.parse(row.steps_json);
  const step = steps.find(s => s.id === req.params.stepId);
  if (step) step.status = status;
  
  db.prepare('UPDATE roadmaps SET steps_json = ? WHERE id = ?').run(JSON.stringify(steps), req.params.roadmapId);
  res.json({ success: true });
});

// ── INVITE CODES ──────────────────────────────────────────────────────
const ADMIN_KEY = process.env.NEXUS_ADMIN_KEY || 'nexus-admin-2026';

app.get('/api/validate-code/:code', (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  const row = db.prepare('SELECT label FROM invite_codes WHERE code = ?').get(code);
  res.json({ valid: !!row, label: row?.label || null });
});

app.use('/api/admin', (req, res, next) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

app.get('/api/admin/codes', (_req, res) => {
  const codes = db.prepare('SELECT * FROM invite_codes ORDER BY created_at DESC').all();
  res.json(codes);
});

app.post('/api/admin/codes', (req, res) => {
  const { code, label } = req.body;
  if (!code || !label) return res.status(400).json({ error: 'Missing code or label' });
  const normalized = code.toUpperCase().trim();
  db.prepare('INSERT OR REPLACE INTO invite_codes (code, label) VALUES (?, ?)').run(normalized, label);
  res.json({ success: true, code: normalized });
});

app.delete('/api/admin/codes/:code', (req, res) => {
  db.prepare('DELETE FROM invite_codes WHERE code = ?').run(req.params.code.toUpperCase());
  res.json({ success: true });
});

// ── SUBJECT SUMMARIES ─────────────────────────────────────────────────
app.get('/api/users/:id/subject-summary/:moduleId', (req, res) => {
  const row = db.prepare('SELECT summary_md, updated_at FROM subject_summaries WHERE user_id = ? AND module_id = ?')
    .get(req.params.id, req.params.moduleId);
  res.json(row || { summary_md: '', updated_at: null });
});

app.put('/api/users/:id/subject-summary/:moduleId', (req, res) => {
  const { summary_md } = req.body;
  if (!summary_md) return res.status(400).json({ error: 'Missing summary_md' });
  const trimmed = summary_md.slice(0, 2000);
  db.prepare("INSERT OR REPLACE INTO subject_summaries (user_id,module_id,summary_md,updated_at) VALUES (?,?,?,datetime('now'))")
    .run(req.params.id, req.params.moduleId, trimmed);
  res.json({ success: true });
});

// ── CHAT (LangGraph) ──────────────────────────────────────────────────
app.post('/api/chat/stream', async (req, res) => {
  const { messages, systemPrompt, userId, activeModuleId, forceCreateTopic } = req.body;
  
  console.log(`[Chat] Request from user: ${userId}, forceCreateTopic: ${forceCreateTopic}`);

  if (!messages || !userId) {
    console.error('[Chat] Missing messages or userId');
    return res.status(400).json({ error: 'Missing messages or userId' });
  }

  // Convert messages to LangChain format
  const lcMessages = messages.map(m => 
    m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
  );

  if (systemPrompt) {
    lcMessages.unshift(new SystemMessage(systemPrompt));
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent Nginx buffering

  const config = { configurable: { thread_id: userId } };
  const input = { 
    messages: lcMessages, 
    userId, 
    activeModuleId, 
    forceCreateTopic 
  };

  try {
    console.log('[Chat] Starting LangGraph stream...');
    const stream = await agent.stream(input, {
      ...config,
      streamMode: "messages",
    });

    for await (const [message, metadata] of stream) {
      if (message.content && metadata.langgraph_node !== 'supervisor') {
        const chunk = {
          content: message.content,
          node: metadata.langgraph_node,
          tool_calls: message.tool_calls,
        };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
    }
    console.log('[Chat] Stream completed successfully');
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    console.error('[Chat] LangGraph Stream Error:', e);
    // Use res.write if headers sent, else res.status
    const errorMsg = JSON.stringify({ error: e.message });
    if (!res.headersSent) {
      res.status(500).write(`data: ${errorMsg}\n\n`);
    } else {
      res.write(`data: ${errorMsg}\n\n`);
    }
    res.end();
  }
});

// ── HEALTH ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: 2 }));

app.listen(3005, () => console.log('Nexus API v2 running on :3005'));
