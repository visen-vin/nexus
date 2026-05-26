const { ChatOpenAI } = require('@langchain/openai');
const { StateGraph, Annotation, START, END } = require('@langchain/langgraph');
const { ToolNode } = require('@langchain/langgraph/prebuilt');
const { SystemMessage, HumanMessage, AIMessage, BaseMessage } = require('@langchain/core/messages');
const { SqliteSaver } = require('@langchain/langgraph-checkpoint-sqlite');
const { z } = require('zod');
const { tool } = require('@langchain/core/tools');
const db = require('./db');
const { getDetailedReport } = require('./reporting');
const { NodeVM } = require('vm2');

// 1. Tool Definitions
const getDetailedReportTool = tool(
  async (args, config) => {
    const userId = config.configurable.thread_id;
    try {
      const report = await getDetailedReport(userId);
      if (!report) return "User report not found.";
      return JSON.stringify(report, null, 2);
    } catch (e) {
      return `Error fetching detailed report: ${e.message}`;
    }
  },
  {
    name: 'get_detailed_report',
    description: 'Call this to see the student\'s full progress report, including XP, current Level, earned Badges, and a module-by-module completion breakdown. Use this to personalize your feedback, congratulate them on achievements, or adjust quiz difficulty based on their mastery level.',
    schema: z.object({}),
  }
);

