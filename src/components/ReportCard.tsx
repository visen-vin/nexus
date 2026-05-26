import { ChevronRight } from 'lucide-react';
import { CONTENT_DB } from '../data/content';
import { Progress } from '../lib/progress';
import type { NoteContent } from '../data/types';

interface FocusTopic { topic: NoteContent; reason: string; }

const CLUSTERS = [
  'Core Foundations',
  'Functions & Objects',
  'Asynchrony & Runtime',
  'Modern Standards',
  'Browser APIs & Security',
];

function getLevel(done: number) {
  if (done < 10) return { label: 'Beginner', next: 'Intermediate', threshold: 10 };
  if (done < 20) return { label: 'Intermediate', next: 'Advanced', threshold: 20 };
  if (done < 26) return { label: 'Advanced', next: 'Expert', threshold: 26 };
  return { label: 'Expert', next: '', threshold: 29 };
}

function getStreak(progress: Record<string, { date: string }>): number {
  const dates = [...new Set(
    Object.values(progress).map(p => new Date(p.date).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (dates[i] === expected.toDateString()) streak++;
    else break;
  }
  return streak;
}

function getFocusTopics(
  topics: NoteContent[],
  progress: ReturnType<typeof Progress.getAll>
): FocusTopic[] {
  if (Object.keys(progress).length === 0) return [];

  const result: FocusTopic[] = [];
  const usedIds = new Set<string>();

  // 1. Struggling topics first
  for (const topic of topics) {
    if (result.length >= 3) break;
    if (progress[topic.id]?.status === 'struggling') {
      result.push({ topic, reason: 'Revisit — marked as struggling' });
      usedIds.add(topic.id);
    }
  }

  if (result.length >= 3) return result;

  // 2. Cluster closest to completion — pick its first unread topic
  const clusterCompletion = CLUSTERS.map(name => {
    const clusterTopics = topics.filter(t => t.group === name);
    const done = clusterTopics.filter(t => progress[t.id]?.status === 'done').length;
    const unread = clusterTopics.filter(t => !progress[t.id] && !usedIds.has(t.id));
    return { name, ratio: done / (clusterTopics.length || 1), done, total: clusterTopics.length, unread };
  });

  const almostDone = clusterCompletion
    .filter(c => c.ratio > 0 && c.ratio < 1 && c.unread.length > 0)
    .sort((a, b) => b.ratio - a.ratio);

  for (const cluster of almostDone) {
    if (result.length >= 3) break;
    const next = cluster.unread[0];
    result.push({ topic: next, reason: `Almost done — finish ${cluster.name}` });
    usedIds.add(next.id);
  }

  if (result.length >= 3) return result;

  // 3. First topic from an untouched cluster
  const untouched = clusterCompletion.filter(c => c.done === 0 && c.unread.length > 0);
  for (const cluster of untouched) {
    if (result.length >= 3) break;
    const next = cluster.unread[0];
    result.push({ topic: next, reason: 'New cluster to explore' });
    usedIds.add(next.id);
  }

  return result;
}

interface Props {
  onNavigate: (id: string) => void;
  progressVersion: number;
}

export function ReportCard({ onNavigate, progressVersion: _ }: Props) {
  const jsTopics = CONTENT_DB.filter(n => n.moduleId === 'js');
  const progress = Progress.getAll();

  const doneTopics = jsTopics.filter(t => progress[t.id]?.status === 'done');
  const strongTopics = doneTopics.filter(t => progress[t.id]?.confidence === 'high');
  const shakyTopics = jsTopics.filter(t => progress[t.id]?.confidence === 'shaky');
  const strugglingTopics = jsTopics.filter(t => progress[t.id]?.status === 'struggling');
  const needsWorkTopics = [...strugglingTopics, ...shakyTopics]
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)
    .slice(0, 5);

  const done = doneTopics.length;
  const level = getLevel(done);
  const streak = getStreak(progress);
  const remaining = jsTopics.length - done;
  const hoursLeft = remaining * 0.5;

  const clusterData = CLUSTERS.map(name => {
    const clusterTopics = jsTopics.filter(t => t.group === name);
    const clusterDone = clusterTopics.filter(t => progress[t.id]?.status === 'done').length;
    return { name, done: clusterDone, total: clusterTopics.length };
  });

  const focusTopics = getFocusTopics(jsTopics, progress);

  return (
    <div className="page-enter max-w-[680px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-2">JavaScript Module</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#f1f1f1] tracking-tight">Report Card</h1>
        </div>
        <div className="flex flex-col items-end gap-2 pt-1">
          <span
            className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border"
            style={{ borderColor: 'var(--domain-accent, #4db8ff)33', backgroundColor: 'var(--domain-accent, #4db8ff)15', color: 'var(--domain-accent, #4db8ff)' }}
          >
            {level.label}
          </span>
          {streak > 0 && <span className="text-[12px] text-[#888]">🔥 {streak} day streak</span>}
        </div>
      </div>

      {/* Overall progress */}
      <div className="p-5 rounded-2xl border border-white/7 bg-white/[0.01] mb-3">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[13px] text-[#888]">Overall Progress</span>
          <span className="text-[13px] font-bold text-[#f1f1f1]">{done} / {jsTopics.length} topics</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(done / jsTopics.length) * 100}%`, backgroundColor: 'var(--domain-accent, #4db8ff)' }}
          />
        </div>
        {level.next && (
          <p className="text-[11px] text-[#888] mt-2">{level.threshold - done} more topics to reach {level.next}</p>
        )}
      </div>

      {/* Cluster breakdown */}
      <div className="flex flex-col gap-1.5 mb-8">
        {clusterData.map(c => (
          <div key={c.name} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.01]">
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1.5">
                <span className="text-[12px] text-[#888] truncate">{c.name}</span>
                <span
                  className="text-[12px] font-bold shrink-0 ml-2"
                  style={{ color: c.done === c.total && c.total > 0 ? '#27c93f' : '#f1f1f1' }}
                >
                  {c.done}/{c.total} {c.done === c.total && c.total > 0 ? '✓' : ''}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${c.total > 0 ? (c.done / c.total) * 100 : 0}%`,
                    backgroundColor: c.done === c.total && c.total > 0 ? '#27c93f' : 'var(--domain-accent, #4db8ff)',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strong / Needs work */}
      {(strongTopics.length > 0 || needsWorkTopics.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {strongTopics.length > 0 && (
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/[0.04]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-3">Strong ✓</p>
              {strongTopics.slice(0, 5).map(t => (
                <button
                  key={t.id}
                  onClick={() => onNavigate(t.id)}
                  className="block w-full text-left text-[13px] text-[#888] hover:text-[#f1f1f1] transition-colors py-0.5 truncate"
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}
          {needsWorkTopics.length > 0 && (
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-3">Needs Work ⚠</p>
              {needsWorkTopics.map(t => (
                <button
                  key={t.id}
                  onClick={() => onNavigate(t.id)}
                  className="block w-full text-left text-[13px] text-[#888] hover:text-[#f1f1f1] transition-colors py-0.5 truncate"
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Focus this week */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-3">Focus This Week</p>
        {focusTopics.length > 0 ? (
          <div className="flex flex-col gap-2">
            {focusTopics.map(({ topic, reason }, i) => (
              <button
                key={topic.id}
                onClick={() => onNavigate(topic.id)}
                className="group flex items-center gap-4 p-4 rounded-xl border border-white/7 bg-white/[0.01] hover:bg-white/[0.03] text-left transition-all"
              >
                <span className="text-[11px] font-black font-mono text-[#888] shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#f1f1f1] truncate">{topic.title}</p>
                  <p className="text-[12px] text-[#888]">{reason}</p>
                </div>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
            <p className="text-[13px] text-[#888] italic">Mark topics as done in the reader to unlock recommendations.</p>
          </div>
        )}
      </div>

      {/* Time estimate */}
      <div className="p-5 rounded-2xl border border-white/7 bg-white/[0.01]">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-4">Time to Advanced JS</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-xl bg-white/[0.02] text-center">
            <p className="text-[10px] text-[#888] mb-1">At 1 hr / day</p>
            <p className="text-2xl font-black text-[#f1f1f1]">{Math.ceil(hoursLeft)}</p>
            <p className="text-[10px] text-[#888]">days</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] text-center">
            <p className="text-[10px] text-[#888] mb-1">At 2 hr / day</p>
            <p className="text-2xl font-black text-[#f1f1f1]">{Math.ceil(hoursLeft / 2)}</p>
            <p className="text-[10px] text-[#888]">days</p>
          </div>
        </div>
        <p className="text-[12px] text-[#888]">{remaining} remaining × ~30 min avg = {hoursLeft} hrs total</p>
      </div>
    </div>
  );
}
