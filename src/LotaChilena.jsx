import { useState, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   LOTA CHILENA 🎱 — Chilean Family Bingo
   Full-featured prototype — architecture ready for Supabase
═══════════════════════════════════════════════════════════════ */

// ────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────
const CARTONES = [
  {id:1,rows:[[4,0,21,0,44,56,0,72,0],[0,12,0,33,0,58,64,0,85],[8,0,27,39,49,0,0,78,0]]},
  {id:2,rows:[[2,11,0,31,0,0,62,70,0],[0,15,23,0,45,51,0,0,82],[7,0,0,36,0,55,69,75,0]]},
  {id:3,rows:[[5,0,22,0,41,0,60,0,88],[0,18,26,34,0,52,0,77,0],[9,13,0,0,47,59,66,0,0]]},
  {id:4,rows:[[1,0,20,30,0,50,0,71,0],[0,14,0,35,42,0,65,0,81],[6,17,28,0,0,54,0,79,0]]},
  {id:5,rows:[[3,10,0,0,40,53,61,0,0],[0,16,24,32,0,0,0,73,89],[0,19,29,38,46,0,67,0,0]]},
  {id:6,rows:[[4,0,22,0,48,55,0,76,0],[0,12,0,34,0,51,63,0,84],[9,15,26,0,40,0,0,70,0]]},
  {id:7,rows:[[2,11,0,37,43,0,68,0,0],[0,18,25,0,0,57,0,74,90],[5,0,0,31,46,52,60,0,0]]},
  {id:8,rows:[[8,0,21,35,0,50,0,72,0],[0,13,0,0,44,59,66,79,0],[1,16,29,39,0,0,0,0,82]]},
  {id:9,rows:[[6,10,0,30,45,0,61,0,0],[0,19,24,0,0,54,0,75,87],[3,0,28,38,49,58,0,0,0]]},
  {id:10,rows:[[7,0,23,0,41,0,65,78,0],[0,14,0,33,47,53,0,0,81],[5,17,27,36,0,0,69,0,0]]},
  {id:11,rows:[[1,0,20,32,0,56,62,0,0],[0,15,25,34,48,0,0,71,0],[9,0,0,0,42,55,67,77,0]]},
  {id:12,rows:[[3,11,24,0,44,0,0,73,0],[0,12,0,38,0,50,60,0,86],[8,0,21,0,49,57,0,79,0]]},
  {id:13,rows:[[5,18,0,35,40,0,64,0,0],[0,0,29,0,43,58,0,76,88],[4,16,22,31,0,0,61,0,0]]},
  {id:14,rows:[[2,0,28,0,46,52,0,70,0],[0,14,0,39,0,54,69,0,83],[7,10,26,33,41,0,0,0,0]]},
  {id:15,rows:[[9,13,0,30,0,51,63,0,0],[0,17,23,0,45,0,0,74,85],[6,0,27,37,42,0,68,0,0]]},
  {id:16,rows:[[4,15,20,0,47,0,60,0,0],[0,0,25,34,0,59,66,72,0],[1,19,0,0,49,53,0,0,89]]},
  {id:17,rows:[[8,0,21,32,0,55,0,75,0],[0,11,29,0,44,0,61,0,82],[3,16,0,36,40,0,67,0,0]]},
  {id:18,rows:[[5,12,0,0,48,50,65,0,0],[0,18,22,38,0,57,0,77,0],[9,0,24,33,43,0,0,0,90]]},
  {id:19,rows:[[2,0,27,31,41,0,62,0,0],[0,14,26,0,0,56,0,73,84],[7,10,0,35,45,52,0,0,0]]},
  {id:20,rows:[[6,17,23,0,0,54,0,79,0],[0,0,0,39,42,58,69,0,88],[4,13,28,30,46,0,0,0,0]]},
  {id:21,rows:[[1,0,25,37,49,0,64,0,0],[0,15,0,0,40,51,63,76,0],[8,11,20,34,0,59,0,0,0]]},
  {id:22,rows:[[3,16,0,32,0,53,0,71,0],[0,19,22,0,47,0,68,0,83],[5,0,29,36,44,55,0,0,0]]},
  {id:23,rows:[[9,12,21,33,0,57,0,0,0],[0,0,27,0,43,0,60,78,86],[2,18,0,38,48,50,0,0,0]]},
  {id:24,rows:[[4,0,24,0,42,52,67,0,0],[0,14,0,31,45,0,0,74,81],[7,10,26,35,0,56,0,0,0]]},
  {id:25,rows:[[6,17,0,39,0,54,66,70,0],[0,13,28,0,41,0,62,0,85],[1,0,23,30,46,58,0,0,0]]},
  {id:26,rows:[[8,15,25,34,0,51,0,0,0],[0,0,0,37,49,0,65,72,89],[5,11,20,0,44,59,0,0,0]]},
  {id:27,rows:[[3,0,22,36,47,0,61,0,0],[0,19,0,0,40,53,0,75,82],[9,16,29,32,0,55,69,0,0]]},
  {id:28,rows:[[2,12,21,33,43,0,0,0,0],[0,18,0,38,0,50,63,77,0],[7,0,27,0,48,57,0,0,87]]},
  {id:29,rows:[[4,14,0,31,0,52,60,0,0],[0,0,26,35,45,56,0,73,0],[1,10,24,0,42,0,0,0,84]]},
  {id:30,rows:[[6,0,28,30,46,0,67,0,0],[0,17,23,39,0,54,0,79,0],[8,13,0,0,41,58,62,0,0]]},
  {id:31,rows:[[5,15,20,37,49,0,0,0,0],[0,11,25,0,0,51,64,76,0],[3,0,0,34,44,59,0,0,81]]},
  {id:32,rows:[[9,19,29,0,47,53,0,0,0],[0,16,0,32,0,55,68,71,0],[7,0,22,36,40,0,61,0,0]]},
  {id:33,rows:[[2,18,27,38,48,0,0,0,0],[0,12,0,33,0,50,65,78,0],[4,0,21,0,43,57,0,0,90]]},
  {id:34,rows:[[6,10,24,35,0,56,0,0,0],[0,14,0,31,45,0,66,74,0],[1,0,26,0,42,52,60,0,0]]},
  {id:35,rows:[[8,13,23,39,46,0,0,0,0],[0,17,0,30,0,54,62,70,0],[3,0,28,0,41,58,67,0,0]]},
  {id:36,rows:[[5,11,25,34,0,59,0,0,0],[0,15,0,37,49,0,63,72,0],[9,0,20,0,44,51,0,76,0]]},
  {id:37,rows:[[7,16,22,32,47,0,0,0,0],[0,19,0,36,0,53,61,75,0],[2,0,29,0,40,55,69,0,0]]},
  {id:38,rows:[[4,12,21,33,43,0,0,0,0],[0,18,0,38,48,57,65,0,0],[8,0,27,0,0,50,0,73,85]]},
  {id:39,rows:[[1,14,26,31,0,52,0,0,0],[0,10,24,0,45,56,68,0,0],[6,0,0,35,42,0,60,77,0]]},
  {id:40,rows:[[9,17,23,30,46,0,0,0,0],[0,13,28,0,0,58,62,79,0],[3,0,0,39,41,54,67,0,0]]},
  {id:41,rows:[[5,15,20,34,44,0,0,0,0],[0,11,25,37,0,51,64,0,0],[7,0,0,0,49,59,63,71,86]]},
  {id:42,rows:[[2,19,29,36,40,0,0,0,0],[0,16,22,0,47,53,61,0,0],[4,0,0,32,0,55,69,75,82]]},
  {id:43,rows:[[8,12,27,33,48,0,0,0,0],[0,18,21,38,0,50,65,0,0],[1,0,0,0,43,57,60,78,88]]},
  {id:44,rows:[[6,14,24,31,42,0,0,0,0],[0,10,26,35,0,52,66,0,0],[9,0,0,0,45,56,62,73,83]]},
  {id:45,rows:[[3,17,23,30,41,0,0,0,0],[0,13,28,39,0,54,67,0,0],[5,0,0,0,46,58,60,70,89]]},
  {id:46,rows:[[7,15,25,37,49,0,0,0,0],[0,11,20,34,0,59,63,0,0],[2,0,0,0,44,51,65,76,81]]},
  {id:47,rows:[[4,19,29,32,47,0,0,0,0],[0,16,22,36,0,53,68,0,0],[8,0,0,0,40,55,61,72,85]]},
  {id:48,rows:[[1,18,21,38,43,0,0,0,0],[0,12,27,33,0,57,60,0,0],[6,0,0,0,48,50,69,77,87]]},
  {id:49,rows:[[9,14,26,35,45,0,0,0,0],[0,10,24,31,0,56,66,0,0],[3,0,0,0,42,52,62,74,90]]},
  {id:50,rows:[[5,17,28,30,46,0,0,0,0],[0,13,23,39,0,58,67,0,0],[7,0,0,0,41,54,60,79,84]]},
];

const SKINS = [
  {id:'dot',   label:'Clásico'},
  {id:'bean',  label:'🫘'},
  {id:'star',  label:'⭐'},
  {id:'coin',  label:'🪙'},
  {id:'x',     label:'✕'},
  {id:'heart', label:'❤️'},
];

const DEMO_PLAYERS = [
  {id:'d1',name:'Caqui',   cartonIdx:1,  skin:'dot'},
  {id:'d2',name:'Karen',   cartonIdx:2,  skin:'bean'},
  {id:'d3',name:'Nana',    cartonIdx:5,  skin:'dot'},
  {id:'d4',name:'Mario P.',cartonIdx:8,  skin:'star'},
  {id:'d5',name:'Marito',  cartonIdx:11, skin:'dot'},
];

const COL_RANGES = ['1-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80-90'];

const INIT_SETTINGS = {apuesta:1000,ternaPct:10,lineaPct:25,lotaPct:65,currency:'CLP'};
const INIT_GAME = {
  status:'idle',
  calledNumbers:[],
  lastDrawn:null,
  prizes:{terna:null,linea:null,lota:null},
  requests:[],
  log:[],
};

// ────────────────────────────────────────────────────────────
// UTILS
// ────────────────────────────────────────────────────────────
const genCode = () => {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6}, () => c[Math.floor(Math.random()*c.length)]).join('');
};

