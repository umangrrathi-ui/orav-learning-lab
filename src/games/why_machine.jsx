import { useState, useCallback, useRef } from "react";

const SUGGESTED = [
  "Stars kaise bante hain?",
  "Dinosaurs kyu khatam ho gaye?",
  "Rainbow kaise banta hai?",
  "Brain kaise kaam karta hai?",
  "Planes kaise udte hain?",
  "Samundar ka paani namkeen kyun hai?",
  "Raat ko andhera kyun hota hai?",
  "Ice cream thandi kyun hoti hai?",
  "Chand pe koi rehta hai?",
  "Paani barasta kyun hai?",
  "Insects ke kitne pair hote hain?",
  "Volcano kaise phatte hain?",
  "WiFi kaise kaam karta hai?",
  "Dreams kyun aate hain?",
  "Earth ghoomti hai toh hum girte kyun nahi?",
  "Black hole kya hota hai?",
  "Fish paani mein saans kaise leti hai?",
  "Bijli kaise banti hai?",
  "Sun kitna door hai?",
  "Humans pehle bandar the kya?",
];

const AGE_LABELS = [
  { age: 6, label: "6 saal (Simple)", color: "#22C55E", emoji: "🧒" },
  { age: 10, label: "10 saal (Medium)", color: "#3B82F6", emoji: "📚" },
  { age: 14, label: "14 saal (Advanced)", color: "#A855F7", emoji: "🔬" },
];

