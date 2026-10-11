import "./analysis.css";
import { modelContent } from "@/content/models";
import { Reveal } from "./Reveal";
import { SectionNav } from "./SectionNav";
import { ImageGrid, LinkCards, SectionHead, TextBlock } from "./Slots";

export function ChapterTab({ id, label }: { id: string; label: string }) {
  const C = modelContent[id];
  const sections = [
    { id: `${id}-overview`, label: "Overview" },
    { id: `${id}-dataprep`, label: "Data Prep" },
    { id: `${id}-code`, label: "Code" },
    { id: `${id}-results`, label: "Results" },
    { id: `${id}-conclusions`, label: "Conclusions" },
  ];
  if (!C) return null;
  return (
    <div className="an-root">
      <SectionNav sections={sections} />
      <Reveal><section>
        <SectionHead id={sections[0].id} eyebrow="a · Overview" title={label} />
        <TextBlock paragraphs={C.overview.paragraphs} hint="Overview" />
        <ImageGrid images={C.overview.images} min={2} hint="Overview visuals" />
      </section></Reveal>
      <Reveal><section>
        <SectionHead id={sections[1].id} eyebrow="b · Data Prep" title="Model input" />
        <TextBlock paragraphs={C.dataPrep.paragraphs} hint="Data preparation" />
        <ImageGrid images={C.dataPrep.images} min={1} hint="Data sample" />
        <LinkCards links={C.dataPrep.links} hint="Data sample link" />
      </section></Reveal>
      <Reveal><section>
        <SectionHead id={sections[2].id} eyebrow="c · Code" title="Implementation" />
        <TextBlock paragraphs={C.code.paragraphs} hint="Code description" />
        <LinkCards links={C.code.links} hint="Notebook / code link" />
      </section></Reveal>
      <Reveal><section>
        <SectionHead id={sections[3].id} eyebrow="d · Results" title="What the model shows" />
        <TextBlock paragraphs={C.results.paragraphs} hint="Results" />
        <ImageGrid images={C.results.figures} hint="Results figures" />
      </section></Reveal>
      <Reveal><section>
        <SectionHead id={sections[4].id} eyebrow="e · Conclusions" title="What this means for the topic" />
        <TextBlock paragraphs={C.conclusions.paragraphs} hint="Conclusions" />
      </section></Reveal>
    </div>
  );
}
