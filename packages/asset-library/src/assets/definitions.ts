import type { AssetDefinition } from "@mity-garden/domain";

// ─── SVG Thumbnail Generators ─────────────────────────────────────────────────
//
// All stroke-widths use fractional values (≤0.5 SVG units) because the viewBox
// is only 64×64. A stroke-width="2" would scale to ~10 px on a 300 px element.

/** Thin-bordered rectangle — base for area elements */
function rectSvg(fill: string, stroke: string, rx = 4): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/></svg>`;
}

/** Thin-bordered circle */
function circleSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/></svg>`;
}

/** Tree: foliage crown + trunk */
function treeSvg(trunkColor: string, crownColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="24" r="20" fill="${crownColor}"/><rect x="28" y="42" width="8" height="16" rx="2" fill="${trunkColor}"/></svg>`;
}

/** Swimming pool with dashed lane-divider lines */
function poolSvg(fill: string, stroke: string, rx = 4): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><line x1="10" y1="21" x2="54" y2="21" stroke="white" stroke-width="0.8" stroke-opacity="0.55" stroke-dasharray="5,3"/><line x1="10" y1="32" x2="54" y2="32" stroke="white" stroke-width="0.8" stroke-opacity="0.55" stroke-dasharray="5,3"/><line x1="10" y1="43" x2="54" y2="43" stroke="white" stroke-width="0.8" stroke-opacity="0.55" stroke-dasharray="5,3"/></svg>`;
}

/** Oval / freeform pool with lane lines */
function ovalPoolSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="30" ry="30" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><line x1="10" y1="24" x2="54" y2="24" stroke="white" stroke-width="0.8" stroke-opacity="0.55" stroke-dasharray="5,3"/><line x1="8" y1="32" x2="56" y2="32" stroke="white" stroke-width="0.8" stroke-opacity="0.55" stroke-dasharray="5,3"/><line x1="10" y1="40" x2="54" y2="40" stroke="white" stroke-width="0.8" stroke-opacity="0.55" stroke-dasharray="5,3"/></svg>`;
}

/** Terrace with tile-grid pattern */
function terraceTileSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><line x1="2" y1="18" x2="62" y2="18" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.5"/><line x1="2" y1="34" x2="62" y2="34" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.5"/><line x1="2" y1="50" x2="62" y2="50" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.5"/><line x1="18" y1="2" x2="18" y2="62" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.5"/><line x1="34" y1="2" x2="34" y2="62" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.5"/><line x1="50" y1="2" x2="50" y2="62" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.5"/></svg>`;
}

/** Wood decking with horizontal plank lines */
function terraceWoodSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><line x1="2" y1="14" x2="62" y2="14" stroke="${stroke}" stroke-width="0.7" stroke-opacity="0.5"/><line x1="2" y1="26" x2="62" y2="26" stroke="${stroke}" stroke-width="0.7" stroke-opacity="0.5"/><line x1="2" y1="38" x2="62" y2="38" stroke="${stroke}" stroke-width="0.7" stroke-opacity="0.5"/><line x1="2" y1="50" x2="62" y2="50" stroke="${stroke}" stroke-width="0.7" stroke-opacity="0.5"/><line x1="32" y1="2" x2="32" y2="14" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.35"/><line x1="32" y1="26" x2="32" y2="38" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.35"/><line x1="32" y1="50" x2="32" y2="62" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.35"/></svg>`;
}

/** Gravel: speckled dot texture */
function gravelSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="#e0dcd6" stroke="#9e9e9e" stroke-width="0.5"/><circle cx="12" cy="12" r="2" fill="#bdbdbd" opacity="0.7"/><circle cx="26" cy="18" r="1.5" fill="#9e9e9e" opacity="0.6"/><circle cx="40" cy="10" r="2.5" fill="#bdbdbd" opacity="0.5"/><circle cx="54" cy="16" r="1.5" fill="#9e9e9e" opacity="0.7"/><circle cx="8" cy="32" r="1.5" fill="#9e9e9e" opacity="0.6"/><circle cx="20" cy="28" r="2" fill="#bdbdbd" opacity="0.7"/><circle cx="34" cy="36" r="1.5" fill="#9e9e9e" opacity="0.5"/><circle cx="48" cy="30" r="2" fill="#bdbdbd" opacity="0.6"/><circle cx="58" cy="38" r="1.5" fill="#9e9e9e" opacity="0.7"/><circle cx="14" cy="48" r="2" fill="#bdbdbd" opacity="0.6"/><circle cx="28" cy="54" r="1.5" fill="#9e9e9e" opacity="0.5"/><circle cx="42" cy="46" r="2.5" fill="#bdbdbd" opacity="0.7"/><circle cx="56" cy="52" r="2" fill="#9e9e9e" opacity="0.6"/></svg>`;
}

/** Grass / lawn with alternating mowing stripe effect */
function grassSvg(fill: string, stroke: string, rx = 2): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><rect x="2" y="2" width="60" height="11" rx="${rx}" fill="${stroke}" opacity="0.08"/><rect x="2" y="24" width="60" height="11" fill="${stroke}" opacity="0.08"/><rect x="2" y="46" width="60" height="11" fill="${stroke}" opacity="0.08"/></svg>`;
}