const rowNums = r => r.filter(n => n > 0);
const allNums = c => c.rows.flatMap(rowNums);

// Can the player REQUEST this type? (only checks their own marks, not whether they're called)
const canReq = (type, carton, marked) => {
  const m = new Set(marked);
  if (type === 'terna') return carton.rows.some(r => rowNums(r).filter(n => m.has(n)).length >= 3);
  if (type === 'linea') return carton.rows.some(r => { const rn = rowNums(r); return rn.length > 0 && rn.every(n => m.has(n)); });
  if (type === 'lota')  { const a = allNums(carton); return a.length > 0 && a.every(n => m.has(n)); }
  return false;
};

// MC validation: marks must ALSO be in called numbers
const isValid = (type, carton, marked, called) => {
  const ok = new Set(marked.filter(n => called.includes(n)));
  if (type === 'terna') return carton.rows.some(r => rowNums(r).filter(n => ok.has(n)).length >= 3);
  if (type === 'linea') return carton.rows.some(r => { const rn = rowNums(r); return rn.length > 0 && rn.every(n => ok.has(n)); });
  if (type === 'lota')  { const a = allNums(carton); return a.length > 0 && a.every(n => ok.has(n)); }
  return false;
};

const calcPot   = (cnt, ap)  => cnt * ap;
const calcPrize = (p, pct)   => Math.floor(p * pct / 100);
const fmtClp    = n          => `$${n.toLocaleString('es-CL')}`;
const tstamp    = ()         => new Date().toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});

const playTone = type => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const note = (f, s, d, shape = 'sine') => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = shape; o.frequency.value = f;
      g.gain.setValueAtTime(0.22, ctx.currentTime + s);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + s + d);
      o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + d);
    };
    if (type === 'draw')    { note(440,0,.05); note(660,.06,.18); }
    if (type === 'win')     { [[523,0],[659,.12],[784,.24],[1047,.36],[1319,.5]].forEach(([f,s]) => note(f,s,.4)); }
    if (type === 'invalid') { note(220,0,.2,'sawtooth'); note(165,.22,.35,'sawtooth'); }
    if (type === 'request') { note(880,0,.12); note(1108,.13,.18); }
  } catch(e) {}
};