export default function WhyMachine() {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAge, setActiveAge] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, streak: 0 });
  const inputRef = useRef();

  const askQuestion = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setAnswers(null);
    setFollowUps([]);
    setActiveAge(0);

    const prompt = `You are a fun, enthusiastic science teacher who LOVES answering kids' questions. The child's name is Orav.

A child asked: "${q.trim()}"

You must respond ONLY with valid JSON (no markdown, no backticks, no preamble). The JSON must have this exact structure:
{
  "answers": [
    {"age": 6, "answer": "Simple answer for a 6 year old in Hinglish (Hindi + English mix). Use fun examples, comparisons to everyday things Orav knows. Keep it 3-4 sentences. Use words like 'dekh', 'samajh', 'matlab'. Make it exciting!"},
    {"age": 10, "answer": "Medium detail for 10 year old in Hinglish. Add some science terms but explain them. 4-6 sentences. Include a cool fact."},
    {"age": 14, "answer": "Advanced explanation for 14 year old in Hinglish. Use proper scientific terms with Hindi explanations. 5-8 sentences. Include numbers/data where relevant."}
  ],
  "funFact": "One mind-blowing related fact in Hinglish that will make Orav go WOW!",
  "followUps": ["Related question 1 in Hinglish?", "Related question 2 in Hinglish?", "Related question 3 in Hinglish?"]
}

IMPORTANT: Response must be ONLY valid JSON. No other text.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("");

      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setAnswers(parsed.answers);
      setFollowUps(parsed.followUps || []);
      setHistory((prev) => [{ q: q.trim(), funFact: parsed.funFact, time: Date.now() }, ...prev].slice(0, 50));
      setStats((prev) => ({ total: prev.total + 1, streak: prev.streak + 1 }));
    } catch (err) {
      setError("Oops! Kuch gadbad ho gayi. Phir se try kar!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = () => {
    if (question.trim()) {
      askQuestion(question);
      setQuestion("");
    }
  };

  const randomSuggestions = SUGGESTED.sort(() => Math.random() - 0.5).slice(0, 6);

  return (
    <div style={{ background: "linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a)", borderRadius: 16, minHeight: 600, fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;}`}</style>

      <div style={{ padding: "20px 18px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{"🤔 The Why Machine"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Kuch bhi pooch! AI jawab dega 3 levels mein!</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 12px", fontSize: 12, color: "#22C55E", fontWeight: 700 }}>
              {stats.total + " questions"}
            </div>
            <button onClick={() => setShowHistory(!showHistory)} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "6px 12px", border: "none", fontSize: 12, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
              {showHistory ? "Back" : "History"}
            </button>
          </div>
        </div>

        {/* History View */}
        {showHistory ? (
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{"📜 Pehle ke sawaal (" + history.length + ")"}</div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.4)" }}>Abhi tak koi sawaal nahi poocha! Shuru kar!</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => (
                  <button key={i} onClick={() => { setShowHistory(false); askQuestion(h.q); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: "#fff" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{"? " + h.q}</div>
                    {h.funFact && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{"Fun fact: " + h.funFact}</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                ref={inputRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Kuch bhi pooch... jaise 'Stars kaise bante hain?'"
                style={{ flex: 1, padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 15, outline: "none" }}
              />
              <button onClick={handleSubmit} disabled={loading || !question.trim()} style={{ padding: "12px 20px", borderRadius: 14, border: "none", background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #A855F7, #6366F1)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap" }}>
                {loading ? "..." : "Pooch!"}
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 40, animation: "spin 2s linear infinite", display: "inline-block" }}>{"🔭"}</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>Orav, soch raha hoon tere sawaal ka jawab...</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>3 levels mein samjhaunga - ruk!</div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 14, marginBottom: 16 }}>{error}</div>
            )}

            {/* Answers */}
            {answers && !loading && (
              <div style={{ animation: "fadeIn 0.4s ease-out" }}>
                {/* Age tabs */}
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  {AGE_LABELS.map((a, i) => (
                    <button key={i} onClick={() => setActiveAge(i)} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: "none", cursor: "pointer", background: activeAge === i ? AGE_LABELS[i].color + "22" : "rgba(255,255,255,0.05)", border: activeAge === i ? "1px solid " + AGE_LABELS[i].color + "44" : "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                      <div style={{ fontSize: 22, marginBottom: 2 }}>{a.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: activeAge === i ? a.color : "rgba(255,255,255,0.5)" }}>{a.label}</div>
                    </button>
                  ))}
                </div>

                {/* Answer card */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "18px 20px", borderLeft: "4px solid " + AGE_LABELS[activeAge].color, marginBottom: 14, animation: "fadeIn 0.3s ease-out" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{AGE_LABELS[activeAge].emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: AGE_LABELS[activeAge].color }}>{AGE_LABELS[activeAge].label + " explanation"}</span>
                  </div>
                  <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.8 }}>
                    {answers[activeAge] ? answers[activeAge].answer : "Loading..."}
                  </div>
                </div>

                {/* Fun fact */}
                {history.length > 0 && history[0].funFact && (
                  <div style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(249,115,22,0.1))", borderRadius: 12, padding: "14px 18px", marginBottom: 14, border: "1px solid rgba(234,179,8,0.2)" }}>
                    <div style={{ fontSize: 11, color: "#EAB308", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{"WOW FACT!"}</div>
                    <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6 }}>{history[0].funFact}</div>
                  </div>
                )}

                {/* Follow-up questions */}
                {followUps.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{"Aur pooch sakte ho:"}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {followUps.map((fu, i) => (
                        <button key={i} onClick={() => askQuestion(fu)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", lineHeight: 1.4 }}>
                          {"? " + fu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions (when no answer shown) */}
            {!answers && !loading && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{"Yeh pooch ke dekh:"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {randomSuggestions.map((s, i) => (
                    <button key={i} onClick={() => askQuestion(s)} style={{ padding: "14px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", textAlign: "left", color: "#fff", fontSize: 13, lineHeight: 1.4 }}>
                      {"? " + s}
                    </button>
                  ))}
                </div>

                {/* How it works */}
                <div style={{ marginTop: 24, padding: "18px 20px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{"Kaise kaam karta hai?"}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { step: "1", text: "Koi bhi sawaal type kar - Hindi, English, Hinglish - kuch bhi!", icon: "?" },
                      { step: "2", text: "AI 3 levels mein samjhayega - 6 saal, 10 saal, aur 14 saal ke liye", icon: "3" },
                      { step: "3", text: "Bonus fun fact milega + aur questions suggest honge!", icon: "!" },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(168,85,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#A855F7", fontWeight: 700, flexShrink: 0 }}>{s.icon}</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{s.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
