// Canvas renderer: draws the full cover composition for any layout/grade.
import { GRADES, GRID_CELLS } from './state.js';

function drawPhoto(ctx, img, x, y, w, h, crop, grade) {
  if (!img) {
    ctx.fillStyle = '#263069';
    ctx.fillRect(x, y, w, h);
    return;
  }
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (crop?.zoom ?? 1);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = x + (w - dw) / 2 + (crop?.ox ?? 0) * w;
  const dy = y + (h - dh) / 2 + (crop?.oy ?? 0) * h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = grade.filter || 'none';
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  if (grade.stops) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, grade.stops[0]);
    g.addColorStop(0.52, grade.stops[1]);
    g.addColorStop(1, grade.stops[2]);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
    if (grade.tint) {
      ctx.fillStyle = grade.tint;
      ctx.fillRect(x, y, w, h);
    }
  }
  ctx.restore();
}

function archedCaption(ctx, text, cx, topY, size) {
  const label = (text || '').toUpperCase();
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const widths = [...label].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + (label.length - 1) * size * 0.06;
  const radius = total * 2.4;
  let cursor = -total / 2;
  ctx.shadowColor = 'rgba(255,46,136,0.95)';
  ctx.shadowBlur = size * 0.28;
  [...label].forEach((ch, i) => {
    const w = widths[i];
    const mid = cursor + w / 2;
    const ang = mid / radius;
    ctx.save();
    ctx.translate(cx + Math.sin(ang) * radius, topY + (1 - Math.cos(ang)) * radius);
    ctx.rotate(ang);
    ctx.transform(1, 0, -0.07, 1, 0, 0);
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = '#12081f';
    ctx.lineJoin = 'round';
    ctx.strokeText(ch, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    cursor += w + size * 0.06;
  });
  ctx.restore();
  return size * 1.18;
}

function scriptAccent(ctx, text, cx, y, size) {
  if (!text) return 0;
  ctx.save();
  ctx.font = `${size}px Pacifico, cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = size * 0.18;
  ctx.shadowOffsetY = size * 0.06;
  ctx.fillStyle = '#ff5ca8';
  ctx.fillText(text, cx, y);
  ctx.restore();
  return size * 1.25;
}

function subtitleLine(ctx, text, cx, y, size) {
  if (!text) return;
  ctx.save();
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  try { ctx.letterSpacing = `${Math.round(size * 0.32)}px`; } catch { /* older engines */ }
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = size * 0.3;
  ctx.fillStyle = '#ffe9f4';
  ctx.fillText(text.toUpperCase(), cx, y);
  ctx.restore();
}

function ribbonBadge(ctx, text, W, H) {
  if (!text) return;
  const s = Math.min(W, H);
  ctx.save();
  ctx.translate(W * 0.115, H * 0.105);
  ctx.rotate(-0.62);
  ctx.fillStyle = '#ff2e88';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = s * 0.012;
  const w = s * 0.34, h = s * 0.052;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.shadowBlur = 0;
  ctx.font = `${Math.round(s * 0.03)}px Anton, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text.toUpperCase(), 0, 1);
  ctx.restore();
}

