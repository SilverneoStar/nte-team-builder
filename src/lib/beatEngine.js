// The Tea Room's beat: a small engine that runs each frame while music plays
// and moves the bars and draws the pulse line, so they flow instead of
// looping. It can't hear the music (YouTube's player keeps its sound to
// itself), so it keeps the song's tempo and makes each beat a little
// different: every fourth beat is stronger, low bars take the kick, high bars
// shimmer, and everything rises fast and falls back slowly like a real meter.
import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;
// A steady pseudo-random number in 0..1 for a whole number.
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const gauss = (p, at, w) => Math.exp(-(((p - at) / w) ** 2));
// One heartbeat over a beat (p from 0 to 1): small bump, dip, tall spike, dip, slow wave.
const heart = (p) =>
  0.1 * gauss(p, 0.1, 0.035) -
  0.12 * gauss(p, 0.27, 0.014) +
  gauss(p, 0.31, 0.016) -
  0.28 * gauss(p, 0.35, 0.016) +
  0.2 * gauss(p, 0.56, 0.06);
// How strong beat k is: downbeats strong, the rest varied.
const strength = (k) => (k % 4 === 0 ? 0.9 + 0.1 * hash(k) : 0.45 + 0.4 * hash(k));

/**
 * Drives the bars (span elements in `barsRef`) or the pulse line (a canvas in
 * `canvasRef`) at `bpm` while `playing`. Writes transforms and pixels straight
 * to the page, so React doesn't redraw anything each frame.
 */
export function useBeatEngine({ barsRef, canvasRef, viz, bpm, playing }) {
  const s = useRef({ clock: 0, beat0: 0, at: 0, bpm, levels: [], last: 0 });
  // With reduced motion asked for, the bars rest and the line stays still.
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  s.current.playing = playing && !still;

  // A new tempo carries on from the current beat, so nothing jumps.
  useEffect(() => {
    const st = s.current;
    st.beat0 = st.beat0 + (st.clock - st.at) * (st.bpm / 60);
    st.at = st.clock;
    st.bpm = bpm;
  }, [bpm]);

  useEffect(() => {
    const st = s.current;
    let raf = 0;
    st.last = performance.now();
    const beatAt = (t) => st.beat0 + (t - st.at) * (st.bpm / 60);

    const drawBars = (dt) => {
      const bars = barsRef.current ? [...barsRef.current.children] : [];
      const n = bars.length;
      if (!n) return false;
      const b = beatAt(st.clock);
      const k = Math.floor(b);
      const since = (b - k) * (60 / st.bpm);
      const kick = st.playing ? strength(k) * Math.exp(-since / ((60 / st.bpm) * 0.32)) : 0;
      let moving = false;
      bars.forEach((el, i) => {
        const f = i / (n - 1);
        const t = st.clock;
        const shimmer = 0.5 + 0.5 * (0.6 * Math.sin(t * (2.1 + 3.7 * hash(i)) + i) + 0.4 * Math.sin(t * (5.3 + 4.1 * hash(i + 40)) + 2 * i));
        const target = st.playing
          ? Math.min(
              1,
              0.08 +
                0.85 * kick * (0.35 + 0.65 * (1 - f)) * (0.65 + 0.6 * hash(i * 7 + k)) +
                0.45 * shimmer * (0.4 + 0.6 * f) * (0.45 + 0.55 * kick),
            )
          : 0.1;
        const cur = st.levels[i] ?? 0.1;
        // Rise fast, fall back slowly.
        const rate = target > cur ? 22 : 5;
        const next = cur + (target - cur) * Math.min(1, rate * dt);
        st.levels[i] = next;
        if (Math.abs(next - target) > 0.002) moving = true;
        el.style.transform = `scaleY(${next.toFixed(3)})`;
      });
      return st.playing || moving;
    };

    const drawPulse = () => {
      const c = canvasRef.current;
      if (!c) return false;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round(c.clientHeight * dpr);
      if (!w || !h) return st.playing;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      const cs = getComputedStyle(c);
      const color = cs.getPropertyValue('--pulse-color').trim() || '#7fd35a';
      const glow = cs.getPropertyValue('--pulse-glow').trim();
      // Six beats across the width; the newest point is on the right.
      const span = 6;
      const base = h * 0.7;
      const amp = h * 0.62;
      const now = beatAt(st.clock);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2 * dpr) {
        const b = now - ((w - x) / w) * span;
        const k = Math.floor(b);
        const p = b - k;
        const wobble = 0.025 * Math.sin(b * TAU * 1.7) + 0.015 * Math.sin(b * TAU * 4.3 + 1);
        const y = base - amp * (heart(p) * strength(k) + wobble);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      let stroke = color;
      if (color === 'rainbow') {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        ['#ff5a5a', '#ffd34f', '#4fe08a', '#4fb8ff', '#c46bff'].forEach((col, i) => g.addColorStop(i / 4, col));
        stroke = g;
      }
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = stroke;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 8 * dpr;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2.4 * dpr;
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 8 * dpr;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // A bright dot where the line is being drawn.
      const yEnd = base - amp * (heart(now - Math.floor(now)) * strength(Math.floor(now)));
      ctx.fillStyle = color === 'rainbow' ? '#c46bff' : color;
      ctx.beginPath();
      ctx.arc(w - 3 * dpr, yEnd, 3 * dpr, 0, TAU);
      ctx.fill();
      return st.playing;
    };

    const frame = (time) => {
      const dt = Math.min(0.05, (time - st.last) / 1000);
      st.last = time;
      if (st.playing) st.clock += dt;
      const keep = viz === 'pulse' ? drawPulse() : drawBars(dt);
      // Keep going while playing, or until the bars have settled after a pause.
      raf = keep ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf) {
        st.last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    start();
    st.start = start;
    // Draw the still line once when paused, and on resize.
    const ro = new ResizeObserver(() => start());
    const el = viz === 'pulse' ? canvasRef.current : barsRef.current;
    if (el) ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [viz, barsRef, canvasRef]);

  // Wake the engine when playback starts or stops.
  useEffect(() => {
    s.current.start?.();
  }, [playing]);
}