/** Building / house footprint: crosshatch + door indicator */
function buildingSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><line x1="2" y1="2" x2="62" y2="62" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.2"/><line x1="62" y1="2" x2="2" y2="62" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.2"/><rect x="24" y="44" width="16" height="18" rx="1" fill="${stroke}" opacity="0.3"/></svg>`;
}

/** Greenhouse: glass pane grid + slight white gloss */
function greenhouseSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="2" fill="#b2dfdb" stroke="#00796b" stroke-width="0.5"/><line x1="2" y1="22" x2="62" y2="22" stroke="#00796b" stroke-width="0.5" stroke-opacity="0.4"/><line x1="2" y1="42" x2="62" y2="42" stroke="#00796b" stroke-width="0.5" stroke-opacity="0.4"/><line x1="22" y1="2" x2="22" y2="62" stroke="#00796b" stroke-width="0.5" stroke-opacity="0.4"/><line x1="42" y1="2" x2="42" y2="62" stroke="#00796b" stroke-width="0.5" stroke-opacity="0.4"/><rect x="2" y="2" width="60" height="60" rx="2" fill="white" opacity="0.12"/></svg>`;
}

/** Gazebo / pergola: octagonal silhouette */
function gazeboSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="22,2 42,2 62,22 62,42 42,62 22,62 2,42 2,22" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><circle cx="32" cy="32" r="8" fill="${stroke}" opacity="0.15"/></svg>`;
}

/** Playground: swing-set A-frame icon */
function playgroundSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><line x1="14" y1="10" x2="50" y2="10" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.6" stroke-linecap="round"/><line x1="14" y1="10" x2="24" y2="54" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.6" stroke-linecap="round"/><line x1="50" y1="10" x2="40" y2="54" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.6" stroke-linecap="round"/><line x1="30" y1="10" x2="30" y2="38" stroke="${stroke}" stroke-width="0.8" stroke-opacity="0.5"/><rect x="24" y="38" width="12" height="3" rx="1" fill="${stroke}" opacity="0.6"/></svg>`;
}

/** Sandbox with sand-texture dots */
function sandboxSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="4" fill="#ffe082" stroke="#f9a825" stroke-width="0.5"/><rect x="8" y="8" width="48" height="48" rx="2" fill="#ffecb3" stroke="#f9a825" stroke-width="0.3"/><circle cx="16" cy="20" r="2" fill="#f9a825" opacity="0.4"/><circle cx="30" cy="14" r="1.5" fill="#f9a825" opacity="0.3"/><circle cx="44" cy="22" r="2" fill="#f9a825" opacity="0.4"/><circle cx="20" cy="40" r="1.5" fill="#f9a825" opacity="0.3"/><circle cx="38" cy="44" r="2" fill="#f9a825" opacity="0.4"/><circle cx="50" cy="34" r="1.5" fill="#f9a825" opacity="0.3"/></svg>`;
}

/** Stepping-stone path: ellipse stones */
function steppingStonesSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="#c8c0b0" stroke="#795548" stroke-width="0.5" opacity="0.3"/><ellipse cx="32" cy="10" rx="16" ry="7" fill="#bcaaa4" stroke="#795548" stroke-width="0.5"/><ellipse cx="32" cy="26" rx="14" ry="6" fill="#a1887f" stroke="#795548" stroke-width="0.5"/><ellipse cx="32" cy="42" rx="16" ry="7" fill="#bcaaa4" stroke="#795548" stroke-width="0.5"/><ellipse cx="32" cy="57" rx="14" ry="6" fill="#a1887f" stroke="#795548" stroke-width="0.5"/></svg>`;
}

/** Paved path: offset brick pattern */
function pavedPathSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="#9e9e9e" stroke="#616161" stroke-width="0.5"/><rect x="4" y="4" width="26" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="34" y="4" width="26" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="4" y="19" width="14" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="22" y="19" width="20" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="46" y="19" width="14" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="4" y="34" width="26" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="34" y="34" width="26" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="4" y="49" width="14" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="22" y="49" width="20" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/><rect x="46" y="49" width="14" height="11" rx="1" fill="#bdbdbd" stroke="#757575" stroke-width="0.3"/></svg>`;
}

/** Wooden fence: horizontal board bands */
function fenceSvg(fill: string, stroke: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/><rect x="4" y="4" width="56" height="9" rx="1" fill="${stroke}" opacity="0.2"/><rect x="4" y="17" width="56" height="9" rx="1" fill="${stroke}" opacity="0.2"/><rect x="4" y="30" width="56" height="9" rx="1" fill="${stroke}" opacity="0.2"/><rect x="4" y="43" width="56" height="9" rx="1" fill="${stroke}" opacity="0.2"/><rect x="4" y="56" width="56" height="6" rx="1" fill="${stroke}" opacity="0.2"/></svg>`;
}

