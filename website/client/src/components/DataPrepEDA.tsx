import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis } from "recharts";

const DATA = {
  recordings: "/data/recordings.json",
  richness: "/data/richness_comparison.json",
};

const STATIC_FIGURES = [
  {
    file: "05_duration.png",
    title: "Recording duration distribution",
    caption:
      "Recording durations are strongly right-skewed, with a median of 24.0 seconds compared with a mean of 46.0 seconds and a maximum of 647.0 seconds. Fifty-three recordings are shorter than the 10-second analysis window, which is relevant when interpreting within-recording acoustic variation."
  },
  {
    file: "06_quality.png",
    title: "Recording quality by state",
    caption:
      "The selected acoustic sample contains 86 A-quality and 189 B-quality Xeno-canto recordings, with no recordings classified below B quality. The distribution shows that the dataset is concentrated in the two higher quality categories across California, Arizona, and Texas."
  },
  {
    file: "07_seasonality.png",
    title: "Seasonal sampling distribution",
    caption:
      "Selected acoustic recordings are distributed unevenly across seasons and regions, with spring contributing the largest overall share and fall the smallest. This uneven seasonal coverage is important when comparing acoustic patterns because recordings do not represent all seasons equally."
  },
  {
    file: "08_time_of_day.png",
    title: "Time-of-day sampling",
    caption:
      "Recording times are concentrated during daylight and particularly in the morning, with the largest number of selected recordings occurring at 07:00. The concentration of recordings at particular times of day shows that the acoustic sample does not represent the daily cycle uniformly."
  },
  {
    file: "09_acoustic_indices.png",
    title: "Acoustic index distributions",
    caption:
      "The four acoustic indices exhibit distinct distributional structures, with NDSI spanning nearly its full bounded range and the Bioacoustic Index showing strong right-skew. These differences indicate that the acoustic measurements do not share the same distributional shape and should therefore be examined individually during exploratory analysis."
  },
  {
    file: "10_feature_correlation.png",
    title: "Acoustic feature correlation",
    caption:
      "Spectral-entropy variants are strongly intercorrelated, with Spearman correlations ranging from 0.78 to 0.89, while ADI shows a strong negative relationship with spectral entropy at r = -0.74. These relationships indicate that several acoustic measurements capture related aspects of the recordings."
  },
  {
    file: "11_state_acoustic_distributions.png",
    title: "Acoustic indices by state",
    caption:
      "Acoustic index distributions show broadly similar shapes across California, Arizona, and Texas. The figure provides a visual comparison of how acoustic measurements are distributed across the three regions."
  },
  {
    file: "12_qc_comparison.png",
    title: "Acoustic features by QC status",
    caption:
      "Of 275 recordings, 208 passed all audit checks and 67 were flagged during quality control. Comparing acoustic index distributions by QC status makes it possible to examine whether data-quality flags are associated with differences in the measured acoustic characteristics."
  },
  {
    file: "13_window_structure.png",
    title: "Analysis-window structure",
    caption:
      "A total of 117 of 275 recordings, or 42.5%, contained only a single 10-second analysis window. For these recordings, within-recording variability cannot be estimated from multiple windows and should therefore be interpreted differently from recordings containing several windows."
  },
];

const STATE_COLORS: Record<string, string> = { CA: "#6ed6d1", AZ: "#d8b76a", TX: "#e88b72" };
const STATE_NAME_MAP: Record<string, string> = {
  CA: "CA", AZ: "AZ", TX: "TX",
  California: "CA", Arizona: "AZ", Texas: "TX",
  ca: "CA", az: "AZ", tx: "TX",
};

