import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Target, Pencil, BookPlus, Check, Sparkles, FilePlus, RefreshCcw, Quote, Moon, BrainCircuit } from 'lucide-react';
import { streamChat, buildSystemPrompt, MonthlyGoal } from '../lib/chat';
import type { ToolCall } from '../lib/chat';
import { Progress } from '../lib/progress';
import { saveTopic, syncMonthlyGoal, fetchSubjectSummary, fetchUserSummary, fetchUserMemory, saveMemory, fetchWeaknesses, syncProgress, fetchDetailedReport } from '../lib/api';
import type { Message } from '../lib/chat';
import type { NoteContent } from '../data/types';

function ChatMarkdown({ content }: { content: string }) {
  const blocks = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.startsWith('```')) {
          const newline = block.indexOf('\n');
          const lang = newline > 3 ? block.slice(3, newline).trim() : '';
          const code = newline > -1 ? block.slice(newline + 1, -3) : block.slice(3, -3);
          const isOutput = lang === 'output' || lang === 'terminal';
          return (
            <div key={i} className={`rounded-xl overflow-hidden border ${isOutput ? 'border-[#34c98a]/20 bg-[#0a1a12]' : 'border-white/8 bg-[#0d0d0f]'}`}>
              {lang && !isOutput && (
                <div className="px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
                  <span className="text-[10px] font-mono font-semibold tracking-widest text-[#666] uppercase">{lang}</span>
                </div>
              )}
              {isOutput && (
                <div className="px-3 py-1.5 border-b border-[#34c98a]/10 bg-[#34c98a]/5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#34c98a]" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#34c98a] uppercase">Sandbox Output</span>
                </div>
              )}
              <pre className={`px-4 py-3 text-[12px] font-mono ${isOutput ? 'text-[#34c98a]' : 'text-[#c4c7c5]'} whitespace-pre-wrap break-words leading-relaxed overflow-x-auto`}>
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        }
        return (
          <div key={i} className="mb-2">
            {block.split('\n').map((line, j) => {
              const isBullet = /^[*+-] /.test(line);
              const isNumbered = /^\d+\. /.test(line);
              const isHeader = /^#{1,3} /.test(line);
              
              let text = line;
              if (isBullet) text = line.slice(2);
              else if (isNumbered) text = line.replace(/^\d+\. /, '');
              else if (isHeader) text = line.replace(/^#{1,3} /, '');

              if (!text.trim() && !isBullet && !isNumbered) return <div key={j} className="h-1.5" />;
              
              return (
                <div key={j} className={`${isBullet || isNumbered ? 'flex gap-2 items-start mb-1' : 'mb-1'} ${isHeader ? 'font-bold text-[#f1f1f1] mt-3 mb-2' : ''} leading-relaxed`}>
                  {isBullet && <span className="text-[#4db8ff] mt-1.5 shrink-0 text-[8px]">◆</span>}
                  {isNumbered && <span className="text-[#888] shrink-0 text-[11px] font-mono mt-1">{line.match(/^\d+/)?.[0]}.</span>}
                  <span className="flex-1">{renderInline(text)}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="px-1.5 py-0.5 rounded-md bg-[#1a1a1f] border border-white/8 font-mono text-[11px] text-[#f9ab00]">{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-[#e8eaed]">{part.slice(2, -2)}</strong>;
    return part;
  });
}

function extractTopicText(note: NoteContent): string {
  return note.sections
    .filter(s => ['text', 'callout', 'heading', 'faq'].includes(s.type))
    .map(s => s.content)
    .join('\n')
    .slice(0, 3000);
}

const QUICK_ACTIONS = [
  { label: 'Quiz me', icon: '🎯', message: 'Quiz me on this topic with a challenging question.' },
  { label: "What's next?", icon: '🗺', message: 'Based on this topic, what should I study next and why?' },
  { label: 'Real-world use', icon: '🌍', message: 'Show me a real-world production example of this concept.' },
  { label: 'Interview Q', icon: '⚡', message: 'Give me a tricky interview question on this topic and rate my answer.' },
];

const FOLLOW_UPS = [
  { label: 'Quiz me', icon: '🎯', message: 'Quiz me on what you just explained.' },
  { label: "What's next?", icon: '🗺', message: 'What should I study next based on this?' },
  { label: 'Go deeper', icon: '🔍', message: 'Go deeper on the most important concept you just covered.' },
  { label: 'Real example', icon: '⚡', message: 'Show me a real-world production example of this.' },
];

function buildProgressSummary(): string {
  const progress = Progress.getAll();
  const entries = Object.entries(progress);
  const done = entries.filter(([, v]) => v.status === 'done').length;
  const struggling = entries.filter(([, v]) => v.status === 'struggling').length;
  return `${done} topics completed, ${struggling} marked as struggling.`;
}

function extractTopicJson(content: string): NoteContent | null {
  const match = content.match(/NEXUS_TOPIC_START\s*([\s\S]*?)\s*NEXUS_TOPIC_END/);
  if (!match) return null;
  try { return JSON.parse(match[1]); }
  catch { return null; }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#555] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

interface Props {
  activeNote: NoteContent | null;
  activeModuleId?: string;
  activeModuleLabel?: string;
  onTopicSaved?: () => void;
  highlightedText?: string;
  onClearHighlight?: () => void;
}

export function ChatAgent({ activeNote, activeModuleId, activeModuleLabel, onTopicSaved, highlightedText, onClearHighlight }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [monthlyGoal, setMonthlyGoal] = useState(() => MonthlyGoal.get());
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');
  const [savingTopic, setSavingTopic] = useState<string | null>(null);
  const [savedTopics, setSavedTopics] = useState<Set<string>>(new Set());
  const [subjectSummary, setSubjectSummary] = useState('');
  const [fullJourney, setFullJourney] = useState('');
  const [studentMemory, setStudentMemory] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [learningInsights, setLearningInsights] = useState('');
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [isDreaming, setIsDreaming] = useState(false);
  const [isWarmupMode, setIsWarmupMode] = useState(false);

  const triggerDream = async () => {
    setIsDreaming(true);
    try {
      const res = await fetch(`/api/users/${localStorage.getItem('nexus_user_id')}/dream`, { method: 'POST' });
      const data = await res.json();
      if (data.insights) setLearningInsights(data.insights);
    } catch (e) { console.error('Dream failed:', e); }
    finally { setIsDreaming(false); }
  };
  const isAdmin = !!localStorage.getItem('nexus_admin_key');
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeModuleId) {
      fetchSubjectSummary(activeModuleId).then(s => setTimeout(() => setSubjectSummary(s), 10));
    } else {
      setTimeout(() => setSubjectSummary(''), 10);
    }
  }, [activeModuleId]);

  useEffect(() => {
    if (!open) return;
    fetchDetailedReport().then(report => {
      if (report?.user.insights) setLearningInsights(report.user.insights);
    });
    fetchUserSummary().then(summary => {
      if (!summary) return;
      const parts: string[] = [];
      if (summary.streak > 0) parts.push(`**Streak:** ${summary.streak} days | **Completed:** ${summary.totalDone}/${summary.totalTopics} topics`);
      summary.subjectSummaries.forEach(s => {
        parts.push(`\n### ${s.module_id.toUpperCase()}\n${s.summary_md}`);
      });
      setFullJourney(parts.join('\n'));
    });
    fetchUserMemory().then(memories => {
      if (!memories.length) return;
      const text = memories.map(m => `**${m.key}:** ${m.value}`).join('\n');
      setStudentMemory(text);
    });
    fetchWeaknesses().then(w => {
      if (!w.length) return;
      setWeaknesses(w.map(i => i.concept).join(', '));
      if (messages.length === 0) setIsWarmupMode(true);
    });
  }, [open, messages.length]);

  useEffect(() => {
    if (highlightedText && !open) {
      setTimeout(() => setOpen(true), 10);
    }
  }, [highlightedText, open]);

  const systemPrompt = buildSystemPrompt({
    topicTitle: activeNote?.title,
    topicContent: activeNote ? extractTopicText(activeNote) : undefined,
    highlightedText: highlightedText,
    monthlyGoal: monthlyGoal || undefined,
    progressSummary: subjectSummary || buildProgressSummary(),
    fullJourney: fullJourney || undefined,
    studentMemory: studentMemory || undefined,
    activeModuleId: activeModuleId || undefined,
    activeModuleLabel: activeModuleLabel || undefined,
    weaknesses: weaknesses || undefined,
    isRevisionMode,
    learningInsights: learningInsights || undefined,
  });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (editingGoal) setTimeout(() => goalInputRef.current?.focus(), 50);
  }, [editingGoal]);

  useEffect(() => {
    setTimeout(() => {
      setMessages([]);
      setIsWarmupMode(false);
    }, 10);
  }, [activeNote?.id]);

  const handleSaveTopic = async (topic: NoteContent) => {
    setSavingTopic(topic.id);
    const result = await saveTopic(topic);
    setSavingTopic(null);
    if (result.success) {
      setSavedTopics(prev => new Set(prev).add(topic.id));
      onTopicSaved?.();
    }
  };

  const saveGoal = () => {
    const g = goalDraft.trim();
    MonthlyGoal.set(g);
    setMonthlyGoal(g);
    setEditingGoal(false);
    syncMonthlyGoal(g);
  };

  const sendMessage = async (text: string, forceCreateTopic = false) => {
    if (!text || streaming) return;
    const userMsg: Message = { role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setStreaming(true);
    setIsWarmupMode(false); // End warmup mode on first message
    abortRef.current = new AbortController();
    try {
      const handleToolCall = async (calls: ToolCall[]): Promise<string[]> => {
        const results: string[] = [];
        for (const call of calls) {
          if (call.name === 'get_detailed_report') {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: 'assistant',
                content: updated[updated.length - 1].content + `\n\n> 📊 **Analyzing student report card...**`,
              };
              return updated;
            });
            results.push(`Detailed report analyzed.`);
          } else if (call.name === 'update_topic_progress') {
            try {
              const { topicId, status, confidence, remarks } = JSON.parse(call.argsJson);
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: updated[updated.length - 1].content + `\n\n> 📝 **Guru Ji left a remark for:** ${topicId}`,
                };
                return updated;
              });
              await syncProgress(topicId, status, confidence, remarks);
              results.push(`Topic progress and remark saved for ${topicId}.`);
            } catch (e) { results.push(`Error: ${String(e)}`); }
          } else if (call.name === 'create_topic') {
            try {
              const topic = JSON.parse(call.argsJson);
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: updated[updated.length - 1].content + `\n✓ Saving: **${topic.title}**`,
                };
                return updated;
              });
              const res = await saveTopic(topic);
              onTopicSaved?.();
              results.push(res.success ? `Topic "${topic.title}" saved.` : `Error: ${res.error}`);
            } catch (e) { results.push(`Error: ${String(e)}`); }
          } else if (call.name === 'save_memory') {
            try {
              const { key, value } = JSON.parse(call.argsJson);
              await saveMemory(key, value);
              setStudentMemory(prev => prev ? `${prev}\n**${key}:** ${value}` : `**${key}:** ${value}`);
              results.push(`Memory saved: ${key}`);
            } catch (e) { results.push(`Error: ${String(e)}`); }
          } else if (call.name === 'log_weakness') {
            try {
              const { concept } = JSON.parse(call.argsJson);
              results.push(`Weakness logged: ${concept}`);
            } catch (e) { results.push(`Error: ${String(e)}`); }
          } else if (call.name === 'execute_code') {
            try {
              const { code: _code } = JSON.parse(call.argsJson);
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: updated[updated.length - 1].content + `\n\n> ⚙️ **Running Code Sandbox...**`,
                };
                return updated;
              });
              
              // We'll call the streamChat but since this is a backend-only tool in agent.js,
              // the output will come back in the next message chunk.
              // However, the results.push here informs the LLM of the outcome.
              // For now, results.push is standard tool handling.
              results.push(`Code executed. Check console output in the next response.`);
            } catch (e) { results.push(`Error: ${String(e)}`); }
          }
        }
        return results;
      };
      await streamChat(
        history, systemPrompt,
        (delta) => setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: updated[updated.length - 1].content + delta };
          return updated;
        }),
        () => {
          setStreaming(false);
          if (highlightedText) onClearHighlight?.();
        },
        abortRef.current.signal,
        handleToolCall,
        forceCreateTopic
      );
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: 'Could not reach Guru Ji. Check your API key in `.env`.' };
          return updated;
        });
      }
      setStreaming(false);
    }
  };

  const send = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (createMode) {
      const msg = `Create a comprehensive topic on: "${trimmedInput}" for the "${activeModuleLabel || activeModuleId || 'current'}" module.`;
      sendMessage(msg, true);
      setCreateMode(false);
    } else {
      sendMessage(trimmedInput);
    }
    setInput('');
    if (inputRef.current) {
      (inputRef.current as any).style.height = 'auto';
    }
  };
  const close = () => { 
    setOpen(false); 
    abortRef.current?.abort(); 
    if (highlightedText) onClearHighlight?.();
  };

  return (
    <>
      {/* Trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 group"
          style={{ backgroundColor: 'var(--domain-accent, #4db8ff)', width: 52, height: 52 }}
          title="Ask Guru Ji"
        >
          <Sparkles size={20} color="#0a0a0b" strokeWidth={2} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[390px] h-[100svh] sm:h-[580px] flex flex-col sm:rounded-2xl overflow-hidden"
          style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

          {/* Header */}
          <div className="shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[13px]"
                    style={{ background: 'linear-gradient(135deg, var(--domain-accent, #4db8ff)30, var(--domain-accent, #4db8ff)10)', border: '1px solid var(--domain-accent, #4db8ff)30', color: 'var(--domain-accent, #4db8ff)' }}>
                    GJ
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#27c93f] border-2 border-[#111113]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#f1f1f1] leading-none mb-1">Guru Ji</p>
                  <p className="text-[11px] text-[#555] leading-none">
                    {activeNote ? activeNote.title : 'Your personal mentor'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={triggerDream}
                  disabled={isDreaming}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isDreaming ? 'animate-pulse text-[#4db8ff]' : 'text-[#444] hover:text-[#4db8ff] hover:bg-white/5'}`}
                  title="Trigger Dreaming Mode (Analyze Logs)"
                >
                  <Moon size={15} />
                </button>
                <button
                  onClick={() => setIsRevisionMode(!isRevisionMode)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isRevisionMode ? 'bg-[#4db8ff]20 text-[#4db8ff]' : 'text-[#444] hover:text-[#888] hover:bg-white/5'}`}
                  title="Toggle Revision Mode"
                >
                  <BrainCircuit size={15} />
                </button>
                <button onClick={close}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-[#888] hover:bg-white/5 transition-all">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Goal strip */}
            <div className="px-4 pb-3">
              {editingGoal ? (
                <div className="flex gap-2">
                  <input
                    ref={goalInputRef}
                    value={goalDraft}
                    onChange={e => setGoalDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveGoal(); if (e.key === 'Escape') setEditingGoal(false); }}
                    placeholder="e.g. Master JS Async by June end"
                    className="flex-1 rounded-lg px-3 py-1.5 text-[12px] text-[#f1f1f1] placeholder-[#444] outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                  <button onClick={saveGoal}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                    style={{ background: 'var(--domain-accent, #4db8ff)20', color: 'var(--domain-accent, #4db8ff)' }}>
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setGoalDraft(monthlyGoal); setEditingGoal(true); }}
                  className="flex items-center gap-1.5 text-[11px] text-[#444] hover:text-[#888] transition-colors">
                  <Target size={10} />
                  <span className="truncate max-w-[270px]">{monthlyGoal || 'Set monthly goal...'}</span>
                  <Pencil size={9} className="opacity-40 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="flex flex-col justify-end min-h-full px-4 py-4 gap-4">

              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-5 py-6">
                  {isWarmupMode && (
                    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-500 mb-2">
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-[#4db8ff10] to-[#4db8ff05] border border-[#4db8ff20] shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#4db8ff15] text-[#4db8ff] shrink-0">
                          <RefreshCcw size={18} className="animate-spin-slow" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#f1f1f1]">Revision Warm-up</p>
                          <p className="text-[11px] text-[#888] leading-snug mt-0.5">Guru Ji has identified topics from your journey that need a quick review.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isWarmupMode && (
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-[18px]"
                      style={{ background: 'linear-gradient(135deg, var(--domain-accent, #4db8ff)25, var(--domain-accent, #4db8ff)08)', border: '1px solid var(--domain-accent, #4db8ff)25', color: 'var(--domain-accent, #4db8ff)' }}>
                      GJ
                    </div>
                  )}
                  
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-[#c4c7c5] mb-1">
                      {isWarmupMode ? 'Ready for a quick check?' : 'Ask me anything'}
                    </p>
                    <p className="text-[12px] text-[#444]">
                      {isWarmupMode ? 'Say "Ready" to start the revision.' : activeNote ? activeNote.title : 'Full-stack engineering, system design, DSA'}
                    </p>
                  </div>
                  
                  <div className="w-full grid grid-cols-2 gap-2">
                    {isWarmupMode ? (
                      <button
                        onClick={() => sendMessage("I'm ready for the warm-up revision. What do you have for me?")}
                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-[13px] font-bold transition-all active:scale-95 hover:bg-[#4db8ff25]"
                        style={{ background: '#4db8ff15', border: '1px solid #4db8ff30', color: '#4db8ff' }}>
                        <Sparkles size={14} />
                        Start Warm-up
                      </button>
                    ) : (
                      QUICK_ACTIONS.map(action => (
                        <button
                          key={action.label}
                          onClick={() => sendMessage(action.message)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] text-left transition-all active:scale-95 hover:bg-white/[0.04]"
                          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span className="text-[14px]">{action.icon}</span>
                          <span className="text-[#777] leading-snug">{action.label}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => {
                const detectedTopic = msg.role === 'assistant' ? extractTopicJson(msg.content) : null;
                const cleanContent = detectedTopic
                  ? msg.content.replace(/NEXUS_TOPIC_START[\s\S]*?NEXUS_TOPIC_END/, '').trim()
                  : msg.content;
                const isLast = i === messages.length - 1;

                return (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-2`}>
                    {msg.role === 'user' ? (
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed text-[#f1f1f1]"
                        style={{ background: 'var(--domain-accent, #4db8ff)22', border: '1px solid var(--domain-accent, #4db8ff)30' }}>
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full">
                        {/* Guru Ji label */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
                            style={{ background: 'var(--domain-accent, #4db8ff)15', color: 'var(--domain-accent, #4db8ff)' }}>
                            GJ
                          </div>
                          <span className="text-[10px] font-semibold text-[#444]">Guru Ji</span>
                          {streaming && isLast && (
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5" style={{ background: 'var(--domain-accent, #4db8ff)' }} />
                          )}
                        </div>
                        <div className="text-[13px] leading-relaxed text-[#c4c7c5] pl-1">
                          {cleanContent
                            ? <ChatMarkdown content={cleanContent} />
                            : streaming && isLast
                              ? <TypingDots />
                              : null}
                        </div>
                      </div>
                    )}

                    {detectedTopic && isAdmin && (
                      <button
                        onClick={() => handleSaveTopic(detectedTopic)}
                        disabled={savingTopic === detectedTopic.id || savedTopics.has(detectedTopic.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all active:scale-95 disabled:opacity-60"
                        style={{
                          border: `1px solid ${savedTopics.has(detectedTopic.id) ? '#27c93f40' : 'var(--domain-accent, #4db8ff)35'}`,
                          background: savedTopics.has(detectedTopic.id) ? '#27c93f12' : 'var(--domain-accent, #4db8ff)10',
                          color: savedTopics.has(detectedTopic.id) ? '#27c93f' : 'var(--domain-accent, #4db8ff)',
                        }}>
                        {savingTopic === detectedTopic.id ? <Loader2 size={12} className="animate-spin" />
                          : savedTopics.has(detectedTopic.id) ? <Check size={12} />
                            : <BookPlus size={12} />}
                        {savedTopics.has(detectedTopic.id) ? `Saved: ${detectedTopic.title}` : `Save to Nexus: ${detectedTopic.title}`}
                      </button>
                    )}

                    {/* Follow-up chips — only after last assistant message when done streaming */}
                    {msg.role === 'assistant' && isLast && !streaming && cleanContent && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {FOLLOW_UPS.map(f => (
                          <button
                            key={f.label}
                            onClick={() => { sendMessage(f.message); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all active:scale-95 hover:bg-white/[0.06]"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#666' }}>
                            <span>{f.icon}</span>
                            <span>{f.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#111113' }}>
            {highlightedText && (
              <div className="flex items-center justify-between mb-2 px-2.5 py-2 rounded-lg border animate-in fade-in slide-in-from-bottom-2"
                style={{ background: 'var(--domain-accent, #4db8ff)10', borderColor: 'var(--domain-accent, #4db8ff)25' }}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <Quote size={12} style={{ color: 'var(--domain-accent, #4db8ff)' }} className="shrink-0" />
                  <span className="text-[10px] font-bold tracking-wider text-[#f1f1f1] uppercase shrink-0">Asking About:</span>
                  <span className="text-[10px] text-[#888] truncate italic">"{highlightedText}"</span>
                </div>
                <button onClick={onClearHighlight} className="text-[#888] hover:text-[#f1f1f1] transition-colors p-0.5 shrink-0">
                  <X size={12} />
                </button>
              </div>
            )}
            {createMode && (
              <div className="flex items-center justify-between mb-2 px-2.5 py-1.5 rounded-lg border animate-in fade-in slide-in-from-bottom-2"
                style={{ background: 'var(--domain-accent, #4db8ff)10', borderColor: 'var(--domain-accent, #4db8ff)25' }}>
                <div className="flex items-center gap-2">
                  <FilePlus size={12} style={{ color: 'var(--domain-accent, #4db8ff)' }} />
                  <span className="text-[10px] font-bold tracking-wider text-[#f1f1f1] uppercase">Create Mode</span>
                  <span className="text-[10px] text-[#888]">— Type topic name & send</span>
                </div>
                <button onClick={() => setCreateMode(false)} className="text-[#888] hover:text-[#f1f1f1] transition-colors p-0.5">
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => setCreateMode(!createMode)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-90 hover:bg-white/5 shrink-0"
                style={{ 
                  background: createMode ? 'var(--domain-accent, #4db8ff)15' : 'transparent',
                  color: createMode ? 'var(--domain-accent, #4db8ff)' : '#555' 
                }}>
                <FilePlus size={16} />
              </button>
              <textarea
                ref={inputRef as any}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  // Auto-expand logic: reset height to min then set to scrollHeight
                  e.target.style.height = 'auto';
                  const newHeight = Math.min(e.target.scrollHeight, 72); // ~3 lines (24px each)
                  e.target.style.height = `${newHeight}px`;
                }}
                onFocus={() => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)}
                placeholder={createMode ? "Topic name to create..." : highlightedText ? "Ask about highlighted text..." : "Ask Guru Ji..."}
                disabled={streaming}
                rows={1}
                className="flex-1 bg-transparent text-[16px] sm:text-[13px] text-[#f1f1f1] placeholder-[#444] outline-none disabled:opacity-50 resize-none py-1.5 max-h-[72px] overflow-y-auto"
                style={{ scrollbarWidth: 'none' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || streaming}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 disabled:opacity-25 shrink-0"
                style={{ background: input.trim() && !streaming ? 'var(--domain-accent, #4db8ff)' : 'rgba(255,255,255,0.06)' }}>
                {streaming
                  ? <Loader2 size={13} color="#0a0a0b" className="animate-spin" />
                  : <Send size={13} color={input.trim() ? '#0a0a0b' : '#666'} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
