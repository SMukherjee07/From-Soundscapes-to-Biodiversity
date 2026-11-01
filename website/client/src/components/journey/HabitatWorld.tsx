import { useEffect, useRef, useState } from "react";
import { Pause, Play, Maximize, Minimize, BookOpen } from "lucide-react";
import "./habitat.css";
export const HABITATS = {california:{label:"California",place:"Coastal oak woodland",asset:"/art/california.png"},arizona:{label:"Arizona",place:"Sonoran desert & sky islands",asset:"/art/arizona.png"},texas:{label:"Texas",place:"The Piney Woods",asset:"/art/texas.png"}};
export type HabitatKey = keyof typeof HABITATS;
export function HabitatWorld({region}:{region:HabitatKey}) {
  const layer=useRef<HTMLDivElement>(null);
  const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [reading,setReading]=useState(false);
  const [full,setFull]=useState(false);
  const [stage,setStage]=useState('Arrival');
  const [fullError,setFullError]=useState('');
  useEffect(()=>{document.body.dataset.reading=String(reading);return()=>{delete document.body.dataset.reading;};},[reading]);
  useEffect(()=>{
    const onFull=()=>setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange',onFull);
    return()=>document.removeEventListener('fullscreenchange',onFull);
  },[]);
  useEffect(()=>{
    document.body.dataset.motion=paused?'paused':'active';const root=layer.current;if(!root)return;
    let raf=0;
    const update=()=>{raf=0;const progress=window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);root.style.setProperty('--travel',String(paused?0:progress));
      const stops=[['top','Arrival'],['expedition','Expedition'],['field-notes','Field notes'],['field-guide','Field guide'],['research','Research'],['immersive','Signal lab'],['methods','Method']];
      let current='Arrival';for(const [id,name] of stops){const node=document.getElementById(id);if(node && node.getBoundingClientRect().top<innerHeight*.45)current=name;}setStage(current);
    };
    const scroll=()=>{if(!raf)raf=requestAnimationFrame(update);};
    const pointer=(e:PointerEvent)=>{if(paused)return;root.style.setProperty('--look-x',String((e.clientX/innerWidth-.5)*2));root.style.setProperty('--look-y',String((e.clientY/innerHeight-.5)*2));};
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('pointermove',pointer,{passive:true});update();
    if(paused){root.style.setProperty('--look-x','0');root.style.setProperty('--look-y','0');}
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',scroll);window.removeEventListener('pointermove',pointer);};
  },[paused]);
  return <><div className={`habitat-world ${paused?'is-still':''}`} ref={layer} aria-hidden>
    {Object.entries(HABITATS).map(([key,h])=><div key={key} className={`habitat-world__image ${region===key?'active':''}`} style={{backgroundImage:`url(${h.asset})`}}/>)}
    <div className="habitat-world__shade"/><div className="habitat-world__mist"/><div className="habitat-world__light"/>
  </div><aside className="expedition-hud" aria-label="Experience controls"><div><i/><span>{HABITATS[region].label}<small>{stage} / {HABITATS[region].place}</small></span></div><div>
    <button aria-label={paused?'Enable ambient motion':'Pause ambient motion'} aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>
    <button aria-label="Quiet reading mode" aria-pressed={reading} onClick={()=>setReading(v=>!v)}><BookOpen size={16}/></button>
    <button aria-label={full?'Exit fullscreen':'Enter fullscreen'} onClick={()=>{setFullError('');const action=document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();action.catch(()=>setFullError('Fullscreen is unavailable in this browser.'));}}>{full?<Minimize size={16}/>:<Maximize size={16}/>}</button></div>{fullError&&<p role="status">{fullError}</p>}</aside></>;
}

