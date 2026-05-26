import { useState, useRef, useEffect } from 'react';
import { TerminalSquare, ArrowRight, AlertCircle } from 'lucide-react';

const CODE_KEY = 'nexus_invite_code';
const USER_KEY = 'nexus_user_id';

export function codeToUserId(code: string): string {
  return btoa(code.toUpperCase().trim()).replace(/=/g, '');
}

export function getStoredCode(): string | null {
  return localStorage.getItem(CODE_KEY);
}

export function applyCode(code: string): string {
  const normalized = code.toUpperCase().trim();
  const userId = codeToUserId(normalized);
  localStorage.setItem(CODE_KEY, normalized);
  localStorage.setItem(USER_KEY, userId);
  return userId;
}

export function clearCode(): void {
  localStorage.removeItem(CODE_KEY);
  localStorage.removeItem(USER_KEY);
}

const PREFIX = 'NEXUS-';

function normalizeSuffix(raw: string): string {
  // If user pastes full code like NEXUS-VIN-2026, strip prefix
  const upper = raw.toUpperCase().trim();
  if (upper.startsWith(PREFIX)) return upper.slice(PREFIX.length);
  return upper;
}

function isValidSuffix(suffix: string): boolean {
  return /^[A-Z0-9]{3,8}-[A-Z0-9]{3,8}$/.test(suffix.trim());
}

interface Props {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: Props) {
  const [suffix, setSuffix] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const fullCode = PREFIX + suffix.toUpperCase().trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuffix(normalizeSuffix(e.target.value));
  };

  const handleSubmit = async () => {
    if (!isValidSuffix(suffix)) {
      setError('Format: XXXX-XXXX (e.g. VIN1-2026)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/validate-code/${encodeURIComponent(fullCode)}`);
      const data = await res.json();
      if (!data.valid) {
        setError('Invalid code. Contact the admin for access.');
        setLoading(false);
        return;
      }
      const userId = applyCode(fullCode);
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
    } catch {
      setError('Could not reach server. Try again.');
      setLoading(false);
      return;
    }
    setLoading(false);
    onEnter();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12 justify-center">
          <TerminalSquare size={18} className="text-[#f1f1f1]" />
          <span className="text-[#f1f1f1] font-black text-sm tracking-tight">NEXUS</span>
        </div>

        <h1 className="text-2xl font-black text-[#f1f1f1] tracking-tight mb-2 text-center">
          Enter your invite code
        </h1>
        <p className="text-[#888] text-[13px] text-center mb-8">
          Your code links progress across all devices.
        </p>

        <div className="space-y-3">
          {/* Split input: static prefix + editable suffix */}
          <div
            className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-white/25 transition-colors overflow-hidden"
            onClick={() => inputRef.current?.focus()}
          >
            <span className="pl-4 pr-1 text-[14px] font-mono text-[#888] tracking-widest select-none shrink-0">
              NEXUS-
            </span>
            <input
              ref={inputRef}
              value={suffix}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="XXXX-XXXX"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 bg-transparent py-3 pr-4 text-[14px] font-mono text-[#f1f1f1] placeholder-[#444] outline-none tracking-widest uppercase min-w-0"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[#d96570] text-[12px]">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!suffix.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] text-[#0a0a0b] transition-all active:scale-95 disabled:opacity-30"
            style={{ backgroundColor: '#4db8ff' }}
          >
            {loading ? 'Entering...' : 'Enter Nexus'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </div>

        <p className="text-[#555] text-[11px] text-center mt-8">
          Don't have a code? Contact the admin.
        </p>
      </div>
    </div>
  );
}
