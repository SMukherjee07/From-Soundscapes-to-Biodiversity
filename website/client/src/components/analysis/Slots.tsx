import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

export type Img = { src: string; alt: string; caption?: string };
export type LinkSpec = { label: string; href: string; note?: string };

/** Renders YOUR paragraphs. Empty → a dashed placeholder so nothing is silently missing. */
export function TextBlock({ paragraphs, hint }: { paragraphs: string[]; hint: string }) {
  if (!paragraphs.length) return <div className="an-slot">✍️ {hint}</div>;
  return <div className="an-prose">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>;
}
export function ImageGrid({ images, min, hint }: { images: Img[]; min?: number; hint: string }) {
  return (
    <>
      {images.length > 0 && (
        <div className="an-imgs">
          {images.map((im) => (
            <figure key={im.src}>
              <img src={im.src} alt={im.alt} loading="lazy" />
              {im.caption && <figcaption>{im.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      {min !== undefined && images.length < min && <div className="an-slot">🖼️ {hint} ({images.length}/{min})</div>}
    </>
  );
}
export function LinkCards({ links, hint }: { links: LinkSpec[]; hint: string }) {
  const ok = links.filter((l) => l.href);
  if (!ok.length) return <div className="an-slot">🔗 {hint}</div>;
  return (
    <div className="an-links">
      {ok.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
          <span>{l.label}{l.note && <small>{l.note}</small>}</span>
          <ExternalLink size={16} />
        </a>
      ))}
    </div>
  );
}
export function SectionHead({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header id={id} className="an-head">
      <p>{eyebrow}</p>
      <h3>{title}</h3>
      {children}
    </header>
  );
}
export function Panel({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="an-panel">
      <div className="an-panel__head"><h4>{title}</h4>{sub && <p>{sub}</p>}</div>
      {children}
    </div>
  );
}
export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="an-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.v)} className={o.v === value ? "on" : ""} onClick={() => onChange(o.v)} aria-pressed={o.v === value}>{o.label}</button>
      ))}
    </div>
  );
}
