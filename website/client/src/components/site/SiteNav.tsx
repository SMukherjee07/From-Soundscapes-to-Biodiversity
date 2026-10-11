import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Bird, LayoutGrid, Volume2, VolumeX, X } from "lucide-react";
import "./site.css";

export type Chapter = { id: string; label: string; kind: string; done: boolean };
type Props = { chapters: Chapter[]; activeTab: string; onSelectTab: (id: string) => void; soundOn: boolean; onToggleSound: () => void; scrollTo: (id: string) => void };
const SECTIONS = [{ id: "field-guide", label: "Explore" }, { id: "research", label: "Research" }, { id: "methods", label: "Method" }];

export function SiteNav({ chapters, activeTab, onSelectTab, soundOn, onToggleSound, scrollTo }: Props) {
  const [open, setOpen] = useState(false), [sec, setSec] = useState(""), [compact, setCompact] = useState(false);
  const { scrollYProgress } = useScroll(); const prog = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  useEffect(() => {
    const on = () => setCompact(window.scrollY > 40); on(); window.addEventListener("scroll", on, { passive: true });
    const io = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; setSec(v ? v.target.id : ""); }, { rootMargin: "-35% 0px -55% 0px" });
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); }); const top = document.getElementById("top"); if (top) io.observe(top);
    return () => { window.removeEventListener("scroll", on); io.disconnect(); };
  }, []);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", k); document.body.style.overflow = open ? "hidden" : ""; return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [open]);
  const done = chapters.filter((c) => c.done).length;
  return (
    <>
      <motion.div className="sn-progress" style={{ scaleX: prog }} aria-hidden />
      <header className={`sn ${compact ? "sn--compact" : ""}`}>
        <button className="sn-brand" onClick={() => scrollTo("top")} aria-label="Back to top"><span><Bird size={17} /></span><b>Acoustic<br />Observatory</b></button>
        <nav className="sn-links" aria-label="Primary">
          {SECTIONS.map((s) => (
            <button key={s.id} className={sec === s.id ? "on" : ""} onClick={() => scrollTo(s.id)}>{s.label}{sec === s.id && <motion.i layoutId="sn-pill" />}</button>
          ))}
        </nav>
        <div className="sn-actions">
          <button className={`sn-sound ${soundOn ? "on" : ""}`} onClick={onToggleSound} aria-pressed={soundOn} aria-label="Toggle sound">{soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
          <button className="sn-chapters" onClick={() => setOpen(true)} aria-haspopup="dialog"><LayoutGrid size={15} /><span>Chapters</span><em>{done}/{chapters.length}</em></button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="sn-atlas" role="dialog" aria-modal="true" aria-label="Project chapters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={() => setOpen(false)}>
            <button className="sn-close" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
            <div className="sn-atlas__grid" onClick={(e) => e.stopPropagation()}>
              {chapters.map((c, i) => (
                <motion.button key={c.id} className={`${activeTab === c.id ? "on" : ""} ${c.done ? "done" : ""}`} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => { onSelectTab(c.id); setOpen(false); scrollTo("research"); }}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span><strong>{c.label}</strong><small>{c.kind}</small><i>{c.done ? "Ready" : "Soon"}</i>
                  <svg viewBox="0 0 120 24" aria-hidden>{Array.from({ length: 30 }, (_, k) => <rect key={k} x={k * 4} y={12 - 2 - ((k * 7 + i * 5) % 9)} width="2" height={4 + ((k * 7 + i * 5) % 9) * 2} rx="1" />)}</svg>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ChapterPager({ chapters, activeTab, onSelectTab }: { chapters: Chapter[]; activeTab: string; onSelectTab: (id: string) => void }) {
  const i = chapters.findIndex((c) => c.id === activeTab), prev = chapters[i - 1], next = chapters[i + 1];
  return (
    <div className="sn-pager">
      {prev ? <button onClick={() => onSelectTab(prev.id)}><small>Previous</small><strong>← {prev.label}</strong></button> : <span />}
      {next ? <button className="next" onClick={() => onSelectTab(next.id)}><small>Next chapter</small><strong>{next.label} →</strong></button> : <span />}
    </div>
  );
}

export function Preloader() {
  const [show, setShow] = useState(() => !sessionStorage.getItem("seen"));
  useEffect(() => { if (!show) return; const t = setTimeout(() => { sessionStorage.setItem("seen", "1"); setShow(false); }, 1500); return () => clearTimeout(t); }, [show]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="sn-pre" exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
          <div className="sn-pre__bars" aria-hidden>{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.05}s` }} />)}</div>
          <p>Acoustic Observatory</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SiteFooter({ scrollTo }: { scrollTo: (id: string) => void }) {
  return (
    <footer className="sf">
      <div className="sf__top">
        <div><h3>Acoustic<br />Observatory</h3><p>Bird sound across California, Arizona and Texas.</p></div>
        <div><h4>Explore</h4><button onClick={() => scrollTo("field-guide")}>Field guide</button><button onClick={() => scrollTo("research")}>Chapters</button><button onClick={() => scrollTo("methods")}>Method</button></div>
        <div><h4>Project</h4><a href="https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity" target="_blank" rel="noreferrer">GitHub repository</a><a href="https://www.linkedin.com/in/samanwita-mukherjee" target="_blank" rel="noreferrer">Samanwita Mukherjee</a></div>
        <div><h4>Data</h4><a href="https://xeno-canto.org" target="_blank" rel="noreferrer">Xeno-canto recordings</a><a href="https://ebird.org" target="_blank" rel="noreferrer">eBird observations</a></div>
      </div>
      <div className="sf__bottom"><span>Recordings © their recordists, shared under the Creative Commons licence shown with each clip. eBird data © Cornell Lab of Ornithology.</span><span>React · Canvas · Python</span></div>
    </footer>
  );
}
