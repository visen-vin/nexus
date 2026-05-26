import { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Check, Lock } from 'lucide-react';

const ADMIN_KEY_STORAGE = 'nexus_admin_key';

interface InviteCode { code: string; label: string; created_at: string; }

function authHeaders(key: string) {
  return { 'Content-Type': 'application/json', 'x-admin-key': key };
}

export function AdminPanel() {
  const [key, setKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || '');
  const [authed, setAuthed] = useState(false);
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchCodes = async (k: string) => {
    const res = await fetch('/api/admin/codes', { headers: authHeaders(k) });
    if (!res.ok) { setError('Invalid admin key'); return false; }
    setCodes(await res.json());
    return true;
  };

  const login = async () => {
    const ok = await fetchCodes(key);
    if (ok) { localStorage.setItem(ADMIN_KEY_STORAGE, key); setAuthed(true); setError(''); }
  };

  useEffect(() => {
    if (key) fetchCodes(key).then(ok => { if (ok) setAuthed(true); });
  }, []);

  const addCode = async () => {
    if (!newCode || !newLabel) return;
    const code = `NEXUS-${newCode.toUpperCase().trim()}`;
    const res = await fetch('/api/admin/codes', {
      method: 'POST',
      headers: authHeaders(key),
      body: JSON.stringify({ code, label: newLabel }),
    });
    if (res.ok) { setNewCode(''); setNewLabel(''); fetchCodes(key); }
  };

  const deleteCode = async (code: string) => {
    await fetch(`/api/admin/codes/${code}`, { method: 'DELETE', headers: authHeaders(key) });
    fetchCodes(key);
  };


  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-3">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={14} className="text-[#888]" />
            <span className="text-[#888] text-[13px] font-mono">Admin Access</span>
          </div>
          <input
            autoFocus
            type="password"
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Admin key"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#f1f1f1] placeholder-[#444] outline-none focus:border-white/25 transition-colors"
          />
          {error && <p className="text-[#d96570] text-[12px]">{error}</p>}
          <button onClick={login} className="w-full py-3 rounded-xl font-bold text-[13px] text-[#0a0a0b] bg-[#4db8ff]">
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] px-6 py-10">
      <div className="max-w-lg mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#888] mb-2">Nexus Admin</p>
        <h1 className="text-2xl font-black text-[#f1f1f1] mb-8">Invite Codes</h1>

        {/* Add new code */}
        <div className="p-4 rounded-2xl border border-white/7 bg-white/[0.02] mb-6 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#888]">New Code</p>
          <div className="flex gap-2 items-center">
            <span className="text-[#555] text-[13px] font-mono shrink-0">NEXUS-</span>
            <input
              value={newCode}
              onChange={e => setNewCode(e.target.value.toUpperCase())}
              placeholder="VIN-2026"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[13px] font-mono text-[#f1f1f1] placeholder-[#444] outline-none focus:border-white/20 uppercase"
            />
          </div>
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Vinayak)"
            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-[#f1f1f1] placeholder-[#444] outline-none focus:border-white/20"
          />
          <button
            onClick={addCode}
            disabled={!newCode || !newLabel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-[#0a0a0b] bg-[#4db8ff] disabled:opacity-30"
          >
            <Plus size={12} /> Create Code
          </button>
        </div>

        {/* Code list */}
        <div className="space-y-2">
          {codes.length === 0 && <p className="text-[#555] text-[13px] text-center py-8">No codes yet.</p>}
          {codes.map(c => (
            <div key={c.code} className="flex items-center gap-3 p-4 rounded-xl border border-white/7 bg-white/[0.02]">
              <div className="flex-1 min-w-0">
                <p className="text-[#f1f1f1] text-[13px] font-mono font-bold">{c.code}</p>
                <p className="text-[#888] text-[11px]">{c.label}</p>
              </div>
              <button onClick={() => copyCode(c.code)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#555] hover:text-[#888] transition-colors">
                {copied === c.code ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
              <button onClick={() => deleteCode(c.code)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-[#555] hover:text-[#d96570] transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
