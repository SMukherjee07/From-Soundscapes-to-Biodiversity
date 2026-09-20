import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DataPrepEDA } from "@/components/DataPrepEDA";
import { IntroductionContent } from "@/IntroductionContent";
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
  "SVMs",
  "Regression",
  "NN",
  "Conclusions",
];

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
  "DataPrep_EDA": {
    eyebrow: "A1 · DATA FOUNDATION",
    title: "Every observation begins as a sound.",
    text: "Audio, place, time, and species metadata are prepared as a transparent research pipeline before any model is trained.",
    metric: "275 recordings",
  },
  Clustering: {
    eyebrow: "A2 · DISCOVER",
    title: "Finding natural families in sound.",
    text: "Unsupervised clustering will reveal acoustic neighborhoods across recordings without starting from a species label.",
    metric: "analysis chapter",
  },
  PCA: {
    eyebrow: "A2 · DISCOVER",
    title: "Reducing a forest of features.",
    text: "Principal component analysis will bring high-dimensional acoustic features into a visual field we can interpret.",
    metric: "analysis chapter",
  },
  NaiveBayes: {
    eyebrow: "A3 · CLASSIFY",
    title: "Probabilities in every chirp.",
    text: "Naive Bayes will establish a transparent baseline for classifying recordings from their extracted features.",
    metric: "analysis chapter",
  },
  DecTrees: {
    eyebrow: "A3 · CLASSIFY",
    title: "Readable branches of evidence.",
    text: "Decision trees will surface the acoustic characteristics that make species and habitats easier to distinguish.",
    metric: "analysis chapter",
  },
  SVMs: {
    eyebrow: "A4 · CLASSIFY",
    title: "Drawing the sound boundary.",
    text: "Support vector machines will test whether acoustic signatures separate species and regions robustly.",
    metric: "analysis chapter",
  },
  Regression: {
    eyebrow: "A5 · PREDICT",
    title: "Estimating diversity from sound.",
    text: "Regression will explore how a soundscape's measured texture relates to observed species richness.",
    metric: "analysis chapter",
  },
  NN: {
    eyebrow: "A5 · PREDICT",
    title: "Listening at another scale.",
    text: "A neural network will later learn richer patterns across acoustic features and classifications.",
    metric: "analysis chapter",
  },
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
  const [activeTab, setActiveTab] = useState("Introduction");
  const [activeRegion, setActiveRegion] = useState("texas");
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



  const toggleSoundscape = () => {
    if (!audioRef.current) return;

    if (soundOn) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSoundOn(false);
    } else {
      audioRef.current.currentTime = 0;

      audioRef.current.play().catch((error) => {
        console.error("Unable to play bird recording:", error);
      });

      setSoundOn(true);
    }
  };

  useEffect(() => () => stopSoundscape(), []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="site-shell">
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
          <button onClick={() => scrollTo("field-guide")}>Explore</button>
          <button onClick={() => scrollTo("research")}>Research</button>
          <button onClick={() => scrollTo("methods")}>Method</button>
        </nav>
        <div className="header-actions">
          <button className={`sound-toggle ${soundOn ? "is-on" : ""}`} onClick={toggleSoundscape} aria-pressed={soundOn}>
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{soundOn ? "Sound on" : "Sound off"}</span>
          </button>
          <button className="menu-trigger" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Open project navigation">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="project-menu" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
            <div className="project-menu__eyebrow">ASSIGNMENT 1 · PROJECT MAP</div>
            <div className="project-menu__tabs">
              {navItems.map((item, index) => (
                <button
                  key={item}
                  className={activeTab === item ? "active" : ""}
                  onClick={() => {
                    setActiveTab(item);
                    setMenuOpen(false);
                    scrollTo("research");
                  }}
                >
                  <span>0{index + 1}</span>{item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="hero" id="top">
        <img className="hero__image" src={HERO_IMAGE} alt="Bird flying over a golden oak woodland at sunrise" />
        <div className="hero__gradient" />
        <div className="hero__grain" />
        <motion.div className="hero__orb orb-one" animate={{ x: [0, 26, 0], y: [0, -18, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="hero__orb orb-two" animate={{ x: [0, -28, 0], y: [0, 16, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
        <div className="hero__content">
          <motion.div className="eyebrow hero__eyebrow" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <span /> A FIELD STUDY IN ECOLOGICAL LISTENING
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.28 }}>
            From<br /><em>soundscapes</em><br />to biodiversity.
          </motion.h1>
          <motion.p className="hero__lede" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.52 }}>
            Can the layered sounds of birds help us read the living richness of a place?
          </motion.p>
          <motion.div className="hero__actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.66 }}>
            <button className="button button--primary" onClick={() => scrollTo("field-guide")}>Enter the field <ArrowDown size={16} /></button>
            <button className="button button--text" onClick={toggleSoundscape}>{soundOn ? "Pause the ambience" : "Play a gentle soundscape"} <AudioLines size={17} /></button>
          </motion.div>
        </div>
        <div className="hero__lower">
          <div className="region-tags"><span>California</span><i /> <span>Arizona</span><i /> <span>Texas</span></div>
          <div className="hero__sound"><span>XENO-CANTO FIELD RECORDING</span><Waveform compact /><span>FIELD RECORDING</span></div>
        </div>
        <BirdFlight />
        <button className="scroll-cue" onClick={() => scrollTo("field-guide")} aria-label="Scroll to field guide"><span />Scroll to listen</button>
      </section>

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
                <button key={region.id} className={activeRegion === region.id ? "active" : ""} onClick={() => setActiveRegion(region.id)}>
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
        <nav className="project-nav-large" aria-label="Project chapters">
          <div className="project-nav-large__label"><span />EXPLORE THE PROJECT</div>
          <div className="project-nav-large__tabs">
            {navItems.map((tab, index) => (
              <button key={tab} type="button" className={`project-nav-large__tab ${activeTab === tab ? "is-active" : ""}`} onClick={() => setActiveTab(tab)}>
                <span className="project-nav-large__number">{String(index + 1).padStart(2, "0")}</span>
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="signal-layout">
          <div className="analysis-tabs" aria-label="Assignment research tabs">
            <p>PROJECT CHAPTERS</p>
            {navItems.map((item, index) => (
              <button key={item} className={activeTab === item ? "active" : ""} onClick={() => setActiveTab(item)}>
                <span>{String(index + 1).padStart(2, "0")}</span>{item}
                {activeTab === item && <motion.i layoutId="active-tab" />}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.article
              className="analysis-main"
              key={activeTab}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.26 }}
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

              {activeTab === "DataPrep_EDA" ? (
                <DataPrepEDA />
              ) : activeTab === "Introduction" ? (
                <IntroductionContent />
              ) : (
                <div className="future-visual">
                  {/* existing content */}
                </div>
              )}

            </motion.article>
          </AnimatePresence>
        </div>
      </section>

      <section className="method-section" id="methods">
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

      <footer className="site-footer">
        <div className="brand"><span className="brand-mark"><Bird size={18} /></span><span>Acoustic<br />Observatory</span></div>
        <p>From Soundscapes to Biodiversity · Assignment 1 · 2026</p>
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
