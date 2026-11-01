import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X, ArrowDown, Headphones } from "lucide-react";
import { useJson } from "@/components/analysis/useJson";
import { SoundEngine } from "./soundEngine";
import { HABITATS, type HabitatKey } from "../journey/HabitatWorld";
import type { RegionKey } from "./scene";
import "./forest.css";

type Bird={id:string;common:string;scientific:string;state:RegionKey;date:string;time:string;quality:string;seconds:number;license:string;source:string;remote:string;audio:string;adaptable:boolean};
type Manifest={regions:Record<RegionKey,Bird[]>};
const ROW={CA:0,AZ:1,TX:2};
const KEYS:Record<HabitatKey,RegionKey>={california:'CA',arizona:'AZ',texas:'TX'};
export function BirdPortrait({region,index,className=''}:{region:RegionKey;index:number;className?:string}){
  return <span aria-hidden className={`bird-portrait ${className}`} style={{backgroundSize:`600% ${region === 'CA' ? 286.13 : region === 'AZ' ? 354.8 : 271.25}%`,backgroundPosition:`${index*20}% ${region === 'CA' ? 0 : region === 'AZ' ? 48.67 : 100}%`}}/>;
}
export function ForestExperience({onEnter,soundOn,onToggleSound,region,onRegionChange}:{onEnter:()=>void;soundOn:boolean;onToggleSound:()=>void;region:HabitatKey;onRegionChange:(region:HabitatKey)=>void}) {
  const {data,error}=useJson<Manifest>('/data/birds.json');
  const regionKey=KEYS[region],birds=data?.regions[regionKey]??[];
  const [selected,setSelected]=useState<number|null>(null);
  const [audioError,setAudioError]=useState('');
  const [playing,setPlaying]=useState(false);
  const engine=useRef<SoundEngine|null>(null),clip=useRef<HTMLAudioElement|null>(null),close=useRef<HTMLButtonElement>(null),opener=useRef<HTMLButtonElement|null>(null);
  const soundRef=useRef(soundOn);soundRef.current=soundOn;
  useEffect(()=>{if(!engine.current)engine.current=new SoundEngine();if(soundOn)engine.current.start(regionKey,[]).catch(()=>{});else{engine.current.stop();clip.current?.pause();setPlaying(false);}},[soundOn,regionKey]);
  useEffect(()=>()=>{engine.current?.stop();void engine.current?.ctx?.close();clip.current?.pause();},[]);
  useEffect(()=>{clip.current?.pause();setSelected(null);setPlaying(false);setAudioError('');},[region]);
  const dismiss=()=>{clip.current?.pause();setSelected(null);setPlaying(false);engine.current?.duck(false);opener.current?.focus();};
  useEffect(()=>{if(selected===null)return;close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')dismiss();};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[selected]);
  const choose=(i:number,target:HTMLButtonElement)=>{
    opener.current=target;clip.current?.pause();setSelected(i);setAudioError('');setPlaying(false);
    if(!soundOn)onToggleSound();engine.current?.duck(true);
    const bird=birds[i],audio=new Audio(bird.remote);clip.current=audio;
    audio.onplaying=()=>{if(!soundRef.current){audio.pause();return;}setPlaying(true);};audio.onpause=()=>setPlaying(false);audio.onended=()=>{setPlaying(false);engine.current?.duck(false);};
    audio.onerror=()=>{setPlaying(false);setAudioError('The source recording is unavailable here. Open Xeno-canto below to listen and view its attribution.');};
    audio.play().catch(()=>{if(clip.current===audio)setAudioError('Playback could not start. Use the source link below.');});
  };
  const b=selected===null?null:birds[selected];
  return <section id="top" className="field-arrival" aria-label="Immersive listening habitat">
    <div className="arrival-copy"><p className="arrival-kicker">AN EXPEDITION INTO ECOLOGICAL SOUND</p><h1>Listen to<br/>a living <em>landscape.</em></h1><p className="arrival-lede">From soundscapes to biodiversity. Follow a recording from the forest into the evidence—and discover what sound can, and cannot, tell us.</p><div className="arrival-actions"><button onClick={onEnter}>Follow the research <ArrowDown size={16}/></button><a href="#immersive">Enter the virtual observatory ↗</a></div><p className="arrival-meta">275 recordings <span/> 3 states <span/> One open question</p></div>
    <div className="encounter-field"><div className="encounter-heading"><span>LISTENING POST / {KEYS[region]}</span><h2>{HABITATS[region].place}</h2><p>Select a bird to inspect its recording.</p></div><div className="encounter-birds" aria-label={`Bird recordings from ${HABITATS[region].label}`}>
      {birds.map((bird,i)=><button key={bird.id} className={`bird-encounter bird-encounter--${i}`} aria-label={`Listen to ${bird.common}`} onClick={e=>choose(i,e.currentTarget)}><BirdPortrait region={regionKey} index={i}/><span className="bird-name"><b>{bird.common}</b><small><Headphones size={11}/> XC{bird.id}</small></span></button>)}
      {error&&<p role="status">The recording catalogue could not be loaded.</p>}
    </div></div>
    <div className="habitat-switcher" role="group" aria-label="Choose habitat">{Object.entries(HABITATS).map(([key,h],i)=><button key={key} aria-pressed={key===region} onClick={()=>onRegionChange(key as HabitatKey)}><small>0{i+1}</small><span>{h.label}<em>{h.place}</em></span></button>)}<button className="arrival-sound" aria-pressed={soundOn} onClick={onToggleSound}>{soundOn?<Volume2 size={18}/>:<VolumeX size={18}/>}<span>{soundOn?'Sound on':'Enable sound'}<em>Optional ambient audio</em></span></button></div>
    <details className="arrival-provenance"><summary>About the scene & recordings</summary><p>AI-generated habitat artwork and bird illustrations create the setting; they are not field photographs or identification evidence. Species names and recording details come from the Xeno-canto manifest. Ambience is synthesized. These focal recordings do not constitute a community survey.</p></details>
    {b&&<aside className="encounter-panel" role="region" aria-label={`${b.common} recording`}><button ref={close} className="encounter-close" onClick={dismiss} aria-label="Close bird recording"><X size={20}/></button><p className="arrival-kicker">FIELD RECORDING / {b.state}</p><BirdPortrait region={regionKey} index={selected!}/><h2>{b.common}</h2><em>{b.scientific}</em><p>{b.date} · Quality {b.quality} · {Math.round(b.seconds)} seconds</p><p role="status">{audioError||(playing?'Playing the source recording':'Recording selected')}</p>{playing&&<button className="encounter-pause" onClick={()=>{clip.current?.pause();engine.current?.duck(false);}}>Pause recording</button>}<a href={b.source} target="_blank" rel="noreferrer">Xeno-canto XC{b.id} · source & recordist ↗</a><a href={b.license} target="_blank" rel="noreferrer">Recording license ↗</a></aside>}
  </section>;
}

