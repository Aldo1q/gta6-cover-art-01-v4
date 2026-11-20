// Neon Coast Cover Studio — UI wiring, shot modes and PNG export.
import { makeState, freshCrops } from './state.js';
import { renderCover, gridPanelAt } from './render.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const SHOT_LAYOUTS = { grid: 'grid', snapshots: 'snapshots', fullbleed: 'fullbleed' };

const state = makeState();
const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
let img = null;
let showSelection = true;

const $ = (id) => document.getElementById(id);

function syncCropInputs() {
  const c = state.crops[state.selected] ?? state.crops[0];
  if (!c) return;
  $('zoom').value = c.zoom;
  $('offx').value = c.ox;
  $('offy').value = c.oy;
  $('panelHint').textContent = state.layout === 'grid'
    ? `Panel ${state.selected + 1} of 8 selected — sliders crop this panel.`
    : state.layout === 'snapshots'
      ? `Snapshot ${state.selected + 1} of 3 selected — sliders crop this frame.`
      : 'Hero image selected — sliders crop the full-bleed photo.';
}

function syncStars() {
  document.querySelectorAll('#stars button').forEach((b) => {
    b.classList.toggle('lit', Number(b.dataset.star) <= state.heat);
  });
}

function markActive(rowId, attr, value) {
  document.querySelectorAll(`#${rowId} button`).forEach((b) => {
    b.classList.toggle('active', b.dataset[attr] === value);
  });
}

function draw() {
  renderCover(ctx, state, img, canvas.width, canvas.height, { showSelection });
}

function setLayout(layout) {
  state.layout = layout;
  state.crops = freshCrops(layout);
  state.selected = 0;
  markActive('layoutRow', 'layout', layout);
  syncCropInputs();
  draw();
}

function loadSample(name) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => { img = im; resolve(true); };
    im.onerror = () => resolve(false);
    im.src = `samples/${name}.jpg`;
  });
}

// ---------- toolbar wiring ----------
document.querySelectorAll('#layoutRow button').forEach((b) => {
  b.addEventListener('click', () => setLayout(b.dataset.layout));
});
document.querySelectorAll('#gradeRow button').forEach((b) => {
  b.addEventListener('click', () => {
    state.grade = b.dataset.grade;
    markActive('gradeRow', 'grade', state.grade);
    draw();
  });
});
document.querySelectorAll('#sampleRow button').forEach((b) => {
  b.addEventListener('click', async () => {
    markActive('sampleRow', 'sample', b.dataset.sample);
    await loadSample(b.dataset.sample);
    draw();
  });
});
$('upload').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const im = new Image();
  im.onload = () => { img = im; draw(); };
  im.src = url;
});
for (const [id, key] of [['caption', 'caption'], ['accent', 'accent'], ['subtitle', 'subtitle'], ['ribbon', 'ribbon']]) {
  $(id).addEventListener('input', () => { state[key] = $(id).value; draw(); });
}
for (const [id, key] of [['zoom', 'zoom'], ['offx', 'ox'], ['offy', 'oy']]) {
  $(id).addEventListener('input', () => {
    const c = state.crops[state.selected];
    if (c) c[key] = Number($(id).value);
    draw();
  });
}
document.querySelectorAll('#stars button').forEach((b) => {
  b.addEventListener('click', () => { state.heat = Number(b.dataset.star); syncStars(); draw(); });
});
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width;
  const ny = (e.clientY - r.top) / r.height;
  if (state.layout === 'grid') {
    const idx = gridPanelAt(nx, ny);
    if (idx >= 0) { state.selected = idx; syncCropInputs(); draw(); }
  } else if (state.layout === 'snapshots') {
    state.selected = Math.min(2, Math.max(0, Math.floor(nx * 3)));
    syncCropInputs();
    draw();
  }
});
document.querySelectorAll('button.export').forEach((b) => {
  b.addEventListener('click', () => {
    const w = Number(b.dataset.w), h = Number(b.dataset.h);
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    renderCover(off.getContext('2d'), state, img, w, h, { showSelection: false });
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neon-coast-${state.layout}-${w}x${h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  });
});

// ---------- boot / shot modes ----------
async function registerFonts() {
  try {
    const anton = new FontFace('Anton', "url('fonts/anton.woff2')");
    const pacifico = new FontFace('Pacifico', "url('fonts/pacifico.woff2')");
    document.fonts.add(anton);
    document.fonts.add(pacifico);
    await Promise.all([anton.load(), pacifico.load()]);
  } catch { /* CSS @font-face is the fallback */ }
  await document.fonts.ready;
}

async function boot() {
  await registerFonts();

  const photo = params.get('photo') || 'sample-1';
  if (params.get('caption')) {
    state.caption = params.get('caption');
    $('caption').value = state.caption;
  }
  if (params.get('grade')) {
    state.grade = params.get('grade');
    markActive('gradeRow', 'grade', state.grade);
  }

  if (shot && SHOT_LAYOUTS[shot]) {
    document.body.classList.add('shot-clean');
    showSelection = false;
    state.layout = SHOT_LAYOUTS[shot];
    state.crops = freshCrops(state.layout);
    state.selected = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else if (shot === 'editor') {
    state.layout = 'grid';
    state.crops = freshCrops('grid');
    state.selected = 0;
    state.heat = 4;
    if (!params.get('caption')) { state.caption = 'NEON COAST'; $('caption').value = state.caption; }
    markActive('layoutRow', 'layout', 'grid');
    canvas.width = 680;
    canvas.height = 680;
  }

  markActive('sampleRow', 'sample', photo);
  await loadSample(photo);
  syncStars();
  syncCropInputs();
  draw();

  if (shot) {
    // One more frame so fonts/canvas settle before the screenshot fires.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      draw();
      window.__shotReady = true;
      document.title = 'READY';
    }));
  }
}

boot();