// ────────────────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lobster&family=Nunito:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:#140903}
::-webkit-scrollbar-thumb{background:#C94B28;border-radius:3px}

/* ── APP ── */
.la{min-height:100vh;background:#120804;color:#FFF3E0;font-family:'Nunito',sans-serif}
.logo-txt{font-family:'Lobster',cursive;color:#E8B84B;text-shadow:0 0 40px rgba(232,184,75,.45),0 4px 20px rgba(0,0,0,.7);line-height:1}

/* ── LANDING ── */
.landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;gap:36px}
.hero{text-align:center}
.hero .logo-txt{font-size:clamp(4.5rem,11vw,8rem)}
.tagline{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.25em;color:#9E7855;margin-top:.6rem}
.cards-wrap{display:flex;gap:18px;width:100%;max-width:580px;flex-wrap:wrap;justify-content:center}
.lc{background:#1C0E07;border:1px solid rgba(212,82,42,.2);border-radius:22px;padding:28px;flex:1;min-width:240px;display:flex;flex-direction:column;gap:14px;transition:border-color .25s,transform .2s}
.lc:hover{border-color:rgba(212,82,42,.5);transform:translateY(-3px)}
.lc-icon{font-size:2.2rem;text-align:center}
.lc h2{font-size:1.2rem;font-weight:900;text-align:center}
.lc p{font-size:.8rem;color:#9E7855;text-align:center;line-height:1.5}
.or-div{display:flex;align-items:center;gap:12px;color:#7A5438;font-weight:900;font-size:.7rem;letter-spacing:.12em;width:100%;max-width:580px}
.or-div::before,.or-div::after{content:'';flex:1;height:1px;background:rgba(212,82,42,.2)}

/* ── INPUTS ── */
.fld{display:flex;flex-direction:column;gap:5px}
.lbl{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#B08868}
.inp{background:rgba(255,255,255,.055);border:1px solid rgba(212,82,42,.22);border-radius:10px;padding:11px 14px;color:#FFF3E0;font-size:1rem;font-family:'Nunito',sans-serif;width:100%;outline:none;transition:border-color .2s}
.inp:focus{border-color:#C94B28}
.inp::placeholder{color:#7A5040}
.inp-code{letter-spacing:.35em;text-transform:uppercase;font-weight:800;font-size:1.15rem;text-align:center}
.inp-num{-moz-appearance:textfield}
.inp-num::-webkit-outer-spin-button,.inp-num::-webkit-inner-spin-button{-webkit-appearance:none}

/* ── BUTTONS ── */
.btn{padding:11px 22px;border-radius:10px;border:none;font-family:'Nunito',sans-serif;font-weight:800;cursor:pointer;transition:all .18s;font-size:.93rem;display:inline-flex;align-items:center;justify-content:center;gap:6px;letter-spacing:.02em}
.btn:disabled{opacity:.55;cursor:not-allowed!important;transform:none!important;pointer-events:none}
.btn-gold{background:#E8B84B;color:#2C1810}
.btn-gold:hover{background:#F5CC70;transform:translateY(-1px)}
.btn-red{background:#C94B28;color:#fff}
.btn-red:hover{background:#E05C38;transform:translateY(-1px)}
.btn-ghost{background:transparent;color:#BFA080;border:1px solid rgba(212,82,42,.28)}
.btn-ghost:hover{border-color:#C94B28;color:#C94B28}
.btn-green{background:#27AE60;color:#fff}
.btn-green:hover{background:#2ECC71;transform:translateY(-1px)}
.btn-danger{background:#C0392B;color:#fff}
.btn-danger:hover{background:#E74C3C}
.btn-xl{padding:16px 34px;font-size:1.05rem;border-radius:14px;letter-spacing:.04em}
.btn-sm{padding:6px 13px;font-size:.78rem;border-radius:7px}
.btn-block{width:100%}
.btn-draw{flex:1;padding:16px;background:linear-gradient(140deg,#C94B28,#A0331A);color:#fff;border:none;border-radius:12px;font-family:'Nunito',sans-serif;font-weight:900;font-size:1rem;cursor:pointer;text-transform:uppercase;letter-spacing:.07em;transition:all .18s;box-shadow:0 4px 18px rgba(201,75,40,.4)}
.btn-draw:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(201,75,40,.5)}
.btn-draw:active{transform:translateY(0)}
.btn-draw:disabled{opacity:.4;cursor:not-allowed;transform:none!important;box-shadow:none}

/* ── LOBBY ── */
.lobby{min-height:100vh;padding:20px;display:flex;flex-direction:column;align-items:center;gap:18px}
.lobby-hdr{width:100%;max-width:980px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.code-pill{background:#1C0E07;border:1px solid rgba(212,82,42,.28);border-radius:100px;padding:7px 18px;display:flex;align-items:center;gap:12px}
.code-val{font-family:'Courier New',monospace;font-size:1.3rem;font-weight:900;color:#E8B84B;letter-spacing:.22em}
.code-lbl{font-size:.62rem;text-transform:uppercase;letter-spacing:.1em;color:#C8A878}
.lobby-body{display:flex;gap:18px;width:100%;max-width:980px;flex-wrap:wrap;align-items:flex-start}
.lb-left{flex:1;min-width:210px;display:flex;flex-direction:column;gap:14px}
.lb-right{flex:2.2;min-width:300px;display:flex;flex-direction:column;gap:14px}
.panel{background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:16px;padding:18px}
.panel-title{font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.13em;color:#B08868;margin-bottom:12px}
.p-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.p-row:last-child{border-bottom:none}
.p-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#C94B28,#8B2500);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.8rem;flex-shrink:0;color:#fff}
.p-name{font-weight:700;font-size:.88rem;flex:1}
.p-tag-mc{font-size:.62rem;padding:2px 8px;border-radius:4px;font-weight:800;text-transform:uppercase;background:rgba(232,184,75,.15);color:#E8B84B;border:1px solid rgba(232,184,75,.3)}
.p-tag-ct{font-size:.62rem;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,.07);color:#B08868}
.settings-g{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pct-bar{display:flex;gap:3px;height:6px;border-radius:4px;overflow:hidden;margin-top:8px}
.pct-t{background:#E8B84B;transition:flex .3s}
.pct-l{background:#C94B28;transition:flex .3s}
.pct-lo{background:#27AE60;transition:flex .3s}
.pct-leg{display:flex;gap:12px;font-size:.68rem;font-weight:700;margin-top:7px;flex-wrap:wrap}
.dot-sq{width:8px;height:8px;border-radius:2px;display:inline-block;margin-right:4px;vertical-align:middle}
.prize-pool{font-family:'Lobster',cursive;font-size:1.9rem;color:#E8B84B;text-shadow:0 0 20px rgba(232,184,75,.4);line-height:1.1}
.cs-wrap{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:12px}
.cs-btn{background:#120804;border:1px solid rgba(212,82,42,.22);color:#FFF3E0;border-radius:7px;padding:5px 10px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:all .15s}
.cs-btn:hover{border-color:#C94B28}
.cs-btn.active{background:#C94B28;border-color:#C94B28;color:#fff}
.cs-btn:disabled{opacity:.55;cursor:not-allowed}
.sk-row{display:flex;gap:6px;flex-wrap:wrap}
.sk-btn{width:44px;height:44px;border-radius:9px;border:2px solid rgba(212,82,42,.2);background:#120804;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;font-size:1.1rem;color:#FFF3E0;font-family:'Nunito',sans-serif;font-weight:900}
.sk-btn.active{border-color:#E8B84B;background:rgba(232,184,75,.12)}
.sk-btn:hover{border-color:#C94B28}
.wait-banner{background:rgba(201,75,40,.08);border:1px solid rgba(201,75,40,.2);border-radius:10px;padding:14px;text-align:center}

/* ── CARTON ── */
.ct-wrap{background:#FFF8F0;border-radius:14px;padding:10px;box-shadow:0 8px 30px rgba(0,0,0,.55);width:100%;max-width:540px}
.ct-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding:0 2px}
.ct-id{font-size:.72rem;font-weight:800;color:#8B4513;text-transform:uppercase;letter-spacing:.08em}
.ct-prog{font-size:.7rem;color:#B07040;font-weight:600}
.ct-grid{display:flex;flex-direction:column;gap:3px}
.ct-row{display:flex;gap:3px}
.ct-cell{flex:1;aspect-ratio:1;min-width:0;border:1px solid #E0C5A8;border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;background:#fff;transition:background .12s;user-select:none;-webkit-tap-highlight-color:transparent}
.ct-cell.emp{background:#F5E8D5;cursor:default;border-color:#DEC8B0}
.ct-cell.cld{background:#FFFDE7}
.ct-cell.mkd.cld{background:#E8F8EE}
.ct-cell.ro{cursor:default}
.ct-num{font-weight:800;font-size:clamp(.64rem,2.4vw,1.08rem);color:#4A3728;position:relative;z-index:1;pointer-events:none;line-height:1}
.ct-marker{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;animation:popIn .22s cubic-bezier(.175,.885,.32,1.275);pointer-events:none;z-index:2;font-size:clamp(1rem,3.2vw,1.65rem);line-height:1}
.mk-dot{width:70%;height:70%;border-radius:50%;background:rgba(39,174,96,.72);border:2px solid #27AE60}
.mk-x{font-weight:900;color:#E74C3C;font-size:clamp(.85rem,2.8vw,1.35rem)}
.ct-cols{display:flex;gap:3px;margin-top:4px}
.ct-col-l{flex:1;text-align:center;font-size:clamp(.38rem,.85vw,.58rem);color:#C0A070;font-weight:600;min-width:0}

/* ── GAME ── */
.game{min-height:100vh;padding:14px 16px;display:flex;flex-direction:column;align-items:center;gap:14px}
.game-hdr{width:100%;max-width:1180px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.prize-bar{display:flex;gap:7px;flex-wrap:wrap}
.pb-item{padding:4px 13px;border-radius:100px;font-size:.7rem;font-weight:800;border:1px solid;transition:all .35s;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
.pb-pend{border-color:rgba(212,82,42,.18);color:#5B3A28}
.pb-open{border-color:#E8B84B;color:#E8B84B;background:rgba(232,184,75,.08)}
.pb-won{border-color:#27AE60;color:#2ECC71;background:rgba(39,174,96,.08);text-decoration:line-through;opacity:.75}
.game-body{display:flex;gap:18px;width:100%;max-width:1180px;align-items:flex-start;flex-wrap:wrap;justify-content:center}
.game-main{display:flex;flex-direction:column;gap:14px;flex:1;min-width:280px;max-width:560px;align-items:center}
.game-tower{width:325px;flex-shrink:0;display:flex;flex-direction:column;gap:12px}

/* ── PRIZE BUTTONS ── */
.pz-row{display:flex;gap:9px;width:100%;max-width:540px}
.pz-btn{flex:1;padding:13px 5px;border-radius:11px;border:2px solid;font-family:'Nunito',sans-serif;font-size:.9rem;font-weight:900;cursor:pointer;transition:all .18s;text-transform:uppercase;letter-spacing:.06em;background:transparent;display:flex;flex-direction:column;align-items:center;gap:2px}
.pz-btn:disabled{opacity:.52;cursor:not-allowed;transform:none!important}
.pz-sub{font-size:.6rem;font-weight:600;letter-spacing:.04em;opacity:.82}
.pz-terna{border-color:#E8B84B;color:#E8B84B}
.pz-terna:not(:disabled):hover{background:#E8B84B;color:#2C1810;transform:translateY(-2px)}
.pz-linea{border-color:#C94B28;color:#C94B28}
.pz-linea:not(:disabled):hover{background:#C94B28;color:#fff;transform:translateY(-2px)}
.pz-lota{border-color:#27AE60;color:#27AE60}
.pz-lota:not(:disabled):hover{background:#27AE60;color:#fff;transform:translateY(-2px)}
.pz-won{text-decoration:line-through;opacity:.45}

/* ── MC TOWER ── */
.tw-panel{background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:14px;padding:14px}
.tw-title{font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.13em;color:#C8A878;margin-bottom:10px}
.draw-row{display:flex;align-items:center;gap:14px}
.big-ball{width:78px;height:78px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0%,#C94B28 55%,#7A2010 100%);display:flex;align-items:center;justify-content:center;font-family:'Lobster',cursive;font-size:2.1rem;color:#fff;box-shadow:0 6px 22px rgba(201,75,40,.55),inset 0 2px 5px rgba(255,255,255,.2);flex-shrink:0;transition:box-shadow .3s}
.big-ball.fresh{animation:ballPop .44s cubic-bezier(.175,.885,.32,1.275)}
.big-ball.empty{background:#231008;color:#8A6050;font-family:'Nunito',sans-serif;font-size:.75rem;font-weight:700}
.matrix{display:flex;flex-direction:column;gap:3px}
.mx-row{display:flex;gap:3px}
.mx-cell{width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:.63rem;font-weight:700;background:#120804;color:#8A6848;transition:all .3s}
.mx-cell.hit{background:#C94B28;color:#fff;animation:cellHit .35s}
.game-log{max-height:130px;overflow-y:auto;display:flex;flex-direction:column;gap:3px}
.le{padding:5px 9px;border-radius:6px;font-size:.73rem;display:flex;justify-content:space-between;align-items:center;gap:8px}
.le-draw{background:rgba(255,255,255,.04);color:#A8886A}
.le-req{background:rgba(232,184,75,.1);color:#E8B84B;border:1px solid rgba(232,184,75,.22)}
.le-win{background:rgba(39,174,96,.1);color:#2ECC71;border:1px solid rgba(39,174,96,.18);font-weight:700}
.le-inv{background:rgba(193,57,43,.1);color:#E74C3C;border:1px solid rgba(193,57,43,.18)}
.le-ts{font-size:.62rem;opacity:.68;flex-shrink:0;font-weight:600}
.stat-row{display:flex;align-items:center;justify-content:space-between;font-size:.72rem}

/* ── PLAYER: LAST CALLS ── */
.last-wrap{display:flex;flex-direction:column;align-items:center;gap:7px;width:100%;max-width:540px}
.last-lbl{font-size:.64rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#A8886A}
.last-balls{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.mini-ball{width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0%,#C94B28 55%,#7A2010 100%);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.72rem;color:#fff;box-shadow:0 2px 8px rgba(201,75,40,.4);flex-shrink:0}
.mini-ball.newest{animation:ballPop .38s cubic-bezier(.175,.885,.32,1.275)}

/* ── ANNOUNCEMENT ── */
.ann-bg{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9998;pointer-events:auto;background:rgba(0,0,0,.55);cursor:pointer}
.ann-box{padding:38px 56px;border-radius:28px;text-align:center;animation:annPop .44s cubic-bezier(.175,.885,.32,1.275);box-shadow:0 0 80px rgba(0,0,0,.9);position:relative;cursor:default}
.ann-close{position:absolute;top:12px;right:14px;background:transparent;border:none;color:rgba(255,255,255,.35);font-size:1rem;cursor:pointer;font-family:'Nunito',sans-serif;font-weight:700;line-height:1;transition:color .15s;padding:4px 8px}
.ann-close:hover{color:rgba(255,255,255,.9)}
.ann-draw{background:rgba(8,4,1,.97);border:3px solid #E8B84B}
.ann-request{background:rgba(8,4,1,.97);border:3px solid #E8B84B}
.ann-win{background:rgba(8,4,1,.97);border:3px solid #27AE60}
.ann-invalid{background:rgba(8,4,1,.97);border:3px solid #E74C3C}
.ann-ball{width:108px;height:108px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff 0%,#C94B28 55%,#7A2010 100%);display:flex;align-items:center;justify-content:center;font-family:'Lobster',cursive;font-size:3rem;color:#fff;margin:0 auto 16px;box-shadow:0 0 45px rgba(201,75,40,.7)}
.ann-title{font-family:'Lobster',cursive;font-size:2.3rem;line-height:1.1}
.ann-draw   .ann-title{color:#FFF3E0}
.ann-request .ann-title{color:#E8B84B}
.ann-win    .ann-title{color:#2ECC71}
.ann-invalid .ann-title{color:#E74C3C}
.ann-sub{font-size:.83rem;color:#B08868;margin-top:7px;font-weight:600}
.ann-emoji{font-size:2rem;margin-top:10px}

/* ── SNOOP MODAL ── */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px}
.modal-box{background:#180A04;border:1px solid rgba(212,82,42,.28);border-radius:20px;width:100%;max-width:1040px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden}
.modal-hdr{padding:16px 22px;border-bottom:1px solid rgba(212,82,42,.18);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.modal-hdr h2{font-size:.95rem;font-weight:900}
.modal-body{padding:18px 22px;overflow-y:auto;display:flex;flex-direction:column;gap:18px}
.reqs-section{display:flex;flex-direction:column;gap:8px}
.req-banner{background:rgba(232,184,75,.1);border:1px solid rgba(232,184,75,.3);border-radius:9px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.req-type{font-weight:900;color:#E8B84B;font-size:.9rem;text-transform:uppercase;font-family:'Lobster',cursive;font-size:1.1rem}
.snoop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
.sn-card{background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:12px;padding:12px}
.sn-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.sn-name{font-weight:800;font-size:.9rem}
.sn-req-mini{background:rgba(232,184,75,.1);border:1px solid rgba(232,184,75,.25);border-radius:7px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}

/* ── MINI CARTON (Snoop) ── */
.mn-grid{display:flex;flex-direction:column;gap:2px}
.mn-row{display:flex;gap:2px}
.mn-cell{flex:1;aspect-ratio:1;min-width:0;max-width:33px;border:1px solid #E0C5A8;border-radius:4px;display:flex;align-items:center;justify-content:center;background:#fff;position:relative;overflow:hidden}
.mn-cell.mn-emp{background:#F5E8D5}
.mn-num{font-size:.56rem;font-weight:800;color:#4A3728;position:relative;z-index:1;line-height:1}
.mn-cell.mn-h{background:rgba(39,174,96,.22)}
.mn-cell.mn-l{background:rgba(231,76,60,.17)}
.mn-cell.mn-m{background:rgba(255,248,200,.75);border:1px dashed #E8B84B}
.mn-dot{width:11px;height:11px;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2}
.mn-dh{background:rgba(39,174,96,.8);border:1px solid #27AE60}
.mn-dl{background:rgba(192,57,43,.85);border:1px solid #C0392B;box-shadow:0 0 5px rgba(231,76,60,.5)}

/* ── SETTLEMENT ── */
.settle{min-height:100vh;padding:22px;display:flex;flex-direction:column;align-items:center;gap:20px}
.settle-hdr{width:100%;max-width:620px;display:flex;align-items:center;justify-content:space-between}
.bal-table{width:100%;max-width:620px;background:#1C0E07;border:1px solid rgba(212,82,42,.18);border-radius:16px;overflow:hidden}
.bal-row{display:flex;padding:11px 20px;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.04)}
.bal-row:last-child{border-bottom:none}
.bal-name{flex:1;font-weight:700;font-size:.9rem}
.bal-pos{color:#2ECC71;font-weight:900;font-size:1rem}
.bal-neg{color:#E74C3C;font-weight:900;font-size:1rem}
.bal-zero{color:#A8886A;font-weight:700;font-size:1rem}
.prize-line{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.prize-line:last-child{border-bottom:none}
.prize-type{font-weight:900;font-size:.85rem;text-transform:uppercase}
.prize-winner{font-size:.85rem;flex:1;padding:0 12px;color:#BFA080}
.prize-amt{font-weight:800;font-size:.9rem}

/* ── CHIPS ── */
.chip{padding:2px 9px;border-radius:100px;font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
.chip-mc{background:rgba(232,184,75,.14);color:#E8B84B;border:1px solid rgba(232,184,75,.28)}
.chip-ok{background:rgba(39,174,96,.14);color:#2ECC71;border:1px solid rgba(39,174,96,.28)}
.chip-req{background:rgba(232,184,75,.14);color:#E8B84B;border:1px solid rgba(232,184,75,.3)}
.chip-pending{background:rgba(201,75,40,.14);color:#C94B28;border:1px solid rgba(201,75,40,.28)}

/* ── UTILS ── */
.flex{display:flex}.fc{flex-direction:column}.ac{align-items:center}.jb{justify-content:space-between}.jc{justify-content:center}
.g3{gap:3px}.g6{gap:6px}.g8{gap:8px}.g10{gap:10px}.g12{gap:12px}.g16{gap:16px}
.w100{width:100%}.tc{text-align:center}
.fw7{font-weight:700}.fw9{font-weight:900}
.gold{color:#E8B84B}.dim{color:#B08868}.green{color:#2ECC71}.red{color:#E74C3C}.white{color:#FFF3E0}
.xs{font-size:.73rem}.sm{font-size:.85rem}.lg{font-size:1.1rem}
.mt4{margin-top:4px}.mt8{margin-top:8px}.mt12{margin-top:12px}.mb8{margin-bottom:8px}.mb12{margin-bottom:12px}
.p12{padding:12px}.p16{padding:16px}
.pulse{animation:pulsar 1.5s infinite}
.warn{color:#E8B84B;font-size:.72rem;font-weight:700;margin-top:6px}
.divline{height:1px;background:rgba(212,82,42,.14);width:100%;margin:6px 0}

/* ── ANIMATIONS ── */
@keyframes popIn{from{transform:scale(0)}to{transform:scale(1)}}
@keyframes ballPop{0%{transform:scale(.25);opacity:0}65%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}
@keyframes annPop{0%{transform:scale(.5);opacity:0}65%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes cellHit{0%{transform:scale(.65)}55%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes pulsar{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ── SESSION STATS TABLE ── */
.stats-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
.stats-tbl{width:100%;border-collapse:collapse;min-width:520px}
.stats-tbl th{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#C8A878;padding:9px 12px;border-bottom:1px solid rgba(212,82,42,.2);text-align:center;white-space:nowrap}
.stats-tbl th:first-child{text-align:left}
.stats-tbl td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.86rem;text-align:center;font-weight:700;vertical-align:middle}
.stats-tbl td:first-child{text-align:left}
.stats-tbl tr:last-child td{border-bottom:none}
.stats-tbl tr:hover td{background:rgba(255,255,255,.025);transition:background .12s}
.st-terna{color:#E8B84B}
.st-linea{color:#C94B28}
.st-lota{color:#27AE60}
.cur-prizes{display:flex;flex-direction:column;gap:3px;margin-bottom:16px}

/* ── RESPONSIVE ── */
@media(max-width:640px){
  .ann-box{padding:26px 32px}
  .ann-ball{width:80px;height:80px;font-size:2.3rem}
  .ann-title{font-size:1.8rem}
  .cards-wrap{flex-direction:column}
  .settings-g{grid-template-columns:1fr}
  .game-tower{width:100%}
}
@media(max-width:940px){
  .game-tower{width:100%}
}
`;

// ────────────────────────────────────────────────────────────
// COMPONENTS
// ────────────────────────────────────────────────────────────

// Skin marker rendered inside a carton cell
function Marker({ skin }) {
  if (skin === 'dot')   return <div className="mk-dot" />;
  if (skin === 'x')     return <span className="mk-x">✕</span>;
  if (skin === 'bean')  return <span>🫘</span>;
  if (skin === 'star')  return <span>⭐</span>;
  if (skin === 'coin')  return <span>🪙</span>;
  if (skin === 'heart') return <span>❤️</span>;
  return <div className="mk-dot" />;
}

// Full carton card with marking
function CartonCard({ carton, marked = [], calledNums = [], skin = 'dot', onToggle, readonly = false }) {
  const m = new Set(marked), c = new Set(calledNums);
  const total = allNums(carton).length;
  const correct = allNums(carton).filter(n => m.has(n) && c.has(n)).length;
  return (
    <div className="ct-wrap">
      <div className="ct-hdr">
        <span className="ct-id">Cartón #{carton.id}</span>
        <span className="ct-prog">{correct} / {total}</span>
      </div>
      <div className="ct-grid">
        {carton.rows.map((row, ri) => (
          <div key={ri} className="ct-row">
            {row.map((num, ci) => {
              if (num === 0) return <div key={ci} className="ct-cell emp" />;
              const isMk = m.has(num), isCld = c.has(num);
              return (
                <div
                  key={ci}
                  className={`ct-cell${isCld ? ' cld' : ''}${isMk ? ' mkd' : ''}${readonly ? ' ro' : ''}`}
                  onClick={() => !readonly && onToggle && onToggle(num)}
                >
                  <span className="ct-num">{num}</span>
                  {isMk && <div className="ct-marker"><Marker skin={skin} /></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ct-cols">
        {COL_RANGES.map(r => <div key={r} className="ct-col-l">{r}</div>)}
      </div>
    </div>
  );
}

// Compact carton for snoop (MC overview)
function MiniCarton({ carton, marked = [], calledNums = [] }) {
  const m = new Set(marked), c = new Set(calledNums);
  return (
    <div className="mn-grid">
      {carton.rows.map((row, ri) => (
        <div key={ri} className="mn-row">
          {row.map((num, ci) => {
            if (num === 0) return <div key={ci} className="mn-cell mn-emp" />;
            const isMk = m.has(num), isCld = c.has(num);
            let cls = '', dot = null;
            if (isMk && isCld)  { cls = 'mn-h'; dot = 'mn-dh'; }
            if (isMk && !isCld) { cls = 'mn-l'; dot = 'mn-dl'; }
            if (!isMk && isCld) { cls = 'mn-m'; }
            return (
              <div key={ci} className={`mn-cell ${cls}`}>
                <span className="mn-num">{num}</span>
                {dot && <div className={`mn-dot ${dot}`} />}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LANDING
// ────────────────────────────────────────────────────────────
function LandingView({ onCreate, onJoin }) {
  const [cName, setCName] = useState('');
  const [jCode, setJCode] = useState('');
  const [jName, setJName] = useState('');

  return (
    <div className="landing">
      <div className="hero">
        <div className="logo-txt">LOTA</div>
        <p className="tagline">El bingo familiar chileno</p>
      </div>

      <div className="cards-wrap">
        <div className="lc">
          <div className="lc-icon">🎉</div>
          <h2>Crear Sala</h2>
          <p>Sé el Animador. Canta los números y dirige el juego.</p>
          <div className="fld">
            <label className="lbl">Tu nombre</label>
            <input className="inp" value={cName} onChange={e => setCName(e.target.value)}
              placeholder="Ej: Felipe Humberto Camiroaga Fernández" onKeyDown={e => e.key === 'Enter' && cName.trim() && onCreate(cName.trim())} />
          </div>
          <button className="btn btn-gold btn-xl btn-block" disabled={!cName.trim()} onClick={() => onCreate(cName.trim())}>
            CREAR SALA →
          </button>
        </div>

        <div className="or-div">O</div>

        <div className="lc">
          <div className="lc-icon">🎯</div>
          <h2>Unirse</h2>
          <p>Entra con el código que te compartió el Animador.</p>
          <div className="fld">
            <label className="lbl">Código de sala</label>
            <input className="inp inp-code" value={jCode}
              onChange={e => setJCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123" maxLength={6} />
          </div>
          <div className="fld">
            <label className="lbl">Tu nombre</label>
            <input className="inp" value={jName} onChange={e => setJName(e.target.value)} placeholder="Ej: Felipe Humberto Camiroaga Fernández" />
          </div>
          <button className="btn btn-red btn-xl btn-block"
            disabled={jCode.length < 6 || !jName.trim()}
            onClick={() => onJoin(jCode, jName.trim())}>
            UNIRSE →
          </button>
        </div>
      </div>

      <p className="xs dim tc">Demo offline · Próximamente con multijugador real vía Supabase</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LOBBY
// ────────────────────────────────────────────────────────────
function LobbyView({ room, me, players, settings, onSettings, onCarton, onSkin, onStart, onBack, onShowBalances }) {
  const taken = players.filter(p => p.id !== me.id).map(p => p.cartonIdx);
  const pctSum = settings.ternaPct + settings.lineaPct + settings.lotaPct;
  const total = calcPot(players.length, settings.apuesta);

  return (
    <div className="lobby">
      <div className="lobby-hdr">
        <div className="code-pill">
          <span className="code-lbl">Sala</span>
          <span className="code-val">{room.code}</span>
          <span className="code-lbl">· {players.length} jugadores</span>
        </div>
        <div className="flex g8 ac">
          {me.isMC && <span className="chip chip-mc">Animador 🎤</span>}
          <button className="btn btn-ghost btn-sm" onClick={onShowBalances}>💰 Balances</button>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Salir</button>
        </div>
      </div>

      <div className="lobby-body">
        {/* LEFT COLUMN */}
        <div className="lb-left">
          <div className="panel">
            <div className="panel-title">Jugadores en sala</div>
            {players.map(p => (
              <div key={p.id} className="p-row">
                <div className="p-av">{p.name[0].toUpperCase()}</div>
                <span className="p-name">{p.name}{p.id === me.id ? ' (tú)' : ''}</span>
                {p.isMC && <span className="p-tag-mc">MC</span>}
                <span className="p-tag-ct">#{CARTONES[p.cartonIdx].id}</span>
              </div>
            ))}
          </div>

          {me.isMC && (
            <div className="panel">
              <div className="panel-title">Pozo estimado</div>
              <div className="prize-pool">{fmtClp(total)}</div>
              <p className="xs dim mt4">{fmtClp(settings.apuesta)} × {players.length} jugadores</p>
              <div className="pct-bar">
                <div className="pct-t" style={{ flex: settings.ternaPct }} />
                <div className="pct-l" style={{ flex: settings.lineaPct }} />
                <div className="pct-lo" style={{ flex: settings.lotaPct }} />
              </div>
              <div className="pct-leg">
                <span><span className="dot-sq" style={{ background: '#E8B84B' }} />Terna {settings.ternaPct}%</span>
                <span><span className="dot-sq" style={{ background: '#C94B28' }} />Línea {settings.lineaPct}%</span>
                <span><span className="dot-sq" style={{ background: '#27AE60' }} />Lota {settings.lotaPct}%</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lb-right">
          {me.isMC && (
            <div className="panel">
              <div className="panel-title">Configuración del juego</div>
              <div className="settings-g">
                <div className="fld">
                  <label className="lbl">Apuesta (CLP)</label>
                  <input className="inp inp-num" type="number" value={settings.apuesta} min={0} step={100}
                    onChange={e => onSettings({ ...settings, apuesta: Math.max(0, Number(e.target.value)) })} />
                </div>
                <div className="fld">
                  <label className="lbl">% Terna</label>
                  <input className="inp inp-num" type="number" value={settings.ternaPct} min={1} max={97}
                    onChange={e => onSettings({ ...settings, ternaPct: Number(e.target.value) })} />
                </div>
                <div className="fld">
                  <label className="lbl">% Línea</label>
                  <input className="inp inp-num" type="number" value={settings.lineaPct} min={1} max={97}
                    onChange={e => onSettings({ ...settings, lineaPct: Number(e.target.value) })} />
                </div>
                <div className="fld">
                  <label className="lbl">% Lota</label>
                  <input className="inp inp-num" type="number" value={settings.lotaPct} min={1} max={97}
                    onChange={e => onSettings({ ...settings, lotaPct: Number(e.target.value) })} />
                </div>
              </div>
              {pctSum !== 100 && <p className="warn">⚠ Los porcentajes deben sumar 100% (actual: {pctSum}%)</p>}
            </div>
          )}

          <div className="panel">
            <div className="panel-title">Elige tu Cartón</div>
            <div className="cs-wrap">
              {CARTONES.map((c, i) => (
                <button key={c.id} className={`cs-btn${me.cartonIdx === i ? ' active' : ''}`}
                  disabled={taken.includes(i)} onClick={() => onCarton(i)}>
                  #{c.id}
                </button>
              ))}
            </div>
            <CartonCard carton={CARTONES[me.cartonIdx]} marked={[]} calledNums={[]} skin={me.skin} readonly />
          </div>

          <div className="panel">
            <div className="panel-title">Marcador (Skin)</div>
            <div className="sk-row">
              {SKINS.map(s => (
                <button key={s.id} className={`sk-btn${me.skin === s.id ? ' active' : ''}`} onClick={() => onSkin(s.id)}>
                  {s.id === 'dot'
                    ? <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(39,174,96,.8)', border: '2px solid #27AE60' }} />
                    : s.label}
                </button>
              ))}
            </div>
          </div>

          {me.isMC
            ? <button className="btn btn-gold btn-xl btn-block" disabled={pctSum !== 100} onClick={onStart}>
                🎉 ¡COMENZAR PARTIDA!
              </button>
            : <div className="wait-banner">
                <p className="dim sm pulse">Esperando que el Animador inicie la partida…</p>
              </div>
          }
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SNOOP MODAL
// ────────────────────────────────────────────────────────────
function SnoopModal({ players, game, onClose, onValidate, onReject }) {
  const reqsByPlayer = {};
  game.requests.forEach(r => {
    if (!reqsByPlayer[r.playerId]) reqsByPlayer[r.playerId] = [];
    reqsByPlayer[r.playerId].push(r);
  });

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-hdr">
          <h2>👁 Vista General — {players.length} Jugadores</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Cerrar</button>
        </div>
        <div className="modal-body">
          {/* Pending requests at the top */}
          {game.requests.length > 0 && (
            <div className="reqs-section">
              <div className="panel-title" style={{ color: '#E8B84B' }}>
                ⚡ Solicitudes pendientes ({game.requests.length})
              </div>
              {game.requests.map(req => {
                const pl = players.find(p => p.id === req.playerId);
                const valid = pl && isValid(req.type, CARTONES[pl.cartonIdx], pl.marked, game.calledNumbers);
                return (
                  <div key={req.id} className="req-banner">
                    <div>
                      <div className="req-type">¡{req.type.toUpperCase()}! — {req.playerName}</div>
                      <p className="xs dim mt4">
                        {req.ts} · {valid ? '✅ Válido según marcas y números' : '❌ Las marcas no coinciden con cantados'}
                      </p>
                    </div>
                    <div className="flex g6">
                      <button className="btn btn-green btn-sm" onClick={() => { onValidate(req.id); }}>✓ Validar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { onReject(req.id); }}>✗ Rechazar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All player cards */}
          <div className="snoop-grid">
            {players.map(p => {
              const carton = CARTONES[p.cartonIdx];
              const reqs = reqsByPlayer[p.id] || [];
              const correctMarks = p.marked.filter(n => game.calledNumbers.includes(n)).length;
              const wrongMarks = p.marked.filter(n => !game.calledNumbers.includes(n)).length;
              return (
                <div key={p.id} className="sn-card">
                  <div className="sn-head">
                    <span className="sn-name">{p.name}</span>
                    <div className="flex g5 ac">
                      {p.isMC && <span className="chip chip-mc">MC</span>}
                      <span className="xs dim">#{carton.id}</span>
                      {reqs.length > 0 && <span className="chip chip-req">¡{reqs[0].type.toUpperCase()}!</span>}
                    </div>
                  </div>
                  {reqs.map(req => (
                    <div key={req.id} className="sn-req-mini">
                      <span className="fw9 gold xs" style={{ textTransform: 'uppercase' }}>¡{req.type}!</span>
                      <div className="flex g4">
                        <button className="btn btn-green btn-sm" onClick={() => onValidate(req.id)}>✓</button>
                        <button className="btn btn-danger btn-sm" onClick={() => onReject(req.id)}>✗</button>
                      </div>
                    </div>
                  ))}
                  <MiniCarton carton={carton} marked={p.marked} calledNums={game.calledNumbers} />
                  <div className="flex jb mt8 xs dim">
                    <span>✅ {correctMarks} correctos</span>
                    <span>🔴 {wrongMarks} incorrectos</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="xs dim tc" style={{borderTop:'1px solid rgba(212,82,42,.12)',paddingTop:12}}>
            💡 <strong style={{color:'#B08868'}}>Modo demo:</strong> Los otros jugadores marcan automáticamente sus números al cantarse. En la versión real con Supabase, cada jugador marca en su propio dispositivo en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// ANNOUNCEMENT OVERLAY
// ────────────────────────────────────────────────────────────
function AnnView({ ann, onClose }) {
  return (
    <div className="ann-bg" onClick={onClose}>
      <div className={`ann-box ann-${ann.type}`} onClick={e => e.stopPropagation()}>
        <button className="ann-close" onClick={onClose}>✕</button>
        {ann.type === 'draw' && <div className="ann-ball">{ann.val}</div>}
        <div className="ann-title">{ann.msg}</div>
        {ann.sub && <div className="ann-sub">{ann.sub}</div>}
        {ann.type === 'win' && <div className="ann-emoji">🎉✨🎊</div>}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// GAME VIEW
// ────────────────────────────────────────────────────────────
function GameView({ room, me, players, settings, game, onDraw, onMark, onClaim, onValidate, onReject, showSnoop, setShowSnoop, ballKey, onLeave, onSettle, onShowBalances }) {
  const carton = CARTONES[me.cartonIdx];
  const total = calcPot(players.length, settings.apuesta);
  const { terna, linea, lota } = game.prizes;
  const allDone = !!(terna && linea && lota);

  // Prize button eligibility
  const canTerna = !terna && canReq('terna', carton, me.marked);
  const canLinea = !!terna && !linea && canReq('linea', carton, me.marked);
  const canLota  = !!linea && !lota  && canReq('lota',  carton, me.marked);

  // Player sees only last 5 drawn numbers (not a full log — that would be cheating)
  const recent = [...game.calledNumbers].reverse().slice(0, 6);

  return (
    <div className="game">
      {/* ── HEADER ── */}
      <div className="game-hdr">
        <div className="code-pill">
          <span className="code-val" style={{ fontSize: '1.1rem' }}>{room.code}</span>
          {me.isMC && <span className="chip chip-mc">MC 🎤</span>}
        </div>

        <div className="prize-bar">
          <div className={`pb-item ${terna ? 'pb-won' : 'pb-open'}`}>
            Terna{terna ? ` — ${terna.playerName}` : ` ${fmtClp(calcPrize(total, settings.ternaPct))}`}
          </div>
          <div className={`pb-item ${linea ? 'pb-won' : terna ? 'pb-open' : 'pb-pend'}`}>
            Línea{linea ? ` — ${linea.playerName}` : ` ${fmtClp(calcPrize(total, settings.lineaPct))}`}
          </div>
          <div className={`pb-item ${lota ? 'pb-won' : linea ? 'pb-open' : 'pb-pend'}`}>
            Lota{lota ? ` — ${lota.playerName}` : ` ${fmtClp(calcPrize(total, settings.lotaPct))}`}
          </div>
        </div>

        <div className="flex g8">
          <button className="btn btn-ghost btn-sm" onClick={onLeave}>Lobby</button>
          <button className="btn btn-ghost btn-sm" onClick={onShowBalances}>💰 Balances</button>
          {me.isMC && allDone && (
            <button className="btn btn-gold btn-sm" onClick={onSettle}>🏆 Cierre Final</button>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="game-body">
        {/* CENTER: player carton + prize buttons */}
        <div className="game-main">
          {/* Players see only last-drawn numbers, not a full list */}
          {!me.isMC && recent.length > 0 && (
            <div className="last-wrap">
              <span className="last-lbl">Últimos cantados</span>
              <div className="last-balls">
                {recent.map((n, i) => (
                  <div key={n} className={`mini-ball${i === 0 ? ' newest' : ''}`}>{n}</div>
                ))}
              </div>
            </div>
          )}

          <CartonCard carton={carton} marked={me.marked} calledNums={game.calledNumbers}
            skin={me.skin} onToggle={onMark} />

          {/* Prize request buttons */}
          <div className="pz-row">
            <button className={`pz-btn pz-terna${terna ? ' pz-won' : ''}`}
              disabled={terna ? true : !canTerna}
              onClick={() => onClaim('terna')}>
              {terna ? '✓ Terna' : '¡TERNA!'}
              <span className="pz-sub">{terna ? terna.playerName : canTerna ? 'Tienes 3 en fila ✓' : '3 marcas en fila'}</span>
            </button>
            <button className={`pz-btn pz-linea${linea ? ' pz-won' : ''}`}
              disabled={linea ? true : !canLinea}
              onClick={() => onClaim('linea')}>
              {linea ? '✓ Línea' : '¡LÍNEA!'}
              <span className="pz-sub">{linea ? linea.playerName : terna ? (canLinea ? 'Tienes fila completa ✓' : 'Fila completa') : 'Primero la Terna'}</span>
            </button>
            <button className={`pz-btn pz-lota${lota ? ' pz-won' : ''}`}
              disabled={lota ? true : !canLota}
              onClick={() => onClaim('lota')}>
              {lota ? '✓ Lota' : '¡LOTA!'}
              <span className="pz-sub">{lota ? lota.playerName : linea ? (canLota ? 'Cartón lleno ✓' : 'Cartón completo') : 'Primero la Línea'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT: MC Control Tower */}
        {me.isMC && (
          <div className="game-tower">
            {/* Draw section */}
            <div className="tw-panel">
              <div className="tw-title">Control del Animador</div>
              <div className="draw-row">
                <div className={`big-ball${game.lastDrawn ? ' fresh' : ' empty'}`} key={ballKey}>
                  {game.lastDrawn || '—'}
                </div>
                <button className="btn-draw" onClick={onDraw}
                  disabled={game.calledNumbers.length >= 90 || allDone}>
                  🎱 CANTAR NÚMERO
                </button>
              </div>
              <div className="divline" />
              <div className="stat-row">
                <span style={{fontSize:'.72rem',color:'#C8A878',fontWeight:700}}>{90 - game.calledNumbers.length} números restantes</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSnoop(true)}>
                  👁 Jugadores {game.requests.length > 0 && `(${game.requests.length} ⚡)`}
                </button>
              </div>
            </div>

            {/* Log */}
            {game.log.length > 0 && (
              <div className="tw-panel">
                <div className="tw-title">Registro de partida</div>
                <div className="game-log">
                  {game.log.map(e => (
                    <div key={e.id} className={`le le-${e.type}`}>
                      <span>{e.msg}</span>
                      <div className="flex ac g6">
                        {e.type === 'req' && e.reqId && (
                          <button className="btn btn-green btn-sm" onClick={() => onValidate(e.reqId)}>✓</button>
                        )}
                        <span className="le-ts">{e.ts}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Number matrix */}
            <div className="tw-panel">
              <div className="tw-title">Tabla 1–90</div>
              <div className="matrix">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80].map(start => (
                  <div key={start} className="mx-row">
                    {Array.from({ length: start === 80 ? 11 : 10 }, (_, i) => start + i)
                      .filter(n => n > 0)
                      .map(n => (
                        <div key={n} className={`mx-cell${game.calledNumbers.includes(n) ? ' hit' : ''}`}>{n}</div>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {allDone && (
              <button className="btn btn-gold btn-xl btn-block" onClick={onSettle}>
                🏆 Ver Balances Finales
              </button>
            )}
          </div>
        )}
      </div>

      {/* Snoop Modal */}
      {showSnoop && (
        <SnoopModal
          players={players} game={game}
          onClose={() => setShowSnoop(false)}
          onValidate={reqId => { onValidate(reqId); setShowSnoop(false); }}
          onReject={reqId => { onReject(reqId); setShowSnoop(false); }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// BALANCES MODAL  (lobby + in-game overlay)
// ────────────────────────────────────────────────────────────
const EMPTY_STAT = { gamesPlayed: 0, wins: { terna: 0, linea: 0, lota: 0 }, totalWagered: 0 };

function StatsTable({ players, stats }) {
  const sorted = [...players].sort((a, b) => b.balance - a.balance);
  return (
    <div className="stats-wrap">
      <table className="stats-tbl">
        <thead>
          <tr>
            <th>Jugador</th>
            <th>Partidas</th>
            <th style={{color:'#E8B84B'}}>Ternas</th>
            <th style={{color:'#C94B28'}}>Líneas</th>
            <th style={{color:'#27AE60'}}>Lotas</th>
            <th>Apostado</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => {
            const st = stats[p.name] || EMPTY_STAT;
            return (
              <tr key={p.id}>
                <td>
                  <div className="flex ac g8">
                    <div className="p-av" style={{width:26,height:26,fontSize:'.68rem',flexShrink:0}}>{p.name[0]}</div>
                    <span>{p.name}</span>
                    {p.isMC && <span className="chip chip-mc" style={{fontSize:'.55rem'}}>MC</span>}
                  </div>
                </td>
                <td className="dim">{st.gamesPlayed}</td>
                <td className="st-terna">{st.wins.terna}</td>
                <td className="st-linea">{st.wins.linea}</td>
                <td className="st-lota">{st.wins.lota}</td>
                <td className="dim">-{fmtClp(st.totalWagered)}</td>
                <td className={p.balance > 0 ? 'bal-pos' : p.balance < 0 ? 'bal-neg' : 'bal-zero'}>
                  {p.balance > 0 ? '+' : ''}{fmtClp(p.balance)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BalancesModal({ players, stats, currentGame, onClose }) {
  const prizes = currentGame?.prizes || {};
  const anyPrize = prizes.terna || prizes.linea || prizes.lota;
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{maxWidth:760}}>
        <div className="modal-hdr">
          <h2>💰 Balances de Sesión</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Cerrar</button>
        </div>
        <div className="modal-body">
          {anyPrize && (
            <div>
              <div className="panel-title" style={{color:'#C8A878',marginBottom:8}}>Premios de la partida actual</div>
              <div className="cur-prizes">
                {['terna','linea','lota'].map(type => {
                  const p = prizes[type];
                  if (!p) return null;
                  return (
                    <div key={type} className="prize-line">
                      <span className="prize-type" style={{color:type==='terna'?'#E8B84B':type==='linea'?'#C94B28':'#27AE60',width:60}}>{type}</span>
                      <span className="prize-winner">{p.playerName}</span>
                      <span className="prize-amt" style={{color:'#2ECC71'}}>+{fmtClp(p.amount)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="divline" />
            </div>
          )}
          <div className="panel-title" style={{color:'#C8A878',marginBottom:10}}>Historial de sesión — todas las partidas</div>
          <StatsTable players={players} stats={stats} />
          <p className="xs dim tc mt12">Balances acumulados. Saldo = premios ganados − apuestas totales.</p>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SETTLEMENT VIEW
// ────────────────────────────────────────────────────────────
function SettleView({ players, settings, game, stats, onNewRound, onBack }) {
  const total = calcPot(players.length, settings.apuesta);
  const pctMap = { terna: settings.ternaPct, linea: settings.lineaPct, lota: settings.lotaPct };

  return (
    <div className="settle">
      <div className="settle-hdr">
        <div className="logo-txt" style={{ fontSize: '2.2rem' }}>Cierre</div>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Volver</button>
      </div>

      {/* Prizes this round */}
      <div className="panel" style={{ width: '100%', maxWidth: 680 }}>
        <div className="panel-title">Premios de esta partida — Pozo: {fmtClp(total)}</div>
        {['terna', 'linea', 'lota'].map(type => {
          const p = game.prizes[type];
          return (
            <div key={type} className="prize-line">
              <span className="prize-type" style={{ color: type === 'terna' ? '#E8B84B' : type === 'linea' ? '#C94B28' : '#27AE60', width: 60 }}>
                {type}
              </span>
              <span className="prize-winner">{p ? p.playerName : '—'}</span>
              <span className="prize-amt" style={{ color: p ? '#2ECC71' : '#B08868' }}>
                {p ? `+${fmtClp(p.amount)}` : fmtClp(calcPrize(total, pctMap[type]))}
              </span>
            </div>
          );
        })}
      </div>

      {/* Full session stats */}
      <div className="panel" style={{ width: '100%', maxWidth: 680 }}>
        <div className="panel-title">Historial de sesión completo</div>
        <StatsTable players={players} stats={stats} />
      </div>

      <button className="btn btn-gold btn-xl" onClick={onNewRound}>
        🎉 Nueva Ronda
      </button>
      <p className="xs dim tc">
        Próximamente: transferencias directas y alertas de pago automáticas
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN APP — State Machine
// ────────────────────────────────────────────────────────────
export default function App() {
  const [screen,       setScreen]       = useState('landing');
  const [room,         setRoom]         = useState(null);
  const [me,           setMe]           = useState(null);
  const [players,      setPlayers]      = useState([]);
  const [settings,     setSettings]     = useState(INIT_SETTINGS);
  const [game,         setGame]         = useState(INIT_GAME);
  const [ann,          setAnn]          = useState(null);
  const [snoop,        setSnoop]        = useState(false);
  const [ballKey,      setBallKey]      = useState(0);
  const [stats,        setStats]        = useState({});
  const [showBalances, setShowBalances] = useState(false);
  const annTimer = useRef(null);

  // ── Announcement system ──
  const announce = useCallback((type, msg, val = '', sub = '', dur = 3500) => {
    if (annTimer.current) clearTimeout(annTimer.current);
    setAnn({ type, msg, val, sub });
    playTone(type);
    annTimer.current = setTimeout(() => setAnn(null), dur);
  }, []);

  // ── CREATE ROOM (as MC) ──
  const createRoom = useCallback(name => {
    const code = genCode();
    const id = 'mc-' + Date.now();
    const mc = { id, name, isMC: true, cartonIdx: 0, skin: 'dot', marked: [], balance: 0 };
    const demo = DEMO_PLAYERS.map(p => ({ ...p, id: p.id + '-' + Date.now(), marked: [], balance: 0 }));
    setRoom({ code, name: `Sala de ${name}` });
    setMe(mc);
    setPlayers([mc, ...demo]);
    setScreen('lobby');
  }, []);

  // ── JOIN ROOM (as Player) ──
  const joinRoom = useCallback((code, name) => {
    const id = 'p-' + Date.now();
    const mc  = { id: 'mc-demo', name: 'Rafa (Animador)', isMC: true, cartonIdx: 0, skin: 'dot', marked: [], balance: 0 };
    const demo = DEMO_PLAYERS.slice(0, 3).map(p => ({ ...p, id: p.id + '-j-' + Date.now(), marked: [], balance: 0 }));
    const player = { id, name, isMC: false, cartonIdx: 6, skin: 'dot', marked: [], balance: 0 };
    setRoom({ code: code.toUpperCase(), name: 'Sala de Rafa' });
    setMe(player);
    setPlayers([mc, ...demo, player]);
    setScreen('lobby');
  }, []);

  // ── SELECT CARTON ──
  const selectCarton = useCallback(idx => {
    const taken = players.filter(p => p.id !== me.id).map(p => p.cartonIdx);
    if (taken.includes(idx)) return;
    const updated = { ...me, cartonIdx: idx, marked: [] };
    setMe(updated);
    setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, cartonIdx: idx, marked: [] } : p));
  }, [me, players]);

  // ── SELECT SKIN ──
  const selectSkin = useCallback(skin => {
    setMe(prev => ({ ...prev, skin }));
    setPlayers(prev => prev.map(p => p.id === me.id ? { ...p, skin } : p));
  }, [me]);

  // ── START GAME ──
  const startGame = useCallback(() => {
    // Track stats: gamesPlayed + totalWagered for everyone in the room
    setStats(prev => {
      const next = { ...prev };
      players.forEach(p => {
        const e = next[p.name] || EMPTY_STAT;
        next[p.name] = { ...e, gamesPlayed: e.gamesPlayed + 1, totalWagered: e.totalWagered + settings.apuesta };
      });
      return next;
    });
    setPlayers(prev => prev.map(p => ({ ...p, balance: p.balance - settings.apuesta, marked: [] })));
    setMe(prev => ({ ...prev, marked: [], balance: prev.balance - settings.apuesta }));
    setGame({ ...INIT_GAME, status: 'active' });
    setScreen('game');
  }, [settings, players]);

  // ── DRAW NUMBER ──
  const drawNumber = useCallback(() => {
    setGame(prev => {
      if (prev.status !== 'active') return prev;
      const avail = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !prev.calledNumbers.includes(n));
      if (!avail.length) return prev;
      const num = avail[Math.floor(Math.random() * avail.length)];
      const newCalled = [...prev.calledNumbers, num];

      // Auto-mark demo players (they mark their own numbers automatically)
      setPlayers(pp => pp.map(p => {
        if (p.id === me.id) return p;
        const carton = CARTONES[p.cartonIdx];
        if (carton.rows.some(row => row.includes(num))) {
          return { ...p, marked: [...p.marked, num] };
        }
        return p;
      }));

      const entry = { id: Date.now() + '', ts: tstamp(), msg: `Salió el ${num}`, type: 'draw' };
      announce('draw', `¡${num}!`, num, '', 1600);
      setBallKey(k => k + 1);
      return { ...prev, calledNumbers: newCalled, lastDrawn: num, log: [entry, ...prev.log] };
    });
  }, [me, announce]);

  // ── TOGGLE MARK ──
  const toggleMark = useCallback(num => {
    if (num === 0) return;
    setMe(prev => {
      if (game.status !== 'active') return prev;
      const nm = prev.marked.includes(num)
        ? prev.marked.filter(n => n !== num)
        : [...prev.marked, num];
      setPlayers(pp => pp.map(p => p.id === prev.id ? { ...p, marked: nm } : p));
      return { ...prev, marked: nm };
    });
  }, [game.status]);

  // ── CLAIM PRIZE (player requests) ──
  const claimPrize = useCallback(type => {
    if (!me || game.status !== 'active') return;
    if (game.prizes[type]) return;
    if (type === 'linea' && !game.prizes.terna) return;
    if (type === 'lota'  && !game.prizes.linea) return;
    const carton = CARTONES[me.cartonIdx];
    if (!canReq(type, carton, me.marked)) return;

    const reqId = Date.now() + '';
    const req = { id: reqId, playerId: me.id, playerName: me.name, type, ts: tstamp() };
    const entry = { id: reqId, ts: tstamp(), msg: `${me.name} grita ¡${type.toUpperCase()}!`, type: 'req', reqId };
    setGame(prev => ({ ...prev, requests: [...prev.requests, req], log: [entry, ...prev.log] }));
    announce('request', `¡${me.name}!`, type, `Solicita ${type.toUpperCase()}`, 4000);
  }, [me, game, announce]);

  // ── VALIDATE WIN (MC approves) ──
  const validateWin = useCallback(reqId => {
    const req = game.requests.find(r => r.id === reqId);
    if (!req) return;
    const player = players.find(p => p.id === req.playerId);
    if (!player) return;
    const carton = CARTONES[player.cartonIdx];
    const valid = isValid(req.type, carton, player.marked, game.calledNumbers);

    if (valid) {
      const total = calcPot(players.length, settings.apuesta);
      const pctMap = { terna: settings.ternaPct, linea: settings.lineaPct, lota: settings.lotaPct };
      const amt = calcPrize(total, pctMap[req.type]);
      const winEntry = { id: Date.now() + '', ts: tstamp(), msg: `✓ ${req.playerName} gana la ${req.type.toUpperCase()} — ${fmtClp(amt)}`, type: 'win' };
      setGame(prev => ({
        ...prev,
        prizes: { ...prev.prizes, [req.type]: { playerId: req.playerId, playerName: req.playerName, amount: amt } },
        requests: prev.requests.filter(r => r.id !== reqId),
        log: [winEntry, ...prev.log],
      }));
      setPlayers(prev => prev.map(p => p.id === req.playerId ? { ...p, balance: p.balance + amt } : p));
      if (req.playerId === me.id) setMe(prev => ({ ...prev, balance: prev.balance + amt }));
      // Track win in session stats
      setStats(prev => {
        const e = prev[req.playerName] || EMPTY_STAT;
        return { ...prev, [req.playerName]: { ...e, wins: { ...e.wins, [req.type]: e.wins[req.type] + 1 } } };
      });
      announce('win', `¡${req.playerName} gana la ${req.type.toUpperCase()}!`, req.type, fmtClp(amt), 5500);
    } else {
      const invEntry = { id: Date.now() + '', ts: tstamp(), msg: `✗ Solicitud inválida de ${req.playerName}`, type: 'inv' };
      setGame(prev => ({ ...prev, requests: prev.requests.filter(r => r.id !== reqId), log: [invEntry, ...prev.log] }));
      announce('invalid', `¡Incorrecto, ${req.playerName}!`, '', 'Las marcas no coinciden con los cantados', 3000);
    }
  }, [game, players, me, settings, announce]);

  // ── REJECT REQUEST (MC dismisses without validating) ──
  const rejectRequest = useCallback(reqId => {
    const req = game.requests.find(r => r.id === reqId);
    if (!req) return;
    const entry = { id: Date.now() + '', ts: tstamp(), msg: `✗ ${req.playerName} — solicitud rechazada`, type: 'inv' };
    setGame(prev => ({ ...prev, requests: prev.requests.filter(r => r.id !== reqId), log: [entry, ...prev.log] }));
    announce('invalid', `¡Rechazado!`, '', `${req.playerName} — ${req.type.toUpperCase()}`, 2500);
  }, [game, announce]);

  // ── NEW ROUND ──
  const newRound = useCallback(() => {
    setGame(INIT_GAME);
    setScreen('lobby');
  }, []);

  // ────────────────────────────────────────────────────────
  return (
    <div className="la">
      <style>{CSS}</style>

      {screen === 'landing' && (
        <LandingView onCreate={createRoom} onJoin={joinRoom} />
      )}

      {screen === 'lobby' && (
        <LobbyView
          room={room} me={me} players={players} settings={settings}
          onSettings={setSettings}
          onCarton={selectCarton}
          onSkin={selectSkin}
          onStart={startGame}
          onBack={() => setScreen('landing')}
          onShowBalances={() => setShowBalances(true)}
        />
      )}

      {screen === 'game' && (
        <GameView
          room={room} me={me} players={players} settings={settings} game={game}
          onDraw={drawNumber}
          onMark={toggleMark}
          onClaim={claimPrize}
          onValidate={validateWin}
          onReject={rejectRequest}
          showSnoop={snoop} setShowSnoop={setSnoop}
          ballKey={ballKey}
          onLeave={() => { setGame(INIT_GAME); setScreen('lobby'); }}
          onSettle={() => setScreen('settle')}
          onShowBalances={() => setShowBalances(true)}
        />
      )}

      {screen === 'settle' && (
        <SettleView
          players={players} settings={settings} game={game} stats={stats}
          onNewRound={newRound}
          onBack={() => setScreen('game')}
        />
      )}

      {showBalances && (
        <BalancesModal
          players={players} stats={stats}
          currentGame={screen === 'game' ? game : null}
          onClose={() => setShowBalances(false)}
        />
      )}

      {ann && <AnnView ann={ann} onClose={() => { if (annTimer.current) clearTimeout(annTimer.current); setAnn(null); }} />}
    </div>
  );
}
