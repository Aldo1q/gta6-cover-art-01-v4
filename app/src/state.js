// Shared state + grade definitions for Neon Coast Cover Studio.

export const GRADES = {
  none:   { filter: '', stops: null, tint: null },
  sunset: {
    filter: 'saturate(1.35) contrast(1.08) sepia(0.28) hue-rotate(-10deg) brightness(1.03)',
    stops: ['rgba(255,122,26,0.55)', 'rgba(255,46,136,0.18)', 'rgba(14,116,144,0.55)'],
    tint: 'rgba(255,140,40,0.10)',
  },
  neon: {
    filter: 'saturate(1.65) contrast(1.16) hue-rotate(14deg) brightness(1.04)',
    stops: ['rgba(255,0,170,0.5)', 'rgba(120,0,255,0.16)', 'rgba(0,220,255,0.5)'],
    tint: 'rgba(200,0,255,0.08)',
  },
  vice: {
    filter: 'saturate(1.28) contrast(1.03) brightness(1.07) hue-rotate(-6deg)',
    stops: ['rgba(255,105,180,0.42)', 'rgba(255,190,220,0.10)', 'rgba(46,230,214,0.42)'],
    tint: 'rgba(255,120,190,0.08)',
  },
};

// The 8 Cover Grid panels as fractions of the cover (x, y, w, h in a 4x3 lattice).
export const GRID_CELLS = [
  { x: 0, y: 0, w: 2, h: 2 },
  { x: 2, y: 0, w: 1, h: 1 },
  { x: 3, y: 0, w: 1, h: 1 },
  { x: 2, y: 1, w: 2, h: 1 },
  { x: 0, y: 2, w: 1, h: 1 },
  { x: 1, y: 2, w: 1, h: 1 },
  { x: 2, y: 2, w: 1, h: 1 },
  { x: 3, y: 2, w: 1, h: 1 },
];

// A distinct deterministic crop per panel so one photo reads as a collage.
const GRID_CROPS = [
  { zoom: 1.05, ox: 0.0, oy: 0.0 },
  { zoom: 1.7, ox: -0.18, oy: -0.22 },
  { zoom: 1.9, ox: 0.2, oy: -0.1 },
  { zoom: 1.35, ox: 0.05, oy: 0.18 },
  { zoom: 1.6, ox: -0.22, oy: 0.12 },
  { zoom: 2.1, ox: 0.12, oy: -0.25 },
  { zoom: 1.5, ox: 0.24, oy: 0.2 },
  { zoom: 1.85, ox: -0.08, oy: 0.28 },
];

const SNAP_CROPS = [
  { zoom: 1.15, ox: -0.05, oy: -0.05 },
  { zoom: 1.55, ox: 0.14, oy: 0.05 },
  { zoom: 1.4, ox: -0.16, oy: 0.16 },
];

export function freshCrops(layout) {
  const src = layout === 'snapshots' ? SNAP_CROPS : layout === 'grid' ? GRID_CROPS : [{ zoom: 1.05, ox: 0, oy: 0 }];
  return src.map((c) => ({ ...c }));
}

export function makeState() {
  return {
    layout: 'grid',
    grade: 'vice',
    caption: 'NEON COAST',
    accent: 'vice nights',
    subtitle: 'ONE CITY · NO BRAKES · ALL SUMMER',
    ribbon: 'NEON COAST',
    heat: 4,
    selected: 0,
    crops: freshCrops('grid'),
  };
}
