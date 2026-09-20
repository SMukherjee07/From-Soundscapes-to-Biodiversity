import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Mic2,
  Radio,
  Sparkles,
} from "lucide-react";

const HERO_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/White_crowned_sparrows_are_a_common_sight_in_spring_(e6fa9c39-1dd8-b71c-07a3-0e858ce8a402).jpg";

const NOTES = [
  {
    number: "01",
    label: "WHY LISTEN?",
    title: "Every habitat leaves an acoustic trace.",
    text:
      "Biodiversity is often encountered as a list of names, a map of distributions, or a record in a field notebook. But a living landscape is experienced through more than what can be seen. Birds call from branches, understory, wetlands, grasslands, and open sky, often at the same moment and from places that are difficult to observe directly. Their sounds overlap, fade, travel, and return, forming a changing acoustic character for the places they inhabit. A morning recording can therefore preserve something that a brief visual survey may miss: not only which species were present, but something of the activity surrounding them. A visual encounter is fleeting; a recording leaves an auditory trace that can be revisited after the moment itself has passed. That trace can be examined alongside information about place, time, and species. It can also be compared across mornings, landscapes, and seasons. The question is not whether sound can replace observation, but whether it can reveal a different part of the ecological picture. Listening becomes useful precisely because it preserves a dimension of the living environment that is otherwise difficult to hold onto.",
    meta: "ACOUSTIC OBSERVATION",
  },

  {
    number: "02",
    label: "WHY BIRDS?",
    title: "Birds turn presence into sound.",
    text:
      "Birds are unusually expressive inhabitants of a landscape. Their calls and songs are shaped by species, behavior, season, time of day, and the environments in which they live. A dawn chorus in a forest does not sound like an evening in desert scrub, and neither is simply a collection of isolated species calls. The sounds carry traces of movement, territory, communication, and interaction. For this reason, birds offer a useful window into the relationship between organisms and place. Recordings also have a quality that field observations do not: they can be returned to. A recording made years earlier can be heard again, examined under a different question, or compared with observations collected elsewhere. Public repositories have made thousands of such recordings accessible beyond the moment and place in which they were made. Yet an important boundary remains. A recording of one bird is evidence of that recording, not automatically a census of everything living around it. Any ecological interpretation must therefore remain attentive to what the microphone captured, what it did not capture, and what can reasonably be inferred from the difference.",
    meta: "SPECIES + SOUND",
  },

  {
    number: "03",
    label: "THREE LANDSCAPES",
    title: "The same question sounds different in every landscape.",
    text:
      "California, Arizona, and Texas offer three very different settings in which to ask what sound can reveal about biodiversity. California stretches from coastal habitats and forests to wetlands, desert, and chaparral. Arizona moves from the Sonoran Desert into cooler, higher-elevation mountain environments. Texas contains its own broad mosaic of coast, grassland, wetland, forest, and open country. These differences matter because sound does not exist apart from place. The species present, the structure of the habitat, the season, the weather, and even the time of day all shape what reaches a microphone. A pattern that appears meaningful in one region may look very different somewhere else. That difference is not necessarily a problem; it may be part of the ecological signal itself. Comparing regions therefore provides a way to ask which acoustic patterns persist across landscapes and which belong to particular environments. Seasonal and daily changes add another layer, as birds arrive, leave, become active, establish territories, and respond to changing conditions. Across these three regions, the study is less interested in finding one universal sound of biodiversity than in discovering where the relationship between sound and ecology holds—and where it begins to change.",
    meta: "CA · AZ · TX",
  },

  {
    number: "04",
    label: "TWO SOURCES",
    title: "A recording is evidence. It is not the whole landscape.",
    text:
      "The acoustic record is only one way of seeing a biological community. Alongside recordings, independent bird observations can provide another view of which species have been reported in a place and time. The two sources are related, but they are not interchangeable. A microphone records sound that reaches it; an observation records what a person reports seeing or hearing. Each captures part of the environment, and each carries its own gaps and biases. Bringing them together makes it possible to ask a more careful question than whether a recording contains a particular species. It allows the study to examine how acoustic patterns correspond with independently observed ecological patterns. Differences between the two sources are just as informative as agreements. A species may be present but silent, audible but distant, recorded unevenly across locations, or simply absent from the available sample. Geography, season, recording quality, and sampling effort can all shape what appears in the data. The purpose of using both sources is therefore not to force them into agreement, but to understand what each can tell us about the same living landscape.",
    meta: "XENO-CANTO + EBIRD",
  },

  {
    number: "05",
    label: "THE CENTRAL QUESTION",
    title: "Where does a recording end—and an ecological inference begin?",
    text:
      "The promise of acoustic biodiversity research lies in its ability to preserve observations that might otherwise disappear with the moment. A recording can be revisited, compared, measured, and placed alongside observations from other times and places. But the presence of information in a recording does not guarantee that the information is sufficient to describe the surrounding community. Traditional field surveys remain essential because many ecological facts cannot be recovered from sound alone. Acoustic observations are better understood as another window onto the landscape: valuable, repeatable, and necessarily incomplete. The deeper question is how much ecological meaning can be recovered from that window. Does the relationship between acoustic character and observed biodiversity remain stable across regions? Does it change with season, habitat, recording conditions, or sampling effort? Where are acoustic measurements informative, and where do they become uncertain? What matters is not only what the recordings reveal, but where their evidence begins to become uncertain. Ultimately, this study asks a deceptively simple question: when does sound reliably represent biodiversity, and when does it not?",
    meta: "SOUND → EVIDENCE",
  },
];

