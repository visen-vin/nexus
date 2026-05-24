import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Minus, RotateCcw, AlertTriangle, Play, Pause, ListTree } from 'lucide-react';

export const CallStackVisualizer = () => {
  const [stack, setStack] = useState<string[]>(['Global Execution Context']);
  const [isOverflow, setIsOverflow] = useState(false);
  const [isAutoRecursing, setIsAutoRecursing] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms delay
  const [log, setLog] = useState<string[]>(['> Initializing Global Execution Context...']);
  const timerRef = useRef<number | null>(null);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [msg, ...prev].slice(0, 15));
  }, []);

  const pushFrame = useCallback(() => {
    setStack(prev => {
      if (prev.length >= 10) {
        setIsOverflow(true);
        addLog('!! STACK OVERFLOW !!');
        setIsAutoRecursing(false);
        return prev;
      }
      const newFrame = `Function ${String.fromCharCode(64 + prev.length)}()`;
      addLog(`> Pushing ${newFrame}`);
      return [...prev, newFrame];
    });
  }, [addLog]);

  const popFrame = () => {
    if (stack.length <= 1) return;
    setIsOverflow(false);
    const popped = stack[stack.length - 1];
    setStack(prev => prev.slice(0, -1));
    addLog(`< Popping ${popped}`);
  };

  const reset = () => {
    setStack(['Global Execution Context']);
    setIsOverflow(false);
    setIsAutoRecursing(false);
    setLog(['> Stack Reset: GEC Restored']);
  };

  useEffect(() => {
    if (isAutoRecursing && !isOverflow) {
      timerRef.current = window.setInterval(() => {
        pushFrame();
      }, speed);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isAutoRecursing, isOverflow, speed, pushFrame]);

  return (
    <div className="my-10 p-6 rounded-3xl border border-white/[0.03] bg-[#0d0d0f] shadow-2xl overflow-hidden font-sans">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h4 className="text-white font-bold text-lg tracking-tight">Call Stack <span className="text-[#34d399]">Simulator</span></h4>
          <p className="text-[11px] font-mono text-[#555] uppercase tracking-wider">Interactive LIFO Tower</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={reset} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#888]"><RotateCcw size={16}/></button>
          
          <button 
            onClick={() => setIsAutoRecursing(!isAutoRecursing)}
            className={`px-4 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-2 ${
              isAutoRecursing ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-white/5 text-[#888] border border-white/5 hover:bg-white/10'
            }`}
          >
            {isAutoRecursing ? <><Pause size={12}/> Stop Recurse</> : <><Play size={12}/> Auto Recurse</>}
          </button>

          <button 
            onClick={popFrame} 
            className="px-4 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <div className="flex items-center gap-2"><Minus size={12}/> Pop</div>
          </button>
          
          <button 
            onClick={pushFrame} 
            className="px-4 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider bg-[#34d399] text-black hover:opacity-90 transition-all"
          >
            <div className="flex items-center gap-2"><Plus size={12}/> Push</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Stack Trace Log */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-3">
            <ListTree size={12} className="text-[#444]" />
            <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Stack Trace</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-[10px] min-h-[280px] flex flex-col gap-1.5">
            {log.map((entry, i) => (
              <div key={i} className={`transition-opacity duration-300 ${i === 0 ? 'text-[#34d399]' : i > 5 ? 'opacity-20' : 'opacity-50'}`}>
                {entry}
              </div>
            ))}
          </div>
        </div>

        {/* The Stack Tower */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
          <div className="relative w-full max-w-[240px] h-[350px] border-x-2 border-b-2 border-white/5 rounded-b-2xl bg-gradient-to-t from-white/[0.02] to-transparent flex flex-col-reverse p-3 gap-2">
            {stack.map((frame, i) => (
              <div 
                key={i} 
                className={`w-full p-4 rounded-xl border font-bold font-mono text-[11px] transition-all duration-300 animate-in slide-in-from-top-4 ${
                  i === stack.length - 1 
                  ? 'bg-[#34d399]/10 border-[#34d399]/40 text-[#34d399] shadow-lg shadow-[#34d399]/5' 
                  : 'bg-white/5 border-white/5 text-[#555]'
                }`}
              >
                {frame}
                {i === stack.length - 1 && <span className="float-right opacity-50">Active</span>}
              </div>
            ))}
            
            {isOverflow && (
              <div className="absolute inset-0 z-20 bg-red-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 rounded-b-xl">
                <AlertTriangle className="text-red-500 mb-2" size={32} />
                <h5 className="text-red-200 font-bold text-sm">STACK OVERFLOW</h5>
                <p className="text-red-400/70 text-[10px] mt-1 leading-relaxed uppercase tracking-tighter">Maximum call stack size exceeded</p>
                <button onClick={reset} className="mt-4 px-4 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase">Force Reset</button>
              </div>
            )}
          </div>
        </div>

        {/* Controls & Insight */}
        <div className="lg:col-span-4 order-3 space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-[10px] font-black text-[#444] uppercase tracking-widest">Recursion Speed</h6>
              <span className="text-[10px] font-mono text-[#34d399]">{speed}ms</span>
            </div>
            <input 
              type="range" 
              min="200" 
              max="2000" 
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#34d399]"
            />
            <div className="flex justify-between mt-2 text-[9px] text-[#444] font-bold">
              <span>FAST</span>
              <span>SLOW</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <h6 className="text-[10px] font-black text-[#444] uppercase tracking-widest mb-2">Memory Insight</h6>
            <p className="text-xs text-[#888] leading-relaxed italic">
              Stack frames take up finite memory. Infinite recursion without a base case leads to the error shown here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
