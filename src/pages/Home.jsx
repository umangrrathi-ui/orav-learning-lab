import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GAMES from "../games.config.js";

const STARS = Array.from({ length: 50 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: Math.random() * 2.5 + 0.5,
  o: 0.2 + Math.random() * 0.5,
}));

export default function Home() {
  const nav = useNavigate();
  const [hover, setHover] = useState(null);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Stars */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
            width: s.s, height: s.s, borderRadius: "50%",
            background: "#fff", opacity: s.o,
          }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "40px 20px 60px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🚀</div>
          <h1 style={{
            fontSize: "clamp(32px, 6vw, 48px)",
            background: "linear-gradient(135deg, #4ECDC4, #FFE66D, #FF6B6B, #A78BFA)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 8, letterSpacing: "-0.5px",
          }}>
            Orav Learning Lab
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 16, fontWeight: 600 }}>
            Papa ka gift — khel khel mein seekho! 🎮✨
          </p>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 6 }}>
            {GAMES.length} games available
          </p>
        </div>

        {/* Game Grid - auto from config */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {GAMES.map((g, i) => (
            <div
              key={g.id}
              onClick={() => nav(g.path)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: g.bg,
                borderRadius: 20, padding: 24, cursor: "pointer",
                border: `1.5px solid ${hover === i ? g.color + "80" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: hover === i ? "translateY(-6px) scale(1.02)" : "none",
                boxShadow: hover === i ? `0 20px 40px ${g.color}20` : "none",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Glow */}
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 100, height: 100, borderRadius: "50%",
                background: g.color, opacity: 0.08, filter: "blur(30px)",
              }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: g.color,
                  letterSpacing: "1.5px", background: g.color + "15",
                  padding: "3px 10px", borderRadius: 6,
                  display: "inline-block", marginBottom: 12,
                }}>{g.tag}</span>

                <div style={{
                  fontSize: 44, marginBottom: 12,
                  transition: "transform 0.3s",
                  transform: hover === i ? "scale(1.15) rotate(-5deg)" : "none",
                }}>{g.emoji}</div>

                <h3 style={{
                  fontSize: 20, fontWeight: 600,
                  marginBottom: 6, color: "#F1F5F9",
                }}>{g.title}</h3>

                <p style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.5 }}>{g.desc}</p>

                <div style={{
                  marginTop: 16, display: "inline-flex", alignItems: "center",
                  gap: 6, color: g.color, fontSize: 14, fontWeight: 700,
                  transition: "gap 0.2s",
                  ...(hover === i ? { gap: 10 } : {}),
                }}>
                  Play Now <span style={{ fontSize: 18 }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 50, color: "#475569", fontSize: 13 }}>
          Made with ❤️ by Papa for Orav
        </div>
      </div>
    </div>
  );
}
