import { useState, useCallback, useEffect, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════
// 🔊 SOUND ENGINE — Web Audio API synthesized sounds (no external files)
// ═══════════════════════════════════════════════════════════════════════
const AudioEngine = (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const playTone = (freq, duration = 0.12, type = "sine", vol = 0.3) => {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch (e) {}
  };

  return {
    beadClick: () => {
      playTone(880, 0.06, "sine", 0.2);
      setTimeout(() => playTone(1200, 0.04, "sine", 0.1), 30);
    },
    beadSlide: () => {
      playTone(600, 0.08, "triangle", 0.15);
    },
    correct: () => {
      playTone(523, 0.15, "sine", 0.25);
      setTimeout(() => playTone(659, 0.15, "sine", 0.25), 120);
      setTimeout(() => playTone(784, 0.2, "sine", 0.3), 240);
      setTimeout(() => playTone(1047, 0.3, "sine", 0.25), 380);
    },
    wrong: () => {
      playTone(300, 0.2, "sawtooth", 0.15);
      setTimeout(() => playTone(250, 0.3, "sawtooth", 0.12), 180);
    },
    levelUp: () => {
      [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.12, "sine", 0.2), i * 80);
      });
    },
    buttonClick: () => {
      playTone(700, 0.05, "square", 0.08);
    },
    tick: () => {
      playTone(1000, 0.03, "sine", 0.05);
    },
    timeLow: () => {
      playTone(400, 0.1, "square", 0.15);
    },
    celebrate: () => {
      const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1568];
      notes.forEach((f, i) => {
        setTimeout(() => playTone(f, 0.18, "sine", 0.2), i * 100);
      });
    },
    whoosh: () => {
      const c = getCtx();
      try {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.2);
      } catch(e) {}
    },
    pop: () => {
      playTone(1400, 0.04, "sine", 0.2);
      setTimeout(() => playTone(1800, 0.03, "sine", 0.1), 20);
    }
  };
})();

// ═══════════════════════════════════════════════════════════════════════
// ✨ CONFETTI / PARTICLE ENGINE
// ═══════════════════════════════════════════════════════════════════════
function Confetti({ active, duration = 3000 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width = canvas.parentElement.offsetWidth;
    const H = canvas.height = canvas.parentElement.offsetHeight;

    const colors = ["#FF6B6B", "#FFB347", "#4ECDC4", "#45B7D1", "#FFEAA7", "#DDA0DD", "#FF69B4", "#7FFF00", "#FFD700"];
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * 200,
      w: 4 + Math.random() * 8,
      h: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
      life: 1,
    }));

    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      if (elapsed > duration) { ctx.clearRect(0, 0, W, H); return; }
      ctx.clearRect(0, 0, W, H);
      const fade = elapsed > duration - 800 ? (duration - elapsed) / 800 : 1;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.rotV;
        ctx.save();
        ctx.globalAlpha = fade * 0.9;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [active, duration]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 100 }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🌟 FLOATING STARS (sparkle effect on correct answer)
// ═══════════════════════════════════════════════════════════════════════
function FloatingStars({ active }) {
  if (!active) return null;
  const stars = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 1,
      size: 14 + Math.random() * 18,
      dur: 1.5 + Math.random() * 1.5,
    })), [active]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 99, overflow: "hidden" }}>
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            bottom: "-20px",
            fontSize: s.size,
            animation: `floatUp ${s.dur}s ease-out ${s.delay}s forwards`,
            opacity: 0,
          }}
        >
          {["⭐", "🌟", "✨", "💫"][s.id % 4]}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🧮 CONSTANTS
// ═══════════════════════════════════════════════════════════════════════
const ROD_COLORS = ["#FF6B6B", "#FF8E53", "#FFB347", "#F7DC6F", "#4ECDC4", "#45B7D1", "#96CEB4", "#DDA0DD", "#A29BFE"];
const ROD_COUNT = 9;

