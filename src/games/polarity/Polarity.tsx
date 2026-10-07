import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import DATA from "./puzzles.json";
import "./Polarity.css";

/* ============================================================
   THE TOTEM — INCEPTION RECURSIVE DREAM GRID
   ============================================================ */

const EMPTY = 0, PM = 1, MP = 2, BLANK = 3, QUERY = 4;

const LAYER_QUOTES = [
  "Discover recursive layers on one core board. Layer 1 is your foundation; each block holds exactly one truth.",
  "Descending deeper into the dream grid. Layer 2 bends perception; paradoxes ripple through the architecture.",
  "Reaching the subconscious core. Layer 3 approaches Limbo; only absolute mathematical alignment stabilizes reality.",
  "Navigating the dream within a dream. Layer 4 unlocks recursive symmetry; beware of structural collapse.",
  "Entering deep architect limbo. Layer 5 demands total polarity synchronization to awaken."
];

/* ============================================================
   INCEPTION FOLDING CITY BACKGROUND WITH ANIMATIONS
   ============================================================ */
const DreamBackground = () => {
  return (
    <div className="totem-bg-container" aria-hidden="true">
      {/* High-Res Inception Folding City Background Layer */}
      <div className="totem-folding-city-art" />
      <div className="totem-folding-city-top-fold" />
      
      {/* 3D Wireframe Folding Grids */}
      <div className="totem-fold-grid totem-fold-grid-bottom" />
      <div className="totem-fold-grid totem-fold-grid-top" />
      
      {/* Ambient Lighting Haze */}
      <div className="totem-city-haze" />
      
      {/* Floating Dream Light Particles */}
      <div className="totem-particles">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="totem-particle" style={{
            left: `${(i * 13 + 7) % 100}%`,
            top: `${(i * 19 + 11) % 100}%`,
            animationDelay: `${(i * 0.4) % 6}s`,
            animationDuration: `${7 + (i % 8)}s`
          }} />
        ))}
      </div>
    </div>
  );
};

/* SVG 3D Spinning Top Totem Emblem */
const SpinningTopIcon = ({ size = 26, spinning = true }) => (
  <svg width={size} height={size} viewBox="0 0 100 120" className={spinning ? "totem-spinning-icon" : ""}>
    <defs>
      <linearGradient id="totemGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff2c6" />
        <stop offset="30%" stopColor="#d4af37" />
        <stop offset="70%" stopColor="#aa7711" />
        <stop offset="100%" stopColor="#442200" />
      </linearGradient>
      <linearGradient id="totemSteelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#666" />
        <stop offset="50%" stopColor="#fff" />
        <stop offset="100%" stopColor="#222" />
      </linearGradient>
    </defs>
    {/* Stem */}
    <rect x="46" y="5" width="8" height="35" rx="4" fill="url(#totemSteelGrad)" />
    {/* Main Body */}
    <path d="M50,15 C65,15 88,45 88,60 C88,72 70,78 50,110 C30,78 12,72 12,60 C12,45 35,15 50,15 Z" fill="url(#totemGoldGrad)" stroke="#332200" strokeWidth="2" />
    {/* Outer Spin Ring */}
    <ellipse cx="50" cy="60" rx="36" ry="10" fill="none" stroke="#ffeecc" strokeWidth="2.5" strokeDasharray="6 4" />
    <ellipse cx="50" cy="60" rx="28" ry="7" fill="none" stroke="#553300" strokeWidth="1.5" />
    {/* Center Core Gem */}
    <circle cx="50" cy="55" r="5" fill="#ffeeaa" />
  </svg>
);

/* Top Header Crest Emblem */
const TopNavCrest = () => (
  <div className="totem-nav-crest-wrapper">
    <svg width="48" height="26" viewBox="0 0 100 60" className="totem-crest-svg">
      <defs>
        <linearGradient id="crestGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffeecc" />
          <stop offset="50%" stopColor="#c49b28" />
          <stop offset="100%" stopColor="#664411" />
        </linearGradient>
      </defs>
      {/* Outer Wings */}
      <polygon points="50,55 0,0 20,0 50,40 80,0 100,0" fill="url(#crestGold)" stroke="#221405" strokeWidth="2" />
      {/* Center Shield */}
      <polygon points="50,58 32,10 68,10" fill="#e6c265" stroke="#442600" strokeWidth="2" />
      <polygon points="50,50 38,15 62,15" fill="#1b2838" />
    </svg>
  </div>
);

