import { useState, useEffect, useRef } from "react";

/* ── helpers ── */
const rand = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const shuf = (a) => [...a].sort(() => Math.random() - 0.5);

/* ── sound engine (lazy-init, safe for sandbox) ── */
function useSound() {
  const ctxRef = useRef(null);
  const getCtx = () => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      if (ctxRef.current.state === "suspended") ctxRef.current.resume();
      return ctxRef.current;
    } catch (e) { return null; }
  };
  const tone = (freq, dur, type, vol, delay) => {
    const c = getCtx();
    if (!c) return;
    try {
      const t = c.currentTime + (delay || 0);
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol || 0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) {}
  };
  return useRef({
    correct() { tone(523,.1,"sine",.3); tone(659,.1,"sine",.3,.08); tone(784,.18,"sine",.35,.16); },
    wrong()   { tone(200,.18,"sawtooth",.2); tone(150,.28,"sawtooth",.15,.12); },
    click()   { tone(800,.05,"sine",.15); },
    streak()  { [523,659,784,1047].forEach((f,i) => tone(f,.12,"sine",.22,i*.07)); },
    levelUp() { [392,523,659,784,1047].forEach((f,i) => tone(f,.22,"triangle",.25,i*.1)); },
    tick()    { tone(1000,.03,"sine",.08); },
    gameOver(){ [784,659,523,392].forEach((f,i) => tone(f,.3,"triangle",.2,i*.15)); },
    perfect() { [523,659,784,1047,1319].forEach((f,i) => tone(f,.15,"sine",.22,i*.06)); },
    select()  { tone(440,.06,"triangle",.15); tone(660,.08,"triangle",.15,.05); },
    pop()     { tone(600,.04,"sine",.2); tone(900,.06,"sine",.15,.03); },
  }).current;
}

/* ── safe math evaluator (no Function/eval) ── */
function evalMath(str) {
  const s = str.replace(/\s/g, "").replace(/x/gi, "*");
  let pos = 0;
  const ch = () => s[pos];
  const eat = (c) => { if (s[pos] === c) { pos++; return true; } return false; };

  function parseExpr() {
    let val = parseTerm();
    while (pos < s.length) {
      if (eat("+")) val += parseTerm();
      else if (eat("-")) val -= parseTerm();
      else break;
    }
    return val;
  }
  function parseTerm() {
    let val = parseFactor();
    while (pos < s.length) {
      if (eat("*")) val *= parseFactor();
      else if (eat("/")) { const d = parseFactor(); if (d === 0) throw "div0"; val /= d; }
      else break;
    }
    return val;
  }
  function parseFactor() {
    if (eat("(")) { const val = parseExpr(); eat(")"); return val; }
    if (eat("-")) return -parseFactor();
    let numStr = "";
    while (pos < s.length && s[pos] >= "0" && s[pos] <= "9") numStr += s[pos++];
    if (numStr === "") throw "parse error";
    return parseInt(numStr, 10);
  }
  const result = parseExpr();
  if (pos !== s.length) throw "parse error";
  return result;
}

/* ── constants ── */
const GAMES = [
  { id:"speed",      name:"Speed Math",       icon:"\u26A1",       gr:"from-orange-500 to-yellow-500", desc:"Race against the clock!", tag:"Arithmetic" },
  { id:"equation",   name:"Equation Builder",  icon:"\uD83E\uDDE9", gr:"from-purple-500 to-pink-500",   desc:"Find the missing number!", tag:"Logic" },
  { id:"estimation", name:"Estimation Station", icon:"\uD83C\uDFAF", gr:"from-green-500 to-teal-500",    desc:"How close can you guess?", tag:"Number Sense" },
  { id:"sequence",   name:"Pattern Hunter",     icon:"\uD83D\uDD0D", gr:"from-blue-500 to-indigo-500",   desc:"Spot the pattern!", tag:"Patterns" },
  { id:"twenty4",    name:"Make 24",            icon:"\uD83C\uDCCF", gr:"from-red-500 to-orange-500",    desc:"Make exactly 24!", tag:"Strategy" },
];
const STAGES = [
  { name:"Beginner", emoji:"\uD83C\uDF31", color:"text-green-400" },
  { name:"Explorer", emoji:"\uD83E\uDDED", color:"text-blue-400" },
  { name:"Warrior",  emoji:"\u2694\uFE0F", color:"text-purple-400" },
  { name:"Champion", emoji:"\uD83D\uDC51", color:"text-yellow-400" },
  { name:"Legend",   emoji:"\uD83C\uDF1F", color:"text-red-400" },
];

