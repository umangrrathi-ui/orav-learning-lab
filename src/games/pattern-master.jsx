import { useState, useEffect, useCallback, useRef } from "react";

const SFX = (() => {
  let ctx = null;
  const gc = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === "suspended") ctx.resume(); return ctx; };
  const p = (f, ty, d, v = 0.12, dl = 0) => { try { const c = gc(), o = c.createOscillator(), g = c.createGain(); o.type = ty; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime + dl); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dl + d); o.connect(g); g.connect(c.destination); o.start(c.currentTime + dl); o.stop(c.currentTime + dl + d + 0.05); } catch (e) {} };
  return {
    correct: () => { p(660, "sine", 0.1, 0.1); p(880, "sine", 0.12, 0.08, 0.08); },
    wrong: () => { p(200, "sawtooth", 0.2, 0.08); p(160, "sawtooth", 0.25, 0.06, 0.1); },
    click: () => p(700, "sine", 0.03, 0.05),
    win: () => { [523, 659, 784, 1047].forEach((f, i) => p(f, "sine", 0.16, 0.08, i * 0.1)); },
    star: () => p(1200, "sine", 0.1, 0.05),
    lvlUp: () => { [440, 554, 659, 880].forEach((f, i) => p(f, "triangle", 0.1, 0.06, i * 0.08)); },
    simon: (idx) => { const freqs = [262, 330, 392, 523]; p(freqs[idx % 4], "sine", 0.25, 0.15); },
  };
})();

function Av({ size = 40, happy = true }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="pmag"><stop offset="0%" stopColor="#fc0" stopOpacity="0.3" /><stop offset="100%" stopColor="transparent" stopOpacity="0" /></radialGradient>
        <radialGradient id="pmfg" cx="45%" cy="40%"><stop offset="0%" stopColor="#F5D0A9" /><stop offset="100%" stopColor="#D4A574" /></radialGradient>
        <linearGradient id="pmmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF1744" /><stop offset="50%" stopColor="#D50000" /><stop offset="100%" stopColor="#B71C1C" /></linearGradient>
        <linearGradient id="pmgt" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFD54F" /><stop offset="50%" stopColor="#FFF176" /><stop offset="100%" stopColor="#FFD54F" /></linearGradient>
      </defs>
      <circle cx="50" cy="55" r="46" fill="url(#pmag)" />
      <ellipse cx="50" cy="48" rx="30" ry="32" fill="#1a1a2e" />
      <ellipse cx="50" cy="56" rx="25" ry="27" fill="url(#pmfg)" />
      <ellipse cx="25" cy="54" rx="4" ry="5.5" fill="#D4A574" /><circle cx="25" cy="58" r="1.8" fill="#FFD54F" />
      <ellipse cx="75" cy="54" rx="4" ry="5.5" fill="#D4A574" /><circle cx="75" cy="58" r="1.8" fill="#FFD54F" />
      <path d="M46 40Q46 34 50 32Q54 34 54 40" fill="none" stroke="#FF6D00" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="41" r="1.4" fill="#FF6D00" />
      <ellipse cx="41" cy="52" rx="5.5" ry="6" fill="white" /><ellipse cx="42" cy="52" rx="3.8" ry="4.2" fill="#2d1b00" /><circle cx="43.3" cy="50.5" r="1.4" fill="white" />
      <ellipse cx="59" cy="52" rx="5.5" ry="6" fill="white" /><ellipse cx="60" cy="52" rx="3.8" ry="4.2" fill="#2d1b00" /><circle cx="61.3" cy="50.5" r="1.4" fill="white" />
      <path d="M35 45Q41 42 47 45" fill="none" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M53 45Q59 42 65 45" fill="none" stroke="#1a1a2e" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="50" cy="59" rx="2.3" ry="1.8" fill="#C99B6D" />
      {happy ? (<path d="M44 66Q50 72 56 66" fill="none" stroke="#8B4513" strokeWidth="1.6" strokeLinecap="round" />) : (<path d="M44 69Q50 65 56 69" fill="none" stroke="#8B4513" strokeWidth="1.6" strokeLinecap="round" />)}
      <circle cx="34" cy="60" r="3.5" fill="#FF8A80" opacity="0.25" /><circle cx="66" cy="60" r="3.5" fill="#FF8A80" opacity="0.25" />
      <path d="M33 77Q50 86 67 77" fill="none" stroke="#FFD54F" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="50" cy="83" r="2.5" fill="#FFD54F" />
      <rect x="23" y="28" width="54" height="4.5" rx="2" fill="url(#pmgt)" />
      <path d="M25 28L25 18Q50 12 75 18L75 28Z" fill="url(#pmmg)" />
      <path d="M25 18Q50 12 75 18" fill="none" stroke="#FFD54F" strokeWidth="2.2" />
      {[31,39,47,55,63,71].map(cx => (<circle key={cx} cx={cx} cy="23" r="1.8" fill="#FFD54F" opacity="0.7" />))}
      <g transform="translate(50,6)">
        <line x1="0" y1="0" x2="0" y2="-22" stroke="#1B5E20" strokeWidth="1.1" />
        {[-6,-3,0,3,6].map((xo,i) => (<path key={i} d={`M${xo} ${-12-i}Q${xo+1} ${-18-i} ${xo*1.2} ${-22}`} fill="none" stroke="#4CAF50" strokeWidth="1.3" opacity="0.7" />))}
        <ellipse cx="0" cy="-13" rx="4.5" ry="5.5" fill="#1565C0" />
        <ellipse cx="0" cy="-13" rx="3" ry="4" fill="#00C853" />
        <ellipse cx="0" cy="-13" rx="1.8" ry="2.2" fill="#1565C0" />
        <circle cx="0" cy="-13" r="1" fill="#FFD54F" />
      </g>
    </svg>
  );
}

