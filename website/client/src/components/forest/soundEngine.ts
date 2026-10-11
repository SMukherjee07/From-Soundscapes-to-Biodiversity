/** Procedural forest ambience (wind, crickets, owl) + a sparse "tapestry" of real bird clips from the manifest. */
import type { RegionKey } from "./scene";
type Clip = { audio: string };
export class SoundEngine {
  ctx: AudioContext | null = null; master!: GainNode; amb!: GainNode; wind!: GainNode; timers: number[] = []; region: RegionKey = "TX"; clips: Clip[] = []; cache = new Map<string, AudioBuffer | null>(); running = false; ducked = false; crickets: GainNode[] = [];
  async start(region: RegionKey, clips: Clip[]) {
    if (!this.ctx) this.build();
    await this.ctx!.resume(); this.running = true; this.setRegion(region, clips);
    this.master.gain.cancelScheduledValues(0); this.master.gain.linearRampToValueAtTime(0.9, this.ctx!.currentTime + 1.5);
  }
  stop() { if (!this.ctx) return; this.running = false; this.master.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8); this.clear(); }
  private clear() { this.timers.forEach((t) => clearTimeout(t)); this.timers = []; }
  private build() {
    const c = (this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)());
    this.master = c.createGain(); this.master.gain.value = 0; this.master.connect(c.destination);
    this.amb = c.createGain(); this.amb.gain.value = 1; this.amb.connect(this.master);
    const nb = c.createBuffer(1, c.sampleRate * 3, c.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = nb; src.loop = true;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 0.6; this.wind = c.createGain(); this.wind.gain.value = 0.15;
    const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 0.09; lfo.connect(lg).connect(this.wind.gain);
    const lfo2 = c.createOscillator(), lg2 = c.createGain(); lfo2.frequency.value = 0.05; lg2.gain.value = 180; lfo2.connect(lg2).connect(bp.frequency);
    src.connect(bp).connect(this.wind).connect(this.amb); src.start(); lfo.start(); lfo2.start();
    this.crickets = [4300, 4700, 5200].map((f) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = 0; o.connect(g).connect(this.amb); o.start(); return g; });
  }
  setRegion(region: RegionKey, clips: Clip[]) {
    this.region = region; this.clips = clips; this.clear(); if (!this.ctx || !this.running) return;
    const w = { CA: 0.11, AZ: 0.2, TX: 0.15 }[region]; this.wind.gain.setTargetAtTime(w, this.ctx.currentTime, 1.5);
    this.loopTimer(() => this.cricket(), { CA: 2.4, AZ: 3.8, TX: 1.1 }[region], 1.6); this.loopTimer(() => this.owl(), 28, 22); this.loopTimer(() => this.tapestry(), 7, 7);
  }
  duck(on: boolean) { this.ducked = on; if (this.ctx) this.amb.gain.setTargetAtTime(on ? 0.3 : 1, this.ctx.currentTime, 0.5); }
  private loopTimer(fn: () => void, base: number, jitter: number) { const tick = () => { if (!this.running) return; fn(); this.timers.push(window.setTimeout(tick, (base + Math.random() * jitter) * 1000)); }; this.timers.push(window.setTimeout(tick, Math.random() * 2000)); }
  private cricket() {
    const c = this.ctx!, g = this.crickets[Math.floor(Math.random() * 3)], n = 8 + Math.floor(Math.random() * 10), t0 = c.currentTime + 0.05, gap = 0.04;
    for (let i = 0; i < n; i++) { const t = t0 + i * gap; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.03, t + 0.008); g.gain.linearRampToValueAtTime(0, t + 0.03); }
  }
  private owl() {
    const c = this.ctx!, pan = c.createStereoPanner(); pan.pan.value = Math.random() * 1.6 - 0.8; const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; pan.connect(lp).connect(this.amb);
    [0, 0.7, 1.7].forEach((dt, i) => { const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + dt; o.type = "sine"; o.frequency.setValueAtTime(i === 2 ? 340 : 400, t); o.frequency.linearRampToValueAtTime(i === 2 ? 290 : 350, t + 0.5); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.08); g.gain.linearRampToValueAtTime(0, t + 0.55); o.connect(g).connect(pan); o.start(t); o.stop(t + 0.6); });
  }
  private async tapestry() {
    if (this.ducked || !this.clips.length) return; const c = this.ctx!, clip = this.clips[Math.floor(Math.random() * this.clips.length)];
    let buf = this.cache.get(clip.audio);
    if (buf === undefined) { try { const r = await fetch(clip.audio); if (!r.ok) throw 0; buf = await c.decodeAudioData(await r.arrayBuffer()); } catch { buf = null; } this.cache.set(clip.audio, buf); }
    if (!buf || !this.running || this.ducked) return;
    const s = c.createBufferSource(), g = c.createGain(), p = c.createStereoPanner(); s.buffer = buf; p.pan.value = Math.random() * 1.8 - 0.9; const dur = Math.min(buf.duration, 8 + Math.random() * 4), t = c.currentTime;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28 + Math.random() * 0.2, t + 1.2); g.gain.linearRampToValueAtTime(0, t + dur); s.connect(g).connect(p).connect(this.amb); s.start(t, Math.random() * Math.max(0, buf.duration - dur), dur);
  }
}