/** Brick wall: offset brick rows */
function brickWallSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="#e57373" stroke="#c62828" stroke-width="0.5"/><rect x="4" y="4" width="26" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="34" y="4" width="26" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="4" y="19" width="14" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="22" y="19" width="20" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="46" y="19" width="14" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="4" y="34" width="26" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="34" y="34" width="26" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="4" y="49" width="14" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="22" y="49" width="20" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/><rect x="46" y="49" width="14" height="11" rx="1" fill="#ef9a9a" stroke="#c62828" stroke-width="0.3"/></svg>`;
}

/** Hedge: layered foliage circles */
function hedgeSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#43a047" stroke="#1b5e20" stroke-width="0.5"/><circle cx="14" cy="26" r="14" fill="#4caf50"/><circle cx="32" cy="20" r="16" fill="#66bb6a"/><circle cx="50" cy="26" r="14" fill="#4caf50"/><circle cx="20" cy="44" r="14" fill="#4caf50"/><circle cx="44" cy="44" r="14" fill="#66bb6a"/></svg>`;
}

/** Outdoor dining set: round table + 4 chairs */
function diningSetSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="2" fill="#fff8e1" stroke="#e65100" stroke-width="0.5"/><circle cx="32" cy="32" r="13" fill="#ffb74d" stroke="#e65100" stroke-width="0.5"/><rect x="28" y="7" width="8" height="7" rx="2" fill="#ff8f00" stroke="#e65100" stroke-width="0.3"/><rect x="28" y="50" width="8" height="7" rx="2" fill="#ff8f00" stroke="#e65100" stroke-width="0.3"/><rect x="7" y="28" width="7" height="8" rx="2" fill="#ff8f00" stroke="#e65100" stroke-width="0.3"/><rect x="50" y="28" width="7" height="8" rx="2" fill="#ff8f00" stroke="#e65100" stroke-width="0.3"/></svg>`;
}

/** Outdoor lounge set: sofa + coffee table */
function loungeSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="2" fill="#cfd8dc" stroke="#546e7a" stroke-width="0.5"/><rect x="8" y="18" width="48" height="28" rx="3" fill="#b0bec5" stroke="#546e7a" stroke-width="0.5"/><rect x="8" y="18" width="48" height="9" rx="3" fill="#90a4ae" stroke="#546e7a" stroke-width="0.3"/><rect x="8" y="27" width="6" height="19" rx="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.3"/><rect x="50" y="27" width="6" height="19" rx="2" fill="#90a4ae" stroke="#546e7a" stroke-width="0.3"/><rect x="16" y="50" width="32" height="10" rx="2" fill="#a5d6a7" stroke="#2e7d32" stroke-width="0.3"/></svg>`;
}

