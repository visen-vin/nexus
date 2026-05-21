import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, Zap, Activity, ChevronRight, ChevronLeft, 
  Code2, Database, Globe, Server, Cpu, Box, 
  Sparkles, Layout, TerminalSquare, Clock, BookOpen
} from 'lucide-react';
import { DOMAINS } from './data/domains';
import { MODULES } from './data/modules';
import { CONTENT_DB } from './data/content';
import type { Domain, Module, NoteContent } from './data/types';
import './index.css';
import './components.css';

const CardPalette = ({ colors }: { colors: string[] }) => (
  <div className="card-palette">
    {colors.map((c, i) => (
      <div key={i} className="palette-dot" style={{ '--dot-color': c } as any} />
    ))}
  </div>
);

const Callout = ({ type, title, children, themeColor }: { type: 'architecture' | 'runtime' | 'warning', title: string, children: React.ReactNode, themeColor: string }) => {
  const colors = { architecture: '#4285f4', runtime: '#f9ab00', warning: '#d96570' };
  const calloutColor = type === 'architecture' ? themeColor : colors[type];
  
  return (
    <div className="callout fade-in" style={{ '--callout-color': calloutColor } as any}>
      <div className="callout-header">
        <Sparkles size={16} color={calloutColor} />
        <span style={{ color: calloutColor }}>{title}</span>
      </div>
      <div style={{ color: '#c4c7c5', fontSize: '1.05rem', lineHeight: '1.8' }}>{children}</div>
    </div>
  );
};

const CodeBlock = ({ code, language = 'javascript' }: { code: string, language?: string }) => (
  <div className="code-wrapper fade-in">
    <div className="code-header">
      <div className="window-controls">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      <span>{language}</span>
    </div>
    <pre><code>{code}</code></pre>
  </div>
);