/* Mini Animated Domino Preview for Tutorial (Restored Skyscraper Designs!) */
function MiniDominoPreview({ type }) {
  if (type === "charge") {
    return (
      <div className="totem-tut-preview-box">
        <div className="totem-tut-domino">
          <div className="totem-tut-half cyan-img-bg"><small>CYAN SKYLINE</small></div>
          <div className="totem-tut-half dark-img-bg"><small>VOID NIGHT</small></div>
        </div>
      </div>
    );
  }
  if (type === "inert") {
    return (
      <div className="totem-tut-preview-box">
        <div className="totem-tut-domino">
          <div className="totem-tut-half metal-img-bg"><small>INERT TOTEM</small></div>
          <div className="totem-tut-half metal-img-bg"><small>INERT TOTEM</small></div>
        </div>
      </div>
    );
  }
  if (type === "paradox") {
    return (
      <div className="totem-tut-preview-box">
        <div className="totem-tut-domino-pair">
          <div className="totem-tut-domino paradox-alert">
            <div className="totem-tut-half cyan-img-bg" />
            <div className="totem-tut-half dark-img-bg" />
          </div>
          <div className="totem-tut-domino paradox-alert">
            <div className="totem-tut-half cyan-img-bg" />
            <div className="totem-tut-half dark-img-bg" />
          </div>
        </div>
        <span className="totem-tut-alert-tag">⚠️ PARADOX: Direct Cyan touching Cyan!</span>
      </div>
    );
  }
  if (type === "clues") {
    return (
      <div className="totem-tut-preview-box">
        <div className="totem-tut-clues-demo">
          <span className="totem-tut-clue cyan-clue">CYAN PROJECTION: 2</span>
          <span className="totem-tut-clue void-clue">VOID PROJECTION: 1</span>
        </div>
      </div>
    );
  }
  return null;
}

/* ============================================================
   ANIMATED ARCHITECT'S GUIDE
   ============================================================ */
const FULL_STEPS = [
  { 
    title: "1. The Concept of Recursive Dreams",
    body: [
      "Welcome, Architect. You have entered the recursive dream layers of the subconscious mind.",
      "Your goal is to seat dominoes onto the clockwork board until the entire dream layer stabilizes.",
      "Keep your Totem spinning to balance each layer."
    ],
    preview: null
  },
  { 
    title: "2. Placing Active Dominoes (Left-Click / Tap)",
    body: [
      "Left-Click or Tap an unassigned block to place an active domino.",
      "One half becomes Cyan City Skyline while the other half drops into Void Black Night Skyline.",
      "Clicking again flips the domino polarity. A third click clears it."
    ],
    preview: "charge"
  },
  { 
    title: "3. Marking Inert Totem Tiles & Notes (Right-Click)",
    body: [
      "Right-Click or Long-Press to mark a block with the Inert Golden Totem. Inert tiles carry zero polarity and act as blank neutral blocks.",
      "Right-Clicking again leaves a Query (?) note when you know a tile belongs there but haven't decided the polarity yet."
    ],
    preview: "inert"
  },
  { 
    title: "4. The Stability Paradox Rule",
    body: [
      "STABILITY RULE: Two Cyan City tiles can NEVER touch each other directly (up, down, left, right).",
      "Likewise, two Void Black Night tiles can NEVER touch each other directly.",
      "Violating this rule triggers a glowing red Paradox Alert. Inert Totem tiles are completely safe and can touch any tile."
    ],
    preview: "paradox"
  },
  { 
    title: "5. Reading Brass Projection Clues",
    body: [
      "Engraved numbers along the clockwork ring dictate how many of each tile type are needed in that line:",
      "• Top & Left numbers show required Cyan City tiles.",
      "• Bottom & Right numbers show required Void Black Night tiles.",
      "Click any brass badge to cross it off. If a line breaks mathematical logic, the badge turns red."
    ],
    preview: "clues"
  },
  { 
    title: "6. Stabilizing & Progressing Layers",
    body: [
      "When all dominoes are placed and brass projections align without paradoxes, the Dream Layer Stabilizes!",
      "Click 'SAVE PROGRESS' to advance to deeper recursive dream layers.",
      "Use the Layer Selector or Reset button to retry anytime."
    ],
    preview: null
  }
];

