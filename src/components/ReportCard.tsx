import { useEffect, useState } from 'react';
import { ChevronRight, Award, Flame, Zap, Trophy, Check } from 'lucide-react';
import { CONTENT_DB } from '../data/content';
import { Progress } from '../lib/progress';
import { fetchDetailedReport } from '../lib/api';
import type { DetailedReport } from '../lib/api';
import type { NoteContent } from '../data/types';

interface FocusTopic { topic: NoteContent; reason: string; }

const CLUSTERS = [
  'Core Foundations',
  'Functions & Objects',
  'Asynchrony & Runtime',
  'Modern Standards',
  'Browser APIs & Security',
];

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

export function ReportCard({ onNavigate, progressVersion }: Props) {
  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedReport().then(data => {
      setReport(data);
      setLoading(false);
    });
  }, [progressVersion]);

  const allTopics = CONTENT_DB;
  const progress = Progress.getAll();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-[#4db8ff33] border-t-[#4db8ff] rounded-full animate-spin" />
        <p className="text-[12px] text-[#555] font-mono">Generating report card...</p>
      </div>
    );
  }

  const doneTopics = allTopics.filter(t => progress[t.id]?.status === 'done');
  const strongTopics = doneTopics.filter(t => progress[t.id]?.confidence === 'high');
  const shakyTopics = allTopics.filter(t => progress[t.id]?.confidence === 'shaky');
  const strugglingTopics = allTopics.filter(t => progress[t.id]?.status === 'struggling');
  const needsWorkTopics = [...strugglingTopics, ...shakyTopics]
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)
    .slice(0, 5);

  const done = doneTopics.length;
  const remaining = allTopics.length - done;
  const hoursLeft = remaining * 0.5;

  const focusTopics = getFocusTopics(allTopics, progress);

  return (
    <div className="page-enter max-w-[680px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-2">Student Dashboard</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#f1f1f1] tracking-tight">Report Card</h1>
        </div>
        <div className="flex flex-col items-end gap-2 pt-1">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-[#555] leading-none mb-1">Current Level</p>
              <p className="text-[14px] font-black text-[#f1f1f1] leading-none">{report?.user.levelLabel}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[18px] bg-gradient-to-br from-[#4db8ff30] to-[#4db8ff10] border border-[#4db8ff30] text-[#4db8ff]">
              {report?.user.level}
            </div>
          </div>
        </div>
      </div>

      {/* Level & XP Progress */}
      <div className="p-6 rounded-2xl border border-[#4db8ff20] bg-gradient-to-br from-[#4db8ff08] to-transparent mb-8">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-[12px] font-bold text-[#f1f1f1] mb-1">XP Progression</p>
            <p className="text-[10px] text-[#555] uppercase font-mono">Next Milestone at {report?.user.nextThreshold} XP</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-black text-[#f1f1f1] leading-none">{report?.user.xp}</p>
            <p className="text-[10px] font-bold text-[#4db8ff] uppercase tracking-wider">Total XP Earned</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-[#4db8ff] to-[#4db8ff99]"
            style={{ width: `${Math.min(100, (report?.user.xp || 0) / (report?.user.nextThreshold || 1) * 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 mb-2 text-orange-400">
            <Flame size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Streak</span>
          </div>
          <p className="text-xl font-black text-[#f1f1f1]">{report?.streak} <span className="text-[10px] text-[#555] font-normal">days</span></p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 mb-2 text-green-400">
            <Check size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
          </div>
          <p className="text-xl font-black text-[#f1f1f1]">{report?.summary.completedTopics}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 mb-2 text-[#4db8ff]">
            <Zap size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">XP</span>
          </div>
          <p className="text-xl font-black text-[#f1f1f1]">{report?.user.xp}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 mb-2 text-purple-400">
            <Award size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Badges</span>
          </div>
          <p className="text-xl font-black text-[#f1f1f1]">{report?.badges.length}</p>
        </div>
      </div>

      {/* Badges Section */}
      {report?.badges && report.badges.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-4">Milestones Unlocked</p>
          <div className="flex flex-wrap gap-2">
            {report.badges.map(badge => (
              <div key={badge.id} className="group relative">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                  <Trophy size={12} />
                  <span className="text-[12px] font-bold">{badge.label}</span>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-[#1a1a1f] border border-white/10 text-[11px] text-[#888] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Module Progress */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-4">Curriculum Completion</p>
        <div className="flex flex-col gap-2">
          {report?.modules.map(mod => (
            <div key={mod.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] font-bold text-[#f1f1f1] uppercase tracking-wide">{mod.id}</span>
                <span className="text-[12px] font-mono text-[#888]">{mod.done} / {mod.total} topics</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-[#4db8ff]"
                  style={{ width: `${mod.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guru Ji's Remarks Section */}
      {report?.topicRemarks && report.topicRemarks.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-4">Guru Ji's Detailed Remarks</p>
          <div className="flex flex-col gap-3">
            {report.topicRemarks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5).map((r, i) => {
              const topic = CONTENT_DB.find(t => t.id === r.topicId);
              return (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[13px] font-bold text-[#f1f1f1]">{topic?.title || r.topicId}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${r.confidence === 'high' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {r.confidence}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#888] italic leading-relaxed">"{r.remark}"</p>
                  <p className="text-[10px] text-[#444] mt-2 font-mono">{new Date(r.updatedAt).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-4">Mastery Projection</p>
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
        <p className="text-[12px] text-[#888]">{remaining} remaining topics × ~30 min avg = {hoursLeft} hrs total</p>
      </div>
    </div>
  );
}