const updateTopicProgressTool = tool(
  async ({ topicId, status, confidence, remarks }, config) => {
    const userId = config.configurable.thread_id;
    try {
      const res = await fetch(`http://localhost:3005/api/users/${userId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, status, confidence, remarks }),
      });
      return res.ok ? `Progress updated for ${topicId}.` : `Error updating progress.`;
    } catch (e) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: 'update_topic_progress',
    description: 'Use this to mark a topic as done, struggling, or todo, and to save detailed remarks/feedback about the student\'s performance on this specific topic. Remarks should include what they did well and specific concepts they missed.',
    schema: z.object({
      topicId: z.string().describe('The ID of the topic (e.g., "js-1-how-js-works")'),
      status: z.enum(['done', 'struggling', 'todo']),
      confidence: z.enum(['high', 'shaky']),
      remarks: z.string().describe('Detailed feedback about the student\'s understanding of this topic.'),
    }),
  }
);

const listCurriculumTool = tool(
  async (args, config) => {
    const userId = config.configurable.thread_id;
    try {
      const rows = db.prepare(`
        SELECT t.module_id, t.group_name, t.title, p.status, p.confidence 
        FROM topics t
        LEFT JOIN progress p ON t.id = p.topic_id AND p.user_id = ?
        ORDER BY t.module_id, t.order_num
      `).all(userId);

      if (rows.length === 0) return "The curriculum is currently empty.";
      
      const curriculum = {};
      rows.forEach(r => {
        if (!curriculum[r.module_id]) curriculum[r.module_id] = {};
        const group = r.group_name || 'General';
        if (!curriculum[r.module_id][group]) curriculum[r.module_id][group] = [];
        curriculum[r.module_id][group].push({
          title: r.title,
          status: r.status || 'not_started',
          confidence: r.confidence || 'none'
        });
      });
      return JSON.stringify(curriculum, null, 2);
    } catch (e) {
      return `Error fetching curriculum: ${e.message}`;
    }
  },
  {
    name: 'list_curriculum',
    description: 'Call this to see the full list of existing modules, topics, and THE STUDENT\'S PROGRESS (done, struggling, etc.). Use this to plan new modules or suggest next steps based on what they are currently studying.',
    schema: z.object({}),
  }
);

const getStudentContextTool = tool(
  async (args, config) => {
    const userId = config.configurable.thread_id;
    try {
      const user = db.prepare('SELECT monthly_goal, learning_style FROM users WHERE id = ?').get(userId);
      const memories = db.prepare('SELECT key, value FROM student_memory WHERE user_id = ?').all(userId);
      const summaries = db.prepare('SELECT module_id, summary_md FROM subject_summaries WHERE user_id = ?').all(userId);
      
      return JSON.stringify({
        goal: user?.monthly_goal || 'None set',
        style: user?.learning_style || 'Not specified',
        memories,
        subject_summaries: summaries
      }, null, 2);
    } catch (e) {
      return `Error fetching context: ${e.message}`;
    }
  },
  {
    name: 'get_student_context',
    description: 'Call this to get the student\'s monthly goal, learning style, long-term memories, and summaries of their journey in specific modules.',
    schema: z.object({}),
  }
);

const saveMemoryTool = tool(
  async ({ key, value }, config) => {
    const userId = config.configurable.thread_id;
    try {
      db.prepare("INSERT OR REPLACE INTO student_memory (user_id,key,value,updated_at) VALUES (?,?,?,datetime('now'))")
        .run(userId, key, value.slice(0, 500));
      return `Memory saved: ${key}`;
    } catch (e) {
      return `Error saving memory: ${e.message}`;
    }
  },
  {
    name: 'save_memory',
    description: 'Save an observation about the student to long-term memory. Use when you notice a strength, weakness, learning style insight, or any pattern worth remembering across sessions.',
    schema: z.object({
      key: z.string().describe('Short snake_case key e.g. "weakness_async", "strength_closures"'),
      value: z.string().describe('Concise observation in 1-2 sentences.'),
    }),
  }
);

const logWeaknessTool = tool(
  async ({ concept, topicId, severity }, config) => {
    const userId = config.configurable.thread_id;
    try {
      db.prepare("INSERT OR REPLACE INTO weaknesses (user_id, concept, topic_id, severity) VALUES (?, ?, ?, ?)")
        .run(userId, concept, topicId || null, severity || 1);
      return `Weakness logged: ${concept}`;
    } catch (e) {
      return `Error logging weakness: ${e.message}`;
    }
  },
  {
    name: 'log_weakness',
    description: 'Log a specific conceptual gap or weakness identified during teaching or assessment. Use this for tracking what needs revision later.',
    schema: z.object({
      concept: z.string().describe('The specific concept or sub-topic (e.g. "Event Loop Macrotasks")'),
      topicId: z.string().optional().describe('The ID of the chapter being studied'),
      severity: z.number().optional().describe('1 for minor doubt, 2 for fundamental misunderstanding'),
    }),
  }
);

const executeCodeTool = tool(
  async ({ code }) => {
    let output = '';
    const vm = new NodeVM({
      console: 'redirect',
      sandbox: {},
      timeout: 2000,
      require: {
        external: false,
        builtin: ['util'],
      },
    });

    vm.on('console.log', (...args) => {
      output += args.join(' ') + '\n';
    });
    vm.on('console.error', (...args) => {
      output += 'ERROR: ' + args.join(' ') + '\n';
    });

    try {
      vm.run(code);
      return output || 'Code executed successfully (no output).';
    } catch (e) {
      return `Runtime Error: ${e.message}`;
    }
  },
  {
    name: 'execute_code',
    description: 'Executes JavaScript code in a secure sandbox and returns console output. Use this to verify code, demonstrate logic, or show live results to the student.',
    schema: z.object({
      code: z.string().describe('The JavaScript code to execute.'),
    }),
  }
);

const generateRoadmapTool = tool(
  async ({ id, title, description, steps }, config) => {
    const userId = config.configurable.thread_id;
    try {
      const stepsJson = JSON.stringify(steps.map((s, idx) => ({
        id: `step-${idx + 1}`,
        title: s.title,
        description: s.description,
        status: 'pending'
      })));
      
      db.prepare('INSERT OR REPLACE INTO roadmaps (id, user_id, title, description, steps_json) VALUES (?, ?, ?, ?, ?)')
        .run(id, userId, title, description, stepsJson);
      
      return `Roadmap "${title}" generated and saved successfully. The student can now see it on their dashboard.`;
    } catch (e) {
      return `Error generating roadmap: ${e.message}`;
    }
  },
  {
    name: 'generate_roadmap',
    description: 'Call this tool to create a structured study plan (roadmap) for the student. A roadmap is a sequence of steps to reach a specific goal. Do NOT use this for single topics; use it for multi-step curricula.',
    schema: z.object({
      id: z.string().describe('Unique kebab-case slug for the roadmap'),
      title: z.string().describe('Clear goal-oriented title (e.g. "React Hooks Mastery")'),
      description: z.string().describe('Brief overview of what this plan covers'),
      steps: z.array(z.object({
        title: z.string().describe('Title of the roadmap step'),
        description: z.string().describe('What will be learned in this specific step'),
      })).min(2).max(15),
    }),
  }
);

const createTopicTool = tool(
  async (args, config) => {
    const { id, moduleId, order, group, title, description, sections } = args;
    try {
      db.prepare('INSERT OR REPLACE INTO topics (id,module_id,order_num,group_name,title,description,sections) VALUES (?,?,?,?,?,?,?)')
        .run(id, moduleId, order ?? 99, group ?? 'Dynamic', title, description ?? '', JSON.stringify(sections));
      return `Topic "${title}" created successfully.`;
    } catch (e) {
      return `Error creating topic: ${e.message}`;
    }
  },
  {
    name: 'create_topic',
    description: 'ALWAYS call this function when creating any topic, lesson, or course content.',
    schema: z.object({
      id: z.string().describe('Unique kebab-case slug'),
      moduleId: z.string().describe('Module ID this belongs to'),
      order: z.number().optional(),
      group: z.string().optional(),
      title: z.string(),
      description: z.string(),
      sections: z.array(z.object({
        type: z.enum(['text', 'heading', 'callout', 'code', 'faq']),
        content: z.string(),
        metadata: z.record(z.any()).optional(),
      })),
    }),
  }
);

// 2. State Definition
const AgentState = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
  }),
  next: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'supervisor',
  }),
  userId: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  activeModuleId: Annotation({
    reducer: (x, y) => y ?? x,
  }),
  forceCreateTopic: Annotation({
    reducer: (x, y) => y ?? x,
  }),
});

// 3. LLM Setup
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

if (apiKey && !process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = apiKey;
}

const model = new ChatOpenAI({
  modelName: 'deepseek-chat',
  apiKey: apiKey,
  configuration: {
    baseURL: 'https://api.deepseek.com',
  },
  streaming: true,
});

// 4. Node Implementations

async function supervisorNode(state) {
  const { messages, forceCreateTopic } = state;
  
  if (forceCreateTopic) {
    return { next: 'creator' };
  }

  const prompt = `You are a supervisor for Guru Ji, an AI mentor. 
Your job is to route the user's request to the correct specialized agent.

Agents:
1. Tutor: Handles general questions, teaching, explanations, and Socratic dialogue.
2. Creator: Dedicated to building structured topics, lessons, or curriculum.

Based on the conversation, decide who should handle the next turn. 
Respond with ONLY the name of the agent: 'tutor' or 'creator'.`;

  const response = await model.invoke([
    new SystemMessage(prompt),
    ...messages,
  ]);
  
  const next = response.content.toLowerCase().includes('creator') ? 'creator' : 'tutor';
  return { next };
}

async function tutorNode(state) {
  const { messages } = state;
  const tutorModel = model.bindTools([getDetailedReportTool, updateTopicProgressTool, saveMemoryTool, logWeaknessTool, executeCodeTool, generateRoadmapTool, listCurriculumTool, getStudentContextTool]);
  const response = await tutorModel.invoke(messages);
  return { messages: [response] };
}

async function creatorNode(state) {
  const { messages, forceCreateTopic } = state;
  const tools = [getDetailedReportTool, updateTopicProgressTool, createTopicTool, logWeaknessTool, executeCodeTool, generateRoadmapTool, listCurriculumTool, getStudentContextTool];
  let creatorModel = model.bindTools(tools);
  
  if (forceCreateTopic) {
    creatorModel = creatorModel.bind({
      tool_choice: { type: 'function', function: { name: 'create_topic' } }
    });
  }

  const response = await creatorModel.invoke(messages);
  return { messages: [response] };
}

const toolNode = new ToolNode([getDetailedReportTool, updateTopicProgressTool, saveMemoryTool, logWeaknessTool, executeCodeTool, generateRoadmapTool, createTopicTool, listCurriculumTool, getStudentContextTool]);

// 5. Graph Construction
const workflow = new StateGraph(AgentState)
  .addNode('supervisor', supervisorNode)
  .addNode('tutor', tutorNode)
  .addNode('creator', creatorNode)
  .addNode('tools', toolNode);

workflow.addEdge(START, 'supervisor');

workflow.addConditionalEdges('supervisor', (state) => state.next);

workflow.addConditionalEdges('tutor', (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length > 0) return 'tools';
  return END;
});

workflow.addConditionalEdges('creator', (state) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls?.length > 0) return 'tools';
  return END;
});

workflow.addEdge('tools', END);

const checkpointer = SqliteSaver.fromConnString('/opt/nexus-api/nexus-checkpoints.db');
const app = workflow.compile({ checkpointer });

module.exports = { app };
