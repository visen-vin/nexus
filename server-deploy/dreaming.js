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
  // 1. Fetch recent messages (last 50)
  // We use the messages table. If it's empty, we might need to extract from checkpoints,
  // but for now, we'll assume the messages table is the primary source of truth.
  const messages = db.prepare(
    'SELECT role, content FROM messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(userId).reverse();

  if (messages.length === 0) {
    return "No recent conversations found to analyze.";
  }

  const conversationText = messages
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const systemPrompt = `You are Guru Ji's "Dreaming Engine". Your job is to analyze a student's recent chat history and extract deep learning insights.
  
Identify:
1. **Conceptual Gaps**: What specific things did they not understand?
2. **Strengths**: What are they good at?
3. **Revision Needed**: Which topics should they revisit immediately?
4. **Learning Style**: Do they prefer analogies? Code examples? Short or long explanations?

Output a concise summary in standard Markdown with headers. Be honest and constructive.
IMPORTANT: Do NOT make things up. Only base your analysis on the provided text.`;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Analyze this conversation for student ${userId}:\n\n${conversationText}`)
  ]);

  const insights = response.content;

  // Save to DB
  db.prepare('UPDATE users SET insights = ? WHERE id = ?').run(insights, userId);

  return insights;
}

module.exports = { generateLearningInsights };
