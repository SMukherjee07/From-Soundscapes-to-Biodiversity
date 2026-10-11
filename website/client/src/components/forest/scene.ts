/** Procedural dark-forest scene: sky, moon rays, three parallax tree layers with swaying branches, fog, fireflies, peeking eyes. */
export type RegionKey = "CA" | "AZ" | "TX";
export const REGION_INFO: Record<RegionKey, { name: string; sub: string }> = {
  CA: { name: "California", sub: "Coastal oak & chaparral" },
  AZ: { name: "Arizona", sub: "Sky islands & Sonoran desert" },
  TX: { name: "Texas", sub: "Piney woods & prairie" },
};
type Cfg = { sky: string[]; glow: string; fog: string; moon: [number, number]; far: string; mid: string; near: string; fire: string; accent: string; trees: ("oak" | "pine" | "cactus")[]; eyes: ("owl" | "deer" | "coyote")[] };
const CFG: Record<RegionKey, Cfg> = {
  CA: { sky: ["#03100f", "#0a2a27", "#1c3b34"], glow: "232,139,114", fog: "30,78,70", moon: [0.74, 0.2], far: "#0b221e", mid: "#061311", near: "#02090a", fire: "216,183,106", accent: "232,139,114", trees: ["oak", "oak", "oak"], eyes: ["owl", "deer"] },
  AZ: { sky: ["#070a1b", "#1a1a45", "#4a3043"], glow: "216,183,106", fog: "70,60,90", moon: [0.28, 0.17], far: "#17142e", mid: "#0c0a1e", near: "#04040d", fire: "240,190,110", accent: "216,183,106", trees: ["pine", "cactus", "cactus"], eyes: ["coyote", "owl"] },
  TX: { sky: ["#030c0b", "#0a2420", "#164038"], glow: "110,214,209", fog: "40,95,88", moon: [0.68, 0.18], far: "#0b2622", mid: "#06130f", near: "#020a09", fire: "140,235,190", accent: "110,214,209", trees: ["pine", "pine", "pine"], eyes: ["deer", "owl"] },
};
const rngf = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

type N = { len: number; ang: number; w: number; ph: number; leaf: number; kids: N[]; sx: number; sy: number };
type Tree = { kind: "oak" | "pine" | "cactus"; x: number; layer: 0 | 1 | 2; size: number; root: N | null; perches: N[]; arms: { side: number; y: number; h: number; v: number }[]; sx: number; sy: number };
const node = (len: number, ang: number, w: number, ph: number, leaf = 0): N => ({ len, ang, w, ph, leaf, kids: [], sx: 0, sy: 0 });

function genOak(r: () => number, len: number, ang: number, w: number, d: number, max: number, perches: N[]): N {
  const n = node(len, ang, w, r() * 6.28);
  if (d >= max) { n.leaf = len * 1.5; if (d >= 3) perches.push(n); return n; }
  const k = d < 2 ? 3 : 2;
  for (let i = 0; i < k; i++) n.kids.push(genOak(r, len * (0.68 + r() * 0.12), (i - (k - 1) / 2) * (0.75 + r() * 0.4) + (r() - 0.5) * 0.3, w * 0.64, d + 1, max, perches));
  return n;
}
function genPine(r: () => number, segs: number, perches: N[]): N {
  const root = node(0.05, 0, 0.022, r() * 6); let cur = root;
  for (let i = 0; i < segs; i++) {
    const f = i / segs, seg = node(0.046 * (1 - f * 0.25), (r() - 0.5) * 0.04, 0.022 * (1 - f * 0.85), r() * 6);
    if (i >= 4) for (const sd of [-1, 1]) {
      const len = (0.14 - f * 0.115) * (0.85 + r() * 0.3), b = node(len, sd * (1.32 + r() * 0.22), 0.005, r() * 6, len);
      cur.kids.push(b); if (i >= 5 && i <= 10) perches.push(b);
    }
    cur.kids.push(seg); cur = seg;
  }
  return root;
}