/* ====================================================================
   SPEED MATH
   ==================================================================== */
function SpeedMathGame({ stage, onScore, onComplete, sfx }) {
  const sr = useRef(0), tr = useRef(0), kr = useRef(0);
  const [prob, setProb] = useState(null);
  const [inp, setInp]   = useState("");
  const [score, setScr] = useState(0);
  const [streak, setStrk] = useState(0);
  const [time, setTime] = useState(60);
  const [total, setTot] = useState(0);
  const [fb, setFb]     = useState(null);
  const [shake, setShk] = useState(false);
  const [busy, setBusy] = useState(false);
  const iRef = useRef(null);
  const done = useRef(false);

  const mk = () => {
    const ops = stage >= 2 ? ["+","-","*","/"] : stage >= 1 ? ["+","-","*"] : ["+","-"];
    const op = ops[rand(0, ops.length-1)];
    const mx = [20,50,100,200,500][stage];
    let a, b, ans;
    if (op==="+") { a=rand(1,mx); b=rand(1,mx); ans=a+b; }
    else if (op==="-") { a=rand(1,mx); b=rand(1,a); ans=a-b; }
    else if (op==="*") { a=rand(2,Math.min(mx,stage>=3?25:12)); b=rand(2,12); ans=a*b; }
    else { b=rand(2,12); ans=rand(1,Math.min(mx/b,20)); a=b*ans; }
    return { a, b, sym: op==="*"?"\u00D7":op==="/"?"\u00F7":op, ans };
  };

  useEffect(() => { setProb(mk()); }, []);
  useEffect(() => {
    if (done.current) return;
    if (time <= 0) { done.current=true; sfx.gameOver(); onComplete(sr.current, tr.current); return; }
    const id = setTimeout(() => { setTime(t=>t-1); if (time<=11) sfx.tick(); }, 1000);
    return () => clearTimeout(id);
  }, [time]);
  useEffect(() => { if (!busy) setTimeout(() => iRef.current?.focus(), 50); }, [prob, busy]);

  const go = () => {
    if (!inp.trim() || busy || !prob || done.current) return;
    setBusy(true);
    const val = parseInt(inp, 10);
    if (isNaN(val)) { setBusy(false); return; }
    tr.current++; setTot(tr.current);
    if (val === prob.ans) {
      const pts = 10 + kr.current * 2;
      sr.current += pts; kr.current++;
      setScr(sr.current); setStrk(kr.current); onScore(pts);
      if (kr.current >= 4) sfx.streak(); else sfx.correct();
      setFb({ ok:true, msg: kr.current>=3 ? `\uD83D\uDD25 ${kr.current} streak! +${pts}` : `\u2705 +${pts}` });
    } else {
      kr.current = 0; setStrk(0); sfx.wrong();
      setShk(true); setTimeout(()=>setShk(false), 400);
      setFb({ ok:false, msg:`\u274C It was ${prob.ans}` });
    }
    setInp("");
    setTimeout(() => { setProb(mk()); setFb(null); setBusy(false); }, 600);
  };

  if (!prob) return null;
  const pct = (time/60)*100;
  const bc = time>20?"bg-green-500":time>10?"bg-yellow-500":"bg-red-500";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${bc} rounded-full`} style={{width:`${pct}%`,transition:"width 1s linear"}}/>
        </div>
        <span className={`text-2xl font-bold font-mono ${time<=10?"text-red-400 animate-pulse":"text-white"}`}>{time}s</span>
      </div>
      <div className="flex gap-8 text-center">
        <div><div className="text-xs text-gray-400">SCORE</div><div className="text-3xl font-black text-yellow-400">{score}</div></div>
        <div><div className="text-xs text-gray-400">STREAK</div><div className="text-3xl font-black text-orange-400">{streak>0?`\uD83D\uDD25${streak}`:"0"}</div></div>
        <div><div className="text-xs text-gray-400">SOLVED</div><div className="text-3xl font-black text-blue-400">{total}</div></div>
      </div>
      <div className={`bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center border border-gray-700 ${shake?"animate-bounce":""}`}>
        <div className="text-6xl font-black text-white mb-3">{prob.a} {prob.sym} {prob.b}</div>
        <div className="text-2xl text-gray-500 mb-4">= ?</div>
        <div className="flex gap-2">
          <input ref={iRef} type="number" value={inp} onChange={e=>setInp(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();go();}}}
            className="flex-1 text-center text-3xl bg-gray-900 text-white border-2 border-gray-600 focus:border-yellow-400 rounded-xl p-3 outline-none" placeholder="?" disabled={busy}/>
          <button type="button" onClick={go} disabled={busy}
            className="bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-black text-xl px-7 rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-yellow-500/20">GO</button>
        </div>
      </div>
      {fb && <div className={`text-xl font-bold px-4 py-2 rounded-xl ${fb.ok?"text-green-400 bg-green-900/40":"text-red-400 bg-red-900/40"}`}>{fb.msg}</div>}
    </div>
  );
}

/* ====================================================================
   EQUATION BUILDER
   ==================================================================== */
function EquationBuilderGame({ stage, onScore, onComplete, sfx }) {
  const sr = useRef(0), lr = useRef(3);
  const [prob, setProb]  = useState(null);
  const [inp, setInp]    = useState("");
  const [score, setScr]  = useState(0);
  const [round, setRnd]  = useState(1);
  const [lives, setLiv]  = useState(3);
  const [fb, setFb]      = useState(null);
  const [busy, setBusy]  = useState(false);
  const iRef = useRef(null);
  const maxR = 10;

  const mk = () => {
    const ops = stage>=2 ? ["+","-","*","/"] : ["+","-","*"];
    const op = ops[rand(0,ops.length-1)];
    const mx = [15,30,60,100,150][stage];
    let a, b, ans;
    if (op==="+") { a=rand(1,mx); b=rand(1,mx); ans=a+b; }
    else if (op==="-") { ans=rand(1,mx); b=rand(1,mx); a=ans+b; }
    else if (op==="*") { a=rand(2,Math.min(12,mx)); b=rand(2,12); ans=a*b; }
    else { b=rand(2,12); ans=rand(1,15); a=b*ans; }
    const sym = op==="*"?"\u00D7":op==="/"?"\u00F7":op;
    const pos = rand(0,2);
    return { show:{ a:pos===0?"?":a, b:pos===1?"?":b, ans:pos===2?"?":ans, sym }, blank: pos===0?a:pos===1?b:ans };
  };

  useEffect(() => { setProb(mk()); }, []);
  useEffect(() => { if(!busy) setTimeout(()=>iRef.current?.focus(),50); }, [prob, busy]);

  const go = () => {
    if (!inp.trim()||busy||!prob) return;
    setBusy(true);
    const val = parseInt(inp,10);
    if (isNaN(val)) { setBusy(false); return; }
    if (val === prob.blank) {
      sr.current+=15; setScr(sr.current); onScore(15); sfx.correct();
      setFb({ok:true,msg:"\u2705 Perfect!"});
    } else {
      lr.current--; setLiv(lr.current); sfx.wrong();
      setFb({ok:false,msg:`\u274C It was ${prob.blank}`});
    }
    setInp("");
    setTimeout(() => {
      setFb(null);
      if (round>=maxR||lr.current<=0) { sfx.gameOver(); onComplete(sr.current,round); }
      else { setRnd(r=>r+1); setProb(mk()); setBusy(false); }
    }, 800);
  };

  if (!prob) return null;
  const d = prob.show;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-8 text-center">
        <div><div className="text-xs text-gray-400">SCORE</div><div className="text-3xl font-black text-purple-400">{score}</div></div>
        <div><div className="text-xs text-gray-400">ROUND</div><div className="text-3xl font-black text-white">{round}/{maxR}</div></div>
        <div><div className="text-xs text-gray-400">LIVES</div><div className="text-3xl font-black text-red-400">{Array.from({length:lives},()=>"\u2764\uFE0F").join("")}</div></div>
      </div>
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg text-center border border-gray-700">
        <div className="text-5xl font-black text-white mb-6 flex items-center justify-center gap-3 flex-wrap">
          <span className={d.a==="?"?"text-yellow-400 border-b-4 border-yellow-400 px-3 animate-pulse":""}>{d.a}</span>
          <span className="text-purple-400">{d.sym}</span>
          <span className={d.b==="?"?"text-yellow-400 border-b-4 border-yellow-400 px-3 animate-pulse":""}>{d.b}</span>
          <span className="text-gray-500">=</span>
          <span className={d.ans==="?"?"text-yellow-400 border-b-4 border-yellow-400 px-3 animate-pulse":""}>{d.ans}</span>
        </div>
        <div className="flex gap-2 justify-center">
          <input ref={iRef} type="number" value={inp} onChange={e=>setInp(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();go();}}}
            className="w-36 text-center text-3xl bg-gray-900 text-white border-2 border-gray-600 focus:border-purple-400 rounded-xl p-3 outline-none" placeholder="?" disabled={busy}/>
          <button type="button" onClick={go} disabled={busy}
            className="bg-purple-500 hover:bg-purple-400 active:scale-95 text-white font-black text-xl px-6 rounded-xl transition-all disabled:opacity-40">Check</button>
        </div>
      </div>
      {fb && <div className={`text-xl font-bold px-4 py-2 rounded-xl ${fb.ok?"text-green-400 bg-green-900/40":"text-red-400 bg-red-900/40"}`}>{fb.msg}</div>}
    </div>
  );
}

/* ====================================================================
   ESTIMATION STATION
   ==================================================================== */
function EstimationGame({ stage, onScore, onComplete, sfx }) {
  const sr = useRef(0);
  const [prob, setProb]   = useState(null);
  const [inp, setInp]     = useState("");
  const [score, setScr]   = useState(0);
  const [round, setRnd]   = useState(1);
  const [fb, setFb]       = useState(null);
  const [done, setDone]   = useState(false);
  const iRef = useRef(null);
  const maxR = 8;

  const mk = () => {
    const types = [
      ()=>{ const n=rand(3,6+stage*2); const ns=Array.from({length:n},()=>rand(5,20+stage*20)); return {q:ns.join(" + "),ans:ns.reduce((a,b)=>a+b,0),hint:`Add ${n} numbers`}; },
      ()=>{ const a=rand(10,50+stage*40); const b=rand(10,50+stage*40); return {q:`${a} \u00D7 ${b}`,ans:a*b,hint:"Multiply"}; },
      ()=>{ const p=[10,15,20,25,30,40,50][rand(0,Math.min(6,2+stage))]; const v=rand(50,200+stage*100); return {q:`${p}% of ${v}`,ans:Math.round(p*v/100),hint:"Percentage"}; },
      ()=>{ const b=rand(2,5+stage); const e=rand(2,stage>=3?4:3); return {q:`${b}^${e}`,ans:Math.pow(b,e),hint:"Power"}; },
    ];
    return types[rand(0,types.length-1)]();
  };

  useEffect(()=>{setProb(mk());}, []);
  useEffect(()=>{if(!done) setTimeout(()=>iRef.current?.focus(),50);}, [prob,done]);

  const guess = () => {
    if (!inp.trim()||done||!prob) return;
    const g=parseInt(inp,10); if(isNaN(g)) return;
    const a=prob.ans; const off=Math.abs(g-a)/Math.max(a,1);
    let pts,rating;
    if(off===0){pts=30;rating="\uD83C\uDFAF EXACT!";sfx.perfect();}
    else if(off<=.05){pts=25;rating="\uD83D\uDD25 Within 5%!";sfx.streak();}
    else if(off<=.1){pts=20;rating="\u2728 Within 10%!";sfx.correct();}
    else if(off<=.2){pts=15;rating="\uD83D\uDC4D Within 20%!";sfx.correct();}
    else if(off<=.35){pts=8;rating="\uD83E\uDD14 Close-ish!";sfx.click();}
    else{pts=2;rating="\uD83D\uDE05 Way off!";sfx.wrong();}
    sr.current+=pts; setScr(sr.current); onScore(pts);
    setFb({rating,pts,g,a,off:Math.round(off*100)});
    setDone(true); setInp("");
  };

  const next = () => {
    sfx.pop(); setDone(false); setFb(null);
    if(round>=maxR){sfx.gameOver();onComplete(sr.current,round);}
    else{setRnd(r=>r+1);setProb(mk());}
  };

  const onKey = e => { if(e.key==="Enter"){e.preventDefault(); if(done)next(); else guess();} };
  if(!prob) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-8 text-center">
        <div><div className="text-xs text-gray-400">SCORE</div><div className="text-3xl font-black text-green-400">{score}</div></div>
        <div><div className="text-xs text-gray-400">ROUND</div><div className="text-3xl font-black text-white">{round}/{maxR}</div></div>
      </div>
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center border border-gray-700">
        <div className="text-sm text-teal-400 mb-1 uppercase tracking-wider">{prob.hint}</div>
        <div className="text-4xl font-black text-white mb-2">{prob.q}</div>
        <div className="text-base text-gray-400 mb-5">Estimate the answer!</div>
        {!done ? (
          <div className="flex gap-2">
            <input ref={iRef} type="number" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={onKey}
              className="flex-1 text-center text-3xl bg-gray-900 text-white border-2 border-gray-600 focus:border-green-400 rounded-xl p-3 outline-none" placeholder="Guess"/>
            <button type="button" onClick={guess}
              className="bg-green-500 hover:bg-green-400 active:scale-95 text-black font-black text-xl px-6 rounded-xl transition-all">Guess</button>
          </div>
        ) : fb && (
          <div className="space-y-3">
            <div className="text-2xl font-black text-white">{fb.rating}</div>
            <div className="flex justify-center gap-5">
              <div><div className="text-xs text-gray-400">You</div><div className="text-xl font-bold text-blue-400">{fb.g}</div></div>
              <div><div className="text-xs text-gray-400">Actual</div><div className="text-xl font-bold text-green-400">{fb.a}</div></div>
              <div><div className="text-xs text-gray-400">Off</div><div className="text-xl font-bold text-yellow-400">{fb.off}%</div></div>
            </div>
            <div className="text-lg text-yellow-400 font-bold">+{fb.pts}</div>
            <button type="button" onClick={next} className="bg-teal-500 hover:bg-teal-400 active:scale-95 text-black font-black px-8 py-3 rounded-xl text-lg transition-all">Next &rarr;</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ====================================================================
   PATTERN HUNTER
   ==================================================================== */
function PatternHunterGame({ stage, onScore, onComplete, sfx }) {
  const sr = useRef(0);
  const [prob, setProb] = useState(null);
  const [sel, setSel]   = useState(null);
  const [score, setScr] = useState(0);
  const [round, setRnd] = useState(1);
  const [fb, setFb]     = useState(null);
  const maxR = 8;

  const mk = () => {
    const pats = [
      ()=>{const s=rand(1,10),d=rand(2,5+stage*2);return Array.from({length:5},(_,i)=>s+d*i);},
      ()=>{const s=rand(2,4),m=rand(2,3);return Array.from({length:5},(_,i)=>s*Math.pow(m,i));},
      ()=>{const s=rand(100,200+stage*100),d=rand(5,15+stage*5);return Array.from({length:5},(_,i)=>s-d*i);},
      ()=>{const a=rand(1,5),b=rand(1,3);return Array.from({length:5},(_,i)=>a+b*i*i);},
    ];
    if(stage>=2) pats.push(()=>{const s=[1,1];for(let i=2;i<6;i++)s.push(s[i-1]+s[i-2]);return s;});
    if(stage>=3) pats.push(()=>Array.from({length:5},(_,i)=>(i+1)*(i+2)));
    const seq = pats[rand(0,pats.length-1)]();
    const answer = seq[4];
    const ws = new Set();
    while(ws.size<3){const w=answer+rand(1,20)*(Math.random()>.5?1:-1);if(w!==answer&&w>0)ws.add(w);}
    return {seq:seq.slice(0,4), answer, choices:shuf([answer,...ws])};
  };

  useEffect(()=>{setProb(mk());}, []);

  const pick = val => {
    if(sel!==null) return;
    sfx.pop(); setSel(val);
    if(val===prob.answer){sr.current+=20;setScr(sr.current);onScore(20);sfx.correct();setFb({ok:true,msg:"\u2705 Pattern found!"});}
    else{sfx.wrong();setFb({ok:false,msg:`\u274C It was ${prob.answer}`});}
    setTimeout(()=>{setFb(null);setSel(null);
      if(round>=maxR){sfx.gameOver();onComplete(sr.current,round);}
      else{setRnd(r=>r+1);setProb(mk());}
    },1200);
  };

  if(!prob) return null;
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-8 text-center">
        <div><div className="text-xs text-gray-400">SCORE</div><div className="text-3xl font-black text-blue-400">{score}</div></div>
        <div><div className="text-xs text-gray-400">ROUND</div><div className="text-3xl font-black text-white">{round}/{maxR}</div></div>
      </div>
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg text-center border border-gray-700">
        <div className="text-base text-indigo-400 mb-4 font-semibold">What comes next?</div>
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          {prob.seq.map((n,i)=><div key={i} className="bg-indigo-900 text-indigo-200 text-3xl font-black px-5 py-3 rounded-xl border border-indigo-700">{n}</div>)}
          <div className="bg-yellow-500 text-black text-3xl font-black px-5 py-3 rounded-xl animate-pulse">?</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {prob.choices.map((c,i)=>{
            let cls="bg-gray-700 hover:bg-gray-600 active:scale-95 text-white cursor-pointer";
            if(sel!==null){
              if(c===prob.answer) cls="bg-green-600 text-white scale-105";
              else if(c===sel) cls="bg-red-600 text-white";
              else cls="bg-gray-800 text-gray-500";
            }
            return <button key={i} type="button" onClick={()=>pick(c)} disabled={sel!==null} className={`${cls} text-2xl font-bold py-4 rounded-xl transition-all border border-gray-600`}>{c}</button>;
          })}
        </div>
      </div>
      {fb && <div className={`text-xl font-bold px-4 py-2 rounded-xl ${fb.ok?"text-green-400 bg-green-900/40":"text-red-400 bg-red-900/40"}`}>{fb.msg}</div>}
    </div>
  );
}

/* ====================================================================
   MAKE 24
   ==================================================================== */
function Make24Game({ stage, onScore, onComplete, sfx }) {
  const sr = useRef(0);
  const sets = [
    [1,2,3,4],[8,3,1,1],[6,4,1,1],[2,2,2,3],
    [2,3,4,6],[1,4,6,1],[2,2,3,4],[1,3,4,6],
    [2,4,4,4],[3,3,4,4],[1,6,8,2],[3,8,3,1],
  ];

  const [cards, setCards]  = useState(()=>shuf(sets[rand(0,sets.length-1)]));
  const [expr, setExpr]    = useState("");
  const [score, setScr]    = useState(0);
  const [round, setRnd]    = useState(1);
  const [fb, setFb]        = useState(null);
  const [hint, setHint]    = useState("");
  const [hUsed, setHU]     = useState(false);
  const [busy, setBusy]    = useState(false);
  const iRef = useRef(null);
  const maxR = 6;

  const reset = () => {
    setCards(shuf(sets[rand(0,sets.length-1)]));
    setExpr(""); setFb(null); setHint(""); setHU(false); setBusy(false);
  };

  useEffect(()=>{if(!busy)setTimeout(()=>iRef.current?.focus(),50);}, [cards,busy]);

  const go = () => {
    if(!expr.trim()||busy) return;
    try {
      const nums = expr.match(/\d+/g)?.map(Number)||[];
      const sn=[...nums].sort((a,b)=>a-b).join(",");
      const sc=[...cards].sort((a,b)=>a-b).join(",");
      if(nums.length!==4||sn!==sc){sfx.wrong();setFb({ok:false,msg:`Use exactly: ${cards.join(", ")}`});return;}
      const result = evalMath(expr);
      if(Math.abs(result-24)<0.001){
        setBusy(true);
        const pts=hUsed?10:25;
        sr.current+=pts;setScr(sr.current);onScore(pts);sfx.perfect();
        setFb({ok:true,msg:`\uD83C\uDF89 = 24! +${pts} pts!`});
        setTimeout(()=>{
          if(round>=maxR){sfx.levelUp();onComplete(sr.current,round);}
          else{setRnd(r=>r+1);reset();}
        },1200);
      } else {
        sfx.wrong();
        setFb({ok:false,msg:`That = ${Math.round(result*100)/100}, not 24!`});
      }
    } catch(e) { sfx.wrong(); setFb({ok:false,msg:"Invalid expression! Use + - * / ( )"}); }
  };

  const giveHint = () => {
    sfx.click(); setHU(true);
    const s=[...cards].sort((a,b)=>a-b);
    if(s[0]*s[1]*s[2]*s[3]===24) setHint("Multiply them all!");
    else if((s[0]+s[1])*s[2]===24||(s[0]+s[1])*s[3]===24) setHint("Add two, then multiply...");
    else setHint("Use parentheses ( ) to change the order!");
  };

  const skip = () => {
    sfx.click();
    if(round>=maxR){sfx.gameOver();onComplete(sr.current,round);}
    else{setRnd(r=>r+1);reset();}
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-8 text-center">
        <div><div className="text-xs text-gray-400">SCORE</div><div className="text-3xl font-black text-red-400">{score}</div></div>
        <div><div className="text-xs text-gray-400">ROUND</div><div className="text-3xl font-black text-white">{round}/{maxR}</div></div>
      </div>
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg text-center border border-gray-700">
        <div className="text-base text-orange-400 mb-4 font-semibold">Use + - * / and ( ) to make 24!</div>
        <div className="flex justify-center gap-4 mb-6">
          {cards.map((n,i)=><div key={i} className="bg-red-900 text-red-200 text-4xl font-black w-16 h-20 flex items-center justify-center rounded-xl border-2 border-red-700 shadow-lg">{n}</div>)}
        </div>
        <div className="flex gap-2 mb-3">
          <input ref={iRef} type="text" value={expr} onChange={e=>setExpr(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();go();}}}
            className="flex-1 text-center text-xl bg-gray-900 text-white border-2 border-gray-600 focus:border-red-400 rounded-xl p-3 outline-none font-mono"
            placeholder="e.g. (3+1)*2*4" disabled={busy}/>
          <button type="button" onClick={go} disabled={busy}
            className="bg-red-500 hover:bg-red-400 active:scale-95 text-white font-black px-5 rounded-xl transition-all disabled:opacity-40">=24?</button>
        </div>
        <div className="flex justify-center gap-4">
          <button type="button" onClick={giveHint} disabled={busy} className="text-sm text-yellow-400 hover:text-yellow-300">\uD83D\uDCA1 Hint</button>
          <button type="button" onClick={skip} disabled={busy} className="text-sm text-gray-400 hover:text-gray-300">Skip &rarr;</button>
        </div>
        {hint && <div className="text-yellow-300 mt-3 text-sm bg-yellow-900/30 rounded-lg px-3 py-1.5">{hint}</div>}
      </div>
      {fb && <div className={`text-xl font-bold px-4 py-2 rounded-xl ${fb.ok?"text-green-400 bg-green-900/40":"text-red-400 bg-red-900/40"}`}>{fb.msg}</div>}
    </div>
  );
}

/* ====================================================================
   RESULTS
   ==================================================================== */
function ResultsScreen({ game, stage, score, total, onBack, onRetry, onNextStage, sfx }) {
  const maxS = game.id==="speed"?Math.max(total*10,1):total*(game.id==="twenty4"?25:game.id==="estimation"?30:20);
  const pct = maxS>0?Math.round(score/maxS*100):0;
  const stars = pct>=90?3:pct>=60?2:pct>=30?1:0;
  const canAdv = pct>=60 && stage<4;

  useEffect(()=>{ if(stars>=2) sfx.levelUp(); }, []);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-7xl">{stars===3?"\uD83C\uDFC6":stars===2?"\u2B50":stars===1?"\uD83D\uDC4D":"\uD83D\uDCAA"}</div>
      <h2 className="text-3xl font-black text-white">{stars===3?"Outstanding!":stars===2?"Great Job!":stars===1?"Good Effort!":"Keep Practicing!"}</h2>
      <div className="flex justify-center gap-1 text-4xl">
        {[1,2,3].map(s=><span key={s} className={s<=stars?"":"opacity-20"}>{"\u2B50"}</span>)}
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
        <div className="text-5xl font-black text-yellow-400 mb-1">{score}</div>
        <div className="text-gray-400">points scored</div>
        <div className="text-sm text-gray-500 mt-1">{STAGES[stage].emoji} {STAGES[stage].name}</div>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button type="button" onClick={()=>{sfx.click();onBack();}} className="bg-gray-700 hover:bg-gray-600 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all">{"\uD83C\uDFE0"} Menu</button>
        <button type="button" onClick={()=>{sfx.select();onRetry();}} className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all">{"\uD83D\uDD04"} Retry</button>
        {canAdv && <button type="button" onClick={()=>{sfx.levelUp();onNextStage();}} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 active:scale-95 text-black font-bold px-6 py-3 rounded-xl transition-all">{"\u2B06\uFE0F"} Next Stage</button>}
      </div>
    </div>
  );
}

/* ====================================================================
   MAIN APP
   ==================================================================== */
export default function MathArcade() {
  const sfx = useSound();
  const [screen, setScreen]   = useState("menu");
  const [selGame, setSelGame] = useState(null);
  const [curStage, setCurStg] = useState(0);
  const [totScore, setTotScr] = useState(0);
  const [gScore, setGScr]     = useState(0);
  const [gTotal, setGTot]     = useState(0);
  const [xp, setXp]           = useState(0);
  const [unlocked, setUnl]    = useState({speed:1,equation:1,estimation:1,sequence:1,twenty4:1});
  const [gKey, setGKey]       = useState(0);

  const pickGame = g => { sfx.select(); setSelGame(g); setScreen("stageSelect"); };
  const startGame = si => { sfx.select(); setCurStg(si); setGScr(0); setGTot(0); setGKey(k=>k+1); setScreen("playing"); };
  const onScr = pts => { setTotScr(t=>t+pts); setXp(x=>x+pts); };
  const onDone = (fs,ft) => {
    setGScr(fs); setGTot(ft); setScreen("results");
    if(ft>0&&fs/(ft*20)>=0.5&&selGame){
      setUnl(prev=>({...prev,[selGame.id]:Math.max(prev[selGame.id]||1,curStage+2)}));
    }
  };

  const level = Math.floor(xp/100)+1;
  const xpPct = xp%100;

  /* MENU */
  if (screen==="menu") return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 pt-4">
          <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-400 via-red-400 to-purple-500 bg-clip-text text-transparent mb-2">Math Arcade</h1>
          <p className="text-gray-400">Train your brain with fun math challenges!</p>
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <div className="bg-gray-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-yellow-400 font-bold">{"\u26A1"} Lvl {level}</span>
              <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-yellow-500 rounded-full transition-all" style={{width:`${xpPct}%`}}/></div>
              <span className="text-xs text-gray-500">{xpPct}/100</span>
            </div>
            <div className="bg-gray-800 rounded-xl px-4 py-2"><span className="text-purple-400 font-bold">{"\uD83C\uDFC6"} {totScore}</span></div>
          </div>
        </div>
        <div className="grid gap-4">
          {GAMES.map(g=>(
            <button key={g.id} type="button" onClick={()=>pickGame(g)}
              className={`w-full bg-gradient-to-r ${g.gr} p-0.5 rounded-2xl transition-transform hover:scale-[1.02] active:scale-[0.97]`}>
              <div className="bg-gray-900 rounded-2xl p-5 flex items-center gap-4">
                <div className="text-5xl">{g.icon}</div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold">{g.name}</h3>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{g.tag}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{g.desc}</p>
                </div>
                <div className="text-gray-600 text-2xl">&rarr;</div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center mt-6 text-xs text-gray-600">{"\uD83D\uDD0A"} Tap a game to start &mdash; sounds play automatically!</p>
      </div>
    </div>
  );

  /* STAGE SELECT */
  if (screen==="stageSelect") {
    const ul = unlocked[selGame.id]||1;
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4">
        <div className="max-w-md mx-auto">
          <button type="button" onClick={()=>{sfx.click();setScreen("menu");}} className="text-gray-400 hover:text-white mb-6 text-lg">&larr; Back</button>
          <div className="text-center mb-8">
            <div className="text-5xl mb-2">{selGame.icon}</div>
            <h2 className="text-3xl font-bold">{selGame.name}</h2>
            <p className="text-gray-400 mt-1">Choose your difficulty</p>
          </div>
          <div className="grid gap-3">
            {STAGES.map((s,i)=>{
              const lk = i>=ul;
              return (
                <button key={i} type="button" onClick={()=>!lk&&startGame(i)} disabled={lk}
                  className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${lk?"bg-gray-900 opacity-40 cursor-not-allowed":"bg-gray-800 hover:bg-gray-700 active:bg-gray-600 active:scale-[0.98] cursor-pointer"}`}>
                  <span className="text-3xl">{lk?"\uD83D\uDD12":s.emoji}</span>
                  <div>
                    <div className={`font-bold text-lg ${s.color}`}>{s.name}</div>
                    <div className="text-sm text-gray-500">Stage {i+1}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* PLAYING */
  if (screen==="playing") {
    const C={speed:SpeedMathGame,equation:EquationBuilderGame,estimation:EstimationGame,sequence:PatternHunterGame,twenty4:Make24Game}[selGame.id];
    return (
      <div className="min-h-screen bg-gray-950 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button type="button" onClick={()=>{sfx.click();setScreen("stageSelect");}} className="text-gray-400 hover:text-white text-lg">&larr; Quit</button>
            <div className="flex items-center gap-2">
              <span className="text-lg">{selGame.icon}</span>
              <span className="font-bold">{selGame.name}</span>
              <span className={`text-sm ${STAGES[curStage].color}`}>{STAGES[curStage].emoji} {STAGES[curStage].name}</span>
            </div>
          </div>
          <C key={gKey} stage={curStage} onScore={onScr} onComplete={onDone} sfx={sfx}/>
        </div>
      </div>
    );
  }

  /* RESULTS */
  if (screen==="results") return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <ResultsScreen game={selGame} stage={curStage} score={gScore} total={gTotal} sfx={sfx}
          onBack={()=>setScreen("menu")} onRetry={()=>startGame(curStage)} onNextStage={()=>startGame(Math.min(curStage+1,4))}/>
      </div>
    </div>
  );

  return null;
}