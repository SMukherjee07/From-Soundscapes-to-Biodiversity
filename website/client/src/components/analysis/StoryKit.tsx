import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, Maximize2, X } from "lucide-react";
import "./story.css";

export type FigSpec = { n?: number | string; src: string; caption: string; open?: string };
export type LinkSpec = { label: string; href: string };

export function Paras({ text }: { text: string[] }) { return <>{text.map((t, i) => <p key={i}>{t}</p>)}</>; }

export function Fig({ n, src, caption, open }: FigSpec) {
  const [zoom, setZoom] = useState(false), btn = useRef<HTMLButtonElement>(null), close = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!zoom) return; close.current?.focus(); const k = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false); window.addEventListener("keydown", k); return () => { window.removeEventListener("keydown", k); btn.current?.focus(); }; }, [zoom]);
  return (
    <figure className="sk-fig">
      <button ref={btn} className="sk-fig__img" onClick={() => setZoom(true)} aria-label={`Enlarge figure ${n ?? ""}`}>
        <img src={src} alt={caption} loading="lazy" /><span><Maximize2 size={14} /> Enlarge</span>
      </button>
      <figcaption><b>{n !== undefined ? `Figure ${n}. ` : ""}</b>{caption}{open && <a href={open} target="_blank" rel="noreferrer">Original file <ExternalLink size={12} /></a>}</figcaption>
      <AnimatePresence>
        {zoom && (
          <motion.div className="sk-lightbox" role="dialog" aria-modal="true" aria-label={caption} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(false)}>
            <button ref={close} className="sk-lightbox__x" onClick={() => setZoom(false)} aria-label="Close"><X size={20} /></button>
            <img src={src} alt={caption} onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </figure>
  );
}
export function FigGrid({ figs, cols = 2 }: { figs: FigSpec[]; cols?: 1 | 2 | 3 }) { return <div className={`sk-grid sk-grid--${cols}`}>{figs.map((f) => <Fig key={f.src} {...f} />)}</div>; }

export function DataTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <div className="sk-tablewrap" tabIndex={0} role="region" aria-label={caption}>
      <table className="sk-table"><caption>{caption}</caption><thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody></table>
    </div>
  );
}

export function CodeBlock({ title, code, href }: { title: string; code: string; href?: string }) {
  const [done, setDone] = useState(false);
  return (
    <details className="sk-code">
      <summary>{title}</summary>
      <div className="sk-code__bar"><button onClick={() => { navigator.clipboard?.writeText(code); setDone(true); setTimeout(() => setDone(false), 1500); }}>{done ? <Check size={14} /> : <Copy size={14} />} {done ? "Copied" : "Copy"}</button>{href && <a href={href} target="_blank" rel="noreferrer">Full notebook <ExternalLink size={12} /></a>}</div>
      <pre tabIndex={0}><code>{code}</code></pre>
    </details>
  );
}

export function Links({ links }: { links: LinkSpec[] }) {
  const ok = links.filter((l) => l.href); if (!ok.length) return null;
  return <div className="sk-links">{ok.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer"><span>{l.label}</span><ExternalLink size={15} /></a>)}</div>;
}

export function Chapter({ id, no, title, kicker, children }: { id: string; no: string; title: string; kicker?: string; children: ReactNode }) {
  return (
    <motion.section className="sk-chapter" initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} aria-labelledby={`${id}-h`}>
      <header id={id} className="sk-chapter__head"><span aria-hidden>{no}</span><div>{kicker && <p>{kicker}</p>}<h3 id={`${id}-h`}>{title}</h3></div></header>
      <div className="sk-chapter__body">{children}</div>
    </motion.section>
  );
}

export function Stats({ items }: { items: { v: string; l: string }[] }) { return <dl className="sk-stats">{items.map((s) => <div key={s.l}><dd>{s.v}</dd><dt>{s.l}</dt></div>)}</dl>; }

export function Panes({ tabs, label }: { tabs: { id: string; label: string; body: ReactNode }[]; label: string }) {
  const [cur, setCur] = useState(tabs[0].id);
  const move = (e: React.KeyboardEvent, i: number) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return; const n = (i + d + tabs.length) % tabs.length; setCur(tabs[n].id); document.getElementById(`pane-t-${tabs[n].id}`)?.focus(); };
  return (
    <div className="sk-panes">
      <div className="sk-tabs" role="tablist" aria-label={label}>
        {tabs.map((t, i) => <button key={t.id} id={`pane-t-${t.id}`} role="tab" aria-selected={cur === t.id} aria-controls={`pane-p-${t.id}`} tabIndex={cur === t.id ? 0 : -1} className={cur === t.id ? "on" : ""} onClick={() => setCur(t.id)} onKeyDown={(e) => move(e, i)}>{t.label}{cur === t.id && <motion.i layoutId={`pt-${label}`} />}</button>)}
      </div>
      {tabs.map((t) => cur === t.id && (
        <motion.div key={t.id} id={`pane-p-${t.id}`} role="tabpanel" aria-labelledby={`pane-t-${t.id}`} className="sk-pane" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>{t.body}</motion.div>
      ))}
    </div>
  );
}