// ═══════════════════════════════════════════════════════════════════════
// 🧮 ABACUS VISUAL COMPONENT — with smooth CSS transitions & hover
// ═══════════════════════════════════════════════════════════════════════
function AbacusVisual({ values, onBeadClick, rodCount = ROD_COUNT, interactive = true, highlightRod = -1, showDigitValues = false }) {
  const rodSpacing = 58;
  const width = rodCount * rodSpacing + 44;
  const barY = 100;
  const totalHeight = 370;
  const [hoveredBead, setHoveredBead] = useState(null);
  const BEAD_RX = 20;
  const BEAD_RY = 13;

  return (
    <div style={{ textAlign: "center", margin: "0 auto", position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${totalHeight}`} style={{ width: "100%", maxWidth: `${Math.min(width, 580)}px`, height: "auto", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>
        <defs>
          {/* Wood grain gradient */}
          <linearGradient id="woodFrame" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A0522D" />
            <stop offset="50%" stopColor="#8B4513" />
            <stop offset="100%" stopColor="#6B3410" />
          </linearGradient>
          <linearGradient id="woodInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5DEB3" />
            <stop offset="100%" stopColor="#DEB887" />
          </linearGradient>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A0522D" />
            <stop offset="100%" stopColor="#704214" />
          </linearGradient>
          {/* Bead gradients for each rod */}
          {ROD_COLORS.map((color, i) => (
            <radialGradient key={`bg${i}`} id={`beadGrad${i}`} cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="40%" stopColor={color} />
              <stop offset="100%" stopColor={darken(color, 30)} />
            </radialGradient>
          ))}
          <filter id="beadShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer frame */}
        <rect x="2" y="2" width={width - 4} height={totalHeight - 4} rx="14" fill="url(#woodFrame)" />
        {/* Inner board */}
        <rect x="10" y="10" width={width - 20} height={totalHeight - 20} rx="10" fill="url(#woodInner)" />

        {/* Divider bar with 3D effect */}
        <rect x="10" y={barY - 2} width={width - 20} height="12" fill="url(#barGrad)" rx="3" />
        <rect x="10" y={barY - 2} width={width - 20} height="4" fill="rgba(255,255,255,0.15)" rx="2" />

        {/* Place value labels at bottom */}
        {Array.from({ length: rodCount }).map((_, i) => {
          const x = 34 + i * rodSpacing;
          const placeValue = Math.pow(10, rodCount - 1 - i);
          const label = placeValue >= 1000000 ? `${placeValue / 1000000}M` : placeValue >= 1000 ? `${placeValue / 1000}K` : `${placeValue}`;
          return (
            <g key={`lbl-${i}`}>
              <circle cx={x} cy={totalHeight - 22} r="14" fill="rgba(139,69,19,0.1)" />
              <text x={x} y={totalHeight - 18} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6B3410" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            </g>
          );
        })}

        {/* Digit values above rods */}
        {showDigitValues && Array.from({ length: rodCount }).map((_, i) => {
          const x = 34 + i * rodSpacing;
          const digit = (values[i]?.top ?? 0) * 5 + (values[i]?.bottom ?? 0);
          if (digit === 0) return null;
          return (
            <text key={`dv-${i}`} x={x} y={totalHeight - 38} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#e74c3c" fontFamily="monospace">
              {digit}
            </text>
          );
        })}

        {/* Rods and Beads */}
        {Array.from({ length: rodCount }).map((_, rodIdx) => {
          const x = 34 + rodIdx * rodSpacing;
          const topVal = values[rodIdx]?.top ?? 0;
          const bottomVal = values[rodIdx]?.bottom ?? 0;
          const isHighlighted = highlightRod === rodIdx;

          return (
            <g key={`rod-${rodIdx}`}>
              {/* Highlight glow */}
              {isHighlighted && (
                <g filter="url(#glowFilter)">
                  <rect x={x - 26} y="10" width="52" height={totalHeight - 20} rx="8" fill="rgba(255,215,0,0.12)" stroke="#FFD700" strokeWidth="2.5" strokeDasharray="6 3">
                    <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                </g>
              )}

              {/* Rod (bamboo style) */}
              <line x1={x} y1="22" x2={x} y2={totalHeight - 40} stroke="#B87333" strokeWidth="4" strokeLinecap="round" />
              <line x1={x - 0.5} y1="22" x2={x - 0.5} y2={totalHeight - 40} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

              {/* TOP BEAD (Heaven = 5) */}
              {(() => {
                const beadY = topVal === 1 ? barY - 16 : 46;
                const isHov = hoveredBead === `${rodIdx}-top`;
                const scale = isHov && interactive ? 1.1 : 1;
                return (
                  <g
                    onClick={() => { if (interactive) { AudioEngine.beadClick(); onBeadClick?.(rodIdx, "top"); }}}
                    onMouseEnter={() => interactive && setHoveredBead(`${rodIdx}-top`)}
                    onMouseLeave={() => setHoveredBead(null)}
                    style={{ cursor: interactive ? "pointer" : "default", transition: "transform 0.2s" }}
                  >
                    {/* Shadow */}
                    <ellipse cx={x} cy={beadY + 3} rx={BEAD_RX} ry={BEAD_RY - 2} fill="rgba(0,0,0,0.12)" />
                    {/* Main bead */}
                    <ellipse cx={x} cy={beadY} rx={BEAD_RX * scale} ry={BEAD_RY * scale} fill={`url(#beadGrad${rodIdx % ROD_COLORS.length})`} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                    {/* Shine */}
                    <ellipse cx={x - 3} cy={beadY - 4} rx={8 * scale} ry={4 * scale} fill="rgba(255,255,255,0.45)" />
                    {/* Label */}
                    <text x={x} y={beadY + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="rgba(0,0,0,0.4)" fontFamily="system-ui">5</text>
                    {interactive && <ellipse cx={x} cy={beadY} rx={BEAD_RX + 6} ry={BEAD_RY + 6} fill="transparent" />}
                  </g>
                );
              })()}

              {/* BOTTOM BEADS (Earth = 1 each) */}
              {Array.from({ length: 4 }).map((_, beadIdx) => {
                const isActive = beadIdx < bottomVal;
                const baseY = barY + 28;
                const spacing = 30;
                const beadY = isActive
                  ? baseY + beadIdx * spacing
                  : baseY + (4 - bottomVal + beadIdx) * spacing + 28;
                const isHov = hoveredBead === `${rodIdx}-${beadIdx}`;
                const scale = isHov && interactive ? 1.1 : 1;

                return (
                  <g
                    key={`b-${rodIdx}-${beadIdx}`}
                    onClick={() => {
                      if (!interactive) return;
                      AudioEngine.beadClick();
                      onBeadClick?.(rodIdx, "bottom", beadIdx);
                    }}
                    onMouseEnter={() => interactive && setHoveredBead(`${rodIdx}-${beadIdx}`)}
                    onMouseLeave={() => setHoveredBead(null)}
                    style={{ cursor: interactive ? "pointer" : "default" }}
                  >
                    <ellipse cx={x} cy={beadY + 3} rx={BEAD_RX} ry={BEAD_RY - 2} fill="rgba(0,0,0,0.1)" />
                    <ellipse cx={x} cy={beadY} rx={BEAD_RX * scale} ry={BEAD_RY * scale} fill={`url(#beadGrad${rodIdx % ROD_COLORS.length})`} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                    <ellipse cx={x - 3} cy={beadY - 4} rx={8 * scale} ry={4 * scale} fill="rgba(255,255,255,0.45)" />
                    <text x={x} y={beadY + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="rgba(0,0,0,0.35)" fontFamily="system-ui">1</text>
                    {interactive && <ellipse cx={x} cy={beadY} rx={BEAD_RX + 6} ry={BEAD_RY + 6} fill="transparent" />}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function darken(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16) - amt;
  let g = parseInt(hex.slice(3, 5), 16) - amt;
  let b = parseInt(hex.slice(5, 7), 16) - amt;
  return `rgb(${Math.max(0, r)},${Math.max(0, g)},${Math.max(0, b)})`;
}

// ═══════════════════════════════════════════════════════════════════════
// 🔢 HELPERS
// ═══════════════════════════════════════════════════════════════════════
function calcTotal(values, rodCount = ROD_COUNT) {
  let total = 0;
  for (let i = 0; i < rodCount; i++) {
    const placeValue = Math.pow(10, rodCount - 1 - i);
    total += ((values[i]?.top ?? 0) * 5 + (values[i]?.bottom ?? 0)) * placeValue;
  }
  return total;
}

function emptyValues(rodCount = ROD_COUNT) {
  return Array.from({ length: rodCount }, () => ({ top: 0, bottom: 0 }));
}

function numberToValues(num, rodCount = ROD_COUNT) {
  const vals = emptyValues(rodCount);
  let remaining = Math.min(num, Math.pow(10, rodCount) - 1);
  for (let i = 0; i < rodCount; i++) {
    const placeValue = Math.pow(10, rodCount - 1 - i);
    const digit = Math.floor(remaining / placeValue);
    remaining -= digit * placeValue;
    vals[i] = { top: digit >= 5 ? 1 : 0, bottom: digit >= 5 ? digit - 5 : digit };
  }
  return vals;
}

function useBeadHandler(setValues) {
  return useCallback((rodIdx, section, beadIdx) => {
    setValues(prev => {
      const next = prev.map(v => ({ ...v }));
      if (section === "top") {
        next[rodIdx].top = next[rodIdx].top === 1 ? 0 : 1;
      } else {
        const current = next[rodIdx].bottom;
        if (beadIdx < current) {
          next[rodIdx].bottom = beadIdx;
        } else {
          next[rodIdx].bottom = Math.min(beadIdx + 1, 4);
        }
      }
      return next;
    });
  }, [setValues]);
}

// ═══════════════════════════════════════════════════════════════════════
// 📚 EXPANDED LESSONS (15 lessons with tips, hints, animations)
// ═══════════════════════════════════════════════════════════════════════
const LESSONS = [
  {
    title: "Welcome to the Abacus! 🧮",
    text: "The abacus is one of the oldest calculating tools in the world — over 2,500 years old! It's still used today because it's amazing for learning math. Let's discover how it works!",
    tip: "💡 Fun fact: The word 'abacus' comes from the Greek word 'abax', meaning 'calculating board'.",
    targetNumber: 0,
    highlightRod: -1,
  },
  {
    title: "Meet the Parts 🔍",
    text: "The abacus has a wooden frame with vertical rods. Each rod has beads — the bar in the middle divides them into TOP beads (above) and BOTTOM beads (below). Each bead has a number printed on it!",
    tip: "💡 Top beads are called 'Heaven beads' (worth 5), and bottom beads are 'Earth beads' (worth 1 each).",
    targetNumber: 0,
    highlightRod: -1,
  },
  {
    title: "Earth Beads — Counting to 4 🌍",
    text: "Let's start with the bottom (Earth) beads on the ONES rod (far right, highlighted in yellow). Each Earth bead is worth 1. Push beads UP toward the bar to count. Try making 3!",
    tip: "💡 Click the bottom beads to push them up. Click again to push them back down.",
    targetNumber: 3,
    highlightRod: ROD_COUNT - 1,
  },
  {
    title: "Counting 1, 2, 3, 4 🔢",
    text: "Great! Now try showing the number 4 on the ones rod. You need to push ALL four Earth beads up toward the bar.",
    tip: "💡 Reset if needed and push 4 bottom beads up!",
    targetNumber: 4,
    highlightRod: ROD_COUNT - 1,
  },
  {
    title: "The Heaven Bead — Worth 5! ☁️",
    text: "The TOP bead is special — it's worth 5! To show the number 5, push ONLY the Heaven bead DOWN toward the bar (and keep all Earth beads down). Try it!",
    tip: "💡 Click the top bead to move it toward the bar. That's 5!",
    targetNumber: 5,
    highlightRod: ROD_COUNT - 1,
  },
  {
    title: "Making 6 ✨",
    text: "Now combine them! To show 6, you need the Heaven bead (5) PLUS one Earth bead (1). That's 5 + 1 = 6! Give it a try!",
    tip: "💡 Push the top bead down AND one bottom bead up.",
    targetNumber: 6,
    highlightRod: ROD_COUNT - 1,
  },
  {
    title: "Making 9 — The Maximum! 🔥",
    text: "The biggest single digit is 9. You need the Heaven bead (5) plus ALL four Earth beads (4). That's 5 + 4 = 9! Show it!",
    tip: "💡 This is the maximum value for any single rod: 5 + 4 = 9.",
    targetNumber: 9,
    highlightRod: ROD_COUNT - 1,
  },
  {
    title: "Moving to Tens! 🔟",
    text: "Now look at the next rod to the LEFT — that's the TENS rod! Each Earth bead there is worth 10, and its Heaven bead is worth 50! Show the number 20 (two Earth beads on tens rod).",
    tip: "💡 Just like the ones rod, but everything is × 10!",
    targetNumber: 20,
    highlightRod: ROD_COUNT - 2,
  },
  {
    title: "The Number 50 🌟",
    text: "The Heaven bead on the tens rod is worth 50! Push it down to show 50. Make sure the ones rod is clear!",
    tip: "💡 One bead = 50. The Heaven bead is really powerful!",
    targetNumber: 50,
    highlightRod: ROD_COUNT - 2,
  },
  {
    title: "Two-Digit Numbers: 35 🎯",
    text: "Let's combine rods! To show 35: put 3 Earth beads on the TENS rod (that's 30) and the Heaven bead on the ONES rod (that's 5). Total: 30 + 5 = 35!",
    tip: "💡 Think about each digit separately: 3 in tens place, 5 in ones place.",
    targetNumber: 35,
    highlightRod: -1,
  },
  {
    title: "Let's Try 67 🎓",
    text: "Show 67! Break it down: 6 in the tens place (Heaven bead + 1 Earth bead = 50 + 10 = 60) and 7 in the ones place (Heaven bead + 2 Earth beads = 5 + 2 = 7).",
    tip: "💡 For digits 5-9, always use the Heaven bead plus Earth beads.",
    targetNumber: 67,
    highlightRod: -1,
  },
  {
    title: "Hundreds! 💯",
    text: "The third rod from the right is HUNDREDS! Each Earth bead = 100, Heaven bead = 500. Try showing 100!",
    tip: "💡 Each rod to the left is worth 10× more than the one to its right.",
    targetNumber: 100,
    highlightRod: ROD_COUNT - 3,
  },
  {
    title: "A Big Number: 142 🚀",
    text: "Show 142! That's: 1 Earth bead on hundreds (100), 4 Earth beads on tens (40), and 2 Earth beads on ones (2). 100 + 40 + 2 = 142!",
    tip: "💡 Break any number into its place values and set each rod independently.",
    targetNumber: 142,
    highlightRod: -1,
  },
  {
    title: "Challenge: 758 🏆",
    text: "Ready for a challenge? Show 758! Think it through: 7 in hundreds (500 + 200), 5 in tens (50), 8 in ones (5 + 3).",
    tip: "💡 7 = Heaven(5) + 2 Earth, 5 = Heaven only, 8 = Heaven(5) + 3 Earth",
    targetNumber: 758,
    highlightRod: -1,
  },
  {
    title: "You're an Abacus Master! 🎉🏅",
    text: "Incredible work! You've learned how to represent any number on the abacus using Heaven and Earth beads. The abacus isn't just for counting — it can help you add, subtract, multiply, and more!",
    tip: "🌟 Try Free Play to practice, or take the Test to prove your skills!",
    targetNumber: 0,
    highlightRod: -1,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// 🎓 LEARNING MODE
// ═══════════════════════════════════════════════════════════════════════
function LearnMode({ onBack }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(emptyValues());
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [justCorrect, setJustCorrect] = useState(false);
  const lesson = LESSONS[step];
  const currentTotal = calcTotal(values);
  const isCorrect = lesson.targetNumber > 0 && currentTotal === lesson.targetNumber;
  const prevCorrectRef = useRef(false);

  const handleBeadClick = useBeadHandler(setValues);

  useEffect(() => {
    if (isCorrect && !prevCorrectRef.current) {
      AudioEngine.correct();
      setShowStars(true);
      setJustCorrect(true);
      setTimeout(() => { setShowStars(false); setJustCorrect(false); }, 2500);
    }
    prevCorrectRef.current = isCorrect;
  }, [isCorrect]);

  const nextStep = () => {
    if (step < LESSONS.length - 1) {
      AudioEngine.whoosh();
      if (step === LESSONS.length - 2) {
        setShowConfetti(true);
        AudioEngine.celebrate();
        setTimeout(() => setShowConfetti(false), 4000);
      }
      setStep(step + 1);
      setValues(emptyValues());
      prevCorrectRef.current = false;
    }
  };

  const prevStep = () => {
    if (step > 0) {
      AudioEngine.buttonClick();
      setStep(step - 1);
      setValues(emptyValues());
      prevCorrectRef.current = false;
    }
  };

  const progressPct = ((step + (isCorrect || lesson.targetNumber === 0 ? 1 : 0)) / LESSONS.length) * 100;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", position: "relative", padding: "0 8px" }}>
      <Confetti active={showConfetti} />
      <FloatingStars active={showStars} />

      <button onClick={() => { AudioEngine.buttonClick(); onBack(); }} style={styles.backBtn}>← Back to Menu</button>

      {/* Progress */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progressPct}%`, background: "linear-gradient(90deg, #4ECDC4, #45B7D1, #A29BFE)" }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "#999", marginBottom: 12 }}>
        Lesson {step + 1} of {LESSONS.length}
      </div>

      {/* Lesson Card */}
      <div style={{
        ...styles.lessonCard,
        animation: "fadeSlideIn 0.4s ease-out",
        border: justCorrect ? "2px solid #4ECDC4" : "2px solid transparent",
        boxShadow: justCorrect ? "0 0 20px rgba(78,205,196,0.3)" : "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <h2 style={styles.lessonTitle}>{lesson.title}</h2>
        <p style={styles.lessonText}>{lesson.text}</p>

        {/* Tip box */}
        {lesson.tip && (
          <div style={styles.tipBox}>
            {lesson.tip}
          </div>
        )}

        {/* Target display */}
        {lesson.targetNumber > 0 && (
          <div style={{
            ...styles.targetBox,
            backgroundColor: isCorrect ? "#d4edda" : "#fff8e1",
            borderColor: isCorrect ? "#28a745" : "#ff9800",
            transform: justCorrect ? "scale(1.03)" : "scale(1)",
            transition: "all 0.3s",
          }}>
            <div style={{ fontSize: 14, color: isCorrect ? "#155724" : "#856404" }}>
              {isCorrect ? "🎉 Perfect!" : "🎯 Target Number"}
            </div>
            <div style={{ fontSize: 28, fontWeight: "bold", color: isCorrect ? "#28a745" : "#e65100", fontFamily: "monospace" }}>
              {lesson.targetNumber}
            </div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
              Your abacus shows: <strong style={{ color: "#2c3e50", fontSize: 15 }}>{currentTotal}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Abacus */}
      <AbacusVisual
        values={values}
        onBeadClick={handleBeadClick}
        highlightRod={lesson.highlightRod}
        showDigitValues={step >= 2}
      />

      {/* Reset */}
      {lesson.targetNumber > 0 && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => { AudioEngine.pop(); setValues(emptyValues()); prevCorrectRef.current = false; }} style={styles.smallBtn}>
            🔄 Reset beads
          </button>
        </div>
      )}

      {/* Navigation */}
      <div style={styles.navRow}>
        <button onClick={prevStep} disabled={step === 0} style={{ ...styles.navBtn, opacity: step === 0 ? 0.4 : 1 }}>
          ← Previous
        </button>
        <button
          onClick={nextStep}
          disabled={step === LESSONS.length - 1 || (lesson.targetNumber > 0 && !isCorrect)}
          style={{
            ...styles.navBtn,
            ...styles.navBtnPrimary,
            opacity: (step === LESSONS.length - 1 || (lesson.targetNumber > 0 && !isCorrect)) ? 0.4 : 1,
          }}
        >
          {step === LESSONS.length - 1 ? "🎉 Done!" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🎨 FREE PLAY MODE
// ═══════════════════════════════════════════════════════════════════════
function FreePlayMode({ onBack }) {
  const [values, setValues] = useState(emptyValues());
  const [showDigits, setShowDigits] = useState(true);
  const [numberPop, setNumberPop] = useState(false);
  const currentTotal = calcTotal(values);
  const prevTotal = useRef(0);
  const handleBeadClick = useBeadHandler(setValues);

  useEffect(() => {
    if (currentTotal !== prevTotal.current) {
      setNumberPop(true);
      setTimeout(() => setNumberPop(false), 200);
      prevTotal.current = currentTotal;
    }
  }, [currentTotal]);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 8px" }}>
      <button onClick={() => { AudioEngine.buttonClick(); onBack(); }} style={styles.backBtn}>← Back to Menu</button>

      <div style={styles.freePlayHeader}>
        <h2 style={{ margin: 0, color: "#2c3e50", fontSize: 22 }}>🎨 Free Play Mode</h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>Click beads to explore! Listen to the sounds as you move them.</p>
      </div>

      {/* Big animated number */}
      <div style={{
        ...styles.bigNumber,
        transform: numberPop ? "scale(1.15)" : "scale(1)",
        transition: "transform 0.15s ease-out",
        color: currentTotal === 0 ? "#ccc" : "#2c3e50",
      }}>
        {currentTotal.toLocaleString()}
      </div>

      {/* Number breakdown */}
      {currentTotal > 0 && (
        <div style={{ textAlign: "center", marginBottom: 12, fontSize: 13, color: "#888" }}>
          {(() => {
            const parts = [];
            for (let i = 0; i < ROD_COUNT; i++) {
              const pv = Math.pow(10, ROD_COUNT - 1 - i);
              const d = (values[i]?.top ?? 0) * 5 + (values[i]?.bottom ?? 0);
              if (d > 0) parts.push(`${d} × ${pv.toLocaleString()}`);
            }
            return parts.join(" + ");
          })()}
        </div>
      )}

      <AbacusVisual values={values} onBeadClick={handleBeadClick} showDigitValues={showDigits} />

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 12 }}>
        <button onClick={() => { AudioEngine.pop(); setValues(emptyValues()); }} style={styles.smallBtn}>
          🔄 Reset
        </button>
        <button onClick={() => setShowDigits(!showDigits)} style={styles.smallBtn}>
          {showDigits ? "🔢 Hide digits" : "🔢 Show digits"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 📝 TEST MODE — with streaks, lives, celebrations
// ═══════════════════════════════════════════════════════════════════════
function generateQuestion(difficulty) {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  if (difficulty === "easy") {
    const type = rand(0, 1);
    if (type === 0) {
      const num = rand(1, 9);
      return { type: "show", number: num, text: `Show the number ${num} on the abacus`, emoji: "🧮" };
    } else {
      const num = rand(1, 9);
      return { type: "read", number: num, text: "What number is shown on the abacus?", emoji: "👀" };
    }
  } else if (difficulty === "medium") {
    const type = rand(0, 2);
    if (type === 0) {
      const num = rand(10, 99);
      return { type: "show", number: num, text: `Show the number ${num}`, emoji: "🧮" };
    } else if (type === 1) {
      const num = rand(10, 99);
      return { type: "read", number: num, text: "Read the number on the abacus", emoji: "👀" };
    } else {
      const a = rand(5, 45);
      const b = rand(5, 45);
      return { type: "show", number: a + b, text: `What is ${a} + ${b}? Show it!`, emoji: "➕" };
    }
  } else {
    const type = rand(0, 3);
    if (type === 0) {
      const num = rand(100, 9999);
      return { type: "show", number: num, text: `Show ${num.toLocaleString()}`, emoji: "🧮" };
    } else if (type === 1) {
      const num = rand(100, 9999);
      return { type: "read", number: num, text: "Read this number from the abacus", emoji: "👀" };
    } else if (type === 2) {
      const a = rand(50, 500);
      const b = rand(50, 500);
      return { type: "show", number: a + b, text: `Calculate ${a} + ${b}`, emoji: "➕" };
    } else {
      const a = rand(100, 999);
      const b = rand(10, Math.min(a - 1, 200));
      return { type: "show", number: a - b, text: `Calculate ${a} − ${b}`, emoji: "➖" };
    }
  }
}

function TestMode({ onBack }) {
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [values, setValues] = useState(emptyValues());
  const [readAnswer, setReadAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const timerRef = useRef(null);
  const TOTAL_Q = 10;

  const handleBeadClick = useCallback((rodIdx, section, beadIdx) => {
    if (answered) return;
    AudioEngine.beadClick();
    setValues(prev => {
      const next = prev.map(v => ({ ...v }));
      if (section === "top") {
        next[rodIdx].top = next[rodIdx].top === 1 ? 0 : 1;
      } else {
        const current = next[rodIdx].bottom;
        if (beadIdx < current) {
          next[rodIdx].bottom = beadIdx;
        } else {
          next[rodIdx].bottom = Math.min(beadIdx + 1, 4);
        }
      }
      return next;
    });
  }, [answered]);

  const startTest = (diff) => {
    AudioEngine.whoosh();
    setDifficulty(diff);
    const qs = Array.from({ length: TOTAL_Q }, () => generateQuestion(diff));
    setQuestions(qs);
    setCurrentQ(0);
    setValues(emptyValues());
    setReadAnswer("");
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswered(false);
    setFinished(false);
    const time = diff === "easy" ? 30 : diff === "medium" ? 45 : 60;
    setTimeLeft(time);
  };

  useEffect(() => {
    if (difficulty && !finished && !answered && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => {
          if (t === 6) AudioEngine.timeLow();
          if (t <= 5 && t > 1) AudioEngine.tick();
          return t - 1;
        });
      }, 1000);
      return () => clearTimeout(timerRef.current);
    }
    if (timeLeft === 0 && difficulty && !finished && !answered) {
      handleSubmit(true);
    }
  }, [timeLeft, difficulty, finished, answered]);

  const handleSubmit = (timedOut = false) => {
    const q = questions[currentQ];
    let correct = false;
    if (q.type === "show") {
      correct = calcTotal(values) === q.number;
    } else {
      correct = parseInt(readAnswer) === q.number;
    }
    if (timedOut) correct = false;
    setWasCorrect(correct);
    if (correct) {
      AudioEngine.correct();
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      setShowStars(true);
      setTimeout(() => setShowStars(false), 2000);
    } else {
      AudioEngine.wrong();
      setStreak(0);
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
    setAnswered(true);
  };

  const nextQuestion = () => {
    AudioEngine.whoosh();
    if (currentQ + 1 >= TOTAL_Q) {
      setFinished(true);
      if (score >= 7) {
        setShowConfetti(true);
        AudioEngine.celebrate();
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } else {
      setCurrentQ(currentQ + 1);
      setValues(emptyValues());
      setReadAnswer("");
      setAnswered(false);
      setWasCorrect(false);
      const time = difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 60;
      setTimeLeft(time);
    }
  };

  // ─── Difficulty Selection ───
  if (!difficulty) {
    return (
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 8px" }}>
        <button onClick={() => { AudioEngine.buttonClick(); onBack(); }} style={styles.backBtn}>← Back to Menu</button>
        <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: 4 }}>📝 Choose Your Challenge</h2>
        <p style={{ textAlign: "center", color: "#888", marginBottom: 24, fontSize: 14 }}>10 timed questions. How well do you know the abacus?</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { key: "easy", label: "Easy", emoji: "🌱", desc: "Numbers 1–9", sub: "30s per question", color: "#4ECDC4", bg: "#e8faf8" },
            { key: "medium", label: "Medium", emoji: "🌿", desc: "Numbers 10–99", sub: "45s · Addition", color: "#FFB347", bg: "#fff5e6" },
            { key: "hard", label: "Hard", emoji: "🌳", desc: "Numbers up to 9,999", sub: "60s · Add & Subtract", color: "#FF6B6B", bg: "#ffe8e8" },
          ].map(d => (
            <button
              key={d.key}
              onClick={() => startTest(d.key)}
              style={{ ...styles.diffBtn, borderColor: d.color, backgroundColor: d.bg }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <div style={{ fontSize: 40 }}>{d.emoji}</div>
              <div style={{ fontWeight: "bold", fontSize: 18, color: "#2c3e50", marginTop: 4 }}>{d.label}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{d.desc}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{d.sub}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Results Screen ───
  if (finished) {
    const pct = Math.round((score / TOTAL_Q) * 100);
    const grade = pct >= 90 ? { emoji: "🏆", msg: "Outstanding!", sub: "You're an abacus master!" }
      : pct >= 70 ? { emoji: "⭐", msg: "Great Job!", sub: "You really know your beads!" }
      : pct >= 50 ? { emoji: "👍", msg: "Good Effort!", sub: "Keep practicing and you'll get even better!" }
      : { emoji: "💪", msg: "Keep Going!", sub: "Practice makes perfect! Try the lessons again." };

    return (
      <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", position: "relative", padding: "0 8px" }}>
        <Confetti active={showConfetti} duration={4000} />
        <button onClick={() => { AudioEngine.buttonClick(); onBack(); }} style={styles.backBtn}>← Back to Menu</button>
        <div style={styles.resultCard}>
          <div style={{ fontSize: 72, animation: "bounceIn 0.6s ease-out" }}>{grade.emoji}</div>
          <h2 style={{ margin: "12px 0 4px", color: "#2c3e50", fontSize: 28 }}>{grade.msg}</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 16 }}>{grade.sub}</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 20 }}>
            <div style={styles.statBox}>
              <div style={{ fontSize: 36, fontWeight: "bold", color: pct >= 70 ? "#28a745" : "#e74c3c" }}>{pct}%</div>
              <div style={{ fontSize: 12, color: "#888" }}>Score</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ fontSize: 36, fontWeight: "bold", color: "#45B7D1" }}>{score}/{TOTAL_Q}</div>
              <div style={{ fontSize: 12, color: "#888" }}>Correct</div>
            </div>
            <div style={styles.statBox}>
              <div style={{ fontSize: 36, fontWeight: "bold", color: "#FFB347" }}>{bestStreak}🔥</div>
              <div style={{ fontSize: 12, color: "#888" }}>Best Streak</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => startTest(difficulty)} style={{ ...styles.navBtn, ...styles.navBtnPrimary }}>🔄 Try Again</button>
            <button onClick={() => { AudioEngine.buttonClick(); setDifficulty(null); }} style={styles.navBtn}>🎚️ Change Level</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Question Screen ───
  const q = questions[currentQ];
  const timerPct = (timeLeft / (difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 60)) * 100;
  const timerColor = timeLeft <= 5 ? "#dc3545" : timeLeft <= 10 ? "#ffc107" : "#4ECDC4";

  return (
    <div style={{
      maxWidth: 620, margin: "0 auto", position: "relative", padding: "0 8px",
      animation: shakeWrong ? "shake 0.4s ease-in-out" : "none",
    }}>
      <FloatingStars active={showStars} />
      <button onClick={() => { AudioEngine.buttonClick(); onBack(); }} style={styles.backBtn}>← Back to Menu</button>

      {/* Top bar: progress + score + streak + timer */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${((currentQ) / TOTAL_Q) * 100}%` }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, fontSize: 13, flexWrap: "wrap", gap: 4 }}>
        <span style={{ color: "#888" }}>Q {currentQ + 1}/{TOTAL_Q}</span>
        {streak >= 2 && (
          <span style={{ color: "#FF6B6B", fontWeight: "bold", animation: "pulse 1s infinite" }}>
            {streak}🔥 streak!
          </span>
        )}
        <span style={{ color: "#888", fontWeight: "bold" }}>⭐ {score}</span>
      </div>

      {/* Timer bar */}
      <div style={{ height: 6, background: "#eee", borderRadius: 3, marginBottom: 12, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3, background: timerColor,
          width: `${timerPct}%`, transition: "width 1s linear, background 0.3s",
        }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 22, fontWeight: "bold", color: timerColor, marginBottom: 8, fontFamily: "monospace" }}>
        {timeLeft <= 10 && timeLeft > 0 && <span style={{ animation: timeLeft <= 5 ? "pulse 0.5s infinite" : "none" }}>⏱ </span>}
        {timeLeft}s
      </div>

      {/* Question Card */}
      <div style={{ ...styles.questionBox, animation: "fadeSlideIn 0.3s ease-out" }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>{q.emoji}</div>
        <p style={{ margin: 0, fontSize: 18, fontWeight: "bold", color: "#2c3e50" }}>{q.text}</p>
      </div>

      {/* Abacus + Input */}
      {q.type === "show" ? (
        <AbacusVisual values={values} onBeadClick={handleBeadClick} interactive={!answered} showDigitValues />
      ) : (
        <>
          <AbacusVisual values={numberToValues(q.number)} interactive={false} />
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <input
              type="number"
              value={readAnswer}
              onChange={e => !answered && setReadAnswer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !answered && handleSubmit()}
              placeholder="Your answer..."
              style={{
                ...styles.answerInput,
                borderColor: answered ? (wasCorrect ? "#28a745" : "#dc3545") : "#ddd",
              }}
              disabled={answered}
              autoFocus
            />
          </div>
        </>
      )}

      {/* Feedback */}
      {answered && (
        <div style={{
          ...styles.feedbackBox,
          backgroundColor: wasCorrect ? "#d4edda" : "#f8d7da",
          borderColor: wasCorrect ? "#28a745" : "#dc3545",
          animation: "fadeSlideIn 0.3s ease-out",
        }}>
          <div style={{ fontSize: 24 }}>{wasCorrect ? "🎉" : "😔"}</div>
          <div>{wasCorrect ? "Correct! Well done!" : `The answer was ${q.number.toLocaleString()}`}</div>
          {!wasCorrect && q.type === "show" && (
            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              You showed: {calcTotal(values).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ textAlign: "center", marginTop: 16, marginBottom: 20 }}>
        {!answered ? (
          <button onClick={() => handleSubmit()} style={{ ...styles.navBtn, ...styles.navBtnPrimary, padding: "14px 48px", fontSize: 16 }}>
            ✓ Submit
          </button>
        ) : (
          <button onClick={nextQuestion} style={{ ...styles.navBtn, ...styles.navBtnPrimary, padding: "14px 48px", fontSize: 16 }}>
            {currentQ + 1 >= TOTAL_Q ? "📊 See Results" : "Next →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🏠 MAIN APP
// ═══════════════════════════════════════════════════════════════════════
export default function AbacusApp() {
  const [mode, setMode] = useState("menu");
  const [menuAnim, setMenuAnim] = useState(false);

  useEffect(() => {
    setMenuAnim(true);
  }, []);

  if (mode === "learn") return <><GlobalStyles /><LearnMode onBack={() => setMode("menu")} /></>;
  if (mode === "play") return <><GlobalStyles /><FreePlayMode onBack={() => setMode("menu")} /></>;
  if (mode === "test") return <><GlobalStyles /><TestMode onBack={() => setMode("menu")} /></>;

  return (
    <>
      <GlobalStyles />
      <div style={{ maxWidth: 620, margin: "0 auto", textAlign: "center", padding: "24px 16px" }}>
        {/* Animated header */}
        <div style={{ animation: menuAnim ? "bounceIn 0.6s ease-out" : "none" }}>
          <div style={{ fontSize: 72, marginBottom: 4 }}>🧮</div>
          <h1 style={{ fontSize: 36, color: "#2c3e50", margin: "0 0 2px", fontFamily: "system-ui, sans-serif" }}>
            Abacus Academy
          </h1>
          <p style={{ color: "#888", fontSize: 15, margin: "0 0 6px" }}>Learn to count like a math wizard!</p>
          <p style={{ color: "#bbb", fontSize: 12, margin: "0 0 28px" }}>with sounds, animations & fun challenges</p>
        </div>

        {/* Menu cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380, margin: "0 auto" }}>
          {[
            { key: "learn", emoji: "📖", title: "Learn", desc: "15 step-by-step lessons with tips & hints", color: "#4ECDC4", bg: "linear-gradient(135deg, #e8faf8, #f0fffe)" },
            { key: "play", emoji: "🎨", title: "Free Play", desc: "Explore the abacus with sounds & live counting", color: "#45B7D1", bg: "linear-gradient(135deg, #e8f4fd, #f0f9ff)" },
            { key: "test", emoji: "📝", title: "Take a Test", desc: "Timed challenges with streaks & celebrations!", color: "#FF6B6B", bg: "linear-gradient(135deg, #ffe8e8, #fff0f0)" },
          ].map((item, idx) => (
            <button
              key={item.key}
              onClick={() => { AudioEngine.buttonClick(); setMode(item.key); }}
              style={{
                ...styles.menuBtn,
                borderLeftColor: item.color,
                background: item.bg,
                animation: `fadeSlideIn 0.4s ease-out ${idx * 0.1}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateX(6px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ fontSize: 36, marginRight: 16, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>{item.emoji}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "bold", fontSize: 18, color: "#2c3e50" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Decorative mini abacus */}
        <div style={{ marginTop: 32, opacity: 0.6, transition: "opacity 0.3s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
        >
          <AbacusVisual values={numberToValues(2026, 5)} rodCount={5} interactive={false} />
          <p style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>Showing: 2026</p>
        </div>

        <p style={{ fontSize: 11, color: "#ccc", marginTop: 24 }}>🔊 Click anywhere to enable sound effects</p>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🎨 GLOBAL STYLES (keyframe animations injected)
// ═══════════════════════════════════════════════════════════════════════
function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounceIn {
        0% { transform: scale(0.3); opacity: 0; }
        50% { transform: scale(1.05); }
        70% { transform: scale(0.95); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes floatUp {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        20% { opacity: 1; }
        100% { transform: translateY(-350px) scale(1.2) rotate(20deg); opacity: 0; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 5px rgba(78,205,196,0.3); }
        50% { box-shadow: 0 0 20px rgba(78,205,196,0.6); }
      }
      * { box-sizing: border-box; }
      body { font-family: system-ui, -apple-system, sans-serif; }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 💅 STYLES
// ═══════════════════════════════════════════════════════════════════════
const styles = {
  backBtn: {
    background: "none", border: "none", color: "#4ECDC4", fontSize: 15, cursor: "pointer",
    fontWeight: "bold", padding: "8px 0", marginBottom: 8, transition: "color 0.2s",
  },
  lessonCard: {
    background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 16, textAlign: "center",
    transition: "all 0.3s",
  },
  lessonTitle: { margin: "0 0 10px", color: "#2c3e50", fontSize: 22, fontWeight: 700 },
  lessonText: { margin: 0, color: "#555", fontSize: 15, lineHeight: 1.7 },
  tipBox: {
    marginTop: 14, padding: "10px 14px", borderRadius: 10, fontSize: 13, color: "#6c757d",
    background: "linear-gradient(135deg, #f8f9fa, #eef2f7)", textAlign: "left", lineHeight: 1.5,
    borderLeft: "4px solid #45B7D1",
  },
  targetBox: {
    marginTop: 16, padding: "12px 16px", borderRadius: 12, border: "2px solid",
    transition: "all 0.3s",
  },
  navRow: { display: "flex", justifyContent: "space-between", marginTop: 16, marginBottom: 20 },
  navBtn: {
    padding: "10px 24px", borderRadius: 10, border: "2px solid #ddd", background: "#fff",
    fontSize: 15, cursor: "pointer", fontWeight: "bold", color: "#555", transition: "all 0.2s",
  },
  navBtnPrimary: {
    background: "linear-gradient(135deg, #4ECDC4, #45B7D1)", borderColor: "transparent", color: "#fff",
  },
  freePlayHeader: {
    background: "linear-gradient(135deg, #e8faf8, #f0fffe)", borderRadius: 14, padding: 16, marginBottom: 12, textAlign: "center",
  },
  bigNumber: {
    fontSize: 52, fontWeight: "bold", textAlign: "center", fontFamily: "monospace", margin: "4px 0 8px",
    transition: "transform 0.15s, color 0.3s",
  },
  smallBtn: {
    padding: "6px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff",
    fontSize: 13, cursor: "pointer", color: "#888", transition: "all 0.2s",
  },
  menuBtn: {
    display: "flex", alignItems: "center", padding: "18px 20px", borderRadius: 14,
    border: "none", borderLeft: "5px solid", cursor: "pointer", transition: "all 0.25s ease",
  },
  diffBtn: {
    padding: "22px 28px", borderRadius: 14, border: "3px solid", cursor: "pointer",
    minWidth: 150, textAlign: "center", transition: "all 0.2s",
  },
  progressBar: {
    height: 8, background: "#e9ecef", borderRadius: 4, overflow: "hidden", marginBottom: 6,
  },
  progressFill: {
    height: "100%", background: "linear-gradient(90deg, #4ECDC4, #45B7D1, #A29BFE)",
    borderRadius: 4, transition: "width 0.4s ease",
  },
  questionBox: {
    background: "linear-gradient(135deg, #f0f7ff, #e8f1fc)", borderRadius: 14, padding: "16px 20px", marginBottom: 14, textAlign: "center",
    border: "2px solid #b8daff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  answerInput: {
    fontSize: 28, padding: "12px 24px", borderRadius: 12, border: "3px solid #ddd",
    textAlign: "center", width: 220, fontFamily: "monospace", transition: "border-color 0.3s",
    outline: "none",
  },
  feedbackBox: {
    textAlign: "center", padding: "14px 16px", borderRadius: 12, border: "2px solid",
    fontSize: 16, fontWeight: "bold", marginTop: 12,
  },
  resultCard: {
    background: "linear-gradient(135deg, #f8f9fa, #fff)", borderRadius: 20, padding: "32px 24px", marginTop: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  statBox: {
    padding: "12px 16px", borderRadius: 12, background: "#f8f9fa", minWidth: 80,
  },
};
