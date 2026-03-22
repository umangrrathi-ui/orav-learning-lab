# 🚀 Orav Learning Lab

Papa ka gift — khel khel mein seekho!

## Games (6)

| # | Game | File | Category |
|---|------|------|----------|
| 1 | 🧩 Code Maze | `src/games/code-maze.jsx` | Coding |
| 2 | 🇮🇳 India Explorer | `src/games/india_explorer.jsx` | Culture |
| 3 | 🔢 Pattern Master | `src/games/pattern-master.jsx` | Brain |
| 4 | 🤔 The Why Machine | `src/games/why_machine.jsx` | AI |
| 5 | 🧮 Math Arcade | `src/games/math-arcade.jsx` | Math |
| 6 | 🧮 Abacus Learning | `src/games/abacus-learning-app.jsx` | Math |

---

## 🎮 NAYA GAME ADD KARNA HAI?

### Step 1: Game file daalo
Naya `.jsx` file daalo `src/games/` folder mein.
File mein `export default function GameName()` hona chahiye.

### Step 2: Config mein register karo
`src/games.config.js` kholo, GAMES array mein ek naya entry add karo:

```js
{
  id: "my-new-game",
  path: "/my-new-game",
  title: "My New Game",
  emoji: "🎮",
  desc: "Description yahan likho",
  color: "#HEX_COLOR",
  bg: "linear-gradient(135deg, #DARK, #DARKER)",
  tag: "CATEGORY",
  component: lazy(() => import("./games/my-new-game.jsx")),
},
```

### Step 3: Build & Deploy
```bash
npm run build
# dist/ folder upload karo Vercel/Hostinger pe
```

---

## 🗑️ GAME HATAANA HAI?

1. `src/games.config.js` mein us game ki entry delete karo
2. (Optional) `src/games/` se file bhi delete kar do
3. `npm run build`

---

## ✏️ GAME UPDATE KARNA HAI?

1. `src/games/filename.jsx` edit karo
2. `npm run build`
3. Vercel pe auto-deploy hoga (git push karo bas)

---

## 🛠️ Local Development

```bash
npm install        # Pehli baar sirf
npm run dev        # Local server start (localhost:5173)
npm run build      # Production build (dist/ folder)
npm run preview    # Preview production build
```

---

## 🚀 Deploy Options

### Vercel (Recommended - FREE)
1. GitHub pe push karo
2. Vercel.com → Import Project → GitHub repo select
3. Framework: Vite → Deploy
4. Auto-deploy har push pe

### Hostinger
1. `npm run build`
2. `dist/` folder ka content FTP/File Manager se upload karo
3. ⚠️ HTTP POST se JS files mat bhejo — WAF corrupt karega!

### GitHub Pages
1. `vite.config.js` mein `base: '/repo-name/'` set karo
2. `npm run build`
3. `dist/` folder deploy karo