/** BBQ / grill with grate lines and legs */
function bbqSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="26" r="22" fill="#ff7043" stroke="#bf360c" stroke-width="0.5"/><circle cx="32" cy="26" r="16" fill="#ff8a65" opacity="0.8"/><line x1="16" y1="26" x2="48" y2="26" stroke="#bf360c" stroke-width="0.8" stroke-opacity="0.5"/><line x1="22" y1="10" x2="22" y2="42" stroke="#bf360c" stroke-width="0.8" stroke-opacity="0.5"/><line x1="32" y1="8" x2="32" y2="44" stroke="#bf360c" stroke-width="0.8" stroke-opacity="0.5"/><line x1="42" y1="10" x2="42" y2="42" stroke="#bf360c" stroke-width="0.8" stroke-opacity="0.5"/><line x1="22" y1="48" x2="18" y2="62" stroke="#bf360c" stroke-width="1.5"/><line x1="42" y1="48" x2="46" y2="62" stroke="#bf360c" stroke-width="1.5"/><line x1="32" y1="48" x2="32" y2="62" stroke="#bf360c" stroke-width="1.5"/></svg>`;
}

// ─── Asset Definitions ────────────────────────────────────────────────────────

export const ASSET_LIBRARY: AssetDefinition[] = [
  // ── Pools ──────────────────────────────────────────────────────────────────
  {
    id: "pool-rectangular",
    type: "pool",
    category: "pool",
    defaultSize: { width: 8, height: 4 },
    minSize: { width: 4, height: 2 },
    maxSize: { width: 20, height: 10 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["pool", "water", "swim"],
    labels: {
      en: { name: "Rectangular Pool", description: "Standard rectangular swimming pool" },
      nl: { name: "Rechthoekig zwembad", description: "Standaard rechthoekig zwembad" },
      fr: { name: "Piscine rectangulaire", description: "Piscine de natation rectangulaire standard" },
    },
    thumbnail: poolSvg("#4fc3f7", "#0277bd", 2),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "pool-oval",
    type: "pool",
    category: "pool",
    defaultSize: { width: 6, height: 4 },
    minSize: { width: 3, height: 2 },
    maxSize: { width: 15, height: 10 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["pool", "water", "oval"],
    labels: {
      en: { name: "Oval Pool", description: "Oval-shaped swimming pool" },
      nl: { name: "Ovaal zwembad", description: "Ovaalvormig zwembad" },
      fr: { name: "Piscine ovale", description: "Piscine de natation de forme ovale" },
    },
    thumbnail: ovalPoolSvg("#4fc3f7", "#0277bd"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "pool-l-shape",
    type: "pool",
    category: "pool",
    defaultSize: { width: 10, height: 6 },
    minSize: { width: 6, height: 4 },
    customSizable: false,
    resizable: true,
    rotatable: true,
    tags: ["pool", "water", "l-shape"],
    labels: {
      en: { name: "L-Shape Pool", description: "L-shaped swimming pool" },
      nl: { name: "L-vormig zwembad", description: "L-vormig zwembad" },
      fr: { name: "Piscine en L", description: "Piscine de natation en forme de L" },
    },
    thumbnail: poolSvg("#4fc3f7", "#0277bd", 0),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "pool-freeform",
    type: "pool",
    category: "pool",
    defaultSize: { width: 8, height: 5 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["pool", "water", "freeform", "organic"],
    labels: {
      en: { name: "Freeform Pool", description: "Organic freeform swimming pool" },
      nl: { name: "Vrijvormig zwembad", description: "Organisch vrijvormig zwembad" },
      fr: { name: "Piscine libre", description: "Piscine de natation à forme libre" },
    },
    thumbnail: ovalPoolSvg("#29b6f6", "#0277bd"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "pool-plunge",
    type: "pool",
    category: "pool",
    defaultSize: { width: 3, height: 2 },
    minSize: { width: 2, height: 1.5 },
    maxSize: { width: 5, height: 4 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["pool", "water", "plunge", "small"],
    labels: {
      en: { name: "Plunge Pool", description: "Compact plunge or dip pool" },
      nl: { name: "Plonsbad", description: "Compact plonsbad" },
      fr: { name: "Bassin plongeoir", description: "Petit bassin de plongeon compact" },
    },
    thumbnail: poolSvg("#80d8ff", "#0277bd", 8),
    constraints: { snapToGrid: true, allowOverlap: false },
  },

  // ── Trees ──────────────────────────────────────────────────────────────────
  {
    id: "tree-oak",
    type: "tree",
    category: "tree",
    defaultSize: { width: 8, height: 8 },
    minSize: { width: 3, height: 3 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["tree", "deciduous", "oak", "large"],
    labels: {
      en: { name: "Oak Tree", description: "Large deciduous oak tree" },
      nl: { name: "Eik", description: "Grote bladverliezende eik" },
      fr: { name: "Chêne", description: "Grand chêne à feuilles caduques" },
    },
    thumbnail: treeSvg("#795548", "#388e3c"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "tree-pine",
    type: "tree",
    category: "tree",
    defaultSize: { width: 4, height: 4 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["tree", "conifer", "pine", "evergreen"],
    labels: {
      en: { name: "Pine Tree", description: "Evergreen pine tree" },
      nl: { name: "Den", description: "Groenblijvende den" },
      fr: { name: "Pin", description: "Pin à feuilles persistantes" },
    },
    thumbnail: treeSvg("#5d4037", "#1b5e20"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "tree-birch",
    type: "tree",
    category: "tree",
    defaultSize: { width: 5, height: 5 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["tree", "deciduous", "birch"],
    labels: {
      en: { name: "Birch Tree", description: "Slender white-barked birch" },
      nl: { name: "Berk", description: "Slanke berk met witte bast" },
      fr: { name: "Bouleau", description: "Bouleau élancé à écorce blanche" },
    },
    thumbnail: treeSvg("#9e9e9e", "#66bb6a"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "tree-apple",
    type: "tree",
    category: "tree",
    defaultSize: { width: 5, height: 5 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["tree", "fruit", "apple"],
    labels: {
      en: { name: "Apple Tree", description: "Fruit-bearing apple tree" },
      nl: { name: "Appelboom", description: "Vruchtdragende appelboom" },
      fr: { name: "Pommier", description: "Pommier fruitier" },
    },
    thumbnail: treeSvg("#8d6e63", "#ef9a9a"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "tree-palm",
    type: "tree",
    category: "tree",
    defaultSize: { width: 4, height: 4 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["tree", "tropical", "palm", "mediterranean"],
    labels: {
      en: { name: "Palm Tree", description: "Tropical palm tree" },
      nl: { name: "Palmboom", description: "Tropische palmboom" },
      fr: { name: "Palmier", description: "Palmier tropical" },
    },
    thumbnail: treeSvg("#a1887f", "#8bc34a"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "tree-magnolia",
    type: "tree",
    category: "tree",
    defaultSize: { width: 6, height: 6 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["tree", "flowering", "magnolia"],
    labels: {
      en: { name: "Magnolia Tree", description: "Ornamental magnolia with seasonal flowers" },
      nl: { name: "Magnolia", description: "Siermagnolia met seizoensbloemen" },
      fr: { name: "Magnolia", description: "Magnolia ornemental à fleurs saisonnières" },
    },
    thumbnail: treeSvg("#8d6e63", "#f48fb1"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "tree-bamboo",
    type: "tree",
    category: "tree",
    defaultSize: { width: 3, height: 6 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["bamboo", "screen", "privacy", "fast-growing"],
    labels: {
      en: { name: "Bamboo Screen", description: "Fast-growing bamboo privacy screen" },
      nl: { name: "Bamboescherm", description: "Snelgroeiend bamboeprivacyscherm" },
      fr: { name: "Écran de bambou", description: "Écran de bambou à croissance rapide" },
    },
    thumbnail: treeSvg("#558b2f", "#aed581"),
    constraints: { snapToGrid: false, allowOverlap: true },
  },
  {
    id: "tree-weeping-willow",
    type: "tree",
    category: "tree",
    defaultSize: { width: 10, height: 10 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["tree", "willow", "water", "large"],
    labels: {
      en: { name: "Weeping Willow", description: "Large weeping willow, ideal near water" },
      nl: { name: "Treurwilg", description: "Grote treurwilg, ideaal bij water" },
      fr: { name: "Saule pleureur", description: "Grand saule pleureur, idéal près de l'eau" },
    },
    thumbnail: treeSvg("#6d4c41", "#9ccc65"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },

  // ── Plants ─────────────────────────────────────────────────────────────────
  {
    id: "plant-rose-bush",
    type: "plant",
    category: "plant",
    defaultSize: { width: 1, height: 1 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["plant", "flower", "rose", "fragrant"],
    labels: {
      en: { name: "Rose Bush", description: "Classic flowering rose bush" },
      nl: { name: "Rozenstruik", description: "Klassieke bloeiende rozenstruik" },
      fr: { name: "Rosier", description: "Rosier classique à fleurs" },
    },
    thumbnail: circleSvg("#e91e63", "#880e4f"),
    constraints: { snapToGrid: false, allowOverlap: true },
  },
  {
    id: "plant-lavender",
    type: "plant",
    category: "plant",
    defaultSize: { width: 0.6, height: 0.6 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["plant", "lavender", "aromatic", "bee-friendly"],
    labels: {
      en: { name: "Lavender", description: "Fragrant purple lavender" },
      nl: { name: "Lavendel", description: "Geurige paarse lavendel" },
      fr: { name: "Lavande", description: "Lavande violette parfumée" },
    },
    thumbnail: circleSvg("#9c27b0", "#6a1b9a"),
    constraints: { snapToGrid: false, allowOverlap: true },
  },
  {
    id: "plant-boxwood",
    type: "plant",
    category: "plant",
    defaultSize: { width: 0.8, height: 0.8 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["plant", "boxwood", "hedge", "topiary", "evergreen"],
    labels: {
      en: { name: "Boxwood", description: "Evergreen boxwood for hedges and topiary" },
      nl: { name: "Buxus", description: "Groenblijvende buxus voor hagen en vormsnoei" },
      fr: { name: "Buis", description: "Buis persistant pour haies et topiaires" },
    },
    thumbnail: circleSvg("#33691e", "#1b5e20"),
    constraints: { snapToGrid: false, allowOverlap: true },
  },
  {
    id: "plant-hydrangea",
    type: "plant",
    category: "plant",
    defaultSize: { width: 1.5, height: 1.5 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["plant", "hydrangea", "flower", "shrub"],
    labels: {
      en: { name: "Hydrangea", description: "Large flowering hydrangea shrub" },
      nl: { name: "Hortensia", description: "Grote bloeiende hortensia" },
      fr: { name: "Hortensia", description: "Grand arbuste à fleurs d'hortensia" },
    },
    thumbnail: circleSvg("#7b1fa2", "#4a148c"),
    constraints: { snapToGrid: false, allowOverlap: true },
  },
  {
    id: "plant-ornamental-grass",
    type: "plant",
    category: "plant",
    defaultSize: { width: 1, height: 1 },
    customSizable: false,
    resizable: true,
    rotatable: false,
    tags: ["plant", "grass", "ornamental", "low-maintenance"],
    labels: {
      en: { name: "Ornamental Grass", description: "Decorative ornamental grass clump" },
      nl: { name: "Siergras", description: "Decoratieve siergrasstruik" },
      fr: { name: "Herbe ornementale", description: "Touffes d'herbes ornementales" },
    },
    thumbnail: circleSvg("#9ccc65", "#558b2f"),
    constraints: { snapToGrid: false, allowOverlap: true },
  },

  // ── Terrace Tiles ──────────────────────────────────────────────────────────
  {
    id: "terrace-concrete",
    type: "terrace-tile",
    category: "terrace-tile",
    defaultSize: { width: 6, height: 4 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["terrace", "concrete", "paved"],
    labels: {
      en: { name: "Concrete Terrace", description: "Poured or tiled concrete terrace" },
      nl: { name: "Betonnen terras", description: "Gegoten of betegeld betonnen terras" },
      fr: { name: "Terrasse en béton", description: "Terrasse en béton coulé ou carrelé" },
    },
    thumbnail: terraceTileSvg("#bdbdbd", "#757575"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "terrace-natural-stone",
    type: "terrace-tile",
    category: "terrace-tile",
    defaultSize: { width: 6, height: 4 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["terrace", "stone", "natural", "classic"],
    labels: {
      en: { name: "Natural Stone Terrace", description: "Natural stone paving" },
      nl: { name: "Natuursteen terras", description: "Bestrating van natuursteen" },
      fr: { name: "Terrasse en pierre naturelle", description: "Dallage en pierre naturelle" },
    },
    thumbnail: terraceTileSvg("#bcaaa4", "#795548"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "terrace-wood-decking",
    type: "terrace-tile",
    category: "terrace-tile",
    defaultSize: { width: 6, height: 4 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["terrace", "wood", "decking", "warm"],
    labels: {
      en: { name: "Wood Decking", description: "Hardwood or composite decking boards" },
      nl: { name: "Houten terras", description: "Hardhouten of composiet terrasplanken" },
      fr: { name: "Terrasse en bois", description: "Planches de terrasse en bois dur ou composite" },
    },
    thumbnail: terraceWoodSvg("#a1887f", "#5d4037"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "terrace-gravel",
    type: "terrace-tile",
    category: "terrace-tile",
    defaultSize: { width: 6, height: 4 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["terrace", "gravel", "low-maintenance"],
    labels: {
      en: { name: "Gravel Area", description: "Decorative gravel surface" },
      nl: { name: "Grindzône", description: "Decoratief grindoppervlak" },
      fr: { name: "Zone de gravier", description: "Surface en gravier décoratif" },
    },
    thumbnail: gravelSvg(),
    constraints: { snapToGrid: true, allowOverlap: false },
  },

  // ── Grass Zones ────────────────────────────────────────────────────────────
  {
    id: "grass-lawn",
    type: "grass-zone",
    category: "grass-zone",
    defaultSize: { width: 10, height: 8 },
    customSizable: true,
    resizable: true,
    rotatable: false,
    tags: ["grass", "lawn", "green"],
    labels: {
      en: { name: "Lawn", description: "Standard mowed lawn area" },
      nl: { name: "Gazon", description: "Standaard gemaaid gazonoppervlak" },
      fr: { name: "Pelouse", description: "Zone de pelouse tondue standard" },
    },
    thumbnail: grassSvg("#66bb6a", "#2e7d32", 2),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "grass-meadow",
    type: "grass-zone",
    category: "grass-zone",
    defaultSize: { width: 10, height: 8 },
    customSizable: true,
    resizable: true,
    rotatable: false,
    tags: ["grass", "meadow", "wildflower", "natural"],
    labels: {
      en: { name: "Wildflower Meadow", description: "Natural wildflower meadow zone" },
      nl: { name: "Bloemenweiland", description: "Natuurlijke zone met veldbloemen" },
      fr: { name: "Prairie fleurie", description: "Zone de prairie naturelle avec fleurs sauvages" },
    },
    thumbnail: grassSvg("#aed581", "#558b2f", 2),
    constraints: { snapToGrid: true, allowOverlap: false },
  },

  // ── Playground ─────────────────────────────────────────────────────────────
  {
    id: "playground-swingset",
    type: "playground",
    category: "playground",
    defaultSize: { width: 3, height: 2 },
    customSizable: false,
    resizable: false,
    rotatable: true,
    tags: ["playground", "swing", "children"],
    labels: {
      en: { name: "Swing Set", description: "Children's swing set" },
      nl: { name: "Schommelrek", description: "Kinderschommelrek" },
      fr: { name: "Portique de balançoire", description: "Portique de balançoire pour enfants" },
    },
    thumbnail: playgroundSvg("#ffca28", "#f57f17"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "playground-sandbox",
    type: "playground",
    category: "playground",
    defaultSize: { width: 2, height: 2 },
    customSizable: true,
    resizable: true,
    rotatable: false,
    tags: ["playground", "sandbox", "children"],
    labels: {
      en: { name: "Sandbox", description: "Children's sandpit" },
      nl: { name: "Zandbak", description: "Kinderzandbak" },
      fr: { name: "Bac à sable", description: "Bac à sable pour enfants" },
    },
    thumbnail: sandboxSvg(),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "playground-trampoline",
    type: "playground",
    category: "playground",
    defaultSize: { width: 3, height: 3 },
    customSizable: false,
    resizable: false,
    rotatable: false,
    tags: ["playground", "trampoline", "children"],
    labels: {
      en: { name: "Trampoline", description: "Round garden trampoline" },
      nl: { name: "Trampoline", description: "Ronde tuintrampoline" },
      fr: { name: "Trampoline", description: "Trampoline de jardin rond" },
    },
    thumbnail: circleSvg("#ff8a65", "#e64a19"),
    constraints: { snapToGrid: false, allowOverlap: false },
  },

  // ── Paths ──────────────────────────────────────────────────────────────────
  {
    id: "path-stepping-stones",
    type: "path",
    category: "path",
    defaultSize: { width: 1, height: 4 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["path", "stepping-stones", "natural"],
    labels: {
      en: { name: "Stepping Stones", description: "Informal stepping stone path" },
      nl: { name: "Stapstenen", description: "Informeel pad met stapstenen" },
      fr: { name: "Pierres de gué", description: "Chemin informel en pierres de gué" },
    },
    thumbnail: steppingStonesSvg(),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "path-paved",
    type: "path",
    category: "path",
    defaultSize: { width: 1.5, height: 6 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["path", "paved", "tile"],
    labels: {
      en: { name: "Paved Path", description: "Tiled or paved garden path" },
      nl: { name: "Betegeld pad", description: "Betegeld of geplaveide tuinpad" },
      fr: { name: "Chemin pavé", description: "Chemin de jardin carrelé ou pavé" },
    },
    thumbnail: pavedPathSvg(),
    constraints: { snapToGrid: true, allowOverlap: false },
  },

  // ── Buildings & Structures ─────────────────────────────────────────────────
  {
    id: "building-house",
    type: "building",
    category: "building",
    defaultSize: { width: 12, height: 10 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["building", "house", "structure", "existing"],
    labels: {
      en: { name: "House / Building", description: "Existing building or house footprint" },
      nl: { name: "Huis / Gebouw", description: "Bestaand gebouw of huis (grondplan)" },
      fr: { name: "Maison / Bâtiment", description: "Empreinte de bâtiment ou maison existant" },
    },
    thumbnail: buildingSvg("#ef9a9a", "#c62828"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "building-shed",
    type: "building",
    category: "building",
    defaultSize: { width: 3, height: 4 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["building", "shed", "storage"],
    labels: {
      en: { name: "Garden Shed", description: "Storage or tool shed" },
      nl: { name: "Tuinhuis", description: "Berging of tuinhuis" },
      fr: { name: "Abri de jardin", description: "Abri de rangement ou d'outils" },
    },
    thumbnail: buildingSvg("#ffab91", "#e64a19"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "building-greenhouse",
    type: "building",
    category: "building",
    defaultSize: { width: 5, height: 3 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["building", "greenhouse", "plants"],
    labels: {
      en: { name: "Greenhouse", description: "Glass or plastic greenhouse" },
      nl: { name: "Serre", description: "Glazen of plastic serre" },
      fr: { name: "Serre", description: "Serre en verre ou en plastique" },
    },
    thumbnail: greenhouseSvg(),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "building-gazebo",
    type: "building",
    category: "building",
    defaultSize: { width: 4, height: 4 },
    customSizable: false,
    resizable: true,
    rotatable: true,
    tags: ["building", "gazebo", "pergola"],
    labels: {
      en: { name: "Gazebo / Pergola", description: "Garden gazebo or pergola structure" },
      nl: { name: "Prieel / Pergola", description: "Tuinprieel of pergola" },
      fr: { name: "Kiosque / Pergola", description: "Kiosque de jardin ou pergola" },
    },
    thumbnail: gazeboSvg("#ffe0b2", "#e65100"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },

  // ── Fences, Walls & Borders ────────────────────────────────────────────────
  {
    id: "fence-wood",
    type: "fence-wall-border",
    category: "fence-wall-border",
    defaultSize: { width: 6, height: 0.15 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["fence", "wood", "privacy"],
    labels: {
      en: { name: "Wooden Fence", description: "Wooden privacy fence panel" },
      nl: { name: "Houten schutting", description: "Houten privacyschutting" },
      fr: { name: "Clôture en bois", description: "Panneau de clôture en bois" },
    },
    thumbnail: fenceSvg("#a1887f", "#5d4037"),
    constraints: { snapToGrid: true, allowOverlap: false },
  },
  {
    id: "fence-hedge",
    type: "fence-wall-border",
    category: "fence-wall-border",
    defaultSize: { width: 6, height: 0.5 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["fence", "hedge", "green", "natural"],
    labels: {
      en: { name: "Hedge", description: "Trimmed garden hedge" },
      nl: { name: "Haag", description: "Gesnoeide tuinhaag" },
      fr: { name: "Haie", description: "Haie de jardin taillée" },
    },
    thumbnail: hedgeSvg(),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "wall-brick",
    type: "fence-wall-border",
    category: "fence-wall-border",
    defaultSize: { width: 6, height: 0.25 },
    customSizable: true,
    resizable: true,
    rotatable: true,
    tags: ["wall", "brick", "masonry"],
    labels: {
      en: { name: "Brick Wall", description: "Solid brick or block wall" },
      nl: { name: "Bakstenen muur", description: "Massieve bakstenen of blokken muur" },
      fr: { name: "Mur en brique", description: "Mur en briques ou parpaings" },
    },
    thumbnail: brickWallSvg(),
    constraints: { snapToGrid: true, allowOverlap: false },
  },

  // ── Outdoor Furniture ──────────────────────────────────────────────────────
  {
    id: "furniture-dining-set",
    type: "furniture",
    category: "furniture",
    defaultSize: { width: 2, height: 2 },
    customSizable: false,
    resizable: false,
    rotatable: true,
    tags: ["furniture", "dining", "table", "chairs"],
    labels: {
      en: { name: "Outdoor Dining Set", description: "Table with 4–6 chairs" },
      nl: { name: "Tuintafelset", description: "Tafel met 4–6 stoelen" },
      fr: { name: "Salon de jardin", description: "Table avec 4 à 6 chaises" },
    },
    thumbnail: diningSetSvg(),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "furniture-lounge-set",
    type: "furniture",
    category: "furniture",
    defaultSize: { width: 3, height: 2 },
    customSizable: false,
    resizable: false,
    rotatable: true,
    tags: ["furniture", "lounge", "sofa", "relax"],
    labels: {
      en: { name: "Lounge Set", description: "Outdoor sofa and lounge chairs" },
      nl: { name: "Loungebank", description: "Buitenbank en loungestoelen" },
      fr: { name: "Salon lounge", description: "Canapé et chaises de salon extérieur" },
    },
    thumbnail: loungeSvg(),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
  {
    id: "furniture-bbq",
    type: "furniture",
    category: "furniture",
    defaultSize: { width: 1, height: 0.6 },
    customSizable: false,
    resizable: false,
    rotatable: true,
    tags: ["furniture", "bbq", "grill", "outdoor-dining"],
    labels: {
      en: { name: "BBQ / Grill", description: "Outdoor barbecue or grill" },
      nl: { name: "Barbecue", description: "Buiten barbecue of grill" },
      fr: { name: "Barbecue", description: "Barbecue ou grill extérieur" },
    },
    thumbnail: bbqSvg(),
    constraints: { snapToGrid: false, allowOverlap: false },
  },
];

// ─── Query helpers ─────────────────────────────────────────────────────────────

export function getAssetById(id: string): AssetDefinition | undefined {
  return ASSET_LIBRARY.find((a) => a.id === id);
}

export function getAssetsByType(type: AssetDefinition["type"]): AssetDefinition[] {
  return ASSET_LIBRARY.filter((a) => a.type === type);
}

export function searchAssets(query: string): AssetDefinition[] {
  const lower = query.toLowerCase();
  return ASSET_LIBRARY.filter(
    (a) =>
      a.id.includes(lower) ||
      a.tags.some((t) => t.includes(lower)) ||
      Object.values(a.labels).some(
        (l) => l.name.toLowerCase().includes(lower) || l.description.toLowerCase().includes(lower)
      )
  );
}

// Group assets by type/category
export function getAssetCategories(): Map<string, AssetDefinition[]> {
  const map = new Map<string, AssetDefinition[]>();
  for (const asset of ASSET_LIBRARY) {
    const existing = map.get(asset.category) ?? [];
    existing.push(asset);
    map.set(asset.category, existing);
  }
  return map;
}
