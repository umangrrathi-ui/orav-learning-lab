import { useState, useEffect, useCallback, useRef } from "react";

/* ═══ SOUND ═══ */
const SFX=(()=>{let ctx=null;const gc=()=>{if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx};const p=(f,ty,d,v=0.12,dl=0)=>{try{const c=gc(),o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime+dl);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dl+d);o.connect(g);g.connect(c.destination);o.start(c.currentTime+dl);o.stop(c.currentTime+dl+d+0.05)}catch(e){}};return{add:()=>{p(880,"sine",0.06,0.08);p(1100,"sine",0.06,0.06,0.04)},rem:()=>p(440,"triangle",0.07,0.06),move:()=>p(520,"sine",0.04,0.05),turn:()=>{p(660,"sine",0.04,0.04);p(770,"sine",0.04,0.04,0.03)},launch:()=>{p(440,"square",0.06,0.05);p(660,"square",0.06,0.05,0.06);p(880,"square",0.09,0.06,0.12)},crash:()=>{p(300,"sawtooth",0.1,0.09);p(200,"sawtooth",0.15,0.07,0.07)},win:()=>{[523,659,784,1047].forEach((f,i)=>p(f,"sine",0.16,0.08,i*0.1))},star:()=>p(1200,"sine",0.1,0.05),click:()=>p(700,"sine",0.03,0.04),lvl:()=>{[440,554,659,880].forEach((f,i)=>p(f,"triangle",0.1,0.05,i*0.08))},cond:(y)=>y?p(880,"sine",0.04,0.04):p(330,"triangle",0.07,0.03)}})();

/* ═══ KRISHNA AVATAR ═══ */
function Av({size=40,crashed=false,blink=false}){
  return(
    <svg viewBox="0 0 100 120" width={size} height={size*1.2} style={{overflow:"visible"}}>
      <defs>
        <radialGradient id="cag"><stop offset="0%" stopColor={crashed?"#f44":"#fc0"} stopOpacity="0.3"/><stop offset="100%" stopColor="transparent" stopOpacity="0"/></radialGradient>
        <radialGradient id="cfg" cx="45%" cy="40%"><stop offset="0%" stopColor="#FDDCB5"/><stop offset="100%" stopColor="#E8B88A"/></radialGradient>
        <linearGradient id="cmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF1744"/><stop offset="40%" stopColor="#E00030"/><stop offset="100%" stopColor="#B71C1C"/></linearGradient>
        <linearGradient id="cgt" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFD54F"/><stop offset="50%" stopColor="#FFF176"/><stop offset="100%" stopColor="#FFD54F"/></linearGradient>
      </defs>
      <circle cx="50" cy="65" r="50" fill="url(#cag)"/>
      {/* Hair */}
      <ellipse cx="50" cy="55" rx="34" ry="36" fill="#0d0d1a"/>
      {/* Face - rounder, cuter */}
      <ellipse cx="50" cy="64" rx="28" ry="30" fill="url(#cfg)"/>
      {/* Ears + earrings */}
      <ellipse cx="22" cy="62" rx="5" ry="7" fill="#E0A872"/><circle cx="22" cy="67" r="2.5" fill="#FFD54F" stroke="#FFC107" strokeWidth="0.5"/>
      <ellipse cx="78" cy="62" rx="5" ry="7" fill="#E0A872"/><circle cx="78" cy="67" r="2.5" fill="#FFD54F" stroke="#FFC107" strokeWidth="0.5"/>
      {/* Tilak */}
      <path d="M45 47Q45 40 50 37Q55 40 55 47" fill="none" stroke="#FF6D00" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="50" cy="48.5" r="2" fill="#FF3D00"/>
      {/* Eyes */}
      {blink?(
        <><line x1="37" y1="60" x2="46" y2="60" stroke="#1a0e00" strokeWidth="2.5" strokeLinecap="round"/><line x1="54" y1="60" x2="63" y2="60" stroke="#1a0e00" strokeWidth="2.5" strokeLinecap="round"/></>
      ):(
        <>
          <ellipse cx="41" cy="60" rx="6.5" ry="7" fill="white"/>
          <ellipse cx="42.5" cy="60" rx="4.5" ry="5" fill="#1a0e00"/>
          <circle cx="44" cy="58" r="2" fill="white"/>
          <ellipse cx="59" cy="60" rx="6.5" ry="7" fill="white"/>
          <ellipse cx="60.5" cy="60" rx="4.5" ry="5" fill="#1a0e00"/>
          <circle cx="62" cy="58" r="2" fill="white"/>
          <path d="M33 53Q41 49 48 53" fill="none" stroke="#0d0d1a" strokeWidth="2" strokeLinecap="round"/>
          <path d="M52 53Q59 49 67 53" fill="none" stroke="#0d0d1a" strokeWidth="2" strokeLinecap="round"/>
        </>
      )}
      {/* Nose */}
      <ellipse cx="50" cy="68" rx="3" ry="2.2" fill="#D4976B"/>
      {/* Mouth */}
      {crashed?(<ellipse cx="50" cy="76" rx="5" ry="4" fill="none" stroke="#444" strokeWidth="1.8"/>):(<path d="M42 74Q50 82 58 74" fill="none" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>)}
      {/* Cheeks */}
      <circle cx="32" cy="69" r="5" fill="#FF8A80" opacity="0.2"/>
      <circle cx="68" cy="69" r="5" fill="#FF8A80" opacity="0.2"/>
      {/* Necklace */}
      <path d="M30 90Q50 102 70 90" fill="none" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round"/>
      {[38,44,50,56,62].map(cx=>(<circle key={cx} cx={cx} cy={cx===50?99:96} r={cx===50?3.5:2.2} fill={cx===50?"#FF6D00":"#FFD54F"}/>))}
      {/* Yellow cloth hint */}
      <path d="M28 88Q50 95 72 88L72 105Q50 112 28 105Z" fill="#FFC107" opacity="0.3" rx="4"/>
      {/* ═══ MUKUT ═══ */}
      <rect x="20" y="34" width="60" height="6" rx="3" fill="url(#cgt)"/>
      <path d="M22 34L22 22Q50 14 78 22L78 34Z" fill="url(#cmg)"/>
      <path d="M22 22Q50 14 78 22" fill="none" stroke="#FFD54F" strokeWidth="2.5"/>
      {/* Gold dots on crown */}
      {[29,37,45,53,61,69].map(cx=>(<g key={cx}><circle cx={cx} cy="28" r="2.5" fill="#FFD54F" opacity="0.85"/><circle cx={cx} cy="28" r="1.2" fill="#FFF176"/></g>))}
      {/* ═══ PEACOCK FEATHER ═══ */}
      <g transform="translate(50,12)">
        <line x1="-3" y1="0" x2="-5" y2="-26" stroke="#2E7D32" strokeWidth="0.8"/>
        <line x1="0" y1="0" x2="0" y2="-28" stroke="#1B5E20" strokeWidth="1.2"/>
        <line x1="3" y1="0" x2="5" y2="-26" stroke="#2E7D32" strokeWidth="0.8"/>
        {[-8,-5,-2,0,2,5,8].map((xo,i)=>(<path key={i} d={`M${xo} ${-14-i*0.8}Q${xo+1} ${-22-i} ${xo*1.3} ${-28}`} fill="none" stroke="#43A047" strokeWidth="1.5" opacity="0.75"/>))}
        <ellipse cx="0" cy="-16" rx="6" ry="7" fill="#0D47A1"/>
        <ellipse cx="0" cy="-16" rx="4" ry="5" fill="#00C853"/>
        <ellipse cx="0" cy="-16" rx="2.2" ry="3" fill="#0D47A1"/>
        <ellipse cx="0" cy="-16" rx="1" ry="1.5" fill="#FFD600"/>
      </g>
      {/* Crash FX */}
      {crashed&&(<><circle cx="32" cy="50" r="5" fill="none" stroke="#ffab40" strokeWidth="1.5" opacity="0.6"><animateTransform attributeName="transform" type="rotate" values="0 32 50;360 32 50" dur="0.5s" repeatCount="indefinite"/></circle><circle cx="68" cy="50" r="5" fill="none" stroke="#ffab40" strokeWidth="1.5" opacity="0.6"><animateTransform attributeName="transform" type="rotate" values="360 68 50;0 68 50" dur="0.5s" repeatCount="indefinite"/></circle></>)}
    </svg>
  );
}