const QUESTIONS = [
  "How does the acoustic character of recordings differ across California, Arizona, and Texas?",
  "How much acoustic variation occurs among recordings of different bird species?",
  "Which acoustic characteristics tend to vary together?",
  "How do duration, recording quality, season, and time of day differ across regions?",
  "How evenly are species represented within the acquired acoustic sample?",
  "How does the geographic distribution of recordings shape the patterns visible in the data?",
  "How consistently do acoustic characteristics distinguish different groups of recordings?",
  "Can patterns among many acoustic measurements reveal meaningful ecological or geographic structure?",
  "How reliably can acoustic information distinguish species or other meaningful groups across regions?",
  "When does acoustic information provide useful evidence of biodiversity—and when does that evidence become uncertain?",
];

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "54px",
    padding: "18px 0 70px",
  },

  introHero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)",
    gap: "38px",
    alignItems: "stretch",
  },

  eyebrow: {
    fontSize: "12px",
    letterSpacing: "0.14em",
    color: "#d8b76a",
    fontWeight: 600,
    margin: "0 0 14px",
  },

  title: {
    fontSize: "clamp(38px, 5vw, 64px)",
    fontWeight: 500,
    margin: "0",
    color: "#f2ebdd",
    lineHeight: 0.98,
    letterSpacing: "-0.035em",
  },

  lead: {
    margin: "24px 0 0",
    maxWidth: "620px",
    lineHeight: 1.65,
    color: "#bfc9c2",
    fontSize: "17px",
  },

  imageCard: {
    position: "relative" as const,
    minHeight: "330px",
    overflow: "hidden",
    borderRadius: "10px",
    border: "1px solid #2a3530",
    background: "#101d19",
  },

  image: {
    width: "100%",
    height: "100%",
    minHeight: "330px",
    objectFit: "cover" as const,
    display: "block",
  },

  imageOverlay: {
    position: "absolute" as const,
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(5,20,15,0.02) 35%, rgba(5,20,15,0.82) 100%)",
  },

  imageLabel: {
    position: "absolute" as const,
    left: "18px",
    right: "18px",
    bottom: "16px",
    color: "#f2ebdd",
    fontSize: "11px",
    letterSpacing: "0.12em",
    lineHeight: 1.5,
  },

  noteShell: {
    borderTop: "1px solid #2a3530",
    borderBottom: "1px solid #2a3530",
    padding: "30px 0",
  },

  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },

  noteLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#d8b76a",
    fontSize: "12px",
    letterSpacing: "0.14em",
    fontWeight: 600,
  },

  noteNumber: {
    color: "#e88b72",
    fontSize: "14px",
  },

  noteCounter: {
    color: "#7f8b84",
    fontSize: "12px",
    letterSpacing: "0.1em",
  },

  noteGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.72fr) minmax(0, 1.28fr)",
    gap: "42px",
  },

  noteTitle: {
    margin: "0",
    color: "#f2ebdd",
    fontSize: "clamp(28px, 3vw, 42px)",
    lineHeight: 1.05,
    fontWeight: 500,
    letterSpacing: "-0.025em",
  },

  noteText: {
    margin: "0",
    color: "#c9d1cb",
    fontSize: "16px",
    lineHeight: 1.8,
  },

  meta: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "10px",
    marginTop: "24px",
  },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 11px",
    border: "1px solid #2a3530",
    borderRadius: "999px",
    color: "#a9b3ac",
    fontSize: "10px",
    letterSpacing: "0.1em",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "28px",
  },

  dots: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  dot: {
    width: "34px",
    height: "3px",
    border: 0,
    padding: 0,
    cursor: "pointer",
    background: "#2a3530",
    transition: "all 180ms ease",
  },

  arrowGroup: {
    display: "flex",
    gap: "8px",
  },

  arrowButton: {
    width: "42px",
    height: "42px",
    display: "grid",
    placeItems: "center",
    border: "1px solid #34423b",
    borderRadius: "50%",
    background: "transparent",
    color: "#f2ebdd",
    cursor: "pointer",
  },

  questionsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: "20px",
    marginBottom: "22px",
  },

  questionsTitle: {
    margin: 0,
    color: "#f2ebdd",
    fontSize: "clamp(30px, 4vw, 48px)",
    fontWeight: 500,
    letterSpacing: "-0.03em",
  },

  questionsIntro: {
    maxWidth: "330px",
    margin: 0,
    color: "#8f9b94",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  questionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
  },

  questionCard: {
    padding: "20px 20px 22px",
    border: "1px solid #25332d",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.015)",
  },

  questionNumber: {
    color: "#e88b72",
    fontSize: "12px",
    letterSpacing: "0.1em",
    fontWeight: 600,
  },

  questionText: {
    margin: "12px 0 0",
    color: "#e9e6dc",
    fontSize: "14px",
    lineHeight: 1.55,
  },

  thread: {
    margin: "26px 0 0",
    padding: "18px 20px",
    border: "1px solid #2a3530",
    borderRadius: "8px",
    color: "#a9b3ac",
    fontSize: "12px",
    letterSpacing: "0.04em",
    textAlign: "center" as const,
  },
};

