import { ResearchChapters } from '@/components/journal/ResearchChapters';
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DataPrepEDA } from "@/components/DataPrepEDA";
import { IntroductionContent } from "@/IntroductionContent";
import { ClusteringTab } from "@/components/analysis/ClusteringTab";
import { PCATab } from "@/components/analysis/PCATab";
import { Expedition } from "@/components/forest/Expedition";
import "@/components/forest/observatory.css";
import { HabitatWorld, type HabitatKey } from "@/components/journey/HabitatWorld";
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  Bird,
  ChevronDown,
  CirclePause,
  CirclePlay,
  Github,
  Leaf,
  Menu,
  Mic2,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
  X,
} from "lucide-react";

const SignalLab = lazy(() => import("@/components/forest/SignalLab").then(m => ({ default: m.SignalLab })));

// Real, CC-licensed photographs from Wikimedia Commons, matched to each
// region's actual habitat — attribution required (CC BY-SA) if this goes public:
// hero: "White crowned sparrows..." (Commons, Category:Singing birds)
// field: Sam Houston National Forest longleaf pine, Walker County, TX (Commons)
const HERO_IMAGE = "https://commons.wikimedia.org/wiki/Special:FilePath/White_crowned_sparrows_are_a_common_sight_in_spring_(e6fa9c39-1dd8-b71c-07a3-0e858ce8a402).jpg";
const FIELD_IMAGE = "https://commons.wikimedia.org/wiki/Special:FilePath/Longleaf_pine_(Pinus_palustris),_Sam_Houston_National_Forest,_Walker_County,_Texas,_USA_(September_2020).jpg";
// Region-card background images, one per state, real habitat photos:
const REGION_IMAGES = {
  california: "https://commons.wikimedia.org/wiki/Special:FilePath/Southern_California_Chaparral.JPG",
  arizona: "https://commons.wikimedia.org/wiki/Special:FilePath/SkyIslands_from_SantaCatalinaMtns.JPG",
  texas: "https://commons.wikimedia.org/wiki/Special:FilePath/Longleaf_pine_(Pinus_palustris),_Sam_Houston_National_Forest,_Walker_County,_Texas,_USA_(September_2020).jpg",
};

// Tab names match the assignment's required naming exactly (rubric: "DO NOT
// change the names") — order follows the module sequence (A1 → A5).
const navItems = [
  "Introduction",
  "DataPrep_EDA",
  "Clustering",
  "PCA",
  "NaiveBayes",
  "DecTrees",
  "Generalization",
  "Biodiversity",
  "Regression",
  "AdaBoost",
  "GradientBoosting",
  "XGBoost",
  "Conclusions",
  "Sources",
];

const navLabels: Record<string, string> = {
  Introduction: "Introduction",
  DataPrep_EDA: "Data Prep & EDA",
  Clustering: "Clustering",
  PCA: "PCA",
  NaiveBayes: "Naive Bayes",
  DecTrees: "Decision Trees",
  Generalization: "Generalization",
  Biodiversity: "Biodiversity",
  Sources: "Sources & Code",
  Regression: "Regression",
  AdaBoost: "AdaBoost",
  GradientBoosting: "GradientBoosting",
  XGBoost: "XGBoost",
  Conclusions: "Conclusions",
};

