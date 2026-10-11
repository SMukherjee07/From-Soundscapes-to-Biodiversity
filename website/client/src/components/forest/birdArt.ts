/** Stylised "nocturne" birds: dark silhouettes with a bioluminescent rim. One parametric drawer per archetype. */
export type Arch = "songbird" | "hummer" | "owl" | "raptor" | "nightjar" | "wader" | "water" | "quail" | "roadrunner" | "dove" | "woodpecker" | "corvid";
export type BirdLook = { arch: Arch; hue: number; seed: number };
export type Pose = { t: number; hover: number; singing: number; flip: number };

export function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const HUES = [168, 182, 196, 40, 18, 262, 150];
export const lookFor = (name: string, arch: Arch): BirdLook => ({ arch, hue: HUES[hash(name) % HUES.length], seed: hash(name) });

type P = { body: number[]; head: number; beak: [number, number]; tail: [number, number]; leg: number; neck?: number; crest?: number; wing?: number; belly?: number };
// body = [rx, ry]; all in units where 1 = nominal bird size
const SPEC: Record<Arch, P> = {
  songbird: { body: [0.62, 0.42], head: 0.3, beak: [0.2, 0.08], tail: [0.8, 0.14], leg: 0.28 },
  hummer: { body: [0.42, 0.26], head: 0.22, beak: [0.7, 0.03], tail: [0.45, 0.16], leg: 0.08, wing: 1 },
  owl: { body: [0.62, 0.78], head: 0.5, beak: [0.1, 0.07], tail: [0.35, 0.2], leg: 0.18, crest: 1 },
  raptor: { body: [0.78, 0.4], head: 0.28, beak: [0.2, 0.12], tail: [0.95, 0.2], leg: 0.3, wing: 1 },
  nightjar: { body: [0.8, 0.34], head: 0.27, beak: [0.1, 0.1], tail: [0.8, 0.16], leg: 0.1 },
  wader: { body: [0.55, 0.3], head: 0.18, beak: [0.9, 0.05], tail: [0.28, 0.1], leg: 1.5, neck: 1.1 },
  water: { body: [0.9, 0.42], head: 0.26, beak: [0.34, 0.1], tail: [0.35, 0.1], leg: 0.22, neck: 0.5 },
  quail: { body: [0.62, 0.52], head: 0.24, beak: [0.12, 0.07], tail: [0.35, 0.16], leg: 0.3, crest: 0.6 },
  roadrunner: { body: [0.78, 0.26], head: 0.24, beak: [0.4, 0.07], tail: [1.35, 0.1], leg: 0.62, crest: 0.8 },
  dove: { body: [0.68, 0.4], head: 0.22, beak: [0.12, 0.05], tail: [0.78, 0.15], leg: 0.2 },
  woodpecker: { body: [0.5, 0.58], head: 0.27, beak: [0.45, 0.07], tail: [0.62, 0.12], leg: 0.18, crest: 0.5 },
  corvid: { body: [0.78, 0.46], head: 0.32, beak: [0.46, 0.14], tail: [0.95, 0.18], leg: 0.32 },
};

