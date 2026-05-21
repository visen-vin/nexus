import React, { useState, useMemo, useEffect } from 'react';
import { ChevronRight, Code2, Globe, Server, Cpu, Box, Sparkles, TerminalSquare } from 'lucide-react';
import { DOMAINS } from './data/domains';
import { MODULES } from './data/modules';
import { CONTENT_DB } from './data/content';
import type { Domain, Module } from './data/types';
import './index.css';
import './components.css';

const Callout = ({ type, title, children, themeColor }: {
  type: 'architecture' | 'runtime' | 'warning';
  title: string;
  children: React.ReactNode;
  themeColor: string;
}) => {
  const colors = { architecture: themeColor, runtime: '#f9ab00', warning: '#d96570' };
  const color = colors[type];
  return (
    <div
      className="rounded-xl border p-5 my-6"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} color={color} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>{title}</span>
      </div>
      <div className="text-[#c4c7c5] text-[15px] leading-relaxed">{children}</div>
    </div>
  );
};

const CodeBlock = ({ code, language = 'javascript' }: { code: string; language?: string }) => (
  <div className="rounded-xl border border-white/7 overflow-hidden my-6 bg-[#0d0d0f]">
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
      </div>
      <span className="text-[11px] font-mono font-bold text-[#888]">{language}</span>
    </div>
    <pre className="p-5 overflow-x-auto text-[13px] leading-relaxed text-[#c4c7c5] font-mono">
      <code>{code}</code>
    </pre>
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
    <div className="min-h-screen bg-[#0a0a0b]">
      <nav className="sticky top-0 z-50 h-14 bg-[#0a0a0b] backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-between px-6 sm:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate('domains')}
            className="flex items-center gap-2 text-[#f1f1f1] font-bold text-sm tracking-tight hover:opacity-70 transition-opacity"
          >
            <TerminalSquare size={16} />
            <span>NEXUS</span>
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

      <main className="max-w-3xl mx-auto px-6 sm:px-8 pt-10 pb-20">
        {view === 'domains' && (
          <div className="page-enter">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-3">Core Domains</p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#f1f1f1] mb-2 leading-tight">
              Engineering Protocols
            </h1>
            <p className="text-[#888] text-base mb-10">High-fidelity revision tracks for senior engineers.</p>

            <div className="flex flex-col gap-2">
              {DOMAINS.map(domain => {
                const count = MODULES.filter(m => m.domainId === domain.id).length;
                return (
                  <button
                    key={domain.id}
                    onClick={() => navigate('modules', domain)}
                    className="group relative flex items-center gap-4 px-4 py-4 rounded-xl border bg-[#111113] text-left overflow-hidden transition-all duration-150 hover:bg-[#161618] active:scale-[0.99]"
                    style={{
                      '--domain-accent': domain.theme.primary,
                      borderColor: 'var(--border)',
                    } as React.CSSProperties}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${domain.theme.primary}44`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
                      style={{ backgroundColor: domain.theme.primary }}
                    />

                    {/* Icon */}
                    <div
                      className="ml-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${domain.theme.primary}15` }}
                    >
                      {getDomainIcon(domain.id, domain.theme.primary, 18)}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] text-[#f1f1f1] mb-0.5">{domain.label}</h3>
                      <p className="text-[#888] text-[13px]">{count} track{count !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={15}
                      className="text-white/20 group-hover:text-white/50 transition-colors shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'modules' && activeDomain && (
          <div className="page-enter" style={{ '--domain-accent': activeDomain.theme.primary } as React.CSSProperties}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: activeDomain.theme.primary }}>
              {activeDomain.label}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#f1f1f1] mb-2 leading-tight">
              Tech Tracks
            </h1>
            <p className="text-[#888] text-base mb-10">Select a module to begin the revision sequence.</p>

            <div className="flex flex-col gap-2">
              {domainModules.map(mod => {
                const noteCount = CONTENT_DB.filter(n => n.moduleId === mod.id).length;
                return (
                  <button
                    key={mod.id}
                    onClick={() => navigate('topics', undefined, mod)}
                    className="group relative flex items-center gap-4 px-4 py-4 rounded-xl border bg-[#111113] text-left overflow-hidden transition-all duration-150 hover:bg-[#161618] active:scale-[0.99]"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = `${activeDomain.theme.primary}44`)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl" style={{ backgroundColor: activeDomain.theme.primary }} />

                    <div className="ml-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${activeDomain.theme.primary}15` }}>
                      <Code2 size={16} color={activeDomain.theme.primary} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] text-[#f1f1f1] mb-0.5">{mod.label}</h3>
                      <p className="text-[#888] text-[13px]">{noteCount} segment{noteCount !== 1 ? 's' : ''}</p>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#888] bg-white/5 px-2 py-1 rounded shrink-0">
                      {mod.version}
                    </span>

                    <ChevronRight size={15} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'topics' && activeModule && activeDomain && (
          <div className="page-enter" style={{ '--domain-accent': activeDomain.theme.primary } as React.CSSProperties}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: activeDomain.theme.primary }}>
              {activeDomain.label} › {activeModule.label}
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#f1f1f1] mb-2 leading-tight">
              {activeModule.label}
            </h1>
            <p className="text-[#888] text-base mb-10">Architectural mastery sequence — {moduleNotes.length} segment{moduleNotes.length !== 1 ? 's' : ''}.</p>

            {moduleNotes.length > 0 ? (
              <div className="relative flex flex-col">
                {/* Vertical connector line */}
                <div className="absolute left-[24px] top-12 bottom-12 w-px bg-white/5" />

                {moduleNotes.map((note, idx) => (
                  <button
                    key={note.id}
                    onClick={() => navigate('reader', undefined, undefined, note.id)}
                    className="timeline-enter group relative flex items-start gap-4 px-2 py-4 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
                    style={{ animationDelay: `${idx * 55}ms` }}
                  >
                    {/* Step number */}
                    <div
                      className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl border text-[11px] font-black font-mono shrink-0 bg-[#111113]"
                      style={{ color: activeDomain.theme.primary, borderColor: `${activeDomain.theme.primary}33` }}
                    >
                      {String(note.order).padStart(2, '0')}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1.5">
                      <h3 className="font-semibold text-[#f1f1f1] text-base mb-1 leading-snug">{note.title}</h3>
                      <p className="text-[#888] text-sm leading-relaxed">{note.description}</p>
                    </div>

                    <ChevronRight size={15} className="text-white/15 group-hover:text-white/40 transition-colors shrink-0 mt-2" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center rounded-xl border border-white/5">
                <p className="text-[#888] italic text-sm">No segments found for this module.</p>
              </div>
            )}
          </div>
        )}

        {view === 'reader' && activeNote && activeModule && activeDomain && (
          <div
            className="page-enter max-w-[680px] mx-auto"
            style={{ '--domain-accent': activeDomain.theme.primary } as React.CSSProperties}
          >
            {/* Reader header */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setView('topics')}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#888] hover:text-[#f1f1f1] transition-colors"
                >
                  ← Index
                </button>
                <span className="text-white/10">|</span>
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: activeDomain.theme.primary }}
                >
                  Segment {activeNoteIndex + 1} / {moduleNotes.length}
                </span>
              </div>

              <h1 className="text-3xl sm:text-[3.25rem] font-black tracking-tight text-[#f1f1f1] leading-[1.05] mb-4">
                {activeNote.title}
              </h1>
              <p className="text-[#888] text-base leading-relaxed">{activeNote.description}</p>
            </header>

            {/* Article body */}
            <article className="space-y-6">
              {activeNote.sections.map((section, idx) => {
                if (section.type === 'text') {
                  return (
                    <p key={idx} className="text-[#c4c7c5] text-[15px] leading-[1.85] tracking-[-0.01em]">
                      {section.content}
                    </p>
                  );
                }
                if (section.type === 'callout') {
                  return (
                    <Callout
                      key={idx}
                      type={(section.metadata?.type || 'architecture') as 'architecture' | 'runtime' | 'warning'}
                      title={section.metadata?.title || 'Note'}
                      themeColor={activeDomain.theme.primary}
                    >
                      {section.content}
                    </Callout>
                  );
                }
                if (section.type === 'code') {
                  return <CodeBlock key={idx} code={section.content} language={section.metadata?.language} />;
                }
                return null;
              })}
            </article>

            {/* Sequential navigation */}
            <div className="grid grid-cols-2 gap-3 mt-16 pt-8 border-t border-white/5">
              <button
                disabled={activeNoteIndex === 0}
                onClick={() => navigate('reader', undefined, undefined, moduleNotes[activeNoteIndex - 1].id)}
                className="flex flex-col gap-1 p-4 rounded-xl border border-white/7 bg-[#111113] text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-white/15 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-white/7"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#888]">← Previous</span>
                <span className="font-semibold text-[#f1f1f1] text-sm truncate">
                  {activeNoteIndex > 0 ? moduleNotes[activeNoteIndex - 1].title : '—'}
                </span>
              </button>

              <button
                disabled={activeNoteIndex === moduleNotes.length - 1}
                onClick={() => navigate('reader', undefined, undefined, moduleNotes[activeNoteIndex + 1].id)}
                className="flex flex-col gap-1 p-4 rounded-xl border bg-[#111113] text-left transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  borderColor: activeNoteIndex < moduleNotes.length - 1 ? `${activeDomain.theme.primary}44` : 'var(--border)'
                }}
                onMouseEnter={e => { if (activeNoteIndex < moduleNotes.length - 1) e.currentTarget.style.borderColor = `${activeDomain.theme.primary}88`; }}
                onMouseLeave={e => { if (activeNoteIndex < moduleNotes.length - 1) e.currentTarget.style.borderColor = `${activeDomain.theme.primary}44`; }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: activeDomain.theme.primary }}>Next →</span>
                <span className="font-semibold text-[#f1f1f1] text-sm truncate">
                  {activeNoteIndex < moduleNotes.length - 1 ? moduleNotes[activeNoteIndex + 1].title : '—'}
                </span>
              </button>
            </div>
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[11px] text-[#888] font-mono tracking-widest uppercase">
            © 2026 Nexus // Core Intel Platform
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
