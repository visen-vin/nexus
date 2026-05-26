import { useState } from 'react';
import { Globe, Server, Box, Cpu, ArrowRight } from 'lucide-react';
import { getUserId } from '../lib/api';

const DOMAINS = [
  { id: 'frontend', label: 'Frontend', desc: 'JS, React, CSS, Browser APIs', icon: Globe, color: '#4db8ff' },
  { id: 'backend', label: 'Backend', desc: 'Node.js, APIs, Databases', icon: Server, color: '#34c98a' },
  { id: 'devops', label: 'DevOps', desc: 'Docker, AWS, CI/CD, Linux', icon: Box, color: '#f9ab00' },
  { id: 'system-design', label: 'System Design', desc: 'HLD, Scalability, Architecture', icon: Cpu, color: '#d96570' },
];

interface Props {
  onDone: (domainId: string) => void;
}

export function OnboardingScreen({ onDone }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetch(`/api/users/${getUserId()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learning_style: selected }),
      });
    } catch { /* best-effort */ }
    setSaving(false);
    onDone(selected);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-3 text-center">Welcome to Nexus</p>
        <h1 className="text-2xl font-black text-[#f1f1f1] tracking-tight mb-2 text-center leading-tight">
          Kya seekhna chahte ho?
        </h1>
        <p className="text-[#888] text-[13px] text-center mb-8">Baad mein badal sakte ho.</p>

        <div className="flex flex-col gap-2 mb-6">
          {DOMAINS.map(d => {
            const Icon = d.icon;
            const active = selected === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className="flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all"
                style={{
                  borderColor: active ? `${d.color}55` : 'rgba(255,255,255,0.07)',
                  backgroundColor: active ? `${d.color}10` : 'transparent',
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${d.color}15` }}>
                  <Icon size={18} color={d.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[14px] text-[#f1f1f1]">{d.label}</p>
                  <p className="text-[12px] text-[#888]">{d.desc}</p>
                </div>
                {active && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={confirm}
          disabled={!selected || saving}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] text-[#0a0a0b] transition-all active:scale-95 disabled:opacity-30"
          style={{ backgroundColor: selected ? DOMAINS.find(d => d.id === selected)?.color : '#4db8ff' }}
        >
          {saving ? 'Setting up...' : 'Start Learning'}
          {!saving && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}
