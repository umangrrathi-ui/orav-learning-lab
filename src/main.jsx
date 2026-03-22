import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import GAMES from "./games.config.js";
import Home from "./pages/Home.jsx";

/**
 * GameWrapper - adds a back button to every game
 */
function GameWrapper({ children }) {
  const nav = useNavigate();
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <button
        onClick={() => nav("/")}
        style={{
          position: "fixed", top: 12, left: 12, zIndex: 9999,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
          color: "#fff", border: "1px solid rgba(255,255,255,0.15)",
          padding: "8px 18px", borderRadius: 30, fontSize: 14,
          fontWeight: 600, cursor: "pointer", display: "flex",
          alignItems: "center", gap: 6,
        }}
      >
        ← Home
      </button>
      {children}
    </div>
  );
}

/**
 * Loading spinner while game loads
 */
function Loading() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: 16,
    }}>
      <div style={{ fontSize: 50, animation: "spin 1.5s linear infinite" }}>🚀</div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Loading game...</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/**
 * App - Routes are auto-generated from games.config.js
 */
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {GAMES.map((game) => {
          const GameComponent = game.component;
          return (
            <Route
              key={game.id}
              path={game.path}
              element={
                <Suspense fallback={<Loading />}>
                  <GameWrapper>
                    <GameComponent />
                  </GameWrapper>
                </Suspense>
              }
            />
          );
        })}
      </Routes>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