function App() {
  const [view, setView] = useState<'domains' | 'modules' | 'topics' | 'reader'>('domains');
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // Derived state (Dynamic Queries)
  const domainModules = useMemo(() => activeDomain ? MODULES.filter(m => m.domainId === activeDomain.id) : [], [activeDomain]);
  const moduleNotes = useMemo(() => activeModule ? CONTENT_DB.filter(n => n.moduleId === activeModule.id).sort((a,b) => a.order - b.order) : [], [activeModule]);
  const activeNote = useMemo(() => CONTENT_DB.find(n => n.id === activeNoteId) || null, [activeNoteId]);
  const activeNoteIndex = useMemo(() => moduleNotes.findIndex(n => n.id === activeNoteId), [moduleNotes, activeNoteId]);

  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    if (view !== 'reader') { setReadProgress(0); return; }
    const handleScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  const navigate = (to: typeof view, domain?: Domain, mod?: Module, noteId?: string) => {
    if (domain) setActiveDomain(domain);
    if (mod) setActiveModule(mod);
    if (noteId) setActiveNoteId(noteId);
    setView(to);
    window.scrollTo(0, 0);
  };

  const getDomainIcon = (id: string, color: string = 'white', size: number = 24) => {
    switch(id) {
      case 'frontend': return <Globe size={size} color={color} />;
      case 'backend': return <Server size={size} color={color} />;
      case 'devops': return <Box size={size} color={color} />;
      case 'system-design': return <Cpu size={size} color={color} />;
      default: return <Code2 size={size} color={color} />;
    }
  };

  return (
    <div className="app-container">
      <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-between px-4">
          {/* Logo */}
          <button
            onClick={() => navigate('domains')}
            className="flex items-center gap-2 text-[#f1f1f1] font-bold text-sm tracking-tight hover:opacity-70 transition-opacity"
          >
            <TerminalSquare size={16} />
            <span>ENG HUB</span>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
            {activeDomain && (
              <>
                <span className="text-white/15">›</span>
                <button
                  onClick={() => navigate('modules')}
                  className="hover:text-[#f1f1f1] transition-colors"
                >
                  {activeDomain.label}
                </button>
              </>
            )}
            {activeModule && (
              <>
                <span className="text-white/15">›</span>
                <button
                  onClick={() => navigate('topics')}
                  className="hover:text-[#f1f1f1] transition-colors"
                >
                  {activeModule.label}
                </button>
              </>
            )}
            {view === 'reader' && activeNote && (
              <>
                <span className="text-white/15">›</span>
                <span className="text-white/50 truncate max-w-[100px] sm:max-w-[200px]">
                  {activeNote.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Reading progress bar */}
        {view === 'reader' && (
          <div
            className="absolute bottom-0 left-0 h-[2px] transition-all duration-150"
            style={{ width: `${readProgress}%`, backgroundColor: 'var(--domain-accent)' }}
          />
        )}
      </nav>

      <main className="main-view">
        {view === 'domains' && (
          <div className="fade-in">
            <h1>Core Domains</h1>
            <p className="subtitle">High-fidelity engineering protocols.</p>
            <div className="bento-grid">
              {DOMAINS.map(domain => {
                const count = MODULES.filter(m => m.domainId === domain.id).length;
                return (
                  <button 
                    key={domain.id} 
                    onClick={() => navigate('modules', domain)} 
                    className="domain-card"
                    style={{ '--card-accent': domain.theme.primary, '--card-accent-dim': domain.theme.dim } as any}
                  >
                    <div className="card-icon-box">
                      {getDomainIcon(domain.id, 'white', 22)}
                    </div>
                    <div className="card-content">
                      <h3>{domain.label}</h3>
                      <p>{count} specialised tracks</p>
                    </div>
                    <CardPalette colors={domain.theme.palette} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'modules' && activeDomain && (
          <div className="fade-in">
            <h1>{activeDomain.label} Tracks</h1>
            <p className="subtitle">Select a module to review documentation.</p>
            <div className="bento-grid">
              {domainModules.map(mod => (
                <button 
                  key={mod.id} 
                  onClick={() => navigate('topics', undefined, mod)} 
                  className="domain-card"
                  style={{ '--card-accent': activeDomain.theme.primary, '--card-accent-dim': activeDomain.theme.dim } as any}
                >
                  <div className="p-2.5 bg-white/10 rounded-lg w-fit">
                    <Code2 size={18} color="white" />
                  </div>
                  <div className="card-content">
                    <h3 style={{ fontSize: '1.25rem' }}>{mod.label}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-zinc-400">Protocol {mod.version}</span>
                    </div>
                  </div>
                  <CardPalette colors={activeDomain.theme.palette} />
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'topics' && activeModule && activeDomain && (
          <div className="fade-in">
            <h1 style={{ fontSize: '2.5rem' }}>{activeModule.label}</h1>
            <p className="subtitle">Architectural mastery sequence.</p>
            <div className="timeline-list" style={{ '--theme-color': activeDomain.theme.primary, '--theme-dim': activeDomain.theme.dim } as any}>
              {moduleNotes.length > 0 ? moduleNotes.map((note, idx) => (
                <button key={note.id} onClick={() => navigate('reader', undefined, undefined, note.id)} className="timeline-item" style={{ '--delay': `${idx * 0.1}s` } as any}>
                  <div className="step-indicator">{String(note.order).padStart(2, '0')}</div>
                  <div className="topic-meta">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Segment Protocol</span>
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: activeDomain.theme.primary }}>Active</span>
                    </div>
                    <h3>{note.title}</h3>
                    <p>{note.description}</p>
                  </div>
                  <ChevronRight size={18} className="text-zinc-800" />
                </button>
              )) : (
                <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/5">
                  <p className="text-muted italic">Asset sequence loading...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'reader' && activeNote && activeModule && activeDomain && (
          <div className="reader-view fade-in" style={{ '--theme-color': activeDomain.theme.primary } as any}>
            <header className="reader-header">
              <div className="flex items-center justify-between mb-6">
                <button className="index-badge" onClick={() => setView('topics')}>Index</button>
                <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px] tracking-widest uppercase">
                  <Clock size={12} /> <span>12 min read</span>
                </div>
              </div>
              <h1>{activeNote.title}</h1>
              <div className="flex items-center gap-4 text-zinc-500 font-medium text-sm">
                <div className="flex items-center gap-1.5"><Database size={14} /> <span>Module: {activeModule.label}</span></div>
                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                <div className="flex items-center gap-1.5"><BookOpen size={14} /> <span>Segment {activeNoteIndex + 1} of {moduleNotes.length}</span></div>
              </div>
            </header>

            <article>
              {activeNote.sections.map((section, idx) => {
                if (section.type === 'text') return <p key={idx} className="text-body">{section.content}</p>;
                if (section.type === 'callout') return <Callout key={idx} type={section.metadata?.type as any || 'architecture'} title={section.metadata?.title || 'Note'} themeColor={activeDomain.theme.primary}>{section.content}</Callout>;
                if (section.type === 'code') return <CodeBlock key={idx} code={section.content} language={section.metadata?.language} />;
                return null;
              })}
            </article>

            <div className="seq-nav">
              <button disabled={activeNoteIndex === 0} onClick={() => navigate('reader', undefined, undefined, moduleNotes[activeNoteIndex - 1].id)} className="nav-card">
                <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Previous Protocol</div>
                <div className="font-bold text-lg truncate">{activeNoteIndex > 0 ? moduleNotes[activeNoteIndex - 1].title : 'Origin'}</div>
              </button>
              <button disabled={activeNoteIndex === moduleNotes.length - 1} onClick={() => navigate('reader', undefined, undefined, moduleNotes[activeNoteIndex + 1].id)} className="nav-card next" style={{ borderColor: activeDomain.theme.primary + '33' }}>
                <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-2" style={{ color: activeDomain.theme.primary }}>Next Protocol</div>
                <div className="font-bold text-lg truncate" style={{ color: '#fff' }}>{activeNoteIndex < moduleNotes.length - 1 ? moduleNotes[activeNoteIndex + 1].title : 'Terminal'}</div>
              </button>
            </div>
          </div>
        )}

        <footer className="footer">
          <p>© 2026 Core Intel Platform // Node-42</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