// Real values from the A1 diverse-sampling pipeline.
// Species counts refer to species represented by the acquired acoustic recordings;
// they are not estimates of regional biodiversity richness.
const regions = [
  {
    id: "california",
    name: "California",
    abbr: "CA",
    recordings: "100",
    species: "66",
    tone: "coral",
    note: "Coastal oak & chaparral",
  },
  {
    id: "arizona",
    name: "Arizona",
    abbr: "AZ",
    recordings: "75",
    species: "44",
    tone: "gold",
    note: "Sky islands & Sonoran desert",
  },
  {
    id: "texas",
    name: "Texas",
    abbr: "TX",
    recordings: "100",
    species: "100",
    tone: "cyan",
    note: "Piney woods & grassland",
  },
];
const analysisCopy: Record<string, { eyebrow: string; title: string; text: string; metric: string }> = {
  Introduction: {
    eyebrow: "THE QUESTION",
    title: "Can a landscape be understood by listening?",
    text: "This observatory follows bird recordings across three geographically distinct regions to investigate whether acoustic patterns can provide meaningful evidence about biodiversity.",
    metric: "03 regions",
  },
  DataPrep_EDA: {
    eyebrow: "A1 · DATA FOUNDATION",
    title: "Every observation begins as a sound.",
    text: "Audio, place, time, and species metadata are prepared as a transparent research pipeline before any model is trained.",
    metric: "275 recordings",
  },
  Clustering: {
    eyebrow: "A2 · DISCOVER",
    title: "A structure, not a species count.",
    text: "Compare acoustic groupings, their stability, and the limits of interpreting them as ecological communities.",
    metric: "analysis chapter",
  },
  PCA: {
    eyebrow: "A2 · DISCOVER",
    title: "Reducing a forest of features.",
    text: "Inspect the directions of acoustic variation, their feature loadings, and their sensitivity to preprocessing.",
    metric: "analysis chapter",
  },
  NaiveBayes: {
    eyebrow: "A3 · CLASSIFY",
    title: "Probabilities in every chirp.",
    text: "Compare probabilistic classifications, out-of-fold evidence and the reliability of model scores.",
    metric: "analysis chapter",
  },
  DecTrees: {
    eyebrow: "A3 · CLASSIFY",
    title: "Readable branches of evidence.",
    text: "Inspect acoustic decision rules, pruning and generalization across held-out coordinate groups.",
    metric: "analysis chapter",
  },
  Generalization: {eyebrow: "ROBUSTNESS · STUDY A", title: "What survives a change of conditions?", text: "Feature families, quality sensitivity and regularization reveal the limits of regional discrimination.", metric: "development evidence"},
  Biodiversity: {eyebrow: "BIOLOGICAL REFERENCE · STUDY B", title: "What was audibly present?", text: "Expert annotations connect acoustic measurements to species composition and richness. Biological scoring is underway.", metric: "7-recording pilot"},
  Sources: {eyebrow: "REPRODUCIBLE RESEARCH", title: "An open field record.", text: "Inspect the code, data provenance, source credits and limits behind each result.", metric: "traceable evidence"},
  Regression: {
    eyebrow: "A5 · PREDICT",
    title: "Estimating diversity from sound.",
    text: "Regression will explore how a soundscape's measured texture relates to observed species richness.",
    metric: "analysis chapter",
  },
  AdaBoost: { eyebrow: "ENSEMBLE · BOOSTING", title: "AdaBoost", text: "", metric: "analysis chapter" },
  GradientBoosting: { eyebrow: "ENSEMBLE · BOOSTING", title: "GradientBoosting", text: "", metric: "analysis chapter" },
  XGBoost: { eyebrow: "ENSEMBLE · BOOSTING", title: "XGBoost", text: "", metric: "analysis chapter" },
  Conclusions: {
    eyebrow: "THE TAKEAWAY",
    title: "What can sound tell us about biodiversity?",
    text: "The study examines where acoustic information is informative, where it becomes limited, and how recording and sampling conditions shape ecological interpretation.",
    metric: "sound → evidence",
  },
};

