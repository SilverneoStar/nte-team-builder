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

    // Colours for the canvas styles come from the page: --pulse-color, a
    // left-to-right gradient in --pulse-stops, and a glow.
    const paint = (c, ctx, w) => {
      const cs = getComputedStyle(c);
      const color = cs.getPropertyValue('--pulse-color').trim() || '#7fd35a';
      const stops = cs
        .getPropertyValue('--pulse-stops')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      let fill = color;
      let tip = color;
      if (stops.length > 1) {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        stops.forEach((col, i) => g.addColorStop(i / (stops.length - 1), col));
        fill = g;
        tip = stops[stops.length - 1];
      }
      return {
        fill,
        tip,
        glow: cs.getPropertyValue('--pulse-glow').trim(),
        blur: parseFloat(cs.getPropertyValue('--pulse-blur')) || 8,
      };
    };
    const canvasOf = () => {
      const c = canvasRef.current;
      if (!c) return null;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round(c.clientHeight * dpr);
      if (!w || !h) return null;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      return { c, ctx, w, h, dpr };
    };
    const glowStroke = (ctx, p, width, dpr) => {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = p.fill;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = width * 3.3 * dpr;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = width * dpr;
      if (p.glow) {
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = p.blur * dpr;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    const lift = () => Math.min(1.15, st.energy);

    // Pulse line: each wave lasts a beat and a half, five across the width.
    // Points sit at fixed places along the song, not the screen, so the line
    // slides smoothly instead of shimmering at the peaks.
    const drawPulse = () => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const unit = 1.5;
      const span = 5;
      const base = h * 0.55;
      const amp = h * 0.42 * lift();
      const u = beatAt(st.clock) / unit;
      const du = span / (w / (3 * dpr));
      ctx.beginPath();
      let first = true;
      for (let v = Math.floor((u - span) / du) * du; v <= u + du; v += du) {
        const x = w - ((u - v) / span) * w;
        const y = base - amp * wave(v, st.mood);
        if (first) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        first = false;
      }
      const p = paint(c, ctx, w);
      glowStroke(ctx, p, 2.4, dpr);
      ctx.fillStyle = p.tip;
      ctx.beginPath();
      ctx.arc(w - 3 * dpr, base - amp * wave(u, st.mood), 3 * dpr, 0, TAU);
      ctx.fill();
      return st.playing;
    };

    // Wave: a filled sound wave, mirrored around the middle, swelling in
    // place. The middle takes the beat; the edges ripple.
    const drawWave = (dt) => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const n = 64;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      const since = (b - kb) * (60 / st.bpm);
      const kick = st.playing ? strength(kb) * Math.exp(-since / ((60 / st.bpm) * 0.4)) * lift() : 0;
      st.wave = st.wave ?? [];
      let moving = false;
      const lv = [];
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const mid = Math.sin(Math.PI * f);
        const t = st.clock;
        // Ripples at several sizes, so the edge looks like sound rather than a smooth hump.
        const ripple =
          0.5 +
          0.5 * (0.45 * Math.sin(t * 2.3 + f * 23) + 0.35 * Math.sin(t * 4.1 - f * 41 + hash(i) * 6) + 0.2 * Math.sin(t * 6.7 + f * 67));
        const target = st.playing
          ? mid ** 0.7 * (0.12 + 0.55 * kick * (0.6 + 0.4 * mid) + 0.5 * ripple * (0.45 + 0.55 * lift()))
          : 0.04 * mid;
        const cur = st.wave[i] ?? 0.04;
        const next = cur + (target - cur) * Math.min(1, (target > cur ? 14 : 4) * dt);
        if (Math.abs(next - target) > 0.002) moving = true;
        st.wave[i] = next;
        lv.push(next);
      }
      const mid = h / 2;
      const half = h * 0.48;
      const xs = (i) => (i / (n - 1)) * w;
      // A smooth outline through the points, top edge then the mirrored bottom.
      const edge = (sign) => {
        ctx.moveTo(xs(0), mid - sign * lv[0] * half);
        for (let i = 1; i < n; i++) {
          const xm = (xs(i - 1) + xs(i)) / 2;
          const ym = mid - sign * ((lv[i - 1] + lv[i]) / 2) * half;
          ctx.quadraticCurveTo(xs(i - 1), mid - sign * lv[i - 1] * half, xm, ym);
        }
        ctx.lineTo(xs(n - 1), mid - sign * lv[n - 1] * half);
      };
      const p = paint(c, ctx, w);
      ctx.beginPath();
      edge(1);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(xs(i), mid + lv[i] * half);
      ctx.closePath();
      ctx.fillStyle = p.fill;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      edge(1);
      glowStroke(ctx, p, 1.8, dpr);
      ctx.beginPath();
      edge(-1);
      glowStroke(ctx, p, 1.8, dpr);
      return st.playing || moving;
    };

    // Ripples: a ring spreads out from the middle on every beat and fades,
    // stronger beats making brighter, wider rings.
    const drawRipples = () => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const beatSec = 60 / st.bpm;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      st.rings = st.rings ?? [];
      if (st.playing && kb !== st.lastRing) {
        st.lastRing = kb;
        st.rings.push({ born: st.clock - (b - kb) * beatSec, s: strength(kb) * lift() });
      }
      const life = beatSec * 3.2;
      st.rings = st.rings.filter((r) => st.clock - r.born < life);
      const p = paint(c, ctx, w);
      const cx = w / 2;
      const cy = h * 0.62;
      ctx.lineCap = 'round';
      for (const r of st.rings) {
        const a = (st.clock - r.born) / life;
        const e = 1 - (1 - a) ** 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * (0.04 + 0.46 * e), h * (0.08 + 0.5 * e), 0, 0, TAU);
        ctx.strokeStyle = p.fill;
        ctx.globalAlpha = Math.max(0, (1 - a) ** 1.6 * Math.min(1, r.s));
        ctx.lineWidth = (0.8 + 2.4 * (1 - a)) * dpr;
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = p.blur * dpr;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      // A glowing core that throbs on the beat.
      const since = (b - kb) * beatSec;
      const throb = st.playing ? Math.exp(-since / (beatSec * 0.35)) * strength(kb) * lift() : 0;
      ctx.beginPath();
      ctx.ellipse(cx, cy, (6 + 10 * throb) * dpr, (2.5 + 4 * throb) * dpr, 0, 0, TAU);
      ctx.fillStyle = p.tip;
      ctx.globalAlpha = 0.55 + 0.45 * throb;
      ctx.fill();
      ctx.globalAlpha = 1;
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
      const keep =
        viz === 'pulse' ? drawPulse() : viz === 'wave' ? drawWave(dt) : viz === 'ripples' ? drawRipples() : drawBars(dt);
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
    const el = viz === 'bars' ? barsRef.current : canvasRef.current;
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