export class Forest {
  W: number; H: number; region: RegionKey; cfg: Cfg; trees: Tree[] = []; birdSlots: { tree: Tree; node: N | null; px: number; py: number }[] = [];
  stars: { x: number; y: number; p: number }[]; flies: { x: number; y: number; p: number; s: number; r: number }[]; fogs: { x: number; y: number; r: number; v: number }[]; eyes: { x: number; y: number; layer: number; kind: string; ph: number; tree: Tree | null }[] = [];
  hits: { cx: number; cy: number; r: number }[] = []; reduced: boolean; glow: HTMLCanvasElement;
  constructor(region: RegionKey, W: number, H: number, birds: number, reduced: boolean) {
    this.W = W; this.H = H; this.region = region; this.cfg = CFG[region]; this.reduced = reduced;
    const r = rngf(region.charCodeAt(0) * 977 + region.charCodeAt(1) * 31);
    const kinds = this.cfg.trees;
    const layerDef = [{ n: 16, size: 0.34, kind: kinds[0] }, { n: 7, size: 0.58, kind: kinds[1] }, { n: 2, size: 0.95, kind: kinds[2] }] as const;
    layerDef.forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        const x = li === 2 ? [0.03, 0.97][i] * W : ((i + 0.5 + (r() - 0.5) * 0.7) / L.n) * W;
        const perches: N[] = []; let root: N | null = null; const arms: Tree["arms"] = [];
        const kind = li === 0 && region === "AZ" ? "pine" : L.kind;
        if (kind === "oak") root = genOak(r, 0.15 * (0.85 + r() * 0.3), (r() - 0.5) * 0.1, 0.03, 0, li === 0 ? 3 : 5, perches);
        else if (kind === "pine") root = genPine(r, li === 0 ? 9 : 14, perches);
        else { const na = 1 + Math.floor(r() * 3); for (let a = 0; a < na; a++) arms.push({ side: r() < 0.5 ? -1 : 1, y: 0.3 + r() * 0.35, h: 0.06 + r() * 0.05, v: 0.1 + r() * 0.1 }); }
        this.trees.push({ kind, x, layer: li as 0 | 1 | 2, size: L.size * (0.85 + r() * 0.3), root, perches, arms, sx: 0, sy: 0 });
      }
    });
    // assign birds to evenly spread mid/near trees
    const cand = this.trees.filter((t) => t.layer > 0 && (t.perches.length > 0 || t.kind === "cactus")).sort((a, b) => a.x - b.x);
    for (let i = 0; i < birds; i++) {
      const t = cand[Math.min(cand.length - 1, Math.floor(((i + 0.5) / birds) * cand.length))];
      this.birdSlots.push({ tree: t, node: t.perches.length ? t.perches[Math.floor(r() * t.perches.length)] : null, px: 0, py: 0 });
    }
    this.stars = Array.from({ length: 90 }, () => ({ x: r() * W, y: r() * H * 0.5, p: r() * 6 }));
    this.flies = Array.from({ length: 34 }, () => ({ x: r(), y: 0.45 + r() * 0.5, p: r() * 100, s: 0.15 + r() * 0.3, r: 2 + r() * 3 }));
    this.fogs = Array.from({ length: 9 }, (_, i) => ({ x: r() * W, y: H * (0.5 + 0.08 * i), r: H * (0.25 + r() * 0.2), v: (0.4 + r() * 0.8) * (i % 2 ? 1 : -1) }));
    const mids = this.trees.filter((t) => t.layer === 1);
    this.cfg.eyes.forEach((kind, k) => { for (let j = 0; j < 2; j++) { const tr = mids[Math.floor(r() * mids.length)]; this.eyes.push({ x: tr.x + (j ? 22 : -18), y: 0, layer: 1, kind, ph: r() * 9 + k, tree: tr }); } });
    this.glow = document.createElement("canvas"); this.glow.width = this.glow.height = 48;
    const g = this.glow.getContext("2d")!, gr = g.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.2, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 48, 48);
  }

  draw(ctx: CanvasRenderingContext2D, t: number, o: { dolly: number; px: number; py: number; birdAlpha: number; dim: number; drawBird: (i: number, x: number, y: number, s: number) => { cx: number; cy: number; r: number } }) {
    const { W, H, cfg } = this, wind = this.reduced ? 0 : 0.8 + 0.5 * Math.sin(t * 0.17) + 0.25 * Math.sin(t * 0.43);
    // sky + glow + stars + moon
    const sg = ctx.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, cfg.sky[0]); sg.addColorStop(0.55, cfg.sky[1]); sg.addColorStop(1, cfg.sky[2]); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
    const hg = ctx.createRadialGradient(W * 0.5, H * 0.72, 0, W * 0.5, H * 0.72, W * 0.7); hg.addColorStop(0, `rgba(${cfg.glow},0.28)`); hg.addColorStop(1, `rgba(${cfg.glow},0)`); ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    for (const s of this.stars) { ctx.globalAlpha = (0.25 + 0.5 * Math.sin(t * 1.3 + s.p) ** 2) * (1 - o.dolly * 0.5); ctx.fillStyle = "#cfe9e4"; ctx.fillRect(s.x + o.px * 4, s.y, 1.4, 1.4); }
    const mx = W * cfg.moon[0] + o.px * 8, my = H * cfg.moon[1] + o.py * 4, mr = H * 0.055;
    ctx.globalAlpha = 1; const mg = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, H * 0.4); mg.addColorStop(0, "rgba(220,240,235,.32)"); mg.addColorStop(1, "rgba(220,240,235,0)"); ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H);
    for (let k = 0; k < (this.lite ? 0 : 5); k++) { // god-rays
      const a = 1.9 + k * 0.17 + Math.sin(t * 0.1 + k) * 0.03, len = H * 1.1, w = 0.05 + k * 0.012;
      const rg = ctx.createLinearGradient(mx, my, mx + Math.cos(a) * len, my + Math.sin(a) * len); rg.addColorStop(0, "rgba(200,235,225,.09)"); rg.addColorStop(1, "rgba(200,235,225,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a - w) * len, my + Math.sin(a - w) * len); ctx.lineTo(mx + Math.cos(a + w) * len, my + Math.sin(a + w) * len); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = "#e9f4ee"; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.3); ctx.fill();
    ctx.fillStyle = "rgba(20,40,40,.18)"; ctx.beginPath(); ctx.arc(mx - mr * 0.3, my - mr * 0.1, mr * 0.28, 0, 6.3); ctx.arc(mx + mr * 0.3, my + mr * 0.3, mr * 0.2, 0, 6.3); ctx.fill();

    this.hits = [];
    const colors = [cfg.far, cfg.mid, cfg.near], depth = [0.3, 0.62, 1], groundY = [0.74, 0.8, 0.9], anchorY = H * 0.8;
    // distant ridges
    for (let k = 0; k < 2; k++) {
      ctx.fillStyle = k ? colors[0] : `rgba(${cfg.fog},.35)`; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 14) { const a = x / W * 6 + k * 3; let y = H * (0.6 - k * 0.04) - (Math.sin(a) * 0.04 + Math.sin(a * 2.3 + 1) * 0.02) * H; if (this.region === "AZ") y = Math.max(y, H * (0.6 - k * 0.04) - 0.03 * H * (Math.sin(a * 0.8) > 0.2 ? 1.6 : 0.4)); ctx.lineTo(x, y); }
      ctx.lineTo(W, H); ctx.fill();
    }
    for (let li = 0; li < 3; li++) {
      const d = depth[li], s = 1 + o.dolly * (0.06 + 0.5 * d), sx = (x: number) => W / 2 + (x - W / 2) * s + o.px * d * 24, sy = (y: number) => anchorY + (y - anchorY) * s + o.py * d * 10;
      const col = colors[li]; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = "round";
      for (const tr of this.trees.filter((q) => q.layer === li)) {
        const bx = sx(tr.x), by = sy(H * groundY[li]), sc = tr.size * s * H; tr.sx = bx; tr.sy = by;
        if (tr.kind === "cactus") {
          const th = 0.5 * sc, tw = 0.034 * sc;
          for (const pass of [0, 1]) {
            ctx.strokeStyle = pass ? col : `rgba(${cfg.accent},.28)`; ctx.lineJoin = "round";
            ctx.lineWidth = tw + (pass ? 0 : 3); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - th); ctx.stroke();
            ctx.lineWidth = tw * 0.72 + (pass ? 0 : 3);
            for (const a of tr.arms) { const ay = by - th * a.y, ax = bx + a.side * (0.06 + a.h * 0.4) * sc; ctx.beginPath(); ctx.moveTo(bx, ay); ctx.quadraticCurveTo(ax, ay + 0.01 * sc, ax, ay - 0.06 * sc); ctx.lineTo(ax, ay - (0.1 + a.v * 1.4) * sc); ctx.stroke(); }
          }
          for (let i = 0; i < this.birdSlots.length; i++) if (this.birdSlots[i].tree === tr) { this.birdSlots[i].px = bx; this.birdSlots[i].py = by - th - tw * 0.4; }
        } else if (tr.root) {
          ctx.strokeStyle = col; ctx.fillStyle = col;
          const walk = (n: N, x: number, y: number, pa: number, dpt: number) => {
            const ang = pa + n.ang + Math.sin(t * 0.55 + n.ph) * 0.05 * wind * (0.35 + dpt * 0.12), x2 = x + Math.sin(ang) * n.len * sc, y2 = y - Math.cos(ang) * n.len * sc;
            ctx.lineWidth = Math.max(0.7, n.w * sc); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
            if (n.leaf) { ctx.beginPath(); if (tr.kind === "oak") { const R = n.leaf * sc * 0.36; ctx.arc(x2, y2, R, 0, 6.3); ctx.moveTo(x2 + R * 1.3, y2 - R * 0.3); ctx.arc(x2 + R * 0.8, y2 - R * 0.3, R * 0.8, 0, 6.3); ctx.moveTo(x2 - R * 0.2, y2 - R * 0.9); ctx.arc(x2 - R * 0.8, y2 - R * 0.9, R * 0.75, 0, 6.3); } else { const L = n.len * sc; ctx.moveTo(x, y - 0.012 * sc); ctx.lineTo(x2, y2 + L * 0.1); ctx.lineTo(x + (x2 - x) * 0.12, y + L * 0.36); ctx.closePath(); } ctx.fill(); }
            n.sx = x2; n.sy = y2; for (const k of n.kids) walk(k, x2, y2, ang, dpt + 1);
          };
          walk(tr.root, bx, by, 0, 0);
          for (let i = 0; i < this.birdSlots.length; i++) { const b = this.birdSlots[i]; if (b.tree === tr && b.node) { b.px = b.node.sx; b.py = b.node.sy; } }
        }
        for (let i = 0; i < this.birdSlots.length; i++) if (this.birdSlots[i].tree === tr && o.birdAlpha > 0.01) {
          ctx.save(); ctx.globalAlpha = o.birdAlpha; const hit = o.drawBird(i, this.birdSlots[i].px, this.birdSlots[i].py, sc * 0.19 / tr.size * (0.75 + li * 0.2)); this.hits[i] = hit; ctx.restore();
        }
      }
      // peeking eyes on this layer
      for (const e of this.eyes.filter((q) => q.layer === li)) {
        const tr = e.tree!, x = tr.sx + (e.x - tr.x) * s, y = tr.sy - (e.kind === "owl" ? 0.2 : 0.02) * tr.size * s * H, near = smooth(300, 40, Math.hypot(this.px - x, this.py - y));
        const blink = (Math.sin(t * 0.8 + e.ph * 3) > 0.985 ? 0.15 : 1), col = e.kind === "owl" ? "255,205,90" : e.kind === "coyote" ? "255,170,80" : "190,240,255", gap = 6 * (0.8 + li * 0.3);
        ctx.globalCompositeOperation = "lighter";
        for (const dx of [-gap, gap]) { ctx.globalAlpha = (0.25 + 0.7 * near) * blink; const gs = (e.kind === "owl" ? 22 : 15) * (0.7 + near * 0.6); ctx.drawImage(this.sprite(col), x + dx - gs / 2, y - gs / 2, gs, gs * blink + 1); ctx.fillStyle = `rgb(${col})`; ctx.fillRect(x + dx - 1.2, y - 1.2 * blink, 2.4, 2.4 * blink); }
        ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
      }
      // fog band between layers
      const fy = H * (li === 0 ? 0.68 : li === 1 ? 0.78 : 0.9), fg = ctx.createLinearGradient(0, fy - H * 0.16, 0, fy + H * 0.1); fg.addColorStop(0, `rgba(${cfg.fog},0)`); fg.addColorStop(0.55, `rgba(${cfg.fog},${0.22 - li * 0.05})`); fg.addColorStop(1, `rgba(${cfg.fog},0)`);
      ctx.fillStyle = fg; ctx.fillRect(0, fy - H * 0.16, W, H * 0.26);
    }
    // ground + foreground blades
    const gg = ctx.createLinearGradient(0, H * 0.88, 0, H); gg.addColorStop(0, "rgba(2,8,9,0)"); gg.addColorStop(0.4, "#020708"); gg.addColorStop(1, "#010404"); ctx.fillStyle = gg; ctx.fillRect(0, H * 0.88, W, H * 0.12);
    ctx.strokeStyle = "#010505"; ctx.lineWidth = 2;
    for (let i = 0; i < 70; i++) { const x = (i / 70) * W + Math.sin(i * 12.9) * 12, h = H * (0.05 + 0.05 * Math.abs(Math.sin(i * 3.7))) * (this.region === "TX" ? 1.4 : 1), sw = Math.sin(t * 0.9 + i) * 10 * wind; ctx.beginPath(); ctx.moveTo(x, H); ctx.quadraticCurveTo(x + sw * 0.4, H - h * 0.6, x + sw + (i % 2 ? 8 : -8), H - h); ctx.stroke(); }
    // fog drifts + fireflies
    ctx.globalCompositeOperation = "lighter";
    for (const f of this.lite ? [] : this.fogs) { const x = ((f.x + t * f.v * 6) % (W + 2 * f.r) + W + 2 * f.r) % (W + 2 * f.r) - f.r, g = ctx.createRadialGradient(x, f.y, 0, x, f.y, f.r); g.addColorStop(0, `rgba(${cfg.fog},.09)`); g.addColorStop(1, `rgba(${cfg.fog},0)`); ctx.fillStyle = g; ctx.fillRect(x - f.r, f.y - f.r, 2 * f.r, 2 * f.r); }
    if (!this.reduced) for (const f of this.lite ? this.flies.slice(0, 10) : this.flies) { const x = W * f.x + Math.sin(t * f.s + f.p) * 70 + o.px * 14, y = H * f.y + Math.cos(t * f.s * 1.3 + f.p) * 40, a = 0.5 + 0.5 * Math.sin(t * 2 + f.p * 3); ctx.globalAlpha = a * 0.9 * (1 - o.dim * 0.6); const s = f.r * 6; ctx.drawImage(this.sprite(cfg.fire), x - s / 2, y - s / 2, s, s); }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    const vg = ctx.createRadialGradient(W / 2, H * 0.5, H * 0.35, W / 2, H * 0.5, H * 0.95); vg.addColorStop(0, `rgba(2,6,5,${0.32 * o.dim})`); vg.addColorStop(1, `rgba(2,6,5,${0.78 + o.dim * 0.15})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }
  px = -999; py = -999; lite = false;
  private sprites = new Map<string, HTMLCanvasElement>();
  sprite(rgb: string) {
    let c = this.sprites.get(rgb); if (c) return c;
    c = document.createElement("canvas"); c.width = c.height = 48; const g = c.getContext("2d")!, gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.18, `rgba(${rgb},.75)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); this.sprites.set(rgb, c); return c;
  }
}
