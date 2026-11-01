import { JournalPages } from './JournalPages';
import { Fig, DataTable, Links } from '../analysis/StoryKit';
import { researchChapters } from './researchContent';
import { VIZ, AuthorPrompt } from './ResearchViz';
import './research.css';

export function ResearchChapters({ chapter }: { chapter: string }) {
  const content = researchChapters[chapter];
  if (!content) return null;
  return <JournalPages key={chapter} book={chapter.toLowerCase()} labels={content.pages.map(p => p.label)}>
    {content.pages.map(page => <section className="research-page" key={page.label}>
      <p className="research-kicker">{content.stage}</p>
      <h2>{page.title}</h2>
      {page.lead && <p className="research-lead">{page.lead}</p>}
      {page.blocks.map((block, i) => {
        if (block.kind === 'heading') return <h3 key={i}>{block.text}</h3>;
        if (block.kind === 'note') return <aside key={i} className="research-note"><strong>{block.title}</strong><p>{block.text}</p></aside>;
        if (block.kind === 'table') return <DataTable key={i} caption={block.caption} head={block.head} rows={block.rows} />;
        if (block.kind === 'figure') {
          const fig = <Fig src={'/research/' + block.file} caption={block.caption} open={'/research/' + block.file} />;
          return block.collapsed ? <details key={i} className="research-foldout"><summary>{block.caption}</summary>{fig}</details> : <div key={i}>{fig}</div>;
        }
        if (block.kind === 'viz') return <div key={i}>{VIZ[block.name]?.()}</div>;
        if (block.kind === 'prompt') return <AuthorPrompt key={i} title={block.title} text={block.text} />;
        if (block.kind === 'links') return <Links key={i} links={block.links} />;
        return <p key={i}>{block.text}</p>;
      })}
    </section>)}
  </JournalPages>;
}
