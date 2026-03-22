/**
 * ═══════════════════════════════════════════════════
 * ORAV LEARNING LAB — Games Configuration
 * ═══════════════════════════════════════════════════
 * 
 * FUTURE MEIN GAME ADD KARNA HAI? Bas 3 steps:
 * 
 *   1. Naya .jsx file daalo src/games/ folder mein
 *      (file mein "export default function GameName()" hona chahiye)
 * 
 *   2. Neeche GAMES array mein ek naya entry add karo
 * 
 *   3. npm run build → deploy!
 * 
 * GAME HATAANA HAI? Bas us entry ko comment (#) ya delete karo.
 * 
 * ═══════════════════════════════════════════════════
 */

import { lazy } from "react";

const GAMES = [
  {
    id: "code-maze",
    path: "/code-maze",
    title: "Code Maze",
    emoji: "🧩",
    desc: "Drag-drop coding blocks se maze solve karo! Krishna avatar, 24 levels!",
    color: "#4ECDC4",
    bg: "linear-gradient(135deg, #0D2137, #1A3A5C)",
    tag: "CODING",
    component: lazy(() => import("./games/code-maze.jsx")),
  },
  {
    id: "india-explorer",
    path: "/india-explorer",
    title: "India Explorer",
    emoji: "🇮🇳",
    desc: "28 states, SVG map, capitals, food, festivals — apna Bharat jaano!",
    color: "#FF8C42",
    bg: "linear-gradient(135deg, #2D1500, #4A2200)",
    tag: "CULTURE",
    component: lazy(() => import("./games/india_explorer.jsx")),
  },
  {
    id: "pattern-master",
    path: "/pattern-master",
    title: "Pattern Master",
    emoji: "🔢",
    desc: "Colors, shapes, Simon Says, number patterns — 20 levels, 4 worlds!",
    color: "#A78BFA",
    bg: "linear-gradient(135deg, #1A0D3A, #2D1B5C)",
    tag: "BRAIN",
    component: lazy(() => import("./games/pattern-master.jsx")),
  },
  {
    id: "why-machine",
    path: "/why-machine",
    title: "The Why Machine",
    emoji: "🤔",
    desc: "Kuch bhi pooch! AI 3 levels mein samjhayega — 6, 10, 14 saal!",
    color: "#A855F7",
    bg: "linear-gradient(135deg, #1E0A3A, #2D1560)",
    tag: "AI",
    component: lazy(() => import("./games/why_machine.jsx")),
  },
  {
    id: "math-arcade",
    path: "/math-arcade",
    title: "Math Arcade",
    emoji: "🧮",
    desc: "Multiple math games — speed rounds, puzzles, challenges!",
    color: "#FFE66D",
    bg: "linear-gradient(135deg, #2D1B00, #4A2F00)",
    tag: "MATH",
    component: lazy(() => import("./games/math-arcade.jsx")),
  },
  {
    id: "abacus",
    path: "/abacus",
    title: "Abacus Learning",
    emoji: "🧮",
    desc: "Visual abacus — numbers seekho traditional style! Beads move karo!",
    color: "#FF6B6B",
    bg: "linear-gradient(135deg, #2D0A0A, #4A1A1A)",
    tag: "MATH",
    component: lazy(() => import("./games/abacus-learning-app.jsx")),
  },

  // ┌─────────────────────────────────────────────┐
  // │  NAYA GAME ADD KARNA HAI? Yahan paste karo: │
  // │                                              │
  // │  {                                           │
  // │    id: "game-name",                          │
  // │    path: "/game-name",                       │
  // │    title: "Game Title",                      │
  // │    emoji: "🎮",                              │
  // │    desc: "Description in Hinglish",          │
  // │    color: "#HEX",                            │
  // │    bg: "linear-gradient(135deg, #X, #Y)",    │
  // │    tag: "CATEGORY",                          │
  // │    component: lazy(() =>                     │
  // │      import("./games/filename.jsx")          │
  // │    ),                                        │
  // │  },                                          │
  // └─────────────────────────────────────────────┘
];

export default GAMES;