const COLORS = ["#FF1744","#2979FF","#00E676","#FFD600","#E040FB","#FF6D00"];
const SHAPES = ["●","■","▲","◆","★","⬟"];
const S_COLS = ["#FF1744","#2979FF","#00E676","#FFD600"];
const S_LBL = ["🔴","🔵","🟢","🟡"];

const WORLDS = [
  { name: "Color Planet", emoji: "🎨", color: "#FF1744", desc: "Find the next color" },
  { name: "Shape Galaxy", emoji: "🔷", color: "#2979FF", desc: "Shapes & combinations" },
  { name: "Memory Nebula", emoji: "🧠", color: "#E040FB", desc: "Remember the sequence" },
  { name: "Number Star", emoji: "🔢", color: "#FFD600", desc: "Crack the number code" },
];

function mkColorLvl(pat, ai, nc = 4) {
  const ans = pat[ai];
  const disp = pat.map((c, i) => i === ai ? null : c);
  let ch = [ans];
  const pool = COLORS.filter(c => c !== ans);
  while (ch.length < nc) { const pk = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]; if (pk && !ch.includes(pk)) ch.push(pk); }
  ch.sort(() => Math.random() - 0.5);
  return { type: "color", display: disp, answer: ans, choices: ch, pattern: pat };
}

function mkShapeLvl(items, ai, nc = 4) {
  const ans = items[ai];
  const disp = items.map((it, i) => i === ai ? null : it);
  let ch = [ans];
  while (ch.length < nc) {
    const c = { shape: SHAPES[Math.floor(Math.random() * SHAPES.length)], color: COLORS[Math.floor(Math.random() * COLORS.length)] };
    if (!ch.some(x => x.shape === c.shape && x.color === c.color)) ch.push(c);
  }
  ch.sort(() => Math.random() - 0.5);
  return { type: "shape", display: disp, answer: ans, choices: ch, pattern: items };
}

function mkSimon(len) { return { type: "simon", sequence: Array.from({ length: len }, () => Math.floor(Math.random() * 4)), length: len }; }

function mkNumLvl(nums, ai, nc = 4) {
  const ans = nums[ai];
  const disp = nums.map((n, i) => i === ai ? null : n);
  let ch = [ans];
  while (ch.length < nc) { const c = ans + ((Math.floor(Math.random() * 10) - 5) || 1); if (!ch.includes(c) && c >= 0) ch.push(c); }
  ch.sort(() => Math.random() - 0.5);
  return { type: "number", display: disp, answer: ans, choices: ch, pattern: nums };
}