function heatStars(ctx, heat, W, H) {
  const s = Math.min(W, H);
  const size = s * 0.045;
  ctx.save();
  ctx.font = `${size}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < 5; i++) {
    const x = W - s * 0.035 - (5 - i) * size * 1.12;
    const y = H - s * 0.028;
    ctx.shadowBlur = i < heat ? size * 0.35 : 0;
    ctx.shadowColor = '#ff7b00';
    ctx.fillStyle = i < heat ? '#ffb400' : 'rgba(255,255,255,0.35)';
    ctx.fillText('★', x, y);
  }
  ctx.restore();
}

function innerFrame(ctx, W, H) {
  const s = Math.min(W, H);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, s * 0.004);
  const m = s * 0.022;
  ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
  ctx.restore();
}

function letteringBlock(ctx, st, W, H, topFrac) {
  const s = Math.min(W, H);
  let y = H * topFrac;
  y += archedCaption(ctx, st.caption, W / 2, y, s * 0.105);
  y += scriptAccent(ctx, st.accent, W / 2, y - s * 0.018, s * 0.052) - s * 0.01;
  subtitleLine(ctx, st.subtitle, W / 2, H - s * 0.085, s * 0.026);
  return y;
}

function layoutGrid(ctx, st, img, W, H, opts) {
  const grade = GRADES[st.grade] ?? GRADES.none;
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, W, H);
  const gap = Math.min(W, H) * 0.012;
  const cw = W / 4, ch = H / 3;
  GRID_CELLS.forEach((cell, i) => {
    const x = cell.x * cw + gap / 2, y = cell.y * ch + gap / 2;
    const w = cell.w * cw - gap, h = cell.h * ch - gap;
    drawPhoto(ctx, img, x, y, w, h, st.crops[i], grade);
    if (opts.showSelection && i === st.selected) {
      ctx.save();
      ctx.strokeStyle = '#2ee6d6';
      ctx.lineWidth = Math.max(3, Math.min(W, H) * 0.008);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
  });
  // Lettering band across the middle-lower area, on a soft scrim.
  const s = Math.min(W, H);
  const scrim = ctx.createLinearGradient(0, H * 0.52, 0, H);
  scrim.addColorStop(0, 'rgba(8,4,20,0)');
  scrim.addColorStop(0.45, 'rgba(8,4,20,0.55)');
  scrim.addColorStop(1, 'rgba(8,4,20,0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.52, W, H * 0.48);
  letteringBlock(ctx, st, W, H, 0.60);
  ribbonBadge(ctx, st.ribbon, W, H);
  heatStars(ctx, st.heat, W, H);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(4, s * 0.012);
  ctx.strokeRect(0, 0, W, H);
  innerFrame(ctx, W, H);
}

function layoutSnapshots(ctx, st, img, W, H) {
  const grade = GRADES[st.grade] ?? GRADES.none;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#241047');
  bg.addColorStop(0.55, '#120a2c');
  bg.addColorStop(1, '#0a2e3a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const s = Math.min(W, H);
  const pw = W * 0.46, ph = H * 0.52;
  const frames = [
    { cx: W * 0.30, cy: H * 0.50, rot: -0.14 },
    { cx: W * 0.56, cy: H * 0.44, rot: 0.05 },
    { cx: W * 0.74, cy: H * 0.56, rot: 0.13 },
  ];
  const notes = ['golden hour', 'the strip', 'last summer'];
  frames.forEach((f, i) => {
    ctx.save();
    ctx.translate(f.cx, f.cy);
    ctx.rotate(f.rot);
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = s * 0.03;
    ctx.shadowOffsetY = s * 0.014;
    ctx.fillStyle = '#fdfdf8';
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    const pad = pw * 0.055;
    drawPhoto(ctx, img, -pw / 2 + pad, -ph / 2 + pad, pw - 2 * pad, ph * 0.78, st.crops[i] ?? st.crops[0], grade);
    ctx.font = `${Math.round(s * 0.034)}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#33334d';
    ctx.fillText(notes[i], 0, ph / 2 - ph * 0.095);
    ctx.restore();
  });
  letteringBlock(ctx, st, W, H, 0.045);
  ribbonBadge(ctx, st.ribbon, W, H);
  heatStars(ctx, st.heat, W, H);
  innerFrame(ctx, W, H);
}

function layoutFullBleed(ctx, st, img, W, H) {
  const grade = GRADES[st.grade] ?? GRADES.none;
  drawPhoto(ctx, img, 0, 0, W, H, st.crops[0], grade);
  const s = Math.min(W, H);
  const scrim = ctx.createLinearGradient(0, H * 0.45, 0, H);
  scrim.addColorStop(0, 'rgba(8,4,20,0)');
  scrim.addColorStop(1, 'rgba(8,4,20,0.78)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.45, W, H * 0.55);
  const top = ctx.createLinearGradient(0, 0, 0, H * 0.3);
  top.addColorStop(0, 'rgba(8,4,20,0.5)');
  top.addColorStop(1, 'rgba(8,4,20,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, H * 0.3);
  letteringBlock(ctx, st, W, H, 0.60);
  ribbonBadge(ctx, st.ribbon, W, H);
  heatStars(ctx, st.heat, W, H);
  innerFrame(ctx, W, H);
}

export function renderCover(ctx, st, img, W, H, opts = {}) {
  ctx.clearRect(0, 0, W, H);
  if (st.layout === 'snapshots') layoutSnapshots(ctx, st, img, W, H);
  else if (st.layout === 'fullbleed') layoutFullBleed(ctx, st, img, W, H);
  else layoutGrid(ctx, st, img, W, H, opts);
}

// Map a click on the grid canvas to a panel index (or -1).
export function gridPanelAt(nx, ny) {
  const col = Math.min(3, Math.floor(nx * 4));
  const row = Math.min(2, Math.floor(ny * 3));
  return GRID_CELLS.findIndex((c) => col >= c.x && col < c.x + c.w && row >= c.y && row < c.y + c.h);
}