function normalizeRecording(r: any) {
  const latRaw =
    r.latitude ??
    r.lat ??
    r.Latitude ??
    r["Latitude (decimal)"] ??
    r["latitude_decimal"] ??
    null;

  const lonRaw =
    r.longitude ??
    r.lon ??
    r.lng ??
    r.Longitude ??
    r["Longitude (decimal)"] ??
    r["longitude_decimal"] ??
    null;

  const lat =
    latRaw !== null && latRaw !== undefined && latRaw !== ""
      ? Number(latRaw)
      : null;

  const lon =
    lonRaw !== null && lonRaw !== undefined && lonRaw !== ""
      ? Number(lonRaw)
      : null;

  const rawState = String(
    r.state ??
    r.State ??
    r.region ??
    r.Region ??
    r.province ??
    r.Province ??
    ""
  )
    .trim()
    .toLowerCase();

  let state = "";

  if (
    rawState === "ca" ||
    rawState === "california" ||
    rawState === "california, usa" ||
    rawState === "california, united states"
  ) {
    state = "CA";
  } else if (
    rawState === "az" ||
    rawState === "arizona" ||
    rawState === "arizona, usa" ||
    rawState === "arizona, united states"
  ) {
    state = "AZ";
  } else if (
    rawState === "tx" ||
    rawState === "texas" ||
    rawState === "texas, usa" ||
    rawState === "texas, united states"
  ) {
    state = "TX";
  } else {
    state = STATE_NAME_MAP[rawState] ?? rawState.toUpperCase();
  }

  const name =
    r.common_name ??
    r.commonName ??
    r.species ??
    r.Species ??
    r.scientific_name ??
    "Unknown";

  return {
    ...r,
    lat,
    lon,
    state,
    common_name: name,
  };
}

const styles = {
  report: { display: "flex", flexDirection: "column" as const, gap: "72px", padding: "40px 0" },
  block: { display: "flex", flexDirection: "column" as const, gap: "14px" },
  h3: { fontSize: "22px", fontWeight: 600, margin: 0, color: "#f2ebdd" },
  h4: { fontSize: "16px", fontWeight: 600, margin: "12px 0 4px", color: "#d8b76a" },
  p: { margin: 0, lineHeight: 1.6, color: "#c9d1cb", fontSize: "15px" },
  caption: { margin: 0, lineHeight: 1.55, color: "#a9b3ac", fontSize: "14px", fontStyle: "italic" as const },
  code: { background: "#0d1a17", padding: "2px 6px", borderRadius: "4px", fontSize: "13px", color: "#6ed6d1", wordBreak: "break-all" as const },
  link: { color: "#6ed6d1" },
  apiDoc: { border: "1px solid #2a3530", borderRadius: "8px", padding: "16px 20px" },
  rawCleanImg: { width: "100%", borderRadius: "8px", display: "block" },
  staticImg: { width: "100%", borderRadius: "8px", display: "block" },
  error: {
    padding: "40px 20px",
    color: "#e88b72",
    fontSize: "15px",
  },

  auditIntro: {
    margin: 0,
    lineHeight: 1.7,
    color: "#c9d1cb",
    fontSize: "15px",
    maxWidth: "900px",
  },

  auditGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "10px",
  },

  auditCard: {
    border: "1px solid #2a3530",
    borderRadius: "8px",
    padding: "20px 16px",
    background: "rgba(255,255,255,0.015)",
  },

  auditValue: {
    display: "block",
    color: "#f2ebdd",
    fontSize: "30px",
    lineHeight: 1,
    fontWeight: 500,
  },

  auditLabel: {
    display: "block",
    marginTop: "10px",
    color: "#8f9b94",
    fontSize: "10px",
    lineHeight: 1.4,
    letterSpacing: "0.1em",
  },

  auditPassed: {
    color: "#6ed6d1",
  },

  auditFlagged: {
    color: "#e88b72",
  },

  auditQuality: {
    color: "#d8b76a",
  },

  cleaningGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "10px",
  },

  cleaningCard: {
    border: "1px solid #25332d",
    borderRadius: "8px",
    padding: "18px 20px",
    background: "#0d1a17",
  },

  cleaningNumber: {
    color: "#e88b72",
    fontSize: "11px",
    letterSpacing: "0.12em",
    fontWeight: 600,
  },

  cleaningTitle: {
    margin: "10px 0 8px",
    color: "#f2ebdd",
    fontSize: "16px",
    fontWeight: 600,
  },

  cleaningText: {
    margin: 0,
    color: "#a9b3ac",
    fontSize: "13px",
    lineHeight: 1.6,
  },

};

