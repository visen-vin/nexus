// types.ts
export type DomainId = 'frontend' | 'backend' | 'devops' | 'system-design';

export interface Domain {
  id: DomainId;
  label: string;
  theme: {
    primary: string;
    dim: string;
    palette: string[];
  };
}

export interface Module {
  id: string;
  domainId: DomainId;
  label: string;
  version: string;
}

export interface Section {
  type: 'text' | 'callout' | 'code' | 'diagram' | 'faq' | 'heading' | 'interactive';
  content: string;
  metadata?: {
    level?: number;
    type?: 'architecture' | 'runtime' | 'warning';
    title?: string;
    language?: string;
  }
}

export interface NoteContent {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  group?: string; // Optional group for clubbing topics
  sections: Section[];
}
