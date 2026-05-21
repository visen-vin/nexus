import type { Domain } from './types';

export const DOMAINS: Domain[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    theme: {
      primary: '#4285f4',
      dim: 'rgba(66, 133, 244, 0.1)',
      palette: ['#4285f4', '#24bdff', '#00d2ff']
    }
  },
  {
    id: 'backend',
    label: 'Backend',
    theme: {
      primary: '#f9ab00',
      dim: 'rgba(249, 171, 0, 0.1)',
      palette: ['#f9ab00', '#ff7e00', '#ff4d00']
    }
  },
  {
    id: 'devops',
    label: 'DevOps',
    theme: {
      primary: '#34a853',
      dim: 'rgba(52, 168, 83, 0.1)',
      palette: ['#34a853', '#00d084', '#00ff94']
    }
  },
  {
    id: 'system-design',
    label: 'System Design',
    theme: {
      primary: '#9b72cb',
      dim: 'rgba(155, 114, 203, 0.1)',
      palette: ['#9b72cb', '#d96570', '#ff6b6b']
    }
  }
];