export function DataPrepEDA() {
  const [richness, setRichness] = useState<any[]>([]);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [speciesTop, setSpeciesTop] = useState<any[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(DATA.richness).then((r) => r.json()),
      fetch(DATA.recordings).then((r) => r.json()),
    ])
      .then(([richnessData, recordingsRaw]) => {
        setRichness(richnessData);
        const recordingsData = recordingsRaw.map(normalizeRecording);
        setRecordings(recordingsData);

        if (recordingsData.length > 0) {
          console.log("Sample normalized recording:", recordingsData[0]);
        }

        const counts: Record<string, number> = {};
        recordingsData.forEach((r: any) => {
          counts[r.common_name] = (counts[r.common_name] || 0) + 1;
        });
        const top = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => (b.count as number) - (a.count as number))
          .slice(0, 15);
        setSpeciesTop(top);
      })
      .catch((err) => {
        console.error("EDA data load failed:", err);
        setLoadError(true);
      });
  }, []);

  if (loadError) {
    return (
      <div style={styles.error}>
        Data files not found — confirm recordings.json and richness_comparison.json
        are in website/client/public/data/.
      </div>
    );
  }

  const geoPoints = recordings.filter((r) => r.lat !== null && r.lon !== null && !isNaN(r.lat) && !isNaN(r.lon));
  console.log("Geographic points:", geoPoints.length);
  console.log(
    "Geographic points by state:",
    ["CA", "AZ", "TX"].reduce(
      (acc, state) => {
        acc[state] = geoPoints.filter((r) => r.state === state).length;
        return acc;
      },
      {} as Record<string, number>
    )
  );
  return (
    <div style={styles.report}>
      <section style={styles.block}>
        <h3 style={styles.h3}>Data sources</h3>
        <div style={styles.apiDoc}>
          <h4 style={styles.h4}>Xeno-canto API v3</h4>
          <p style={styles.p}>Website: <a style={styles.link} href="https://xeno-canto.org" target="_blank" rel="noreferrer">xeno-canto.org</a></p>
          <p style={styles.p}>Endpoint: <code style={styles.code}>https://xeno-canto.org/api/3/recordings</code></p>
          <p style={styles.p}>Example GET: <code style={styles.code}>https://xeno-canto.org/api/3/recordings?query=grp:birds box:32.5,-124.5,42.0,-114.1 q:"&gt;C"&key=YOUR_KEY</code></p>
        </div>
        <div style={styles.apiDoc}>
          <h4 style={styles.h4}>eBird API 2.0</h4>
          <p style={styles.p}>Website: <a style={styles.link} href="https://ebird.org" target="_blank" rel="noreferrer">ebird.org</a></p>
          <p style={styles.p}>Endpoint: <code style={styles.code}>https://api.ebird.org/v2/data/obs/{"{regionCode}"}/recent</code></p>
          <p style={styles.p}>Example GET: <code style={styles.code}>https://api.ebird.org/v2/data/obs/US-CA/recent?back=30</code> (header: <code style={styles.code}>x-ebirdapitoken</code>)</p>
        </div>
        <p style={styles.caption}>
          Raw data: <a style={styles.link} href="https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/tree/main/data/raw" target="_blank" rel="noreferrer">data/raw/</a>
          {" · "}Code: <a style={styles.link} href="https://github.com/SMukherjee07/From-Soundscapes-to-Biodiversity/tree/main/research" target="_blank" rel="noreferrer">research/</a>
        </p>
      </section>

      <section style={styles.block}>
        <h3 style={styles.h3}>Raw versus cleaned data</h3>
        <img style={styles.rawCleanImg} src="/figures/raw_clean/raw_vs_clean_example.png" alt="Raw versus cleaned spectrogram comparison" />
        <p style={styles.caption}>A flagged (low-amplitude) recording compared against a clean example, both drawn from the validated 275-recording sample.</p>
      </section>
      <section style={styles.block}>
        <h3 style={styles.h3}>Data quality & cleaning audit</h3>

        <p style={styles.auditIntro}>
          The 275-recording acoustic sample was subjected to metadata,
          geographic, recording-quality, and analysis-window checks before
          exploratory analysis. Quality-control flags were retained as
          metadata rather than silently removing observations, allowing the
          cleaned dataset to preserve a transparent record of which recordings
          passed all checks and which required review.
        </p>

        <div style={styles.auditGrid}>
          <div style={styles.auditCard}>
            <span style={styles.auditValue}>
              275
            </span>
            <span style={styles.auditLabel}>
              RECORDINGS ACQUIRED
            </span>
          </div>

          <div style={styles.auditCard}>
            <span style={{ ...styles.auditValue, ...styles.auditPassed }}>
              208
            </span>
            <span style={styles.auditLabel}>
              PASSED ALL AUDIT CHECKS
            </span>
          </div>

          <div style={styles.auditCard}>
            <span style={{ ...styles.auditValue, ...styles.auditFlagged }}>
              67
            </span>
            <span style={styles.auditLabel}>
              FLAGGED DURING QC
            </span>
          </div>

          <div style={styles.auditCard}>
            <span style={{ ...styles.auditValue, ...styles.auditQuality }}>
              86
            </span>
            <span style={styles.auditLabel}>
              A-QUALITY RECORDINGS
            </span>
          </div>

          <div style={styles.auditCard}>
            <span style={{ ...styles.auditValue, ...styles.auditQuality }}>
              189
            </span>
            <span style={styles.auditLabel}>
              B-QUALITY RECORDINGS
            </span>
          </div>
        </div>

        <div style={styles.cleaningGrid}>
          <div style={styles.cleaningCard}>
            <span style={styles.cleaningNumber}>
              01 · METADATA
            </span>

            <h4 style={styles.cleaningTitle}>
              Metadata standardization
            </h4>

            <p style={styles.cleaningText}>
              Recording metadata were standardized into consistent fields for
              downstream analysis, including species, state, geographic coordinates,
              recording date, quality, and other recording attributes.
            </p>
          </div>

          <div style={styles.cleaningCard}>
            <span style={styles.cleaningNumber}>
              02 · GEOGRAPHY
            </span>

            <h4 style={styles.cleaningTitle}>
              Geographic validation
            </h4>

            <p style={styles.cleaningText}>
              Geographic fields were converted to usable numeric coordinates and
              checked before spatial analysis. Recordings with usable coordinates
              could then be validated geographically across California, Arizona,
              and Texas.
            </p>
          </div>

          <div style={styles.cleaningCard}>
            <span style={styles.cleaningNumber}>
              03 · QUALITY CONTROL
            </span>

            <h4 style={styles.cleaningTitle}>
              Audio quality control
            </h4>

            <p style={styles.cleaningText}>
              Recordings were evaluated for quality, duration, and analysis-window
              structure. Quality-control status was preserved so that technically
              usable but potentially challenging recordings could remain visible
              for downstream comparison.
            </p>
          </div>
        </div>

        <p style={styles.caption}>
          Cleaning and quality control were documented separately from exploratory
          analysis so that data limitations remain visible. Rather than treating
          every unusual recording as an error, the workflow preserves quality
          information that can be examined alongside acoustic measurements.
        </p>
      </section>
      <section style={styles.block}>
        <h3 style={styles.h3}>Figure 01 — Recordings and species by state</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={richness}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3530" />
            <XAxis dataKey="state" stroke="#f2ebdd" />
            <YAxis stroke="#f2ebdd" />
            <Tooltip contentStyle={{ background: "#07110f", border: "1px solid #2a3530" }} />
            <Legend />
            <Bar dataKey="acoustic_recordings" name="Recordings" fill="#6ed6d1" />
            <Bar dataKey="acoustic_species" name="Species" fill="#e88b72" />
          </BarChart>
        </ResponsiveContainer>
        <p style={styles.caption}>The acquisition target of 100 California, 75 Arizona, and 100 Texas
          recordings was met exactly, while species representation varies by state
          despite comparable sample sizes. This difference shows that the number
          of recordings collected from a region does not directly determine how
          many distinct species are represented in the acoustic sample.</p>
      </section>

      <section style={styles.block}>
        <h3 style={styles.h3}>Figure 02 — Acoustic coverage of independently observed species</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={richness} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3530" />
            <XAxis type="number" stroke="#f2ebdd" unit="%" />
            <YAxis dataKey="state" type="category" stroke="#f2ebdd" />
            <Tooltip contentStyle={{ background: "#07110f", border: "1px solid #2a3530" }} formatter={(v: any) => `${v}%`} />
            <Bar dataKey="acoustic_representation_pct" name="Species represented acoustically" fill="#d8b76a" />
          </BarChart>
        </ResponsiveContainer>
        <p style={styles.caption}> These percentages describe representation within the acquired datasets,
          not regional biodiversity coverage, and differences may reflect the
          distinct sampling processes of the two sources. The comparison therefore
          shows how much of the independently observed species set is represented
          in the acquired acoustic recordings for each region.</p>
      </section>

      <section style={styles.block}>
        <h3 style={styles.h3}>Figure 03 — Geographic distribution of recordings</h3>
        {geoPoints.length === 0 ? (
          <p style={styles.error}>
            No usable latitude/longitude values found in recordings.json — check the browser console
            (F12) for "Sample normalized recording" to see the actual field names and share them.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3530" />
              <XAxis type="number" dataKey="lon" name="Longitude" stroke="#f2ebdd" domain={["dataMin - 1", "dataMax + 1"]} />
              <YAxis type="number" dataKey="lat" name="Latitude" stroke="#f2ebdd" domain={["dataMin - 1", "dataMax + 1"]} />
              <ZAxis range={[50, 50]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "#07110f",
                  border: "1px solid #2a3530",
                  color: "#ffffff",
                }}
                itemStyle={{ color: "#ffffff" }}
                labelStyle={{ color: "#ffffff" }}
                formatter={(value: any, name: any, props: any) => [
                  value,
                  name === "lat"
                    ? `Latitude (${props.payload.common_name})`
                    : name,
                ]}
              />
              <Legend />
              {["CA", "AZ", "TX"].map((state) => (
                <Scatter key={state} name={state} data={geoPoints.filter((r) => r.state === state)} fill={STATE_COLORS[state]} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        )}
        <p style={styles.caption}> Recording locations are distributed within the acquisition regions for
          California, Arizona, and Texas. The geographic spread provides a visual
          check of the coordinates used for the regional comparisons.</p>
      </section>

      <section style={styles.block}>
        <h3 style={styles.h3}>Figure 04 — Most represented species</h3>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={speciesTop} layout="vertical" margin={{ left: 140 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3530" />
            <XAxis type="number" stroke="#f2ebdd" allowDecimals={false} />
            <YAxis dataKey="name" type="category" stroke="#f2ebdd" width={140} fontSize={12} />
            <Tooltip contentStyle={{ background: "#07110f", border: "1px solid #2a3530" }} />
            <Bar dataKey="count" name="Recordings" fill="#6ed6d1" />
          </BarChart>
        </ResponsiveContainer>
        <p style={styles.caption}>The acoustic sample contains 159 species represented by 275 recordings,
          with the most frequently represented species accounting for only a
          subset of the total recordings. The long tail of less frequently recorded
          species shows that the acquired sample includes many species represented
          by relatively few recordings.</p>
      </section>

      {STATIC_FIGURES.map((fig) => (
        <section style={styles.block} key={fig.file}>
          <h3 style={styles.h3}>{fig.title}</h3>
          <img style={styles.staticImg} src={`/figures/eda/${fig.file}`} alt={fig.title} />
          <p style={styles.caption}>{fig.caption}</p>
        </section>
      ))}
    </div>
  );
}
