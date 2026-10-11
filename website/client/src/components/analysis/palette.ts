export const CLUSTER_COLORS = ["#6ed6d1", "#e88b72", "#d8b76a", "#a99bd6", "#8ccf7e", "#e6a0c4", "#7fb2f0", "#c4c4b8"];
export const STATE_COLORS: Record<string, string> = { CA: "#e88b72", AZ: "#d8b76a", TX: "#6ed6d1" };
export const FAMILY_COLORS: Record<string, string> = {
  "MFCC dynamics": "#e88b72",
  "MFCC mean": "#d8b76a",
  "Acoustic indices": "#6ed6d1",
  Entropy: "#a99bd6",
  "Spectral & temporal": "#8ccf7e",
};
export const familyColor = (f: string) => FAMILY_COLORS[f] ?? "#c4c4b8";
export function normState(s: string): string {
  const t = (s ?? "").toLowerCase();
  if (t.startsWith("ca")) return "CA";
  if (t.startsWith("ar") || t === "az") return "AZ";
  if (t.startsWith("te") || t === "tx") return "TX";
  return s;
}
