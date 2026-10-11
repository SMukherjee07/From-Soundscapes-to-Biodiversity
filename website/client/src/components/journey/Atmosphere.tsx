import { useEffect } from "react";
import "./atmosphere.css";

/** Film grain + a soft cursor spotlight that sit over the whole site. Purely decorative. */
export function Atmosphere() {
  useEffect(() => {
    const on = (e: PointerEvent) => { const s = document.documentElement.style; s.setProperty("--mx", `${e.clientX}px`); s.setProperty("--my", `${e.clientY}px`); };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  return (<><div className="atm-spot" aria-hidden /><div className="atm-grain" aria-hidden /></>);
}
