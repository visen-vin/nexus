import type { NoteContent } from '../data/types';
import type { TopicStatus, Confidence } from './progress';

const BASE = '/api';
const USER_KEY = 'nexus_user_id';

export function getUserId(): string {
  return localStorage.getItem(USER_KEY) ?? '';
}

export async function initUser(): Promise<{ learning_style: string } | null> {
  const id = getUserId();
  if (!id) return null;
  try {
    const res = await fetch(`${BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.ok ? res.json() : null;
  } catch { return null; }
}

export interface DynamicDomain {
  id: string; label: string; color: string; order_num: number;
}
export interface DynamicModule {
  id: string; domain_id: string; label: string; version: string; order_num: number;
}

export async function fetchDynamicDomains(): Promise<DynamicDomain[]> {
  try {
    const res = await fetch(`${BASE}/domains`);
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export async function fetchDynamicModules(): Promise<DynamicModule[]> {
  try {
    const res = await fetch(`${BASE}/modules`);
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export async function saveDomain(label: string, color: string): Promise<{ success: boolean; id?: string }> {
  try {
    const id = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const res = await fetch(`${BASE}/domains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, label, color, created_by: getUserId() }),
    });
    const data = await res.json();
    return res.ok ? { success: true, id: data.id } : { success: false };
  } catch { return { success: false }; }
}

export async function saveModule(domainId: string, label: string): Promise<{ success: boolean; id?: string }> {
  try {
    const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = `${domainId}-${slug}`;
    const res = await fetch(`${BASE}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, domainId, label, created_by: getUserId() }),
    });
    const data = await res.json();
    return res.ok ? { success: true, id: data.id } : { success: false };
  } catch { return { success: false }; }
}

export async function fetchDynamicTopics(): Promise<NoteContent[]> {
  try {
    const res = await fetch(`${BASE}/topics`);
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export async function saveTopic(topic: NoteContent): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic),
    });
    const data = await res.json();
    return res.ok ? { success: true } : { success: false, error: data.error };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function deleteTopic(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/topics/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch { return false; }
}

export async function fetchProgress(): Promise<Record<string, { status: TopicStatus; confidence: Confidence; date: string }>> {
  const id = getUserId();
  if (!id) return {};
  try {
    const res = await fetch(`${BASE}/users/${id}/progress`);
    return res.ok ? res.json() : {};
  } catch { return {}; }
}

export async function syncProgress(topicId: string, status: string, confidence: string, remarks?: string): Promise<void> {
  try {
    await fetch(`${BASE}/users/${getUserId()}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, status, confidence, remarks }),
    });
  } catch { /* best-effort */ }
}

export async function syncMonthlyGoal(goal: string): Promise<void> {
  try {
    await fetch(`${BASE}/users/${getUserId()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_goal: goal }),
    });
  } catch { /* best-effort */ }
}

export async function pushSubjectSummary(moduleId: string, summary_md: string): Promise<void> {
  try {
    await fetch(`${BASE}/users/${getUserId()}/subject-summary/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary_md }),
    });
  } catch { /* best-effort */ }
}

export async function fetchSubjectSummary(moduleId: string): Promise<string> {
  try {
    const res = await fetch(`${BASE}/users/${getUserId()}/subject-summary/${moduleId}`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.summary_md || '';
  } catch { return ''; }
}

export interface UserSummary {
  monthlyGoal: string;
  streak: number;
  totalDone: number;
  totalTopics: number;
  subjectSummaries: { module_id: string; summary_md: string }[];
}

export interface DetailedReport {
  user: { id: string; xp: number; level: number; levelLabel: string; nextThreshold: number; insights?: string };
  streak: number;
  badges: { id: string; label: string; description: string }[];
  modules: { id: string; total: number; done: number; percentage: number }[];
  topicRemarks: { topicId: string; status: string; confidence: string; remark: string; updatedAt: string }[];
  summary: { totalTopics: number; completedTopics: number; strugglingTopics: number };
}

export async function fetchUserMemory(): Promise<{ key: string; value: string }[]> {
  const id = getUserId();
  if (!id) return [];
  try {
    const res = await fetch(`${BASE}/users/${id}/memory`);
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export async function saveMemory(key: string, value: string): Promise<void> {
  const id = getUserId();
  if (!id) return;
  try {
    await fetch(`${BASE}/users/${id}/memory/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  } catch { /* best-effort */ }
}

export async function fetchUserSummary(): Promise<UserSummary | null> {
  const id = getUserId();
  if (!id) return null;
  try {
    const res = await fetch(`${BASE}/users/${id}/summary`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      monthlyGoal: data.user?.monthly_goal || '',
      streak: data.stats?.streak || 0,
      totalDone: data.stats?.done || 0,
      totalTopics: data.stats?.total || 0,
      subjectSummaries: data.subjectSummaries || [],
    };
  } catch { return null; }
}

export async function fetchDetailedReport(): Promise<DetailedReport | null> {
  const id = getUserId();
  if (!id) return null;
  try {
    const res = await fetch(`${BASE}/users/${id}/detailed-report`);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

export async function fetchWeaknesses(): Promise<{ concept: string; severity: number }[]> {
  const id = getUserId();
  if (!id) return [];
  try {
    const res = await fetch(`${BASE}/users/${id}/weaknesses`);
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'done';
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  created_at: string;
}

export async function fetchRoadmaps(): Promise<Roadmap[]> {
  const id = getUserId();
  if (!id) return [];
  try {
    const res = await fetch(`${BASE}/users/${id}/roadmaps`);
    return res.ok ? res.json() : [];
  } catch { return []; }
}

export async function updateRoadmapStep(roadmapId: string, stepId: string, status: 'pending' | 'done'): Promise<void> {
  const id = getUserId();
  if (!id) return;
  await fetch(`${BASE}/users/${id}/roadmaps/${roadmapId}/step/${stepId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}
