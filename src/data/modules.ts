import type { Module } from './types';

export const MODULES: Module[] = [
  // Frontend
  { id: 'js', domainId: 'frontend', label: 'JavaScript', version: 'v1.4' },
  { id: 'ts', domainId: 'frontend', label: 'TypeScript', version: 'v2.0' },
  { id: 'react', domainId: 'frontend', label: 'React', version: 'v18.3' },
  { id: 'redux', domainId: 'frontend', label: 'Redux / RTK', version: 'v2.1' },
  
  // Backend
  { id: 'node', domainId: 'backend', label: 'Node.js Core', version: 'v20.x' },
  { id: 'postgres', domainId: 'backend', label: 'PostgreSQL', version: 'v15' },
  
  // System Design
  { id: 'hld', domainId: 'system-design', label: 'High Level Design', version: 'v1.0' },
  { id: 'db-sharding', domainId: 'system-design', label: 'Database Sharding', version: 'v1.2' }
];