function Waveform({ compact = false }: { compact?: boolean }) {
  const bars = Array.from({ length: compact ? 36 : 88 }, (_, index) => {
    const wave = Math.sin(index * 0.43) * 0.34 + Math.sin(index * 0.12 + 1.2) * 0.24;
    const height = 18 + Math.abs(wave) * (compact ? 30 : 70) + (index % 11 === 0 ? 19 : 0);
    return <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 22}ms` }} />;
  });
  return <div className={`waveform ${compact ? "waveform--compact" : ""}`}>{bars}</div>;
}

function BirdFlight() {
  return (
    <svg className="bird-flight" viewBox="0 0 132 48" aria-hidden="true">
      <motion.path
        d="M4 28 C16 10, 27 12, 42 27 C49 15, 58 12, 66 26 C78 10, 95 10, 128 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.75 }}
        transition={{ duration: 1.7, delay: 1, ease: "easeOut" }}
      />
      <motion.path
        d="M42 27 L35 22 M42 27 L48 20 M66 26 L59 21 M66 26 L73 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2.1 }}
      />
    </svg>
  );
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState(() => { const c=new URLSearchParams(location.search).get("chapter"); return c && navItems.includes(c) ? c : "Introduction"; });
  const destination=(id:string)=>["research","field-guide","field-notes","methods","immersive"].includes(id)?id:"top";
  const [view,setView]=useState(()=>destination(location.hash.slice(1)));
  const [activeRegion, setActiveRegion] = useState<HabitatKey>("california");
  const [soundOn, setSoundOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeRegionInfo = regions.find((region) => region.id === activeRegion) ?? regions[2];
  const copy = analysisCopy[activeTab];

  const stopSoundscape = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setSoundOn(false);
  };



  const toggleSoundscape = () => setSoundOn((v) => !v);


  useEffect(() => () => stopSoundscape(), []);

  const scrollTo = (id: string) => {setView(destination(id));const url=new URL(location.href);url.hash=id;history.pushState({},'',url);requestAnimationFrame(()=>requestAnimationFrame(()=>{const node=document.getElementById(id);if(node){node.scrollIntoView({behavior:"instant",block:"start"});const title=node.querySelector<HTMLElement>("h1,h2")||node;title.tabIndex=-1;title.focus({preventScroll:true});}}));};
  useEffect(()=>{const back=()=>{setView(destination(location.hash.slice(1)));const c=new URLSearchParams(location.search).get('chapter');if(c&&navItems.includes(c))setActiveTab(c);};window.addEventListener('popstate',back);window.addEventListener('hashchange',back);return()=>{window.removeEventListener('popstate',back);window.removeEventListener('hashchange',back);};},[]);
  useEffect(()=>{const url=new URL(location.href);url.searchParams.set('chapter',activeTab);history.replaceState({},'',url);},[activeTab]);

  return (
    <main className="site-shell" data-view={view} onClickCapture={event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const a=(event.target as Element).closest('a[href^="#"]');if(a){const id=a.getAttribute('href')!.slice(1);if(id){event.preventDefault();scrollTo(id);}}}}>
      <a className="skip-link" href="#research">Skip to research</a>
      <HabitatWorld region={activeRegion} />
      <audio
        ref={audioRef}
        src="/audio/AZ_218539.mp3"
        preload="metadata"
      />
      <header className="site-header">
        <button className="brand" onClick={() => scrollTo("top")} aria-label="Return to top">
          <span className="brand-mark"><Bird size={18} strokeWidth={1.8} /></span>
          <span>Acoustic<br />Observatory</span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => scrollTo("field-guide")}>Field guide</button>
          <button onClick={() => scrollTo("research")}>Research</button>
          <button onClick={() => scrollTo("methods")}>Method</button>
          <button onClick={() => scrollTo("immersive")}>Signal lab</button>
        </nav>
        <div className="header-actions">
          <button className={`sound-toggle ${soundOn ? "is-on" : ""}`} onClick={toggleSoundscape} aria-pressed={soundOn}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{soundOn ? "Ambience on" : "Ambience off"}</span>
          </button>
          <button className="menu-trigger" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Open project navigation">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="project-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
            <div className="quest-links">{[["top","Choose expedition"],["field-notes","Your field notes"],["immersive","Signal lab"],["field-guide","Field guide"]].map(([id,label])=><button key={id} onClick={()=>{setMenuOpen(false);scrollTo(id);}}>{label} ↗</button>)}</div><div className="project-menu__eyebrow">RESEARCH CHAPTERS · EXPLORATORY STAGE</div>
            <div className="project-menu__tabs">
              {navItems.map((item, index) => (
                <button
                  key={item}
                  aria-current={activeTab === item ? "page" : undefined}
                className={activeTab === item ? "active" : ""}
                  onClick={() => {
                    setActiveTab(item);
                    setMenuOpen(false);
                    scrollTo("research");
                  }}
                >
                  <span>0{index + 1}</span>{navLabels[item]}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Expedition
        region={activeRegion}
        onRegionChange={setActiveRegion}
        soundOn={soundOn}
        onToggleSound={toggleSoundscape}
      />

      <div className="research-snapshot" aria-label="Research snapshot">
        <a href="#research"><small>THE COLLECTION</small><b>275</b><span>Focal bird recordings · 3 states</span></a>
        <a href="#research"><small>THE REPRESENTATION</small><b>50</b><span>Acoustic features in the primary matrix</span></a>
        <a href="#research"><small>THE STRUCTURE</small><b>9 PCs</b><span>Retained by Yeo–Johnson parallel analysis</span></a>
        <a href="#immersive"><small>THE EXPERIENCE</small><b>Listen → Test</b><span>Experiment with a real recording</span></a>
      </div>
      <section className="intro-section" id="field-guide">
        <div className="section-label"><span>01</span> A CONTINENT OF SOUND</div>
        <div className="intro-grid">
          <div>
            <p className="eyebrow eyebrow--dark"><span /> FIELD GUIDE</p>
            <h2>Three places.<br /><em>One listening question.</em></h2>
          </div>
          <div className="intro-copy">
            <p>Birdsong is not just a chorus. It is a living record of habitat, season, distance, and species. This project compares sound recordings from California, Arizona, and Texas to explore what biodiversity sounds like.</p>
            <button className="inline-link" onClick={() => scrollTo("research")}>How the study unfolds <ArrowDown size={16} /></button>
          </div>
        </div>

        <div className="region-explorer">
          <div className="map-panel">
            <div className="map-panel__top"><span>WEST & SOUTHWEST / SAMPLE SITES</span><span className="legend-dot" /> SELECT A STATE</div>
            <svg className="us-map" viewBox="0 0 700 360" role="img" aria-label="Abstract map showing California, Arizona and Texas sample locations">
              <path className="map-outline" d="M54 56L110 42L152 58L171 92L162 126L185 141L175 188L205 218L198 252L241 271L257 302L307 316L340 290L377 291L401 273L443 280L480 266L513 275L537 242L584 233L618 208L642 169L629 137L601 125L586 99L553 103L530 82L494 87L477 69L432 79L405 65L367 84L333 75L300 96L262 90L224 108L198 90L172 77L145 89L119 79L88 92Z" />
              <path className={`state-shape ca ${activeRegion === "california" ? "selected" : ""}`} onClick={() => setActiveRegion("california")} d="M132 86L159 96L175 127L162 161L176 194L157 229L165 267L141 279L112 237L94 204L91 174L74 137L83 105Z" />
              <path className={`state-shape az ${activeRegion === "arizona" ? "selected" : ""}`} onClick={() => setActiveRegion("arizona")} d="M180 165L246 174L247 236L215 258L176 247L167 211Z" />
              <path className={`state-shape tx ${activeRegion === "texas" ? "selected" : ""}`} onClick={() => setActiveRegion("texas")} d="M407 183L488 183L506 203L544 202L572 232L548 263L521 270L500 306L467 312L438 288L402 281L383 247L394 221Z" />
              <g className="map-lines"><path d="M259 135L315 147L350 143L380 159" /><path d="M293 223L341 223L377 244" /><path d="M524 130L515 182" /><path d="M559 172L598 190" /></g>
              <g className="map-label"><text x="75" y="312">PACIFIC</text><text x="569" y="338">GULF OF MEXICO</text></g>
              <g className="map-marker"><circle cx="134" cy="177" r="6" /><circle cx="214" cy="210" r="6" /><circle cx="469" cy="241" r="6" /></g>
            </svg>
            <div className="map-panel__footer">
              <span>Acoustic sample</span>
              <b>275 recordings</b>
              <span>Study regions</span>
              <b>CA · AZ · TX</b>
            </div>
          </div>

          <div className="region-details">
            <AnimatePresence mode="wait">
              <motion.div key={activeRegion} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                <p className="eyebrow eyebrow--dark"><span /> ACTIVE FIELD REGION</p>
                <h3>{activeRegionInfo.name}</h3>
                <p className="region-note">{activeRegionInfo.note}</p>
                <div className="metric-grid">
                  <div><strong>{activeRegionInfo.recordings}</strong><span>recordings</span></div>
                  <div><strong>{activeRegionInfo.species}</strong><span>species</span></div>
                </div>
                <div className="region-method-note">
                  <span>ACOUSTIC SAMPLE</span>
                  <p>
                    Species represented by the acquired acoustic recordings.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="region-list">
              {regions.map((region) => (
                <button key={region.id} className={activeRegion === region.id ? "active" : ""} onClick={() => setActiveRegion(region.id as HabitatKey)}>
                  <span className={`state-chip state-chip--${region.tone}`}>{region.abbr}</span><span>{region.name}</span><ArrowUpRight size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="signal-section" id="research">
        <div className="signal-section__background" />
        <div className="section-label section-label--light"><span>02</span> RESEARCH OBSERVATORY</div>
        <div className="research-status"><p><strong>Research checkpoint · Part 3</strong><br/>236 corrected regional recordings · 184 development / 52 held-out. Final test unevaluated. Biodiversity: annotated pilot.</p><a href="?chapter=Sources&leaf=sources-1#research">Code & evidence ↗</a></div>

        <div className="journal-questions"><small>THE RESEARCH QUESTION / EVIDENCE BEFORE INFERENCE</small><h3>When does acoustic variation become ecological information?</h3><p><b>Describe:</b> Which acoustic measurements vary across the acquired recordings, species and states?</p><p><b>Test:</b> How much structure persists when source recordings are kept separate and recording conditions are controlled?</p><p><b>Validate:</b> Can those measurements predict independently observed biodiversity in real soundscapes?</p><p>The repository currently supports exploratory PCA and clustering. Predictive ecological validation remains future work.</p></div><div className="journal-compass"><button disabled={activeTab === navItems[0]} onClick={() => { setActiveTab(navItems[Math.max(0,navItems.indexOf(activeTab)-1)]); scrollTo("research"); }}>← Previous chapter</button><span>CHAPTER / {String(navItems.indexOf(activeTab)+1).padStart(2,"0")} OF {navItems.length}</span><button disabled={activeTab === navItems[navItems.length-1]} onClick={() => { setActiveTab(navItems[Math.min(navItems.length-1,navItems.indexOf(activeTab)+1)]); scrollTo("research"); }}>Next chapter →</button></div><div className="signal-layout">

          <div className="analysis-tabs" aria-label="Research chapters">
            <p>JOURNAL CONTENTS</p>

            {navItems.map((item, index) => (
              <button
                key={item}
                className={activeTab === item ? "active" : ""}
                aria-current={activeTab === item ? "page" : undefined}
                onClick={() => { setActiveTab(item); scrollTo("research"); }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {navLabels[item]}
                {activeTab === item && <motion.i layoutId="active-tab" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              className="analysis-main"
              key={activeTab}
              initial={{ opacity: 0, rotateY: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: reduceMotion ? 0 : -12 }}
              transition={{ duration: reduceMotion ? 0 : 0.38 }}
            >

              {activeTab !== "Introduction" && (
                <>
                  <p className="eyebrow">
                    <span /> {copy.eyebrow}
                  </p>

                  <div className="analysis-main__heading">
                    <h2>{copy.title}</h2>
                    <span className="analysis-metric">{copy.metric}</span>
                  </div>

                  <p className="analysis-main__text">{copy.text}</p>
                </>
              )}

              {["DataPrep_EDA", "Clustering", "PCA"].includes(activeTab) && <aside className="research-note"><strong>Historical exploratory cohort</strong><p>These earlier analyses describe the original 275 recordings and acquisition labels. The supervised chapters use the geographically audited 236-recording cohort. Their counts and labels are not interchangeable.</p></aside>}
              {activeTab === "DataPrep_EDA" ? (
                <DataPrepEDA />
              ) : activeTab === "Introduction" ? (
                <IntroductionContent />
              ) : activeTab === "Clustering" ? (
                <ClusteringTab />
              ) : activeTab === "PCA" ? (
                <PCATab />
              ) : ["NaiveBayes", "DecTrees", "Generalization", "Biodiversity", "Conclusions", "Sources"].includes(activeTab) ? (
                <ResearchChapters chapter={activeTab} />
              ) : ["Regression", "AdaBoost", "GradientBoosting", "XGBoost"].includes(activeTab) ? (
                <div
                  className="future-visual model-placeholder"
                  style={{
                    marginTop: "2rem",
                    padding: "clamp(1.25rem, 3vw, 2rem)",
                    border: "1px solid rgba(180, 205, 190, 0.22)",
                    borderRadius: "18px",
                    background: "linear-gradient(135deg, rgba(26, 52, 45, 0.62), rgba(12, 29, 29, 0.72))",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 0.8rem",
                      fontSize: "0.72rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#b7d3bc",
                    }}
                  >
                    Model chapter · In preparation
                  </p>
                  <h3 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.35rem, 2.5vw, 1.8rem)" }}>
                    {navLabels[activeTab]} analysis
                  </h3>
                  <p style={{ maxWidth: "44rem", margin: "0 0 1.5rem", lineHeight: 1.75, color: "rgba(238, 243, 235, 0.78)" }}>
                    This section is reserved for the {navLabels[activeTab]} analysis. Results and visualizations will be added after the model has been implemented and evaluated. No PCA or clustering results are presented here.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "0.75rem",
                    }}
                  >
                    {[
                      ["01", "Prepare features", "Define the inputs and target."],
                      ["02", "Train and evaluate", "Fit the model and assess performance."],
                      ["03", "Interpret findings", "Report results, limitations, and ecological meaning."],
                    ].map(([number, title, detail]) => (
                      <div
                        key={number}
                        style={{
                          padding: "1rem",
                          borderRadius: "12px",
                          border: "1px solid rgba(180, 205, 190, 0.16)",
                          background: "rgba(255, 255, 255, 0.035)",
                        }}
                      >
                        <span style={{ display: "block", marginBottom: "0.8rem", color: "#b7d3bc", fontSize: "0.72rem" }}>
                          {number}
                        </span>
                        <strong style={{ display: "block", marginBottom: "0.4rem", color: "#f0f3eb", fontSize: "0.92rem" }}>
                          {title}
                        </strong>
                        <span style={{ display: "block", color: "rgba(238, 243, 235, 0.68)", fontSize: "0.84rem", lineHeight: 1.6 }}>
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="future-visual">
                  <h3>Exploratory structure, with ecological validation still ahead.</h3><p>The current study describes 275 focal bird recordings across 159 species. PCA and clustering reveal acoustic variation, but do not establish biodiversity, habitat condition, or species richness from a soundscape.</p><p>Publication work requires a reproducible feature pipeline, source-disjoint evaluation, and validation against independent ecological observations. The next question is when recording conditions and overlapping calls distort the measurements—and whether those failures can be quantified and corrected.</p>
                </div>
              )}

            </motion.article>
          </AnimatePresence>
        </div>
      </section>

      <Suspense fallback={<p className="obs-caption">Opening the signal workbench…</p>}><SignalLab /></Suspense><section className="method-section" id="methods">
        <div className="method-intro">
          <div><p className="eyebrow eyebrow--dark"><span /> A1 / DATA PREPARATION</p><h2>From field<br /><em>recording to insight.</em></h2></div>
          <p>The visual layer is intentionally separate from the research workflow. In practice, Python will prepare versioned data and figures; this interface turns those results into an approachable, inspectable story.</p>
        </div>
        <div className="pipeline">
          {[
            ["01", "Collect", "Bird audio & metadata"],
            ["02", "Validate", "Duration · rate · quality"],
            ["03", "Prepare", "Clean tags & location"],
            ["04", "Listen", "Extract acoustic features"],
            ["05", "Explore", "Reveal ecological patterns"],
          ].map(([number, title, note], index) => (
            <motion.div className="pipeline-step" key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.45, delay: index * 0.06 }}>
              <span>{number}</span><i>{index === 0 ? <Mic2 size={17} /> : index === 4 ? <Leaf size={17} /> : <ChevronDown size={17} />}</i><h3>{title}</h3><p>{note}</p>
            </motion.div>
          ))}
        </div>

        <div className="feature-story">
          <div className="feature-story__image"><img src={FIELD_IMAGE} alt="Longleaf pine forest in Sam Houston National Forest, Texas" /><div className="photo-tag">FIELD NOTE / TEXAS PINEY WOODS</div></div>
          <div className="feature-story__content">
            <p className="eyebrow eyebrow--dark"><span /> WHY LISTEN?</p>
            <blockquote>“The goal is not to replace ecological observation. It is to make biodiversity easier to hear.”</blockquote>
            <p>A single recording holds both a species-level call and an ecosystem-scale texture. By preserving the connection between an audio file and its place, we can ask better questions about diversity.</p>
            <button className="inline-link" onClick={() => { setActiveTab("Conclusions"); scrollTo("research"); }}>Read the project conclusion <ArrowUpRight size={16} /></button>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-section__glow" />
        <p className="eyebrow"><span /> THE ACOUSTIC BIODIVERSITY OBSERVATORY</p>
        <h2>Listen closer.<br /><em>See further.</em></h2>
        <p>This is version 0.1: an evolving research artifact built to grow from a course project into a public ecological observatory.</p>
        <div className="closing-actions"><button className="button button--primary" onClick={() => scrollTo("top")}>Return to the soundscape <ArrowUpRight size={16} /></button><a href="https://www.xeno-canto.org/" target="_blank" rel="noreferrer" className="button button--text">Explore Xeno-canto <Send size={15} /></a></div>
      </section>

      <nav className="destination-nav" aria-label="Explore the observatory">{[["top","Expeditions"],["field-notes","My notebook"],["field-guide","Field guide"],["research","Research journal"],["immersive","Signal lab"],["methods","Methods"]].map(([id,label])=><a key={id} href={'#'+id} aria-current={view===id?'page':undefined}>{label}</a>)}</nav><footer className="site-footer">
        <div className="brand"><span className="brand-mark"><Bird size={18} /></span><span>Acoustic<br />Observatory</span></div>
        <p>From Soundscapes to Biodiversity · Exploratory research · 2026</p>
        <a
          href="https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity"
          target="_blank"
          rel="noreferrer"
        >
          <Github size={16} /> Research repository
        </a>
      </footer>
    </main>
  );
}



