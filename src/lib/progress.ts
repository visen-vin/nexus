export type TopicStatus = 'done' | 'struggling';
export type Confidence = 'high' | 'shaky' | 'lost';

export interface TopicProgress {
  status: TopicStatus;
  confidence: Confidence;
  date: string;
}

const KEY = 'nexus_progress';

export const Progress = {
  getAll(): Record<string, TopicProgress> {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '{}'); }
    catch { return {}; }
  },
  set(topicId: string, status: TopicStatus, confidence: Confidence): void {
    const all = this.getAll();
    all[topicId] = { status, confidence, date: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
  },
  remove(topicId: string): void {
    const all = this.getAll();
    delete all[topicId];
    localStorage.setItem(KEY, JSON.stringify(all));
  },
  hydrate(serverProgress: Record<string, TopicProgress>): void {
    localStorage.setItem(KEY, JSON.stringify(serverProgress));
  }
};
