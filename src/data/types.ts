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
  type: 'text' | 'callout' | 'code';
  content: string;
  metadata?: {
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
  sections: Section[];
}
