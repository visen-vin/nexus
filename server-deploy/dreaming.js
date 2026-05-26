const db = require('./db');
const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');

const model = new ChatOpenAI({
  modelName: 'deepseek-chat',
  openAIApiKey: process.env.DEEPSEEK_API_KEY,
  configuration: { baseURL: 'https://api.deepseek.com/v1' },
  temperature: 0.3,
});

async function generateLearningInsights(userId) {
  const user = db.prepare('SELECT last_dreamed_at, insights FROM users WHERE id = ?').get(userId);
  
  // 1. Fetch new messages since last dream
  let query = 'SELECT role, content, created_at FROM messages WHERE user_id = ?';
  let params = [userId];
  
  if (user.last_dreamed_at) {
    query += ' AND created_at > ?';
    params.push(user.last_dreamed_at);
  }
  
  query += ' ORDER BY created_at ASC LIMIT 100'; // Incremental processing
  const newMessages = db.prepare(query).all(...params);

  if (newMessages.length === 0) {
    return user.insights || "No new conversations to dream about yet.";
  }

  const conversationText = newMessages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const systemPrompt = `You are Guru Ji's "Dreaming Engine". Your job is to analyze a student's RECENT chat history and update their learning insights.
  
Existing Insights for context:
"""
${user.insights || 'None'}
"""

New Data to process:
"""
${conversationText}
"""

Identify and UPDATE:
1. **Conceptual Gaps**: What new misunderstandings emerged?
2. **Progress**: What did they master since the last analysis?
3. **Revision Strategy**: Refine which topics they should revisit.

Output a comprehensive, updated summary in standard Markdown with headers.
IMPORTANT: Integrate the new findings into the existing context. Do NOT lose old important insights.`;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Dream about these new messages for student ${userId}.`)
  ]);

  const updatedInsights = response.content;
  const now = new Date().toISOString().replace('T', ' ').split('.')[0]; // SQLite format

  // Save to DB
  db.prepare('UPDATE users SET insights = ?, last_dreamed_at = ? WHERE id = ?').run(updatedInsights, now, userId);

  return updatedInsights;
}

module.exports = { generateLearningInsights };