function ArchitectGuideModal({ step, setStep, close }) {
  const st = FULL_STEPS[step];
  const last = step === FULL_STEPS.length - 1;

  return (
    <div className="totem-guide-overlay">
      <div className="totem-guide-card animate-guide-card">
        <div className="totem-guide-header">
          <div className="totem-guide-badge">
            <SpinningTopIcon size={22} spinning={true} />
            <span>ARCHITECT'S BRIEFING — SECTOR {step + 1} OF {FULL_STEPS.length}</span>
          </div>
          <button className="totem-close-btn" onClick={close} title="Close Guide">✕</button>
        </div>

        <h3 className="totem-guide-title">{st.title}</h3>

        <div className="totem-guide-content">
          {st.body.map((p, i) => <p key={i} className="totem-guide-text">{p}</p>)}
          {st.preview && <MiniDominoPreview type={st.preview} />}
        </div>

        <div className="totem-guide-progress-bar">
          <div className="totem-guide-progress-fill" style={{ width: `${((step + 1) / FULL_STEPS.length) * 100}%` }} />
        </div>

        <div className="totem-guide-dots">
          {FULL_STEPS.map((_, i) => (
            <span key={i} className={`totem-guide-dot ${i === step ? "active" : ""}`} onClick={() => setStep(i)} />
          ))}
        </div>

        <div className="totem-guide-footer">
          <button className="totem-btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>Back</button>
          {last ? (
            <button className="totem-btn-gold pulse-btn" onClick={close}>INITIALIZE DREAM</button>
          ) : (
            <button className="totem-btn-gold" onClick={() => setStep(s => s + 1)}>Proceed ›</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Generic Info Modal */
function InfoModal({ title, children, close }) {
  return (
    <div className="totem-modal-overlay" onClick={close}>
      <div className="totem-modal-card" onClick={e => e.stopPropagation()}>
        <div className="totem-modal-header">
          <span className="totem-modal-tag">{title.toUpperCase()}</span>
          <button className="totem-close-btn" onClick={close}>✕</button>
        </div>
        <h3 className="totem-modal-title">{title}</h3>
        <div className="totem-modal-body">{children}</div>
        <div className="totem-modal-footer">
          <button className="totem-btn-gold" onClick={close}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN TOTEM GAME COMPONENT
   ============================================================ */
export default function Polarity({ user, onGameOver, onExit }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const levels = DATA.levels;

  const randomIdx = (n, avoid) => {
    if (n <= 1) return 0;
    let i;
    do { i = Math.floor(Math.random() * n); } while (i === avoid);
    return i;
  };

  const [levelIdx, setLevelIdx] = useState(0);
  const [puzzleIdx, setPuzzleIdx] = useState(() => randomIdx(levels[0].puzzles.length, -1));
  const puzzle = levels[levelIdx].puzzles[puzzleIdx];
  const R = puzzle.rows, C = puzzle.cols;

  const [board, setBoard] = useState(() => Array(puzzle.dominoes.length).fill(EMPTY));
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [doneClues, setDoneClues] = useState(() => new Set());
  const [activeModal, setActiveModal] = useState(null); 
  const [showInitialGuide, setShowInitialGuide] = useState(false);
  const [tutStep, setTutStep] = useState(0);
  const [tapMode, setTapMode] = useState("charge");
  const [cursor, setCursor] = useState({ r: 0, c: 0 });
  const [kb, setKb] = useState(false);
  const boardRef = useRef(null);

  const loadPuzzle = (li, pi) => {
    const clampLi = Math.max(0, Math.min(levels.length - 1, li));
    const p = levels[clampLi].puzzles[pi];
    setLevelIdx(clampLi); setPuzzleIdx(pi);
    setBoard(Array(p.dominoes.length).fill(EMPTY));
    setPast([]); setFuture([]); setDoneClues(new Set());
    setCursor({ r: 0, c: 0 });
  };

  const newGame = () => loadPuzzle(levelIdx, randomIdx(levels[levelIdx].puzzles.length, puzzleIdx));
  const pickLevel = (li) => loadPuzzle(li, randomIdx(levels[li].puzzles.length, -1));

  const cellDom = useMemo(() => {
    const m = Array.from({ length: R }, () => Array(C).fill(null));
    puzzle.dominoes.forEach(([r1, c1, r2, c2], d) => {
      m[r1][c1] = { d, k: 0 };
      m[r2][c2] = { d, k: 1 };
    });
    return m;
  }, [puzzle, R, C]);

  const A = useMemo(() => {
    const v = Array.from({ length: R }, () => Array(C).fill(null));
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const cell = cellDom[r][c];
      if (!cell) continue;
      const { d, k } = cell;
      const s = board[d];
      v[r][c] = s === PM ? (k === 0 ? 1 : -1) : s === MP ? (k === 0 ? -1 : 1) : s === BLANK ? 0 : null;
    }
    const pr = Array(R).fill(0), nr = Array(R).fill(0), ur = Array(R).fill(0);
    const pc = Array(C).fill(0), nc = Array(C).fill(0), uc = Array(C).fill(0);
    const conflict = Array.from({ length: R }, () => Array(C).fill(false));

    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const x = v[r][c];
      if (x === null) { ur[r]++; uc[c]++; continue; }
      if (x === 1) { pr[r]++; pc[c]++; }
      if (x === -1) { nr[r]++; nc[c]++; }
      if (x !== 0) {
        if (r + 1 < R && v[r + 1][c] === x) conflict[r][c] = conflict[r + 1][c] = true;
        if (c + 1 < C && v[r][c + 1] === x) conflict[r][c] = conflict[r][c + 1] = true;
      }
    }
    const bad = (cur, und, t) => t != null && (cur > t || cur + und < t);
    const err = {
      top: puzzle.clues.top.map((t, c) => bad(pc[c], uc[c], t)),
      bottom: puzzle.clues.bottom.map((t, c) => bad(nc[c], uc[c], t)),
      left: puzzle.clues.left.map((t, r) => bad(pr[r], ur[r], t)),
      right: puzzle.clues.right.map((t, r) => bad(nr[r], ur[r], t)),
    };
    const allPlaced = board.every((s) => s === PM || s === MP || s === BLANK);
    const anyConflict = conflict.some((row) => row.some(Boolean));
    const anyErr = Object.values(err).some((a) => a.some(Boolean));
    return { v, conflict, err, solved: allPlaced && !anyConflict && !anyErr };
  }, [board, cellDom, puzzle, R, C]);

  const solved = A.solved;

  const [hasScored, setHasScored] = useState(false);
  const [checkState, setCheckState] = useState<"idle" | "wrong">("idle");
  // Auto submit removed. Score is sent when CHECK is clicked.

  useEffect(() => {
    setHasScored(false);
  }, [levelIdx]);

  const commit = useCallback((next) => {
    setPast((p) => [...p, board]);
    setFuture([]);
    setBoard(next);
  }, [board]);

  const leftAct = useCallback((r, c) => {
    if (solved) return;
    const cell = cellDom[r][c];
    if (!cell) return;
    const { d, k } = cell;
    const s = board[d];
    let n;
    if (s === PM || s === MP) {
      const isPlus = (s === PM) === (k === 0);
      n = isPlus ? (s === PM ? MP : PM) : EMPTY;
    } else {
      n = k === 0 ? PM : MP;
    }
    const next = board.slice(); next[d] = n; commit(next);
  }, [board, cellDom, commit, solved]);

  const rightAct = useCallback((r, c) => {
    if (solved) return;
    const cell = cellDom[r][c];
    if (!cell) return;
    const { d } = cell;
    const s = board[d];
    const n = s === BLANK ? QUERY : s === QUERY ? EMPTY : BLANK;
    const next = board.slice(); next[d] = n; commit(next);
  }, [board, cellDom, commit, solved]);

  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture((f) => [board, ...f]);
    setBoard(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
  }, [past, board]);

  const reset = () => {
    if (board.some((s) => s !== EMPTY)) commit(Array(board.length).fill(EMPTY));
    setDoneClues(new Set());
  };

  const toggleClue = (key) =>
    setDoneClues((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const onCellClick = (r, c) => {
    setKb(false);
    tapMode === "inert" ? rightAct(r, c) : leftAct(r, c);
  };

  /* Stats metrics */
  const placedCount = board.filter(s => s !== EMPTY).length;
  const totalDominoes = puzzle.dominoes.length;
  const totalCells = R * C;
  const totalClues = puzzle.clues.top.concat(puzzle.clues.bottom, puzzle.clues.left, puzzle.clues.right).filter(n => n != null).length;

  /* Sizing for Board Canvas */
  const S = 60, M = 46;
  const W = 2 * M + C * S, H = 2 * M + R * S;
  const cx = (c) => M + c * S + S / 2;
  const cy = (r) => M + r * S + S / 2;

  /* Domino Rendering with RESTORED HIGH-RES SKYLINE CITY DESIGNS! */
  const renderDominoCard = ([r1, c1, r2, c2], d) => {
    const s = board[d];
    const minC = Math.min(c1, c2), minR = Math.min(r1, r2);
    const x = M + minC * S + 3, y = M + minR * S + 3;
    const isHoriz = r1 === r2;
    const w = (Math.abs(c2 - c1) + 1) * S - 6;
    const h = (Math.abs(r2 - r1) + 1) * S - 6;
    const cells = [[r1, c1], [r2, c2]];
    const clipId = `${uid}-domino-${d}`;

    return (
      <g key={`dom-${d}`} className="totem-domino-group">
        <defs>
          <clipPath id={clipId}>
            <rect x={x} y={y} width={w} height={h} rx="12" ry="12" />
          </clipPath>
          <linearGradient id={`brassRimGrad-${d}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffeeaa" />
            <stop offset="40%" stopColor="#d4af37" />
            <stop offset="80%" stopColor="#885511" />
            <stop offset="100%" stopColor="#ffeeaa" />
          </linearGradient>
        </defs>

        {/* Heavy 3D Brass Capsule Frame Border */}
        <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx="14" ry="14"
              fill="#06070a" stroke={`url(#brassRimGrad-${d})`} strokeWidth="2"
              filter="drop-shadow(0 3px 8px rgba(0,0,0,0.8))" />

        {/* Clipped Card Body (WITH RESTORED SKYLINE DESIGNS!) */}
        <g clipPath={`url(#${clipId})`}>
          {cells.map(([r, c], k) => {
            const val = A.v[r][c];
            const rx = M + c * S, ry = M + r * S;

            if (s === BLANK) {
              /* Inert Metal Plate with Dual Golden Totems */
              return (
                <g key={k}>
                  <image href="/brass_totem_tile.jpg" x={rx} y={ry} width={S} height={S} preserveAspectRatio="xMidYMid slice" />
                  <rect x={rx} y={ry} width={S} height={S} fill="rgba(0,0,0,0.3)" />
                </g>
              );
            }

            if (s === QUERY) {
              /* Golden Mystery Query */
              return (
                <g key={k}>
                  <image href="/brass_totem_tile.jpg" x={rx} y={ry} width={S} height={S} preserveAspectRatio="xMidYMid slice" />
                  <rect x={rx} y={ry} width={S} height={S} fill="rgba(0,0,0,0.6)" />
                  <text x={rx + S / 2} y={ry + S / 2 + 7} textAnchor="middle" fontSize="22" fontFamily="Cinzel, serif" fontWeight="900" fill="#ffeeaa">?</text>
                </g>
              );
            }

            if (val === 1) {
              /* Positive Cyan Charge — RESTORED CYAN SKYLINE CITY ARTWORK! */
              return (
                <g key={k}>
                  <image href="/cyan_city_skyline.jpg" x={rx} y={ry} width={S} height={S} preserveAspectRatio="xMidYMid slice" />
                  <rect x={rx} y={ry} width={S} height={S} fill="rgba(0, 212, 255, 0.2)" mixBlendMode="overlay" />
                </g>
              );
            }

            if (val === -1) {
              /* Void Negative Charge — RESTORED DARK VOID NIGHT SKYLINE ARTWORK! */
              return (
                <g key={k}>
                  <image href="/dark_void_skyline.jpg" x={rx} y={ry} width={S} height={S} preserveAspectRatio="xMidYMid slice" />
                  <rect x={rx} y={ry} width={S} height={S} fill="rgba(0, 0, 0, 0.35)" />
                </g>
              );
            }

            /* Unseated Empty Domino Blueprint */
            return (
              <g key={k}>
                <rect x={rx} y={ry} width={S} height={S} fill="rgba(15, 20, 30, 0.55)" />
                <rect x={rx + 3} y={ry + 3} width={S - 6} height={S - 6} rx="5" fill="none" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
              </g>
            );
          })}
        </g>

        {/* Divider line for domino */}
        {isHoriz ? (
          <line x1={x + w / 2} y1={y + 3} x2={x + w / 2} y2={y + h - 3} stroke="url(#brassRimGrad-0)" strokeWidth="1.5" />
        ) : (
          <line x1={x + 3} y1={y + h / 2} x2={x + w - 3} y2={y + h / 2} stroke="url(#brassRimGrad-0)" strokeWidth="1.5" />
        )}
      </g>
    );
  };

  /* Clue element badge engraved directly into the clockwork brass ring */
  const renderClueBadge = (key, text, x, y, isErr) => {
    if (text == null) return null;
    const isDone = doneClues.has(key);
    const textColor = isDone ? "#555d6e" : isErr ? "#ff3344" : "#ffeeaa";

    return (
      <g key={key} onClick={() => {
              if (solved && onGameOver && !hasScored) {
                setHasScored(true);
                onGameOver({ score: (levelIdx + 1) * 50, level: "Polarity L" + (levelIdx + 1) });
              } else if (!solved) {
                setCheckState("wrong");
                setTimeout(() => setCheckState("idle"), 1500);
              }
            }}>
        {/* Brass Bevel Ring */}
        <circle cx={x} cy={y} r="16" fill="#141824" stroke="#d4af37" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))" />
        <circle cx={x} cy={y} r="13" fill="none" stroke="#775511" strokeWidth="1" />
        <text x={x} y={y + 5} textAnchor="middle" fontSize="15" fontFamily="Cinzel, serif" fontWeight="900" fill={textColor} style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9)" }}>
          {text}
        </text>
      </g>
    );
  };

  const canPrevLayer = levelIdx > 0;
  const canNextLayer = levelIdx < levels.length - 1;

  return (
    <div className="totem-stage-wrapper">

      <div className="totem-app-card">
        {/* ================= HEADER NAV BAR ================= */}
        <header className="totem-nav-bar">
          <div className="totem-nav-left">
            <button className="totem-nav-link" onClick={() => onExit && onExit()}>EXIT</button>
          </div>
          
          {/* Winged Metallic Crest */}
          <TopNavCrest />

          <div className="totem-nav-right">
            <button className="totem-nav-link" style={{ fontWeight: "bold" }} onClick={() => { setTutStep(0); setShowInitialGuide(true); }}>DEMO</button>
            <button className="totem-nav-link" onClick={() => setActiveModal('about')}>ABOUT</button>
          </div>
        </header>

        {/* ================= TITLE BRAND SECTION ================= */}
        <div className="totem-brand-section">
          {/* Ornate Gold Banner Bracket Header above THE */}
          <div className="totem-banner-bracket">
            <svg width="150" height="15" viewBox="0 0 200 24" className="totem-bracket-svg">
              <path d="M10,20 L40,4 L160,4 L190,20" fill="none" stroke="#d4af37" strokeWidth="2" />
              <circle cx="40" cy="4" r="3" fill="#ffeeaa" />
              <circle cx="160" cy="4" r="3" fill="#ffeeaa" />
            </svg>
            <span className="totem-sub-prefix">THE</span>
          </div>

          {/* 3D Bevelled Title */}
          <h1 className="totem-main-title 3d-totem-title">
            T
            <span className="totem-o-wrapper 3d-o-medallion">
              <SpinningTopIcon size={34} spinning={true} />
            </span>
            TEM
          </h1>

          {/* Unique lore quote */}
          <p className="totem-quote">
            {LAYER_QUOTES[levelIdx] || `Layer ${levelIdx + 1} of the recursive subconscious. Seat the polarities to balance the dream.`}
          </p>
        </div>

        {/* ================= MAIN CORE BOARD FRAME ================= */}
        <main className="totem-board-frame">
          {/* Inner Header Selector Bar */}
          <div className="totem-board-header-bar totem-board-header-centered">
            <div className="totem-layer-dropdown-pill">
              <button className="totem-chevron" disabled={!canPrevLayer} onClick={() => pickLevel(levelIdx - 1)}>‹</button>
              <select className="totem-layer-select-native" value={levelIdx} onChange={(e) => pickLevel(Number(e.target.value))}>
                {levels.map((L, i) => (
                  <option key={L.id} value={i}>Layer {i + 1}</option>
                ))}
              </select>
              <span className="totem-layer-label-text">Layer {levelIdx + 1} ▾</span>
              <button className="totem-chevron" disabled={!canNextLayer} onClick={() => pickLevel(levelIdx + 1)}>›</button>
            </div>
          </div>

          {/* SVG Board Canvas */}
          <div
            className="totem-svg-container"
            tabIndex={0}
            ref={boardRef}
            aria-label="Totem Clockwork Board"
          >
            <svg className="totem-board-svg" viewBox={`0 0 ${W} ${H}`} onContextMenu={(e) => e.preventDefault()}>
              <defs>
                <radialGradient id="dialBgGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1a1e2b" />
                  <stop offset="70%" stopColor="#0f121a" />
                  <stop offset="100%" stopColor="#080a0f" />
                </radialGradient>
              </defs>

              {/* Background Dial / Clockwork Mechanics */}
              <rect x="0" y="0" width={W} height={H} fill="url(#dialBgGrad)" rx="8" />
              
              {/* Heavy Golden Brass Concentric Clockwork Rings */}
              <circle cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.46} fill="none" stroke="#d4af37" strokeWidth="10" opacity="0.2" />
              <circle cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.44} fill="none" stroke="#ffeeaa" strokeWidth="2.5" opacity="0.5" />
              <circle cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.38} fill="none" stroke="#aa7711" strokeWidth="2" strokeDasharray="10 5" opacity="0.6" />
              <circle cx={W / 2} cy={H / 2} r={Math.min(W, H) * 0.28} fill="none" stroke="#ffeeaa" strokeWidth="1" opacity="0.3" />

              {/* Grid cell guide borders */}
              {Array.from({ length: R }).map((_, r) => Array.from({ length: C }).map((__, c) => (
                <rect key={`grid-${r}-${c}`} x={M + c * S + 2} y={M + r * S + 2} width={S - 4} height={S - 4}
                      rx="6" fill="rgba(18, 22, 32, 0.6)" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="1" />
              )))}

              {/* Render Dominoes */}
              {puzzle.dominoes.map(renderDominoCard)}

              {/* Paradox Conflict Overlay */}
              {A.conflict.map((row, r) => row.map((bad, c) => bad && (
                <rect key={`conf-${r}-${c}`} x={M + c * S + 3} y={M + r * S + 3} width={S - 6} height={S - 6}
                      rx="6" fill="none" stroke="#ff3344" strokeWidth="3" className="totem-conflict-pulse" pointerEvents="none" />
              )))}

              {/* Click Interceptors */}
              {Array.from({ length: R }).map((_, r) => Array.from({ length: C }).map((__, c) => (
                <rect key={`act-${r}-${c}`} x={M + c * S} y={M + r * S} width={S} height={S} fill="transparent"
                      style={{ cursor: solved ? "default" : "pointer" }}
                      onClick={() => onCellClick(r, c)}
                      onContextMenu={(e) => { e.preventDefault(); rightAct(r, c); }} />
              )))}

              {/* Render Clue Badges along clockwork edge */}
              {puzzle.clues.top.map((t, c) => renderClueBadge(`top-${c}`, t, cx(c), M / 2, A.err.top[c]))}
              {puzzle.clues.bottom.map((t, c) => renderClueBadge(`bottom-${c}`, t, cx(c), H - M / 2, A.err.bottom[c]))}
              {puzzle.clues.left.map((t, r) => renderClueBadge(`left-${r}`, t, M / 2, cy(r), A.err.left[r]))}
              {puzzle.clues.right.map((t, r) => renderClueBadge(`right-${r}`, t, W - M / 2, cy(r), A.err.right[r]))}
            </svg>
          </div>
        </main>

        {/* ================= BOTTOM DASHBOARD PANEL ================= */}
        <footer className="totem-dashboard-panel">
          {/* Stats Columns */}
          <div className="totem-stats-grid">
            <div className="totem-stat-box">
              <span className="totem-stat-label">LAYER</span>
              <span className="totem-stat-val">{levelIdx + 1}</span>
            </div>
            <div className="totem-stat-box">
              <span className="totem-stat-label">CLUES</span>
              <span className="totem-stat-val">{totalClues}</span>
            </div>
            <div className="totem-stat-box">
              <span className="totem-stat-label">SEATED</span>
              <span className="totem-stat-val">{placedCount}/{totalDominoes}</span>
            </div>
          </div>

          <div className="totem-divider-line">
            <span className="totem-divider-gem" />
          </div>

          {/* Interactive Controls Row */}
          <div className="totem-controls-row">
            {/* Layer Select Stepper */}
            <div className="totem-stepper-container">
              <span className="totem-stepper-title">LAYER SELECT</span>
              <div className="totem-stepper-box">
                <button className="totem-step-btn" disabled={!canPrevLayer} onClick={() => pickLevel(levelIdx - 1)}>‹</button>
                <span className="totem-step-num">{levelIdx + 1}</span>
                <button className="totem-step-btn" disabled={!canNextLayer} onClick={() => pickLevel(levelIdx + 1)}>›</button>
              </div>
            </div>

            {/* Action Coins Group */}
            <div className="totem-coins-group">
              {/* Architect Guide Coin */}
              <div className="totem-coin-item" onClick={() => { setTutStep(0); setShowInitialGuide(true); }}>
                <div className="totem-coin totem-coin-gold">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <span className="totem-coin-label">GUIDE</span>
              </div>

              {/* Undo Coin */}
              <div className="totem-coin-item" onClick={undo} style={{ opacity: past.length ? 1 : 0.4 }}>
                <div className="totem-coin totem-coin-teal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                    <path d="M3 7v6h6" />
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                  </svg>
                </div>
                <span className="totem-coin-label">UNDO</span>
              </div>

              {/* Reset Coin */}
              <div className="totem-coin-item" onClick={reset}>
                <div className="totem-coin totem-coin-ruby">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
                    <path d="M21.5 2v6h-6" />
                    <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                </div>
                <span className="totem-coin-label">RESET</span>
              </div>
            </div>

            {/* Spinning Totem Graphic on Dial */}
            <div className="totem-dial-spin-area" title="Click to spin the Totem" onClick={newGame}>
              <div className="totem-compass-ring" />
              <SpinningTopIcon size={38} spinning={true} />
            </div>
          </div>

          {/* Primary Save / Check Action Pill Button */}
          <div className="totem-save-btn-wrapper">
            <button className={`totem-save-btn ${solved ? "solved-glow" : ""}`} onClick={() => { if (solved && onGameOver && !hasScored) { setHasScored(true); onGameOver({ score: (levelIdx + 1) * 50, level: "Polarity L" + (levelIdx + 1) }); } }}>
              <span className="totem-gem-left" />
              <span className="totem-save-text">{solved ? "STABILIZED!" : checkState === "wrong" ? "INCORRECT" : "CHECK"}</span>
              <span className="totem-gem-right" />
            </button>
          </div>

          {/* Bottom Progress Text */}
          <div className="totem-progress-line">
            RECURSIVE PROGRESS: {placedCount} of {totalDominoes} layers placed
          </div>
        </footer>

        {/* Footer Nav Links */}
        <div className="totem-footer-nav totem-footer-centered">
          <button onClick={() => setActiveModal('leaderboard')}>LEADERBOARD</button>
        </div>
      </div>

      {/* Automatic Animated Architect's Guide at Start */}
      {showInitialGuide && (
        <ArchitectGuideModal step={tutStep} setStep={setTutStep} close={() => setShowInitialGuide(false)} />
      )}

      {/* Nav Modals */}
      {activeModal === 'story' && (
        <InfoModal title="The Story of The Totem" close={() => setActiveModal(null)}>
          <p>You are the Architect, exploring recursive layers of the subconscious mind. Every board represents a dream layer.</p>
          <p>Your totem tells you whether you are in reality or caught in an unstable dream paradox. Seat all polarity blocks correctly to stabilize the dream state.</p>
        </InfoModal>
      )}

      {activeModal === 'about' && (
        <InfoModal title="About The Architecture" close={() => setActiveModal(null)}>
          <p>Controls & Interactions:</p>
          <ul>
            <li><strong>Left Click / Tap:</strong> Places Cyan City tile, then Void Night tile, then clears.</li>
            <li><strong>Right Click / Long Tap:</strong> Marks Inert Totem tile or Query note (?).</li>
          </ul>
          <button className="totem-btn-gold" style={{ marginTop: '10px', width: '100%' }} onClick={() => { setActiveModal(null); setTutStep(0); setShowInitialGuide(true); }}>
            Open Full Architect Guide
          </button>
        </InfoModal>
      )}

      {activeModal === 'leaderboard' && (
        <InfoModal title="Architect Leaderboard" close={() => setActiveModal(null)}>
          <p>Layer 1: Stabilized (100%)</p>
          <p>Layer 2: In Progress</p>
          <p>Layer 3: Locked</p>
        </InfoModal>
      )}

      {activeModal === 'settings' && (
        <InfoModal title="Architect Settings" close={() => setActiveModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" defaultChecked /> Atmospheric Folding City Background & Animations
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" defaultChecked /> High Resolution Skyscrapers
            </label>
            <button className="totem-btn-secondary" onClick={() => setTapMode(m => m === "charge" ? "inert" : "charge")}>
              Tap Intent Mode: {tapMode.toUpperCase()}
            </button>
          </div>
        </InfoModal>
      )}
    </div>
  );
}