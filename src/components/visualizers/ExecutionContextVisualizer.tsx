import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const CODE_SNIPPET = `var a = 1;
function outer() {
  var b = 2;
  function inner() {
    var c = 3;
    return a + b + c;
  }
  return inner();
}
outer();`;

const PHASES = [
  {
    id: 0,
    label: "Global EC Created",
    phase: "Memory Creation",
    description: "Global Execution Context pushed. Variables hoisted as undefined, functions stored as full definitions.",
    callStack: ["GEC"],
    memory: { a: "undefined", outer: "[Function]" },
    variables: { a: "undefined", outer: "[Function]" },
    highlight: [0, 1],
  },
  {
    id: 1,
    label: "GEC Code Execution",
    phase: "Code Execution",
    description: "Code runs line-by-line. 'a' is assigned '1'. outer() call creates a new FEC.",
    callStack: ["GEC", "FEC: outer()"],
    memory: { a: "1", outer: "[Function]" },
    variables: { a: "1", outer: "[Function]", b: "undefined", inner: "[Function]" },
    highlight: [0, 2],
  },
  {
    id: 2,
    label: "outer() Memory Phase",
    phase: "Memory Creation",
    description: "Inside outer()'s FEC. 'b' hoisted as undefined, 'inner' stored as full definition.",
    callStack: ["GEC", "FEC: outer()"],
    memory: { a: "1", outer: "[Function]", b: "undefined", inner: "[Function]" },
    variables: { a: "1", outer: "[Function]", b: "undefined", inner: "[Function]" },
    highlight: [3, 4],
  },
  {
    id: 3,
    label: "outer() Code Execution",
    phase: "Code Execution",
    description: "'b' assigned '2'. inner() called — another FEC pushed. Closure captures scope.",
    callStack: ["GEC", "FEC: outer()", "FEC: inner()"],
    memory: { a: "1", outer: "[Function]", b: "2", inner: "[Function]", c: "undefined" },
    variables: { a: "1", outer: "[Function]", b: "2", inner: "[Function]", c: "undefined" },
    highlight: [3, 5, 6],
  },
  {
    id: 4,
    label: "inner() Executes",
    phase: "Code Execution",
    description: "'c = 3'. Return = 1+2+3 = 6. inner() popped after return.",
    callStack: ["GEC", "FEC: outer()"],
    memory: { a: "1", outer: "[Function]", b: "2", inner: "[Function]", c: "3" },
    variables: { a: "1", outer: "[Function]", b: "2", inner: "[Function]", c: "3", returnVal: "6" },
    highlight: [5, 6, 7],
    popped: "FEC: inner()",
    returnVal: "6",
  },
  {
    id: 5,
    label: "outer() Returns",
    phase: "Cleanup",
    description: "outer() returns 6. Its FEC is popped. Execution returns to GEC.",
    callStack: ["GEC"],
    memory: { a: "1", outer: "[Function]" },
    variables: { a: "1", outer: "[Function]" },
    highlight: [8],
    popped: "FEC: outer()",
    returnVal: "6",
  },
];

export const ExecutionContextVisualizer = () => {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const timerRef = useRef<number | null>(null);

  const current = PHASES[step];

  useEffect(() => {
    if (auto) {
      timerRef.current = window.setInterval(() => {
        setStep(s => {
          if (s >= PHASES.length - 1) { setAuto(false); return s; }
          return s + 1;
        });
      }, 2500);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [auto]);

  return (
    <div className="my-10 p-6 rounded-3xl border border-white/[0.03] bg-[#0d0d0f] shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h4 className="text-white font-bold text-lg tracking-tight">Execution Context <span className="text-[#f59e0b]">Visualizer</span></h4>
          <p className="text-[11px] font-mono text-[#555] uppercase tracking-wider">Step {step + 1} of {PHASES.length} — {current.label}</p>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
          <button onClick={() => setStep(0)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#888]"><RotateCcw size={16}/></button>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#888]"><ChevronLeft size={16}/></button>
          <button onClick={() => setAuto(!auto)} className={`px-4 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all ${auto ? 'bg-red-500/20 text-red-400' : 'bg-[#f59e0b] text-black'}`}>
            {auto ? <div className="flex items-center gap-2"><Pause size={12}/> Pause</div> : <div className="flex items-center gap-2"><Play size={12}/> Auto Play</div>}
          </button>
          <button onClick={() => setStep(s => Math.min(PHASES.length - 1, s + 1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#888]"><ChevronRight size={16}/></button>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-start">
        <div className="px-2 py-1 rounded bg-white/5 text-[9px] font-black uppercase text-[#f59e0b] mt-1 border border-[#f59e0b]/20 tracking-widest">{current.phase}</div>
        <p className="text-sm text-[#888] leading-relaxed">{current.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code */}
        <div className="lg:col-span-5">
           <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-3">Source Environment</div>
           <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-[13px] leading-relaxed relative overflow-hidden">
             {CODE_SNIPPET.split('\n').map((line, i) => (
               <div key={i} className={`px-2 rounded transition-all duration-300 ${current.highlight.includes(i) ? 'bg-[#f59e0b]/10 text-white translate-x-1' : 'text-[#444]'}`}>
                 <span className="inline-block w-4 text-[10px] mr-3 opacity-30 select-none">{i+1}</span>
                 {line || ' '}
               </div>
             ))}
           </div>
        </div>

        {/* Call Stack */}
        <div className="lg:col-span-3">
          <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-3">Call Stack</div>
          <div className="flex flex-col-reverse gap-2 min-h-[150px] justify-end">
            <div className="text-[9px] text-center text-[#222] font-black tracking-widest py-2 border-t border-white/5 mt-2">STACK BOTTOM</div>
            {current.callStack.map((frame, i) => (
              <div key={frame} className={`p-3 rounded-xl border text-[11px] font-bold font-mono transition-all duration-500 animate-in slide-in-from-bottom-2 ${i === current.callStack.length - 1 ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]' : 'bg-white/5 border-white/5 text-[#555]'}`}>
                {frame} {i === current.callStack.length - 1 && '◀'}
              </div>
            ))}
          </div>
        </div>

        {/* Memory */}
        <div className="lg:col-span-4">
          <div className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-3">Variable Environment</div>
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 font-mono text-[12px]">
            {Object.entries(current.variables).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-white/[0.02] last:border-0">
                <span className="text-[#666]">{k}</span>
                <span className={v === 'undefined' ? 'text-[#444]' : 'text-[#34d399]'}>{v as string}</span>
              </div>
            ))}
            {current.returnVal && (
              <div className="mt-4 p-2 rounded bg-[#34d399]/5 border border-[#34d399]/20 text-center animate-pulse">
                <span className="text-[10px] text-[#34d399] uppercase font-black block mb-1">Return Value</span>
                <span className="text-xl font-black text-[#34d399]">{current.returnVal}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