function genLevels() {
  const C = COLORS;
  return [
    { w:0, name:"Red Blue Red", ...mkColorLvl([C[0],C[1],C[0],C[1],C[0],C[1]], 5) },
    { w:0, name:"Traffic Lights", ...mkColorLvl([C[0],C[2],C[3],C[0],C[2],C[3]], 5) },
    { w:0, name:"Double Up", ...mkColorLvl([C[0],C[0],C[1],C[1],C[0],C[0],C[1],C[1]], 7) },
    { w:0, name:"Rainbow Step", ...mkColorLvl([C[0],C[1],C[2],C[3],C[0],C[1],C[2],C[3]], 7) },
    { w:0, name:"Grow Pattern", ...mkColorLvl([C[0],C[1],C[0],C[1],C[2],C[0],C[1],C[2],C[3]], 8) },
    { w:1, name:"Shape Swap", ...mkShapeLvl([{shape:"●",color:C[0]},{shape:"■",color:C[1]},{shape:"●",color:C[0]},{shape:"■",color:C[1]},{shape:"●",color:C[0]},{shape:"■",color:C[1]}], 5) },
    { w:1, name:"Color Shapes", ...mkShapeLvl([{shape:"▲",color:C[0]},{shape:"▲",color:C[1]},{shape:"▲",color:C[2]},{shape:"▲",color:C[0]},{shape:"▲",color:C[1]},{shape:"▲",color:C[2]}], 5) },
    { w:1, name:"Mixed Match", ...mkShapeLvl([{shape:"●",color:C[0]},{shape:"■",color:C[1]},{shape:"▲",color:C[2]},{shape:"●",color:C[0]},{shape:"■",color:C[1]},{shape:"▲",color:C[2]}], 5) },
    { w:1, name:"Shape Stairs", ...mkShapeLvl([{shape:"●",color:C[0]},{shape:"●",color:C[1]},{shape:"■",color:C[0]},{shape:"■",color:C[1]},{shape:"▲",color:C[0]},{shape:"▲",color:C[1]}], 5) },
    { w:1, name:"Mega Pattern", ...mkShapeLvl([{shape:"★",color:C[0]},{shape:"◆",color:C[1]},{shape:"★",color:C[2]},{shape:"◆",color:C[3]},{shape:"★",color:C[0]},{shape:"◆",color:C[1]},{shape:"★",color:C[2]},{shape:"◆",color:C[3]}], 7) },
    { w:2, name:"Easy Memory", ...mkSimon(3) },
    { w:2, name:"Four Steps", ...mkSimon(4) },
    { w:2, name:"Five Beats", ...mkSimon(5) },
    { w:2, name:"Rhythm Master", ...mkSimon(6) },
    { w:2, name:"Brain Burner", ...mkSimon(7) },
    { w:3, name:"Count by 2", ...mkNumLvl([2,4,6,8,10,12], 5) },
    { w:3, name:"Times 2", ...mkNumLvl([1,2,4,8,16,32], 5) },
    { w:3, name:"Square Up", ...mkNumLvl([1,4,9,16,25,36], 5) },
    { w:3, name:"Add More", ...mkNumLvl([1,2,4,7,11,16], 5) },
    { w:3, name:"Fibonacci!", ...mkNumLvl([1,1,2,3,5,8,13], 6) },
  ];
}

