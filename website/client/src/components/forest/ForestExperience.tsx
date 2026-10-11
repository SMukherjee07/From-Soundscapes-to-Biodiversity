import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ChevronLeft, ChevronRight, Volume2, VolumeX, X } from "lucide-react";
import { forestCopy as F, journeyCopy as J } from "@/content/journey";
import { useJson } from "@/components/analysis/useJson";
import { drawBird, lookFor, type Arch } from "./birdArt";
import { Forest, REGION_INFO, type RegionKey } from "./scene";
import { SoundEngine } from "./soundEngine";
import "./forest.css";

type Bird = { id: string; common: string; scientific: string; arch: Arch; state: RegionKey; date: string; time: string; quality: string; seconds: number; license: string; source: string; remote: string; audio: string; adaptable: boolean; blurb: string };
type Manifest = { note?: string; regions: Record<RegionKey, Bird[]> };
const REGIONS: RegionKey[] = ["CA", "AZ", "TX"];
const ACCENT: Record<RegionKey, string> = { CA: "232,139,114", AZ: "216,183,106", TX: "110,214,209" };
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const licenseShort = (u: string) => (u.match(/licenses\/([^/]+)\/([^/]+)/)?.slice(1, 3).join(" ").toUpperCase() ?? "CC");

export function ForestExperience({ onEnter, soundOn, onToggleSound }: { onEnter: () => void; soundOn: boolean; onToggleSound: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null), stickRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const sp = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5 });
  const [size, setSize] = useState({ w: 1280, h: 800 });
  const [region, setRegion] = useState<RegionKey>("TX");
  const [selected, setSelected] = useState(-1);
  const [p, setP] = useState(0);
  const { data } = useJson<Manifest>("/data/birds.json");
  const birds = useMemo(() => data?.regions[region] ?? [], [data, region]);
  const looks = useMemo(() => birds.map((b) => lookFor(b.common, b.arch)), [birds]);

  const engine = useRef<SoundEngine | null>(null), clip = useRef<HTMLAudioElement | null>(null);
  const ptr = useRef({ x: 0, y: 0, px: -999, py: -999 }), hover = useRef(-1), sel = useRef(-1), fade = useRef(1), focus = useRef(0), hoverV = useRef<number[]>([]), singV = useRef<number[]>([]);
  sel.current = selected;

  useMotionValueEvent(sp, "change", (v) => setP((q) => (Math.abs(q - v) > 0.01 ? v : q)));
  const heroOpacity = useTransform(sp, [0, 0.12, 0.2], [1, 1, 0]);
  const cueOpacity = useTransform(sp, [0, 0.05], [1, 0]);
  const ctaOpacity = useTransform(sp, [0.82, 0.92], [0, 1]);

  useEffect(() => {
    const el = stickRef.current; if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight })); ro.observe(el); setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // sound: ambient engine follows the header toggle + region
  useEffect(() => {
    if (!engine.current) engine.current = new SoundEngine();
    if (soundOn) engine.current.start(region, birds.filter((x) => x.adaptable && x.audio)).catch(() => {}); else { engine.current.stop(); clip.current?.pause(); }
  }, [soundOn, region, birds]);
  useEffect(() => () => { engine.current?.stop(); clip.current?.pause(); }, []);

  const select = (i: number) => {
    clip.current?.pause();
    if (i >= 0 && !soundOn) onToggleSound();
    setSelected(i); focus.current = Math.max(focus.current, 0.001);
    if (i < 0) { engine.current?.duck(false); return; }
    const b = birds[i], a = new Audio(); a.loop = true; a.volume = 0.9; a.src = b.audio || b.remote;
    a.onerror = () => { a.onerror = null; if (a.src === b.remote) return; a.src = b.remote; a.play().catch(() => {}); };
    a.play().catch(() => {}); clip.current = a; engine.current?.duck(true);
  };
  const changeRegion = (r: RegionKey) => { if (r === region) return; select(-1); fade.current = 1; setRegion(r); };

  useEffect(() => {
    const cv = canvasRef.current, wrap = wrapRef.current; if (!cv || !wrap) return;
    const ctx = cv.getContext("2d")!, W = size.w, H = size.h, dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const forest = new Forest(region, W, H, Math.max(birds.length, 6), reduced);
    let visible = true, raf = 0, last = 0, slow = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(wrap);
    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame); if (!visible) return;
      const t = ms / 1000, dt = Math.min(0.05, t - last); if (!forest.lite && t > 3) { slow = dt > 0.034 ? slow + 1 : Math.max(0, slow - 1); if (slow > 90) forest.lite = true; } last = t, pv = reduced ? 0.6 : sp.get();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      focus.current += ((sel.current >= 0 ? 1 : 0) - focus.current) * Math.min(1, dt * 4); const f = focus.current;
      forest.px = ptr.current.px; forest.py = ptr.current.py;
      const hit = forest.hits[sel.current];
      ctx.save();
      if (f > 0.002 && hit) { const s = 1 + 0.85 * f, tx = hit.cx + (W * 0.33 - hit.cx) * f, ty = hit.cy + (H * 0.56 - hit.cy) * f; ctx.translate(tx, ty); ctx.scale(s, s); ctx.translate(-hit.cx, -hit.cy); }
      const birdAlpha = reduced ? 1 : smooth(0.3, 0.46, pv);
      forest.draw(ctx, t, {
        dolly: reduced ? 0.6 : smooth(0.1, 0.5, pv), px: ptr.current.x, py: ptr.current.y, birdAlpha, dim: f,
        drawBird: (i, x, y, s) => {
          const lk = looks[i]; if (!lk) return { cx: x, cy: y, r: 0 };
          hoverV.current[i] = (hoverV.current[i] ?? 0) + ((hover.current === i ? 1 : 0) - (hoverV.current[i] ?? 0)) * 0.15; singV.current[i] = (singV.current[i] ?? 0) + ((sel.current === i ? 1 : 0) - (singV.current[i] ?? 0)) * 0.1;
          ctx.save(); if (sel.current >= 0 && sel.current !== i) ctx.globalAlpha *= 1 - 0.7 * f;
          const acc = ACCENT[region], h = drawBird(ctx, lk, x, y, Math.max(W < 720 ? 40 : 62, Math.min(W < 720 ? 74 : 112, s)), { t, hover: hoverV.current[i], singing: singV.current[i], flip: i % 2 ? -1 : 1 }, acc);
          if (sel.current < 0) { const ph = (t * 0.5 + i * 0.37) % 1; ctx.strokeStyle = `rgba(${acc},${0.28 * (1 - ph)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(h.cx, h.cy, h.r * (0.6 + ph * 0.7), 0, 6.3); ctx.stroke(); }
          if (hoverV.current[i] > 0.05 && sel.current < 0) { const txt = birds[i]?.common ?? ""; ctx.font = '500 12px "DM Mono", monospace'; const w = ctx.measureText(txt).width + 20; ctx.globalAlpha = hoverV.current[i]; ctx.fillStyle = "rgba(4,12,11,.78)"; ctx.beginPath(); ctx.roundRect(h.cx - w / 2, h.cy - h.r - 34, w, 24, 12); ctx.fill(); ctx.strokeStyle = `rgba(${acc},.6)`; ctx.stroke(); ctx.fillStyle = "#f2ebdd"; ctx.textAlign = "center"; ctx.fillText(txt, h.cx, h.cy - h.r - 18); }
          ctx.restore(); return h;
        },
      });
      ctx.restore();
      if (fade.current > 0.003) { fade.current *= 0.93; ctx.fillStyle = `rgba(2,6,5,${fade.current})`; ctx.fillRect(0, 0, W, H); }
      const hi = (sel.current < 0 && birdAlpha > 0.6) ? forest.hits.findIndex((h2, i) => h2 && Math.hypot(ptr.current.px - h2.cx, ptr.current.py - h2.cy) < h2.r + 8 && i >= 0) : -1;
      if (hi !== hover.current) { hover.current = hi; cv.style.cursor = hi >= 0 ? "pointer" : "default"; }
    };
    let pv = 0; raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [size, region, birds, looks, reduced, sp]);

  const onMove = (e: React.PointerEvent) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); ptr.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1, px: e.clientX - r.left, py: e.clientY - r.top }; };
  const onClick = () => { if (hover.current >= 0) select(hover.current); else if (sel.current >= 0) select(-1); };
  const b = selected >= 0 ? birds[selected] : null;
  const goNext = (d: number) => select((selected + d + birds.length) % birds.length);

  return (
    <div ref={wrapRef} id="top" className="fx" style={{ height: reduced ? "100svh" : "300vh" }}>
      <div ref={stickRef} className="fx__stick">
        <canvas ref={canvasRef} className="fx__canvas" style={{ width: "100%", height: "100%" }} onPointerMove={onMove} onClick={onClick} aria-hidden />
        <motion.div className="fx-hero" style={{ opacity: reduced ? 1 : heroOpacity }}>
          <p className="fx-eyebrow"><span />{J.hero.eyebrow}</p>
          <h1>From <em>soundscapes</em><br />to biodiversity.</h1>
          <p className="fx-lede">{J.hero.lede}</p>
        </motion.div>
        <motion.div className="fx-cue" style={{ opacity: reduced ? 0 : cueOpacity }}><i />{J.hero.cue}</motion.div>

        {!b && (
          <div className="fx-regions" role="group" aria-label={F.choose}>
            <small>{F.choose}</small>
            <div>{REGIONS.map((r) => (
              <button key={r} className={r === region ? "on" : ""} style={{ ["--c" as string]: ACCENT[r] }} onClick={() => changeRegion(r)} aria-pressed={r === region}>
                <b>{REGION_INFO[r].name}</b><span>{REGION_INFO[r].sub}</span>
              </button>))}
            </div>
            {p > 0.5 && <em className="fx-hint">{F.hint}</em>}
            <small className="fx-note">{F.note}</small>
          </div>
        )}

        <motion.button className="fx-cta" style={{ opacity: reduced ? 0 : ctaOpacity, pointerEvents: p > 0.85 ? "auto" : "none" }} onClick={onEnter}>{F.enter} <ArrowDown size={15} /></motion.button>
        <button className="fx-sound" onClick={onToggleSound} aria-pressed={soundOn}>{soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}{soundOn ? F.soundOn : F.soundOff}</button>

        {b && (
          <aside className="fx-panel" style={{ ["--c" as string]: ACCENT[region] }} aria-live="polite">
            <button className="fx-x" onClick={() => select(-1)} aria-label={F.back}><X size={16} /></button>
            <span className="fx-chip">{REGION_INFO[b.state].name}</span>
            <h2>{b.common}</h2><p className="fx-sci">{b.scientific}</p>
            <div className="fx-eq" aria-hidden>{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 0.09) % 0.9}s` }} />)}</div>
            {b.blurb && <p className="fx-blurb">{b.blurb}</p>}
            <dl><div><dt>Recorded</dt><dd>{b.date}{b.time && b.time !== "nan" ? ` · ${b.time}` : ""}</dd></div><div><dt>Quality</dt><dd>{b.quality} · {Math.round(b.seconds)} s</dd></div></dl>
            <a className="fx-src" href={b.source} target="_blank" rel="noreferrer">Xeno-canto XC{b.id} · {licenseShort(b.license)}</a>
            <div className="fx-nav"><button onClick={() => goNext(-1)} aria-label="Previous bird"><ChevronLeft size={16} /></button><button onClick={() => select(-1)}>{F.back}</button><button onClick={() => goNext(1)} aria-label="Next bird"><ChevronRight size={16} /></button></div>
          </aside>
        )}
        <nav className="sr-only" aria-label="Birds in this forest">{birds.map((bd, i) => <button key={bd.id} onClick={() => select(i)}>{bd.common}</button>)}</nav>
      </div>
    </div>
  );
}