/* ═══ CONSTANTS ═══ */
const CL=44;
const DR=[{dx:0,dy:-1},{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0}];
const DA=["▲","▶","▼","◀"];
const BD={
  forward:{label:"Forward",icon:"🚀",color:"#00e5ff"},
  left:{label:"Left",icon:"↩️",color:"#ff6ec7"},
  right:{label:"Right",icon:"↪️",color:"#ffab40"},
  loop2:{label:"Repeat 2×",icon:"🔁",color:"#b388ff",count:2,isLoop:true},
  loop3:{label:"Repeat 3×",icon:"🔁",color:"#ce93d8",count:3,isLoop:true},
  loopEnd:{label:"↩ End",icon:"",color:"#9575cd",isEnd:true},
  ifWall:{label:"If Wall",icon:"🧱",color:"#69f0ae"},
  ifClear:{label:"If Open",icon:"✨",color:"#66bb6a"},
  endIf:{label:"End If",icon:"⏹",color:"#4caf50"},
};

/* ═══ 24 VERIFIED LEVELS ═══ */
const LS=[
  // WORLD 1: SEQUENCES (1-6)
  {w:0,name:"Liftoff!",tip:"Tap Forward to fly straight! 💎",cols:7,rows:5,grid:[[1,1,1,1,1,1,1],[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1]],start:{x:1,y:2,dir:1},goal:{x:5,y:2},blocks:["forward"],par:4,max:8,hint:"Forward × 4!"},
  {w:0,name:"First Turn",tip:"Turn Right around the corner!",cols:6,rows:6,grid:[[1,1,1,1,1,1],[1,0,0,0,1,1],[1,1,1,0,1,1],[1,1,1,0,1,1],[1,1,1,0,1,1],[1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:3,y:4},blocks:["forward","left","right"],par:6,max:12,hint:"F,F,TR,F,F,F"},
  {w:0,name:"Zigzag",tip:"Mix turns through the zigzag!",cols:6,rows:5,grid:[[1,1,1,1,1,1],[1,0,0,0,1,1],[1,1,1,0,0,1],[1,1,1,1,0,1],[1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:4,y:3},blocks:["forward","left","right"],par:8,max:14,hint:"F,F,TR,F,TL,F,TR,F"},
  {w:0,name:"U-Turn",tip:"Go around the wall!",cols:5,rows:5,grid:[[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:1,y:3},blocks:["forward","left","right"],par:8,max:14,hint:"F,F,TR,F,F,TR,F,F"},
  {w:0,name:"Winding Cave",tip:"Left AND right turns!",cols:6,rows:6,grid:[[1,1,1,1,1,1],[1,0,0,0,1,1],[1,1,1,0,1,1],[1,1,1,0,0,1],[1,1,1,1,0,1],[1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:4,y:4},blocks:["forward","left","right"],par:9,max:16,hint:"F,F,TR,F,F,TL,F,TR,F"},
  {w:0,name:"T-Junction",tip:"Go to the center then down!",cols:7,rows:6,grid:[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,1,1,0,1,1,1],[1,1,1,0,1,1,1],[1,1,1,0,1,1,1],[1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:3,y:4},blocks:["forward","left","right"],par:6,max:12,hint:"F,F,TR,F,F,F"},
  // WORLD 2: LOOPS (7-12)
  {w:1,name:"Loop Lane",tip:"🔄 NEW: Loop blocks! Only 2 Forwards allowed — you MUST use Repeat!",cols:9,rows:5,grid:[[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1]],start:{x:1,y:2,dir:1},goal:{x:7,y:2},blocks:["forward","loop2","loop3","loopEnd"],par:4,max:8,hint:"Repeat 3× → Forward, Forward → End = does Forward 6 times in just 4 blocks!",tutorial:true,limits:{forward:2}},
  {w:1,name:"Stairway",tip:"Only 2 Forwards + 1 of each turn! Loop them! ⭐",cols:7,rows:7,grid:[[1,1,1,1,1,1,1],[1,0,0,1,1,1,1],[1,1,0,0,1,1,1],[1,1,1,0,0,1,1],[1,1,1,1,0,1,1],[1,1,1,1,1,1,1],[1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:4,y:4},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:7,max:12,hint:"Repeat 3× → Forward, Right, Forward, Left → End = 7 blocks!",limits:{forward:2,left:1,right:1}},
  {w:1,name:"Square Run",tip:"The path repeats — use loops for fewer blocks! 🔲",cols:6,rows:6,grid:[[1,1,1,1,1,1],[1,0,0,0,0,1],[1,0,1,1,0,1],[1,0,1,1,0,1],[1,0,0,0,0,1],[1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:1,y:4},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:9,max:14,hint:"Repeat 2× → Fwd,Fwd,Fwd,Right → End, then Fwd,Fwd,Fwd"},
  {w:1,name:"Mega Corridor",tip:"Only 1 Forward allowed! Put a loop INSIDE a loop! 🧠",cols:12,rows:5,grid:[[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1]],start:{x:1,y:2,dir:1},goal:{x:10,y:2},blocks:["forward","loop2","loop3","loopEnd"],par:5,max:8,hint:"Repeat 3× → Repeat 3× → Forward → End → End = 9 steps from 1 Forward!",limits:{forward:1}},
  {w:1,name:"Grand Staircase",tip:"Only 2 Forwards + 1 turn each! Nest loops! 🏔️",cols:9,rows:9,grid:[[1,1,1,1,1,1,1,1,1],[1,0,0,1,1,1,1,1,1],[1,1,0,0,1,1,1,1,1],[1,1,1,0,0,1,1,1,1],[1,1,1,1,0,0,1,1,1],[1,1,1,1,1,0,0,1,1],[1,1,1,1,1,1,0,0,1],[1,1,1,1,1,1,1,0,1],[1,1,1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:7,y:7},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:8,max:12,hint:"Repeat 2× → Repeat 3× → Fwd,Right,Fwd,Left → End → End",limits:{forward:2,left:1,right:1}},
  {w:1,name:"Long Corridor",tip:"Only 2 Forwards! Combine Repeat 2× and 3×!",cols:10,rows:5,grid:[[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1]],start:{x:1,y:2,dir:1},goal:{x:8,y:2},blocks:["forward","loop2","loop3","loopEnd"],par:6,max:10,hint:"Repeat 3× → Forward,Forward → End + Forward = 7 steps",limits:{forward:3}},
  // WORLD 3: COMPLEX (13-18)
  {w:2,name:"Z-Path",tip:"Navigate the Z shape!",cols:6,rows:5,grid:[[1,1,1,1,1,1],[1,0,0,0,0,1],[1,1,1,1,0,1],[1,0,0,0,0,1],[1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:1,y:3},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:8,max:16,hint:"F,F,F,TR,F,F,TR,F,F,F"},
  {w:2,name:"Hook Path",tip:"Go around the U-hook!",cols:7,rows:5,grid:[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:1,y:3},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:10,max:18,hint:"F×4,TR,F×2,TR,F×4"},
  {w:2,name:"Long Staircase",tip:"5 stair steps! Use nested loops!",cols:9,rows:8,grid:[[1,1,1,1,1,1,1,1,1],[1,0,0,1,1,1,1,1,1],[1,1,0,0,1,1,1,1,1],[1,1,1,0,0,1,1,1,1],[1,1,1,1,0,0,1,1,1],[1,1,1,1,1,0,0,1,1],[1,1,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:6,y:6},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:7,max:22,hint:"×2→(F,TR,F,TL)→End needs nesting!"},
  {w:2,name:"Spiral",tip:"Follow the clockwise spiral!",cols:7,rows:6,grid:[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,0,0,0,1],[1,0,0,0,1,1,1],[1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:3,y:3},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:10,max:18,hint:"F×4,TR,F×2,TR,F×2"},
  {w:2,name:"Wrap Around",tip:"Go around the big block!",cols:7,rows:6,grid:[[1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:1,y:4},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:10,max:18,hint:"F×4,TR,F×3,TR,F×4"},
  {w:2,name:"S-Curve",tip:"A big S! Find the pattern!",cols:7,rows:7,grid:[[1,1,1,1,1,1,1],[1,0,0,0,0,1,1],[1,1,1,1,0,1,1],[1,1,0,0,0,1,1],[1,1,0,1,1,1,1],[1,1,0,0,0,0,1],[1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:5,y:5},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:14,max:22,hint:"F,F,F,TR,F,F,TR,F,F,TL,F,F,TL,F,F,F"},
  // WORLD 4: MASTER (19-24)
  {w:3,name:"Maze Runner",tip:"A real maze! 🗺️",cols:7,rows:7,grid:[[1,1,1,1,1,1,1],[1,0,0,0,0,1,1],[1,0,1,1,0,1,1],[1,0,1,0,0,0,1],[1,0,1,0,1,0,1],[1,0,0,0,1,0,1],[1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:5,y:5},blocks:["forward","left","right","loop2","loop3","loopEnd","ifWall","endIf"],par:11,max:22,hint:"Right then zigzag down!"},
  {w:3,name:"Castle",tip:"Enter the castle walls!",cols:8,rows:7,grid:[[1,1,1,1,1,1,1,1],[1,0,0,0,0,1,1,1],[1,1,1,1,0,1,1,1],[1,1,1,1,0,0,0,1],[1,1,1,1,1,1,0,1],[1,1,1,1,1,1,0,1],[1,1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:6,y:5},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:12,max:20,hint:"F,F,F,TR,F,F,TL,F,F,TR,F,F"},
  {w:3,name:"Snake Loop",tip:"Find the hidden repeat! 🐍",cols:8,rows:7,grid:[[1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,1],[1,0,1,0,1,0,1,1],[1,0,1,0,0,0,1,1],[1,0,1,1,1,0,1,1],[1,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:6,y:5},blocks:["forward","left","right","loop2","loop3","loopEnd","ifWall","endIf"],par:9,max:24,hint:"×2→F,F,TR,F,F,TL→End,F"},
  {w:3,name:"Tower Climb",tip:"Climb the tower! 🗼",cols:6,rows:9,grid:[[1,1,1,1,1,1],[1,0,0,0,0,1],[1,0,1,1,0,1],[1,0,0,0,0,1],[1,0,1,1,0,1],[1,0,0,0,0,1],[1,0,1,1,0,1],[1,0,0,0,0,1],[1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:1,y:7},blocks:["forward","left","right","loop2","loop3","loopEnd"],par:10,max:20,hint:"F,F,F,TR,×3→F,F→End,TR,F,F,F"},
  {w:3,name:"Cross Grid",tip:"Navigate the intersections!",cols:9,rows:9,grid:[[1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,1,0,1],[1,0,1,1,0,1,1,0,1],[1,0,0,0,0,0,0,0,1],[1,0,1,1,0,1,1,0,1],[1,0,1,1,0,1,1,0,1],[1,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:7,y:7},blocks:["forward","left","right","loop2","loop3","loopEnd","ifWall","ifClear","endIf"],par:9,max:24,hint:"×2→×3,F,End,TR→End"},
  {w:3,name:"Final Mission",tip:"THE ULTIMATE TEST! 🏆",cols:8,rows:7,grid:[[1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,1],[1,0,1,0,1,0,1,1],[1,0,1,0,0,0,1,1],[1,0,1,1,1,0,1,1],[1,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1]],start:{x:1,y:1,dir:1},goal:{x:6,y:5},blocks:["forward","left","right","loop2","loop3","loopEnd","ifWall","ifClear","endIf"],par:9,max:26,hint:"×2→F,F,TR,F,F,TL→End,F"},
];

const WS=[
  {name:"Planet Alpha",emoji:"🌍",color:"#00e5ff",desc:"Learn Forward & Turns"},
  {name:"Nebula Loop",emoji:"🌀",color:"#b388ff",desc:"Master loop blocks"},
  {name:"Asteroid Belt",emoji:"☄️",color:"#ff6ec7",desc:"Complex paths & spirals"},
  {name:"Galaxy Core",emoji:"🏆",color:"#ffab40",desc:"Combine everything!"},
];

/* ═══ HELPERS ═══ */
const ok=(g,x,y,R,C)=>x>=0&&x<C&&y>=0&&y<R&&g[y][x]===0;
const wA=(g,r,R,C)=>{const d=DR[r.dir];return!ok(g,r.x+d.dx,r.y+d.dy,R,C)};
function expand(bs){const res=[];let i=0;while(i<bs.length){const b=bs[i],def=BD[b.type];if(def&&def.count){let dp=1,j=i+1;const body=[];while(j<bs.length&&dp>0){const jd=BD[bs[j].type];if(jd&&jd.count)dp++;if(bs[j].type==="loopEnd")dp--;if(dp>0)body.push(bs[j]);j++}for(let k=0;k<def.count;k++)res.push(...expand(body));i=j}else if(b.type==="loopEnd"){i++}else{res.push(b);i++}}return res}
const getSt=(bc,par)=>bc<=par?3:bc<=par+3?2:1;
let _id=0;const mkB=(t)=>({type:t,id:`b${++_id}`});

/* ═══ PARTICLES ═══ */
function Pts({x,y,type}){const[ps,setPs]=useState([]);useEffect(()=>{const n=type==="win"?18:7;const cs=type==="win"?["#ffab40","#ff6ec7","#00e5ff","#b388ff","#69f0ae"]:["#ff6e6e","#ff9800"];setPs(Array.from({length:n},(_,i)=>({id:i,x:0,y:0,vx:(Math.random()-0.5)*(type==="win"?6:3.5),vy:(Math.random()-0.5)*(type==="win"?6:3.5)-1.5,sz:Math.random()*4+2,c:cs[i%cs.length],l:1})));const iv=setInterval(()=>{setPs(pr=>{const nx=pr.map(q=>({...q,x:q.x+q.vx,y:q.y+q.vy,vy:q.vy+0.13,l:q.l-0.03})).filter(q=>q.l>0);if(!nx.length)clearInterval(iv);return nx})},28);return()=>clearInterval(iv)},[]);return(<>{ps.map(q=>(<div key={q.id} style={{position:"absolute",left:x+q.x,top:y+q.y,width:q.sz,height:q.sz,borderRadius:"50%",background:q.c,opacity:q.l,pointerEvents:"none",zIndex:50}}/>))}</>)}

/* ═══ MAIN ═══ */
export default function CodeMaze(){
  const[li,setLi]=useState(0);const[prog,setProg]=useState([]);const[bot,setBot]=useState(null);const[run2,setRun2]=useState(false);const[res,setRes]=useState(null);const[rTy,setRTy]=useState("");const[done,setDone]=useState({});const[vw,setVw]=useState("worlds");const[sW,setSW]=useState(0);const[hint,setHint]=useState(false);const[trail,setTrail]=useState([]);const[pts,setPts]=useState(null);const[drO,setDrO]=useState(false);const[stp,setStp]=useState(0);const[blk,setBlk]=useState(false);const[snd,setSnd]=useState(true);const[showTut,setShowTut]=useState(false);const[seenTut,setSeenTut]=useState({});
  const rr=useRef(false);const dtR=useRef(null);const lv=LS[li];const wo=WS[lv.w];

  useEffect(()=>{const iv=setInterval(()=>{if(!run2){setBlk(true);setTimeout(()=>setBlk(false),140)}},3200);return()=>clearInterval(iv)},[run2]);
  useEffect(()=>{setBot({...lv.start});setProg([]);setRes(null);setRTy("");setRun2(false);setTrail([]);setPts(null);setStp(0);setHint(false);rr.current=false;if(lv.tutorial&&!seenTut[li]){setTimeout(()=>setShowTut(true),300)}},[li]);
  const rst=useCallback(()=>{rr.current=false;setBot({...lv.start});setRes(null);setRTy("");setRun2(false);setTrail([]);setPts(null);setStp(0)},[lv]);
  const clr=()=>{rst();setProg([])};
  const sf=(fn)=>{if(snd)fn()};
  const blockCount=(t)=>prog.filter(b=>b.type===t).length;
  const blockAtLimit=(t)=>lv.limits&&lv.limits[t]!==undefined&&blockCount(t)>=lv.limits[t];
  const addB=(t)=>{if(run2||prog.length>=lv.max||blockAtLimit(t))return;sf(SFX.add);setProg(p=>[...p,mkB(t)]);setRes(null)};
  const remB=(id)=>{if(run2)return;sf(SFX.rem);setProg(p=>p.filter(b=>b.id!==id));setRes(null)};
  const movB=(id,d)=>{if(run2)return;sf(SFX.click);setProg(p=>{const i=p.findIndex(b=>b.id===id),n=i+d;if(n<0||n>=p.length)return p;const np=[...p];[np[i],np[n]]=[np[n],np[i]];return np})};

  const runProg=useCallback(async()=>{
    if(!prog.length)return;rst();setRun2(true);rr.current=true;sf(SFX.launch);await new Promise(r=>setTimeout(r,300));
    const ex=expand(prog);if(ex.length>200){setRes("crash");setRTy("inf");setRun2(false);rr.current=false;return}
    let r={...lv.start};const tr=[];let st=0;
    for(let i=0;i<ex.length&&rr.current;i++){const cmd=ex[i];
      if(cmd.type==="forward"){const d=DR[r.dir],nx=r.x+d.dx,ny=r.y+d.dy;if(!ok(lv.grid,nx,ny,lv.rows,lv.cols)){sf(SFX.crash);setPts({x:r.x*CL+CL/2,y:r.y*CL+CL/2,type:"crash"});setRes("crash");setRTy("wall");setRun2(false);rr.current=false;return}r={...r,x:nx,y:ny};st++;tr.push(`${nx},${ny}`);setBot({...r});setTrail([...tr]);setStp(st);sf(SFX.move)}
      else if(cmd.type==="left"){r={...r,dir:(r.dir+3)%4};setBot({...r});sf(SFX.turn)}
      else if(cmd.type==="right"){r={...r,dir:(r.dir+1)%4};setBot({...r});sf(SFX.turn)}
      else if(cmd.type==="ifWall"||cmd.type==="ifClear"){const c=cmd.type==="ifWall"?wA(lv.grid,r,lv.rows,lv.cols):!wA(lv.grid,r,lv.rows,lv.cols);sf(()=>SFX.cond(c));if(!c){let dp=1;while(i+1<ex.length&&dp>0){i++;if(ex[i].type==="ifWall"||ex[i].type==="ifClear")dp++;if(ex[i].type==="endIf")dp--}}await new Promise(x=>setTimeout(x,150));continue}
      else if(cmd.type==="endIf"){await new Promise(x=>setTimeout(x,40));continue}
      await new Promise(x=>setTimeout(x,250));
      if(r.x===lv.goal.x&&r.y===lv.goal.y){const s=getSt(prog.length,lv.par);sf(SFX.win);setTimeout(()=>{for(let si=0;si<s;si++)setTimeout(()=>sf(SFX.star),si*250)},400);setPts({x:r.x*CL+CL/2,y:r.y*CL+CL/2,type:"win"});setDone(pv=>({...pv,[li]:Math.max(pv[li]||0,s)}));setRes("win");setRun2(false);rr.current=false;return}
    }
    if(rr.current&&(r.x!==lv.goal.x||r.y!==lv.goal.y)){sf(SFX.crash);setRes("crash");setRTy("lost")}
    setRun2(false);rr.current=false;
  },[prog,li,lv,rst,snd]);

  const totS=Object.values(done).reduce((a,b)=>a+b,0);
  const wSt=(wi)=>LS.reduce((a,l,i)=>a+(l.w===wi?(done[i]||0):0),0);
  const wMx=(wi)=>LS.filter(l=>l.w===wi).length*3;
  const isCr=res==="crash"&&rTy==="wall";
  const bt=(bg,ds=false)=>({padding:"7px 16px",borderRadius:10,border:"none",background:ds?"#222":bg,color:ds?"#555":"#fff",fontSize:13,fontWeight:800,cursor:ds?"not-allowed":"pointer",boxShadow:ds?"none":`0 2px 10px ${bg}33`});
  const tB={background:"none",border:"none",color:"#778",cursor:"pointer",fontSize:9,padding:"0 2px",fontWeight:900};
  const wIdx=lv.w;const lvInW=LS.filter((l,i)=>l.w===wIdx&&i<=li).length;

  /* ═══ WORLD MAP ═══ */
  if(vw==="worlds"){return(
    <div style={rS}><style>{bC}</style><div style={sB}/>
      <div style={{...hS,justifyContent:"center"}}><div style={tSt}>🛸 CODE MAZE</div></div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:20,gap:14,position:"relative",zIndex:5}}>
        <div style={{width:64,height:72}}><Av size={64}/></div>
        <div style={{fontSize:16,fontWeight:900,color:"#e0e0ff"}}>Choose Your World</div>
        <div style={{fontSize:12,color:"#889"}}>⭐ {totS}/{LS.length*3}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:380,width:"100%"}}>
          {WS.map((w,i)=>(<button key={i} onClick={()=>{sf(SFX.click);setSW(i);setVw("levels")}} style={{padding:16,borderRadius:14,border:`2px solid ${w.color}44`,background:`${w.color}08`,color:"#e0e0ff",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:28,marginBottom:4}}>{w.emoji}</div>
            <div style={{fontSize:13,fontWeight:800,color:w.color}}>{w.name}</div>
            <div style={{fontSize:10,color:"#889",marginTop:3}}>{w.desc}</div>
            <div style={{fontSize:12,marginTop:5,color:"#ffab40"}}>⭐ {wSt(i)}/{wMx(i)}</div>
          </button>))}
        </div>
      </div>
    </div>
  )}

  /* ═══ LEVEL SELECT ═══ */
  if(vw==="levels"){const wL=LS.map((l,i)=>({...l,idx:i})).filter(l=>l.w===sW);const w=WS[sW];return(
    <div style={rS}><style>{bC}</style><div style={sB}/>
      <div style={hS}><button onClick={()=>setVw("worlds")} style={{...bt("#5c6bc0"),fontSize:11,padding:"5px 12px"}}>◀ Back</button><div style={{fontSize:14,fontWeight:800,color:w.color}}>{w.emoji} {w.name}</div></div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:14,gap:8,position:"relative",zIndex:5}}>
        <div style={{fontSize:12,color:"#889"}}>⭐ {wSt(sW)}/{wMx(sW)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:7,maxWidth:380,width:"100%"}}>
          {wL.map((l,i)=>(<button key={l.idx} onClick={()=>{sf(SFX.click);setLi(l.idx);setVw("game")}} style={{padding:"12px 14px",borderRadius:12,border:`1px solid ${w.color}30`,background:"rgba(0,0,0,0.18)",color:"#e0e0ff",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${w.color}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:w.color}}>{i+1}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>{l.name}</div><div style={{fontSize:10,color:"#667",marginTop:2}}>Par: {l.par}</div></div>
            <div style={{fontSize:15}}>{done[l.idx]?"⭐".repeat(done[l.idx])+"☆".repeat(3-done[l.idx]):"○○○"}</div>
          </button>))}
        </div>
      </div>
    </div>
  )}

  /* ═══ GAME ═══ */
  return(
    <div style={rS}><style>{bC}</style><div style={sB}/>
      <div style={hS}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <button onClick={()=>{sf(SFX.click);setVw("worlds")}} style={{...bt("#5c6bc0"),fontSize:10,padding:"3px 9px"}}>🗺️</button>
          <div style={{width:28,height:32}}><Av size={28}/></div>
          <div style={{fontSize:14,fontWeight:900,background:`linear-gradient(90deg,${wo.color},#ff6ec7)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>CODE MAZE</div>
          <div style={{fontSize:10,color:"#ffab40",fontWeight:700}}>⭐{totS}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <button onClick={()=>setSnd(s=>!s)} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"2px 6px",fontSize:12,cursor:"pointer",color:snd?"#69f0ae":"#555"}}>{snd?"🔊":"🔇"}</button>
          <span style={{background:`${wo.color}12`,border:`1px solid ${wo.color}30`,borderRadius:9,padding:"2px 7px",fontSize:9,fontWeight:800,color:wo.color}}>{wo.emoji}W{lv.w+1}</span>
          <button onClick={()=>{sf(SFX.click);setVw("levels");setSW(lv.w)}} style={{background:"rgba(100,140,255,0.08)",border:"1px solid rgba(100,140,255,0.15)",borderRadius:12,padding:"2px 9px",fontSize:11,fontWeight:700,color:"#b388ff",cursor:"pointer"}}>L{lvInW}: {lv.name}</button>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"7px 6px",gap:6,position:"relative",zIndex:5}}>
        <div style={{fontSize:12,color:"#889",textAlign:"center",maxWidth:440}}>{lv.tip}</div>
        <div style={{background:"rgba(0,0,0,0.28)",borderRadius:11,padding:7,border:"1px solid rgba(100,140,255,0.07)",display:"inline-block"}}>
          <div style={{position:"relative",width:lv.cols*CL,height:lv.rows*CL,overflow:"visible"}}>
            {Array.from({length:lv.rows*lv.cols},(_,idx)=>{const x=idx%lv.cols,y=Math.floor(idx/lv.cols);const w=lv.grid[y][x]===1,isG=x===lv.goal.x&&y===lv.goal.y,isT=trail.includes(`${x},${y}`);return(<div key={idx} style={{position:"absolute",left:x*CL,top:y*CL,width:CL,height:CL,background:w?"linear-gradient(145deg,#0e0b24,#14112c)":isT?`${wo.color}07`:"rgba(25,32,70,0.45)",borderRadius:w?2:4,border:w?"1px solid rgba(28,23,50,0.8)":"1px solid rgba(80,100,200,0.08)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:w?"inset 0 2px 5px rgba(0,0,0,0.5)":"none"}}>{w&&<span style={{opacity:0.05,fontSize:8}}>◼</span>}{isG&&!w&&<span style={{fontSize:17,filter:"drop-shadow(0 0 5px #ff6ec7)",animation:"float 2s ease-in-out infinite"}}>💎</span>}{isT&&!isG&&<div style={{width:3,height:3,borderRadius:"50%",background:`${wo.color}38`}}/>}</div>)})}
            {bot&&(<div style={{position:"absolute",left:bot.x*CL,top:bot.y*CL-6,width:CL,height:CL+8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"left 0.2s cubic-bezier(.4,0,.2,1),top 0.2s cubic-bezier(.4,0,.2,1)",zIndex:10}}>
              <Av size={CL-4} crashed={isCr} blink={blk&&!run2}/>
              <div style={{fontSize:8,marginTop:-4,color:`${wo.color}77`,fontWeight:900}}>{DA[bot.dir]}</div>
            </div>)}
            {pts&&<Pts x={pts.x} y={pts.y} type={pts.type}/>}
          </div>
        </div>
        {run2&&<div style={{fontSize:10,color:"#667",fontWeight:600}}>Steps: {stp}</div>}
        <div style={{width:"100%",maxWidth:500,display:"flex",flexDirection:"column",gap:5}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,fontWeight:800,color:"#99a"}}>🧩 BLOCKS</span><span style={{fontSize:10,color:"#556"}}>{prog.length}/{lv.max}</span></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
            {lv.blocks.map(t=>{const bd=BD[t];const atLim=blockAtLimit(t);const hasLim=lv.limits&&lv.limits[t]!==undefined;const remaining=hasLim?lv.limits[t]-blockCount(t):null;return(<div key={t} draggable={!run2&&!atLim} onDragStart={e=>{if(atLim)return;dtR.current=t;e.dataTransfer.effectAllowed="copy"}} onClick={()=>addB(t)} style={{display:"flex",alignItems:"center",gap:3,padding:"4px 8px",borderRadius:6,background:atLim?"rgba(60,60,60,0.3)":`${bd.color}14`,border:`1.5px solid ${atLim?"#333":bd.color+"38"}`,color:atLim?"#555":bd.color,fontSize:11,fontWeight:700,cursor:run2||atLim?"not-allowed":"pointer",userSelect:"none",opacity:run2?0.4:atLim?0.35:1,position:"relative"}}><span style={{fontSize:12}}>{bd.icon}</span><span>{bd.label}</span>{hasLim&&(<span style={{fontSize:9,marginLeft:2,padding:"0 4px",borderRadius:4,background:atLim?"rgba(255,50,50,0.2)":"rgba(255,255,255,0.08)",color:atLim?"#f55":"#aab"}}>{remaining}left</span>)}</div>)})}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
            <span style={{fontSize:11,fontWeight:800,color:"#99a"}}>📋 PROGRAM</span>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:10,color:"#556"}}>Par {lv.par}=⭐⭐⭐</span><button onClick={()=>{sf(SFX.click);setHint(h=>!h)}} style={{background:"none",border:"1px solid rgba(255,171,64,0.22)",borderRadius:5,color:"#ffab40",fontSize:10,padding:"1px 6px",cursor:"pointer",fontWeight:700}}>💡</button></div>
          </div>
          {hint&&<div style={{background:"rgba(255,171,64,0.06)",border:"1px solid rgba(255,171,64,0.15)",borderRadius:6,padding:"4px 8px",fontSize:11,color:"#ffab40"}}>💡 {lv.hint}</div>}
          <div onDragOver={e=>{e.preventDefault();setDrO(true)}} onDragLeave={()=>setDrO(false)} onDrop={e=>{e.preventDefault();if(dtR.current){addB(dtR.current);dtR.current=null}setDrO(false)}} style={{minHeight:42,padding:4,background:drO?"rgba(0,229,255,0.04)":"rgba(0,0,0,0.13)",border:`2px dashed ${drO?"#00e5ff":"rgba(100,140,255,0.1)"}`,borderRadius:8,display:"flex",flexWrap:"wrap",gap:3,alignContent:"flex-start"}}>
            {!prog.length&&<div style={{width:"100%",textAlign:"center",color:"#445",fontSize:11,padding:"5px 0"}}>{run2?"⏳...":"👆 Tap blocks or drag here"}</div>}
            {(()=>{let depth=0;return prog.map((b,i)=>{const bd=BD[b.type];if(bd.isEnd)depth=Math.max(0,depth-1);const myDepth=depth;if(bd.isLoop)depth++;const indent=myDepth*12;const isLoopBlock=bd.isLoop||bd.isEnd;return(<div key={b.id} style={{display:"flex",alignItems:"center",gap:2,padding:"2px 5px",borderRadius:5,background:isLoopBlock?`${bd.color}18`:`${bd.color}10`,border:`1.5px solid ${bd.color}${isLoopBlock?"55":"30"}`,color:bd.color,fontSize:10,fontWeight:700,marginLeft:indent,borderLeft:myDepth>0&&!isLoopBlock?`3px solid #b388ff44`:"none",paddingLeft:myDepth>0&&!isLoopBlock?6:5}}><span style={{fontSize:10}}>{bd.icon}</span><span>{bd.label}</span>{!run2&&<div style={{display:"flex",gap:1,marginLeft:2}}>{i>0&&<button onClick={()=>movB(b.id,-1)} style={tB}>◀</button>}{i<prog.length-1&&<button onClick={()=>movB(b.id,1)} style={tB}>▶</button>}<button onClick={()=>remB(b.id)} style={{...tB,color:"#f55"}}>✕</button></div>}</div>)})})()}
          </div>
          <div style={{display:"flex",gap:5,justifyContent:"center",marginTop:2}}>
            <button onClick={runProg} disabled={run2||!prog.length} style={bt(run2||!prog.length?"#333":"#00c853",run2||!prog.length)}>{run2?"⏳...":"▶ LAUNCH!"}</button>
            <button onClick={()=>{sf(SFX.click);rst()}} disabled={run2} style={bt(run2?"#333":"#5c6bc0",run2)}>🔄</button>
            <button onClick={()=>{sf(SFX.click);clr()}} disabled={run2} style={bt(run2?"#333":"#e53935",run2)}>🗑</button>
          </div>
        </div>
      </div>
      {res&&(()=>{const isW=res==="win",st=isW?getSt(prog.length,lv.par):0;const msg=isW?["🌟 Perfect!","⭐ Great!","✨ You made it!"][3-st]||"✨ Nice!":rTy==="wall"?"Hit a wall!":rTy==="inf"?"Too many steps!":"Didn't reach the crystal!";return(
        <div style={oS} onClick={()=>{if(!isW)setRes(null)}}>
          <div style={mS} onClick={e=>e.stopPropagation()}>
            <div style={{margin:"0 auto 5px",width:56,height:64}}><Av size={56} crashed={!isW}/></div>
            <div style={{fontSize:17,fontWeight:900,marginBottom:4,color:isW?"#69f0ae":"#ff6e6e"}}>{isW?"Level Complete!":"Try Again!"}</div>
            {isW&&<div style={{fontSize:28,marginBottom:4}}>{"⭐".repeat(st)}{"☆".repeat(3-st)}</div>}
            <div style={{fontSize:12,color:"#99a",marginBottom:3}}>{msg}</div>
            <div style={{fontSize:11,color:"#667",marginBottom:10}}>{isW?`${prog.length} blocks (par: ${lv.par})`:`Steps: ${stp}`}</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>{sf(SFX.click);setRes(null);rst()}} style={bt("#5c6bc0")}>{isW?"🔄 Retry":"🔧 Retry"}</button>
              {isW&&li<LS.length-1&&<button onClick={()=>{sf(SFX.lvl);setRes(null);setLi(l=>l+1)}} style={bt("#00c853")}>Next ➡️</button>}
              {isW&&li===LS.length-1&&<div style={{fontSize:13,color:"#ffab40",fontWeight:800,padding:6}}>🏆 CHAMPION!</div>}
              {isW&&<button onClick={()=>{sf(SFX.click);setRes(null);setVw("worlds")}} style={bt("#7c4dff")}>🗺️</button>}
            </div>
          </div>
        </div>
      )})()}
      {/* TUTORIAL MODAL */}
      {showTut && (
        <div style={oS} onClick={() => {setShowTut(false);setSeenTut(p => ({...p,[li]:true}))}}>
          <div style={{...mS,maxWidth:360,padding:22,textAlign:"left"}} onClick={e => e.stopPropagation()}>
            <div style={{textAlign:"center",fontSize:20,fontWeight:900,marginBottom:10,color:"#b388ff"}}>🔁 New: Loop Blocks!</div>
            <div style={{fontSize:13,color:"#ccd",lineHeight:1.5,marginBottom:12}}>
              Loops repeat commands automatically! Put any commands <b style={{color:"#b388ff"}}>between</b> a Repeat block and an End block.
            </div>
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:10,padding:10,marginBottom:12}}>
              <div style={{fontSize:11,color:"#889",marginBottom:6}}>Example: Instead of 6 Forwards...</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                {["🚀","🚀","🚀","🚀","🚀","🚀"].map((e,i) => (
                  <span key={i} style={{background:"rgba(0,229,255,0.12)",border:"1px solid rgba(0,229,255,0.3)",borderRadius:5,padding:"2px 6px",fontSize:11,color:"#00e5ff"}}>{e}Fwd</span>
                ))}
              </div>
              <div style={{fontSize:11,color:"#889",marginBottom:6}}>Use just 4 blocks:</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{background:"rgba(179,136,255,0.18)",border:"1.5px solid rgba(179,136,255,0.5)",borderRadius:5,padding:"2px 6px",fontSize:11,color:"#b388ff",fontWeight:700}}>🔁 Repeat 3×</span>
                <div style={{borderLeft:"3px solid #b388ff44",paddingLeft:4,display:"flex",gap:4}}>
                  <span style={{background:"rgba(0,229,255,0.12)",border:"1px solid rgba(0,229,255,0.3)",borderRadius:5,padding:"2px 6px",fontSize:11,color:"#00e5ff"}}>🚀Fwd</span>
                  <span style={{background:"rgba(0,229,255,0.12)",border:"1px solid rgba(0,229,255,0.3)",borderRadius:5,padding:"2px 6px",fontSize:11,color:"#00e5ff"}}>🚀Fwd</span>
                </div>
                <span style={{background:"rgba(149,117,205,0.18)",border:"1.5px solid rgba(149,117,205,0.5)",borderRadius:5,padding:"2px 6px",fontSize:11,color:"#9575cd",fontWeight:700}}>↩ End</span>
              </div>
              <div style={{fontSize:11,color:"#69f0ae",marginTop:6,fontWeight:700}}>= Forward Forward Forward Forward Forward Forward</div>
            </div>
            <div style={{textAlign:"center"}}>
              <button onClick={() => {setShowTut(false);setSeenTut(p => ({...p,[li]:true}))}} style={bt("#b388ff")}>Got it! Let's go! 🚀</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const rS={minHeight:"100vh",background:"linear-gradient(145deg,#080c20,#14103a 40%,#0c1832)",color:"#e0e0ff",fontFamily:"'Nunito','Segoe UI',system-ui,sans-serif",position:"relative",overflow:"hidden"};
const sB={position:"absolute",inset:0,pointerEvents:"none",opacity:0.45,background:"radial-gradient(1px 1px at 15% 20%,#fff .5px,transparent 1px),radial-gradient(1.5px 1.5px at 45% 65%,#aaf .5px,transparent 1px),radial-gradient(1px 1px at 75% 15%,#fff .5px,transparent 1px),radial-gradient(1px 1px at 88% 55%,#ccf .5px,transparent 1px),radial-gradient(1.2px 1.2px at 30% 80%,#fff .5px,transparent 1px)"};
const hS={display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",background:"rgba(0,0,0,0.28)",borderBottom:"1px solid rgba(100,140,255,0.07)",position:"relative",zIndex:10,flexWrap:"wrap",gap:5};
const tSt={fontSize:20,fontWeight:900,letterSpacing:1.5,background:"linear-gradient(90deg,#FFD54F,#ff6ec7,#00e5ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"};
const oS={position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(3px)"};
const mS={background:"linear-gradient(145deg,#1a1040,#0d1b3e)",border:"1px solid rgba(100,140,255,0.1)",borderRadius:15,padding:18,maxWidth:310,width:"92%",textAlign:"center",boxShadow:"0 12px 36px rgba(0,0,0,0.5)"};
const bC=`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}*{box-sizing:border-box;margin:0;padding:0}button:active{transform:scale(0.95)}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(100,140,255,0.15);border-radius:3px}`;