export default function PatternMaster() {
  const [levels] = useState(genLevels);
  const [li, setLi] = useState(0);
  const [vw, setVw] = useState("worlds");
  const [selW, setSelW] = useState(0);
  const [done, setDone] = useState({});
  const [snd, setSnd] = useState(true);
  const [res, setRes] = useState(null);
  const [streak, setStreak] = useState(0);
  const [siPh, setSiPh] = useState("watch");
  const [siIn, setSiIn] = useState([]);
  const [siHi, setSiHi] = useState(-1);
  const [siErr, setSiErr] = useState(false);
  const [sel, setSel] = useState(null);
  const [showA, setShowA] = useState(false);

  const sf = (fn) => { if (snd) fn(); };
  const lv = levels[li];
  const wo = WORLDS[lv.w];
  const totS = Object.values(done).reduce((a, b) => a + b, 0);
  const wSt = (wi) => levels.reduce((a, l, i) => a + (l.w === wi ? (done[i] || 0) : 0), 0);
  const wMx = (wi) => levels.filter(l => l.w === wi).length * 3;
  const bt = (bg, ds = false) => ({ padding: "8px 18px", borderRadius: 10, border: "none", background: ds ? "#222" : bg, color: ds ? "#555" : "#fff", fontSize: 13, fontWeight: 800, cursor: ds ? "not-allowed" : "pointer", boxShadow: ds ? "none" : `0 2px 10px ${bg}33` });

  useEffect(() => { setRes(null); setSel(null); setShowA(false); setSiPh("watch"); setSiIn([]); setSiHi(-1); setSiErr(false); }, [li]);

  const playSi = useCallback(async () => {
    if (lv.type !== "simon") return;
    setSiPh("watch"); setSiHi(-1);
    for (let i = 0; i < lv.sequence.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setSiHi(lv.sequence[i]); sf(() => SFX.simon(lv.sequence[i]));
      await new Promise(r => setTimeout(r, 400));
      setSiHi(-1);
    }
    await new Promise(r => setTimeout(r, 300));
    setSiPh("play"); setSiIn([]);
  }, [lv, snd]);

  useEffect(() => {
    if (lv.type === "simon" && siPh === "watch" && res === null) {
      const t = setTimeout(playSi, 600);
      return () => clearTimeout(t);
    }
  }, [li, siPh, res]);

  const handleWin = () => {
    const ns = streak + 1; setStreak(ns);
    const st = ns >= 3 ? 3 : ns >= 2 ? 2 : 1;
    sf(SFX.win);
    setTimeout(() => { for (let i = 0; i < st; i++) setTimeout(() => sf(SFX.star), i * 250); }, 400);
    setDone(pv => ({ ...pv, [li]: Math.max(pv[li] || 0, st) }));
    setRes("win");
  };

  const handleSiPress = (idx) => {
    if (siPh !== "play" || res) return;
    sf(() => SFX.simon(idx));
    const ni = [...siIn, idx]; setSiIn(ni);
    setSiHi(idx); setTimeout(() => setSiHi(-1), 200);
    if (lv.sequence[ni.length - 1] !== idx) {
      sf(SFX.wrong); setSiErr(true); setSiPh("done");
      setTimeout(() => { setStreak(0); setRes("wrong"); }, 500);
      return;
    }
    if (ni.length === lv.sequence.length) {
      sf(SFX.correct); setSiPh("done");
      setTimeout(() => handleWin(), 400);
    }
  };

  const handleAns = (choice) => {
    if (showA || res) return;
    setSel(choice); setShowA(true);
    let ok = false;
    if (lv.type === "color") ok = choice === lv.answer;
    else if (lv.type === "shape") ok = choice.shape === lv.answer.shape && choice.color === lv.answer.color;
    else if (lv.type === "number") ok = choice === lv.answer;
    if (ok) { sf(SFX.correct); setTimeout(() => handleWin(), 600); }
    else { sf(SFX.wrong); setTimeout(() => { setStreak(0); setRes("wrong"); }, 600); }
  };

  const retry = () => { setRes(null); setSel(null); setShowA(false); setSiPh("watch"); setSiIn([]); setSiHi(-1); setSiErr(false); };

  if (vw === "worlds") {
    return (
      <div style={rS}><style>{bC}</style><div style={sB} />
        <div style={{ ...hS, justifyContent: "center" }}><div style={tS}>🧩 PATTERN MASTER</div></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 20, gap: 14, position: "relative", zIndex: 5 }}>
          <div style={{ width: 60, height: 60 }}><Av size={60} /></div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#e0e0ff" }}>Choose Your World</div>
          <div style={{ fontSize: 12, color: "#889" }}>⭐ {totS}/{levels.length * 3}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 380, width: "100%" }}>
            {WORLDS.map((w, i) => (
              <button key={i} onClick={() => { sf(SFX.click); setSelW(i); setVw("levels"); }}
                style={{ padding: 16, borderRadius: 14, border: `2px solid ${w.color}44`, background: `${w.color}08`, color: "#e0e0ff", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{w.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: w.color }}>{w.name}</div>
                <div style={{ fontSize: 10, color: "#889", marginTop: 3 }}>{w.desc}</div>
                <div style={{ fontSize: 12, marginTop: 5, color: "#ffab40" }}>⭐ {wSt(i)}/{wMx(i)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (vw === "levels") {
    const wL = levels.map((l, i) => ({ ...l, idx: i })).filter(l => l.w === selW);
    const w = WORLDS[selW];
    return (
      <div style={rS}><style>{bC}</style><div style={sB} />
        <div style={hS}>
          <button onClick={() => setVw("worlds")} style={{ ...bt("#5c6bc0"), fontSize: 11, padding: "5px 12px" }}>◀ Back</button>
          <div style={{ fontSize: 14, fontWeight: 800, color: w.color }}>{w.emoji} {w.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 14, gap: 8, position: "relative", zIndex: 5 }}>
          <div style={{ fontSize: 12, color: "#889" }}>⭐ {wSt(selW)}/{wMx(selW)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, maxWidth: 380, width: "100%" }}>
            {wL.map((l, i) => (
              <button key={l.idx} onClick={() => { sf(SFX.click); setLi(l.idx); setStreak(0); setVw("game"); }}
                style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${w.color}30`, background: "rgba(0,0,0,0.18)", color: "#e0e0ff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${w.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: w.color }}>{i + 1}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800 }}>{l.name}</div><div style={{ fontSize: 10, color: "#667", marginTop: 2 }}>{l.type === "simon" ? `${l.length} steps` : "Pattern"}</div></div>
                <div style={{ fontSize: 15 }}>{done[l.idx] ? "⭐".repeat(done[l.idx]) + "☆".repeat(3 - done[l.idx]) : "○○○"}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderColor = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 14, color: "#aab", fontWeight: 600 }}>Find the missing color:</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {lv.display.map((c, i) => (
          <div key={i} style={{ width: 48, height: 48, borderRadius: 12, background: c || (showA ? lv.answer : "rgba(255,255,255,0.08)"), border: c ? "2px solid rgba(255,255,255,0.15)" : showA ? "3px solid #69f0ae" : "3px dashed rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: c ? `0 4px 12px ${c}44` : "none", transition: "all 0.3s" }}>
            {!c && !showA && "❓"}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: "#aab", fontWeight: 600, marginTop: 8 }}>Pick:</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {lv.choices.map((c, i) => { const iC = showA && c === lv.answer; const iW = showA && sel === c && c !== lv.answer; return (
          <button key={i} onClick={() => handleAns(c)} disabled={showA} style={{ width: 60, height: 60, borderRadius: 14, border: "none", background: c, cursor: showA ? "default" : "pointer", boxShadow: iC ? "0 0 20px #69f0ae" : iW ? "0 0 20px #ff1744" : `0 4px 12px ${c}44`, transform: iC ? "scale(1.15)" : iW ? "scale(0.9)" : "scale(1)", transition: "all 0.3s", opacity: showA && !iC && !iW ? 0.3 : 1 }} />
        ); })}
      </div>
    </div>
  );

  const renderShape = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 14, color: "#aab", fontWeight: 600 }}>Find the missing shape:</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {lv.display.map((it, i) => (
          <div key={i} style={{ width: 52, height: 52, borderRadius: 12, background: it ? `${it.color}18` : showA ? `${lv.answer.color}18` : "rgba(255,255,255,0.05)", border: it ? `2px solid ${it.color}44` : showA ? "3px solid #69f0ae" : "3px dashed rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: it ? it.color : showA ? lv.answer.color : "#fff", transition: "all 0.3s" }}>
            {it ? it.shape : showA ? lv.answer.shape : "❓"}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: "#aab", fontWeight: 600, marginTop: 8 }}>Pick:</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {lv.choices.map((it, i) => { const iC = showA && it.shape === lv.answer.shape && it.color === lv.answer.color; const iS = sel && sel.shape === it.shape && sel.color === it.color; const iW = showA && iS && !iC; return (
          <button key={i} onClick={() => handleAns(it)} disabled={showA} style={{ width: 64, height: 64, borderRadius: 14, border: `2px solid ${it.color}44`, background: `${it.color}15`, cursor: showA ? "default" : "pointer", fontSize: 30, color: it.color, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: iC ? "0 0 20px #69f0ae" : iW ? "0 0 20px #ff1744" : "none", transform: iC ? "scale(1.15)" : iW ? "scale(0.9)" : "scale(1)", transition: "all 0.3s", opacity: showA && !iC && !iW ? 0.3 : 1 }}>
            {it.shape}
          </button>
        ); })}
      </div>
    </div>
  );

  const renderSimon = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 14, color: "#aab", fontWeight: 600 }}>
        {siPh === "watch" ? "👀 Watch the pattern..." : siPh === "play" ? `🎯 Your turn! (${siIn.length}/${lv.sequence.length})` : siErr ? "❌ Wrong!" : "✅ Perfect!"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 240 }}>
        {[0, 1, 2, 3].map(idx => (
          <button key={idx} onClick={() => handleSiPress(idx)} disabled={siPh !== "play"}
            style={{ width: 100, height: 100, borderRadius: 16, background: siHi === idx ? S_COLS[idx] : `${S_COLS[idx]}33`, border: `3px solid ${S_COLS[idx]}66`, cursor: siPh === "play" ? "pointer" : "default", fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: siHi === idx ? `0 0 30px ${S_COLS[idx]}88` : "none", transform: siHi === idx ? "scale(1.05)" : "scale(1)", transition: "all 0.15s" }}>
            {S_LBL[idx]}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {lv.sequence.map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < siIn.length ? (siErr && i === siIn.length - 1 ? "#ff1744" : "#69f0ae") : "rgba(255,255,255,0.15)", transition: "all 0.2s" }} />
        ))}
      </div>
      {siPh === "play" && (<button onClick={playSi} style={{ ...bt("#5c6bc0"), fontSize: 11, padding: "5px 14px" }}>🔄 Replay</button>)}
    </div>
  );

  const renderNum = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 14, color: "#aab", fontWeight: 600 }}>Find the missing number:</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {lv.display.map((n, i) => (
          <div key={i} style={{ width: 54, height: 54, borderRadius: 12, background: n !== null ? "rgba(255,214,0,0.1)" : showA ? "rgba(105,240,174,0.1)" : "rgba(255,255,255,0.05)", border: n !== null ? "2px solid rgba(255,214,0,0.3)" : showA ? "3px solid #69f0ae" : "3px dashed rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: n !== null ? "#FFD600" : showA ? "#69f0ae" : "#fff", transition: "all 0.3s" }}>
            {n !== null ? n : showA ? lv.answer : "❓"}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: "#aab", fontWeight: 600, marginTop: 8 }}>Pick:</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {lv.choices.map((n, i) => { const iC = showA && n === lv.answer; const iW = showA && sel === n && n !== lv.answer; return (
          <button key={i} onClick={() => handleAns(n)} disabled={showA} style={{ width: 64, height: 64, borderRadius: 14, background: iC ? "rgba(105,240,174,0.15)" : iW ? "rgba(255,23,68,0.15)" : "rgba(255,214,0,0.08)", border: iC ? "3px solid #69f0ae" : iW ? "3px solid #ff1744" : "2px solid rgba(255,214,0,0.25)", cursor: showA ? "default" : "pointer", fontSize: 22, fontWeight: 900, color: iC ? "#69f0ae" : iW ? "#ff1744" : "#FFD600", transform: iC ? "scale(1.15)" : iW ? "scale(0.9)" : "scale(1)", transition: "all 0.3s", opacity: showA && !iC && !iW ? 0.3 : 1 }}>
            {n}
          </button>
        ); })}
      </div>
    </div>
  );

  return (
    <div style={rS}><style>{bC}</style><div style={sB} />
      <div style={hS}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button onClick={() => { sf(SFX.click); setVw("worlds"); }} style={{ ...bt("#5c6bc0"), fontSize: 10, padding: "3px 9px" }}>🗺️</button>
          <div style={{ width: 26, height: 26 }}><Av size={26} /></div>
          <div style={{ fontSize: 14, fontWeight: 900, background: `linear-gradient(90deg,${wo.color},#ff6ec7)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PATTERN MASTER</div>
          <div style={{ fontSize: 10, color: "#ffab40", fontWeight: 700 }}>⭐{totS}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <button onClick={() => setSnd(s => !s)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "2px 6px", fontSize: 12, cursor: "pointer", color: snd ? "#69f0ae" : "#555" }}>{snd ? "🔊" : "🔇"}</button>
          <span style={{ background: `${wo.color}12`, border: `1px solid ${wo.color}30`, borderRadius: 9, padding: "2px 7px", fontSize: 9, fontWeight: 800, color: wo.color }}>{wo.emoji}</span>
          <button onClick={() => { sf(SFX.click); setVw("levels"); setSelW(lv.w); }} style={{ background: "rgba(100,140,255,0.08)", border: "1px solid rgba(100,140,255,0.15)", borderRadius: 12, padding: "2px 9px", fontSize: 11, fontWeight: 700, color: "#b388ff", cursor: "pointer" }}>L{(li % 5) + 1}: {lv.name}</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 10px", gap: 8, position: "relative", zIndex: 5 }}>
        {streak > 0 && <div style={{ fontSize: 11, color: "#69f0ae", fontWeight: 700 }}>🔥 Streak: {streak} {streak >= 3 ? "→ ⭐⭐⭐" : streak >= 2 ? "→ ⭐⭐" : "→ ⭐"}</div>}
        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 16, padding: 20, border: "1px solid rgba(100,140,255,0.08)", maxWidth: 500, width: "100%" }}>
          {lv.type === "color" && renderColor()}
          {lv.type === "shape" && renderShape()}
          {lv.type === "simon" && renderSimon()}
          {lv.type === "number" && renderNum()}
        </div>
      </div>
      {res && (() => {
        const isW = res === "win"; const st = isW ? (streak >= 3 ? 3 : streak >= 2 ? 2 : 1) : 0;
        return (
          <div style={oS} onClick={() => { if (!isW) retry(); }}>
            <div style={mS} onClick={e => e.stopPropagation()}>
              <div style={{ margin: "0 auto 6px", width: 56, height: 56 }}><Av size={56} happy={isW} /></div>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 5, color: isW ? "#69f0ae" : "#ff6e6e" }}>{isW ? "Correct!" : "Not quite!"}</div>
              {isW && <div style={{ fontSize: 30, marginBottom: 5 }}>{"⭐".repeat(st)}{"☆".repeat(3 - st)}</div>}
              <div style={{ fontSize: 13, color: "#99a", marginBottom: 3 }}>{isW ? (st === 3 ? "🌟 Perfect streak!" : "✨ Keep going!") : "Try again!"}</div>
              <div style={{ display: "flex", gap: 7, justifyContent: "center", flexWrap: "wrap", marginTop: 10 }}>
                <button onClick={() => { sf(SFX.click); retry(); }} style={bt("#5c6bc0")}>{isW ? "🔄 Retry" : "🔧 Try Again"}</button>
                {isW && li < levels.length - 1 && <button onClick={() => { sf(SFX.lvlUp); setRes(null); setLi(li + 1); }} style={bt("#00c853")}>Next ➡️</button>}
                {isW && li === levels.length - 1 && <div style={{ fontSize: 14, color: "#ffab40", fontWeight: 800, padding: 6 }}>🏆 CHAMPION!</div>}
                {isW && <button onClick={() => { sf(SFX.click); setRes(null); setVw("worlds"); }} style={bt("#7c4dff")}>🗺️</button>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const rS = { minHeight: "100vh", background: "linear-gradient(145deg,#0a0820,#160e3a 40%,#0e1a35)", color: "#e0e0ff", fontFamily: "'Nunito','Segoe UI',system-ui,sans-serif", position: "relative", overflow: "hidden" };
const sB = { position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.45, background: "radial-gradient(1px 1px at 12% 25%,#fff .5px,transparent 1px),radial-gradient(1.5px 1.5px at 48% 60%,#aaf .5px,transparent 1px),radial-gradient(1px 1px at 78% 18%,#fff .5px,transparent 1px),radial-gradient(1px 1px at 85% 52%,#ccf .5px,transparent 1px)" };
const hS = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(0,0,0,0.28)", borderBottom: "1px solid rgba(100,140,255,0.07)", position: "relative", zIndex: 10, flexWrap: "wrap", gap: 5 };
const tS = { fontSize: 20, fontWeight: 900, letterSpacing: 1.5, background: "linear-gradient(90deg,#FF1744,#FFD600,#2979FF,#E040FB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const oS = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(3px)" };
const mS = { background: "linear-gradient(145deg,#1a1040,#0d1b3e)", border: "1px solid rgba(100,140,255,0.1)", borderRadius: 16, padding: 20, maxWidth: 320, width: "92%", textAlign: "center", boxShadow: "0 12px 36px rgba(0,0,0,0.5)" };
const bC = `*{box-sizing:border-box;margin:0;padding:0}button:active{transform:scale(0.95)}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.15);border-radius:3px}`;
