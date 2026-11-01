import { Children, isValidElement, useEffect, useId, useRef, useState, type ReactNode, type ReactElement } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './journal.css';
function words(node:ReactNode):string {if(typeof node==='string'||typeof node==='number')return String(node);if(Array.isArray(node))return node.map(words).join(' ');if(isValidElement<{children?:ReactNode}>(node))return words(node.props.children);return '';}
function heading(node:ReactNode):string {if(!isValidElement<{title?:string;children?:ReactNode}>(node))return '';if(node.props.title)return node.props.title;if(typeof node.type==='string'&&/^h[1-6]$/.test(node.type))return words(node.props.children);for(const child of Children.toArray(node.props.children)){const title=heading(child);if(title)return title;}return '';}
export function JournalPages({children,book,labels}:{children:ReactNode;book:string;labels?:string[]}) {
 const pages=Children.toArray(children).filter(isValidElement) as ReactElement[];
 const fromUrl=()=>{const leaf=new URLSearchParams(location.search).get('leaf')||'';const number=leaf.startsWith(book+'-')?Number(leaf.slice(book.length+1)):1;return Number.isInteger(number)?Math.max(0,Math.min(pages.length-1,number-1)):0;};
 const [page,setPage]=useState(fromUrl),[direction,setDirection]=useState(1),[all,setAll]=useState(false);
 const reduce=useReducedMotion(),labelId=useId(),focus=useRef<HTMLHeadingElement>(null),moved=useRef(false);
 const titles=pages.map((node,index)=>labels?.[index]||heading(node)||'Field plate '+(index+1));
 useEffect(()=>{const back=()=>{setPage(fromUrl());setAll(false);};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[book,pages.length]);
 const href=(index:number)=>{const url=new URL(location.href);url.searchParams.set('leaf',book+'-'+(index+1));url.hash='research';return url.pathname+url.search+url.hash;};
 const go=(index:number)=>{setDirection(index>=page?1:-1);setPage(index);setAll(false);moved.current=true;history.pushState({},'',href(index));};
 const focusPage=()=>{if(moved.current){focus.current?.focus({preventScroll:true});focus.current?.scrollIntoView({block:'start',behavior:'instant'});moved.current=false;}};
 const controls=<nav className="leaf-controls" aria-label={book+' page navigation'}><button disabled={page===0} onClick={()=>go(page-1)}>← Previous page</button><span aria-live="polite">PAGE {page+1} / {pages.length}</span><button disabled={page===pages.length-1} onClick={()=>go(page+1)}>Next page →</button></nav>;
 return <div className={'journal-book journal-book--'+book}>
  <div className="journal-binding" aria-hidden="true" />
  <div className="leaf-index"><label htmlFor={labelId}>Open a page</label><select id={labelId} value={page} onChange={event=>go(Number(event.target.value))}>{titles.map((title,index)=><option key={index} value={index}>{String(index+1).padStart(2,'0')} · {title}</option>)}</select><button onClick={()=>{setAll(value=>!value);moved.current=true;}} aria-pressed={all}>{all?'Return to page view':'Read full chapter'}</button></div>
  <nav className="leaf-page-links" aria-label="Direct journal page links">{titles.map((title,index)=><a key={index} href={href(index)} aria-current={!all&&page===index?'page':undefined} onClick={event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();go(index);}}>{title}</a>)}</nav>
  {!all&&controls}
  <div className="journal-perspective"><AnimatePresence mode="wait" initial={false}><motion.div className="journal-leaf" key={all?'all':page} initial={{rotateY:reduce?0:direction*10,opacity:reduce?1:0}} animate={{rotateY:0,opacity:1}} exit={{rotateY:reduce?0:direction*-10,opacity:reduce?1:0}} transition={{duration:reduce?0:.25,ease:'easeInOut'}} onAnimationComplete={focusPage}>
   <div className="leaf-running-head"><span>ACOUSTIC OBSERVATORY / FIELD JOURNAL</span><span>{all?'COMPLETE CHAPTER':String(page+1).padStart(2,'0')}</span></div>
   <h3 className="leaf-title" ref={focus} tabIndex={-1}>{all?'Complete chapter':titles[page]}</h3>
   <div className="journal-page-content">{all?pages:pages[page]}</div><div className="leaf-colophon">OBSERVE · MEASURE · QUESTION</div>
  </motion.div></AnimatePresence></div>{!all&&controls}
 </div>;
}
