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
// The pulse line at beat b: flat at the edges of each beat, a smooth swell of
// waves in the middle. Each beat has its own number of waves and height, and
// some stretches of four beats stay quiet, so it rests flat, then rolls.
const smooth = (x) => x * x * (3 - 2 * x);

// What kind of song it is, guessed from its name and album (or picked by the
// reader): how much energy it has, how many waves fit in a beat, and how often
// the line rests.
export const MOODS = {
  calm: { label: 'Calm', energy: 0.55, waves: [1, 2], rest: 0.35 },
  steady: { label: 'Steady', energy: 0.8, waves: [1.5, 3], rest: 0.22 },
  lively: { label: 'Lively', energy: 1, waves: [2, 3.5], rest: 0.15 },
  intense: { label: 'Intense', energy: 1.2, waves: [2.5, 4.5], rest: 0.08 },
};
// Gentle words win over everything (a "Crimson Lullaby" is still a lullaby).
const SOFT = /lullaby|acoustic|stripped|piano|nursery|\bsleep/i;
const INTENSE =
  /battle|boss|beast|chaos|fury|furyon|action|turbo|bite|\bexe\b|fight|duel|danger|storm|rampage|hunt|clash|prophecy|gambit|limbo|evil|enem|doom|chimera|perish|burning|crimson|panic|frontier|showdown|attack|golden mecha|resist|riot|混沌|狂|斗|危险|械尸|绝命|烈拳/i;
const CALM =
  /afternoon|\btea\b|relax|morning|letters|\bnight\b|\brain\b|gentle|memor|flora|blossom|farewell|\bempty\b|quiet|\bpeace\b|afterglow|the sea|until we meet|years of stars|fading|\bdew\b|serene|悠闲|静谧|岁岁|漫行|晓|絵本|闲|慢/i;
const LIVELY =
  /feat\.|party|holiday|summer|weekend|groove|dance|play on|link up|tango|\bpop\b|cheer|festival|vacation|angel|heartbeat|stars|wonderland|shining|battery|thump|champion|round and round|magical|frequency|whatever|夏日|派对|喵/i;
export const guessMood = (song) => {
  // An instrumental version goes by the song it comes from.
  const name = (song?.name ?? '').replace(/\s*[(（]?(instrumental|伴奏)[)）]?/gi, '');
  const text = `${name} ${song?.album ?? ''}`;
  if (SOFT.test(text)) return 'calm';
  if (INTENSE.test(text)) return 'intense';
  if (CALM.test(text)) return 'calm';
  // A single's songs share its name: the instrumental of a sung single stays lively.
  if (LIVELY.test(text) || (song?.album && name.startsWith(song.album) && song.album.length > 3 && !/hyper|极限|mix/i.test(song.album)))
    return 'lively';
  return 'steady';
};

// Where in the song: builds up over the opening, swells and settles through
// the middle, and fades over the last few seconds. p is 0..1 (or null).
const shapeOf = (p) => {
  if (p == null || !Number.isFinite(p)) return 1;
  const intro = smooth(Math.min(1, p / 0.1));
  const outro = smooth(Math.min(1, (1 - p) / 0.07));
  const swell = 0.88 + 0.12 * Math.sin(p * Math.PI * 6 - 1);
  return (0.45 + 0.55 * intro) * (0.35 + 0.65 * outro) * swell;
};

const wave = (b, mood = MOODS.steady) => {
  const k = Math.floor(b);
  const p = b - k;
  const phrase = Math.floor(k / 4);
  // About one stretch in five rests, never two in a row.
  const rests = (n) => hash(n + 900) < mood.rest;
  const quiet = rests(phrase) && !rests(phrase - 1);
  const height = (quiet ? 0.12 : 0.55 + 0.45 * hash(k + 300)) * (k % 4 === 0 ? 1 : 0.8);
  const [lo, hi] = mood.waves;
  const waves = lo + Math.floor(hash(k + 500) * (hi - lo + 1) * 2) / 2;
  // Rest flat for the first and last part of the beat; swell in between.
  const a = 0.12 + 0.1 * hash(k + 700);
  const e = p < a || p > 1 - a ? 0 : Math.sin((Math.PI * (p - a)) / (1 - 2 * a));
  return height * smooth(e) * Math.sin(TAU * waves * p + hash(k) * 2);
};

// How strong beat k is: downbeats strong, the rest varied.
const strength = (k) => (k % 4 === 0 ? 0.9 + 0.1 * hash(k) : 0.45 + 0.4 * hash(k));

/**
 * Drives the bars (span elements in `barsRef`) or the pulse line (a canvas in
 * `canvasRef`) at `bpm` while `playing`. Writes transforms and pixels straight
 * to the page, so React doesn't redraw anything each frame.
 */
export function useBeatEngine({ barsRef, canvasRef, viz, bpm, playing, mood = 'steady', progress }) {
  const s = useRef({ clock: 0, beat0: 0, at: 0, bpm, levels: [], last: 0, shape: 1, polled: 0 });
  s.current.mood = MOODS[mood] ?? MOODS.steady;
  s.current.progress = progress;
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
      const kick = st.playing ? strength(k) * Math.exp(-since / ((60 / st.bpm) * 0.32)) * Math.min(1.2, st.energy) : 0;
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
                0.45 * shimmer * (0.4 + 0.6 * f) * (0.45 + 0.55 * kick) * Math.min(1.1, 0.4 + 0.6 * st.energy),
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
      // The line rests in the middle so the waves can go both up and down.
      const base = h * 0.55;
      const amp = h * 0.42;
      const now = beatAt(st.clock);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2 * dpr) {
        const b = now - ((w - x) / w) * span;
        const y = base - amp * Math.min(1.15, st.energy) * wave(b, st.mood);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // A gradient style lists its colours in --pulse-stops, left to right.
      const stops = cs
        .getPropertyValue('--pulse-stops')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      let stroke = color;
      let tip = color;
      if (stops.length > 1) {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        stops.forEach((col, i) => g.addColorStop(i / (stops.length - 1), col));
        stroke = g;
        tip = stops[stops.length - 1];
      }
      const blur = parseFloat(cs.getPropertyValue('--pulse-blur')) || 8;
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
        ctx.shadowBlur = blur * dpr;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // A bright dot where the line is being drawn.
      const yEnd = base - amp * Math.min(1.15, st.energy) * wave(now, st.mood);
      ctx.fillStyle = tip;
      ctx.beginPath();
      ctx.arc(w - 3 * dpr, yEnd, 3 * dpr, 0, TAU);
      ctx.fill();
      return st.playing;
    };

    const frame = (time) => {
      const dt = Math.min(0.05, (time - st.last) / 1000);
      st.last = time;
      // How far into the song, checked a few times a second; eased so changes glide.
      if (time - st.polled > 400) {
        st.polled = time;
        st.target = shapeOf(st.progress?.());
      }
      st.shape += ((st.target ?? 1) - st.shape) * Math.min(1, 2 * dt);
      st.energy = st.mood.energy * st.shape;
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