export function IntroductionContent() {
  const [activeNote, setActiveNote] = useState(0);

  const note = NOTES[activeNote];

  const previousNote = () => {
    setActiveNote((current) =>
      current === 0 ? NOTES.length - 1 : current - 1
    );
  };

  const nextNote = () => {
    setActiveNote((current) =>
      current === NOTES.length - 1 ? 0 : current + 1
    );
  };

  return (
    <div style={styles.wrap}>
      {/* =========================================================
          HERO
          ========================================================= */}

      <section style={styles.introHero}>
        <div>
          <p style={styles.eyebrow}>
            <span>01</span>&nbsp;&nbsp; INTRODUCTION · FIELD NOTES
          </p>

          <h2 style={styles.title}>Can biodiversity be heard?</h2>

          <p style={styles.lead}>
            A study of bird recordings across California, Arizona, and Texas,
            asking how much ecological information can reasonably be recovered
            from sound.
          </p>

          <div style={styles.meta}>
            <span style={styles.pill}>
              <Mic2 size={13} />
              275 RECORDINGS
            </span>

            <span style={styles.pill}>
              <MapPin size={13} />
              CA · AZ · TX
            </span>

            <span style={styles.pill}>
              <Radio size={13} />
              XENO-CANTO
            </span>
          </div>
        </div>

        <div style={styles.imageCard}>
          <img
            src={HERO_IMAGE}
            alt="White-crowned sparrow in its natural habitat"
            style={styles.image}
          />

          <div style={styles.imageOverlay} />

          <div style={styles.imageLabel}>
            FIELD NOTE / WHITE-CROWNED SPARROW
            <br />
            IMAGE SOURCE: WIKIMEDIA COMMONS
          </div>
        </div>
      </section>

      {/* =========================================================
          FIELD NOTE / ONE PARAGRAPH AT A TIME
          ========================================================= */}

      <section style={styles.noteShell}>
        <div style={styles.noteHeader}>
          <div style={styles.noteLabel}>
            <span style={styles.noteNumber}>{note.number}</span>
            {note.label}
          </div>

          <span style={styles.noteCounter}>
            {String(activeNote + 1).padStart(2, "0")} /{" "}
            {String(NOTES.length).padStart(2, "0")}
          </span>
        </div>

        <div style={styles.noteGrid}>
          <div>
            <h3 style={styles.noteTitle}>{note.title}</h3>

            <div style={styles.meta}>
              <span style={styles.pill}>{note.meta}</span>
            </div>
          </div>

          <div>
            <p style={styles.noteText}>{note.text}</p>

            <div style={styles.controls}>
              <div style={styles.dots}>
                {NOTES.map((item, index) => (
                  <button
                    key={item.number}
                    aria-label={
                      "Open field note " + String(index + 1)
                    }
                    onClick={() => setActiveNote(index)}
                    style={{
                      ...styles.dot,
                      background:
                        index === activeNote ? "#d8b76a" : "#2a3530",
                      width: index === activeNote ? "48px" : "24px",
                    }}
                  />
                ))}
              </div>

              <div style={styles.arrowGroup}>
                <button
                  onClick={previousNote}
                  aria-label="Previous field note"
                  style={styles.arrowButton}
                >
                  <ArrowLeft size={16} />
                </button>

                <button
                  onClick={nextNote}
                  aria-label="Next field note"
                  style={styles.arrowButton}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          RESEARCH QUESTIONS
          ========================================================= */}

      <section>
        <div style={styles.questionsHeader}>
          <div>
            <p style={styles.eyebrow}>RESEARCH THREAD</p>

            <h2 style={styles.questionsTitle}>
              What can listening reveal?
            </h2>
          </div>

          <p style={styles.questionsIntro}>
            Ten questions move from describing the recordings toward testing
            their ecological meaning.
          </p>
        </div>

        <div style={styles.questionGrid}>
          {QUESTIONS.map((question, index) => (
            <div style={styles.questionCard} key={index}>
              <span style={styles.questionNumber}>
                {String(index + 1).padStart(2, "0")}
              </span>

              <p style={styles.questionText}>{question}</p>
            </div>
          ))}
        </div>

        <p style={styles.thread}>
          <Sparkles
            size={13}
            style={{
              verticalAlign: "middle",
              marginRight: "6px",
            }}
          />
          DESCRIPTION&nbsp;&nbsp; → &nbsp;&nbsp;STRUCTURE&nbsp;&nbsp; →
          &nbsp;&nbsp;PREDICTION&nbsp;&nbsp; → &nbsp;&nbsp;ECOLOGICAL
          INTERPRETATION
        </p>
      </section>
    </div>
  );
}