/** Draw a bird perched at (x,y) = feet position; size ≈ body length in px. Faces +x when flip=1, -x when -1. */
export function drawBird(ctx: CanvasRenderingContext2D, look: BirdLook, x: number, y: number, size: number, pose: Pose, accent: string) {
  const s = SPEC[look.arch], u = size, f = pose.flip, t = pose.t;
  const breathe = 1 + 0.018 * Math.sin(t * 2.2 + look.seed), bob = Math.sin(t * 0.9 + look.seed) > 0.93 ? 0.35 : 0;
  const body = `hsl(${look.hue} 32% 17%)`, rim = `hsla(${look.hue} 85% ${64 + pose.hover * 14}%, ${0.8 + pose.hover * 0.2})`;
  const hg = ctx.createRadialGradient(x, y - u * 0.5, 0, x, y - u * 0.5, u * 1.5); hg.addColorStop(0, `rgba(${accent},${0.2 + pose.hover * 0.25})`); hg.addColorStop(1, `rgba(${accent},0)`); ctx.fillStyle = hg; ctx.fillRect(x - u * 1.6, y - u * 2, u * 3.2, u * 3);
  ctx.save(); ctx.translate(x, y); ctx.scale(f, 1);
  const legL = s.leg * u * 0.5, cy = -legL - s.body[1] * u * 0.5;
  // legs
  ctx.strokeStyle = body; ctx.lineWidth = Math.max(1, u * 0.035); ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(-u * 0.08, cy + s.body[1] * u * 0.4); ctx.lineTo(-u * 0.06, 0); ctx.moveTo(u * 0.1, cy + s.body[1] * u * 0.4); ctx.lineTo(u * 0.1, 0); ctx.stroke();
  ctx.translate(0, cy); ctx.scale(breathe, breathe);
  const rx = s.body[0] * u * 0.5, ry = s.body[1] * u * 0.5, hr = s.head * u * 0.5;
  const nx = rx * 0.78, ny = -ry * (0.35 + (s.neck ?? 0) * 1.1), hx = nx + hr * 0.3, hy = ny - hr * 0.55 - bob * u * 0.05;
  const shape = () => {
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, -0.12, 0, Math.PI * 2);                                     // body
    ctx.moveTo(-rx * 0.8, 0); ctx.lineTo(-rx - s.tail[0] * u * 0.5, ry * 0.5 + s.tail[1] * u * 0.4); ctx.lineTo(-rx - s.tail[0] * u * 0.46, ry * 0.5 - s.tail[1] * u * 0.2); ctx.lineTo(-rx * 0.5, -ry * 0.4); // tail
    if (s.neck) { ctx.moveTo(rx * 0.5, -ry * 0.2); ctx.lineTo(nx, ny); ctx.lineTo(nx + hr * 0.2, ny + ry * 0.2); ctx.lineTo(rx * 0.2, ry * 0.3); }
    ctx.moveTo(hx + hr, hy); ctx.arc(hx, hy, hr, 0, Math.PI * 2);                         // head
    const bx = hx + hr * 0.85, by = hy + hr * 0.1, bl = s.beak[0] * u * 0.5, bw = s.beak[1] * u * 0.5, open = pose.singing * (0.5 + 0.5 * Math.sin(t * 14)) * bw * 1.6;
    ctx.moveTo(bx, by - bw); ctx.lineTo(bx + bl, by - open * 0.2); ctx.lineTo(bx, by + bw * 0.3);
    if (open > 0.1) { ctx.moveTo(bx, by + bw * 0.3); ctx.lineTo(bx + bl * 0.9, by + open); ctx.lineTo(bx, by + bw); }
    if (s.crest) { ctx.moveTo(hx - hr * 0.5, hy - hr * 0.6); ctx.lineTo(hx - hr * (0.9 + s.crest * 0.5), hy - hr * (1.6 + s.crest * 0.6)); ctx.lineTo(hx + hr * 0.1, hy - hr * 0.9); }
    if (s.wing) { ctx.moveTo(-rx * 0.2, -ry * 0.2); ctx.lineTo(-rx * 1.1, -ry * (1.5 + Math.sin(t * (look.arch === "hummer" ? 60 : 1.6)) * 0.5)); ctx.lineTo(rx * 0.3, -ry * 0.6); }
  };
  shape();
  ctx.lineJoin = "round"; ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1.4, u * 0.05); ctx.stroke();    // rim light
  ctx.fillStyle = body; ctx.fill();
  // belly sheen + eye
  const g = ctx.createLinearGradient(0, -ry, 0, ry); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, `hsla(${look.hue} 70% 60% / ${0.35 + pose.hover * 0.25})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, ry * 0.1, rx * 0.85, ry * 0.8, -0.12, 0, Math.PI); ctx.fill();
  ctx.fillStyle = `rgba(${accent},${0.9})`; ctx.beginPath(); ctx.arc(hx + hr * 0.35, hy - hr * 0.1, Math.max(1.3, hr * 0.16), 0, Math.PI * 2); ctx.fill();
  if (look.arch === "owl") { ctx.beginPath(); ctx.arc(hx + hr * 0.35, hy - hr * 0.1, hr * 0.32, 0, Math.PI * 2); ctx.fillStyle = `rgba(${accent},0.35)`; ctx.fill(); }
  ctx.restore();
  // sound rings while singing
  if (pose.singing > 0.02) {
    const bx = x + f * (nx + hr * 1.2 + s.beak[0] * u * 0.5) * breathe, by = y + cy + hy;
    for (let k = 0; k < 3; k++) {
      const ph = ((t * 0.7 + k / 3) % 1), r = u * (0.3 + ph * 1.5);
      ctx.strokeStyle = `rgba(${accent},${(1 - ph) * 0.5 * pose.singing})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(bx, by, r, f > 0 ? -0.9 : Math.PI - 0.9, f > 0 ? 0.9 : Math.PI + 0.9); ctx.stroke();
    }
  }
  return { cx: x, cy: y + cy, r: Math.max(u * 0.7, 26) };
}
