// The Tea Room's beat: a small engine that runs each frame while music plays
// and moves the bars and draws the pulse line (or wave, ripples or bloom), so they flow instead of
// looping. It can't hear the music (YouTube's player keeps its sound to
// itself), so it keeps the song's tempo and makes each beat a little
// different: every fourth beat is stronger, low bars take the kick, high bars
// shimmer, and everything rises fast and falls back slowly like a real meter.
import { useEffect, useRef, useState } from 'react';

const TAU = Math.PI * 2;
// Canvas styles that draw the levels as a spectrum (audioMotion-style looks).
export const SPECTRUM = new Set(['led', 'curve', 'radial', 'brush']);
// A steady pseudo-random number in 0..1 for a whole number.
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// A dry-brush stroke along a centre line: pressed and solid at the start, then
// splitting into bristles that each run out of ink at their own point, some
// breaking into dashes near the tail. pt(t) gives [x, y, nx, ny] (point and
// normal); reach (0..1) is how far the brush has travelled so far.
const dryStroke = (ctx, pt, width, seed, reach = 1, bristles = 6) => {
  if (reach <= 0 || width <= 0) return;
  const SEG = 14;
  // One tapered ribbon of a bristle, from a to b along the stroke.
  const ribbon = (off, bw, a, b, end) => {
    const left = [];
    const right = [];
    for (let k = 0; k <= SEG; k++) {
      const t = a + ((b - a) * k) / SEG;
      const [x, y, nx, ny] = pt(t);
      // Full width through the body, thinning to a point where the ink runs out.
      const r = (bw / 2) * Math.pow(Math.max(0, 1 - t / end), 0.45) * (1 - t * 0.25);
      const o = off * (0.8 + 0.2 * (1 - t));
      left.push([x + nx * (o + r), y + ny * (o + r)]);
      right.push([x + nx * (o - r), y + ny * (o - r)]);
    }
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const [x, y] of left) ctx.lineTo(x, y);
    for (let k = right.length - 1; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1]);
    ctx.closePath();
    ctx.fill();
  };
  for (let j = 0; j < bristles; j++) {
    const r1 = hash(seed * 13.1 + j * 7.7);
    const r2 = hash(seed * 5.3 + j * 3.1);
    const r3 = hash(seed * 2.9 + j * 11.3);
    const edge = Math.abs(j / (bristles - 1) - 0.5) * 2;
    const off = (j / (bristles - 1) - 0.5) * width * 0.8;
    const bw = (width / bristles) * (1.2 + r1 * 0.9);
    // Outer bristles run dry first.
    const end = 1 - r2 * 0.45 * (0.35 + edge);
    const stop = Math.min(reach, end);
    // Some bristles skip once near the tail, leaving a dry gap.
    const gap = r3 < 0.5 ? end * (0.62 + r3 * 0.4) : 2;
    if (gap < stop) {
      ribbon(off, bw, 0, gap, end);
      const g2 = gap + 0.04 + r1 * 0.05;
      if (g2 < stop) ribbon(off, bw, g2, stop, end);
    } else ribbon(off, bw, 0, stop, end);
  }
  // The pressed head.
  const [hx, hy] = pt(0.02);
  ctx.beginPath();
  ctx.ellipse(hx, hy, width * 0.46, width * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
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
export function useBeatEngine({ barsRef, canvasRef, viz, bpm, playing, mood = 'steady', progress, live = null }) {
  const s = useRef({ clock: 0, beat0: 0, at: 0, bpm, levels: [], last: 0, shape: 1, polled: 0 });
  s.current.mood = MOODS[mood] ?? MOODS.steady;
  s.current.progress = progress;
  // With reduced motion asked for, the bars rest and the line stays still.
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  // Listen mode: an AnalyserNode on the microphone. While it's on, the bars
  // show what it hears (even with the player paused).
  s.current.live = live;
  s.current.playing = (playing || !!live) && !still;

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

    // Live levels: n bands spread on a log scale from 40 Hz to 16 kHz, each the
    // loudest bin in its band (the analyser already maps -85..-25 dB to 0..255).
    const liveLevels = (n) => {
      const an = st.live;
      if (!an) return null;
      if (!st.bins || st.bins.length !== an.frequencyBinCount) st.bins = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(st.bins);
      const hz = an.context.sampleRate / 2 / an.frequencyBinCount;
      const out = [];
      for (let i = 0; i < n; i++) {
        const f0 = 40 * Math.pow(400, i / n);
        const f1 = 40 * Math.pow(400, (i + 1) / n);
        let a = Math.floor(f0 / hz);
        const b = Math.max(a + 1, Math.ceil(f1 / hz));
        let m = 0;
        for (; a < b && a < st.bins.length; a++) m = Math.max(m, st.bins[a]);
        out.push(0.04 + 0.96 * Math.pow(m / 255, 1.4));
      }
      return out;
    };

    // Each bar's level this frame: live when listening, else the beat's guess.
    // Rises fast and falls back slowly, like a real meter; peaks hold, then drop.
    const levels = (n, dt) => {
      const live = liveLevels(n);
      const b = beatAt(st.clock);
      const k = Math.floor(b);
      const since = (b - k) * (60 / st.bpm);
      const kick = st.playing ? strength(k) * Math.exp(-since / ((60 / st.bpm) * 0.32)) * Math.min(1.2, st.energy) : 0;
      let moving = false;
      if (!st.peaks) st.peaks = [];
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const t = st.clock;
        const shimmer = 0.5 + 0.5 * (0.6 * Math.sin(t * (2.1 + 3.7 * hash(i)) + i) + 0.4 * Math.sin(t * (5.3 + 4.1 * hash(i + 40)) + 2 * i));
        const target = live
          ? live[i]
          : st.playing
            ? Math.min(
                1,
                0.08 +
                  0.85 * kick * (0.35 + 0.65 * (1 - f)) * (0.65 + 0.6 * hash(i * 7 + k)) +
                  0.45 * shimmer * (0.4 + 0.6 * f) * (0.45 + 0.55 * kick) * Math.min(1.1, 0.4 + 0.6 * st.energy),
              )
            : 0.1;
        const cur = st.levels[i] ?? 0.1;
        const rate = target > cur ? (live ? 30 : 22) : live ? 8 : 5;
        const next = cur + (target - cur) * Math.min(1, rate * dt);
        st.levels[i] = next;
        if (Math.abs(next - target) > 0.002) moving = true;
        // Peak caps: jump to a new high, hang a moment, then fall.
        const pk = st.peaks[i] ?? { v: 0.1, hold: 0 };
        if (next >= pk.v) {
          pk.v = next;
          pk.hold = 0.5;
        } else if ((pk.hold -= dt) <= 0) pk.v = Math.max(next, pk.v - 0.9 * dt);
        if (pk.v - next > 0.002) moving = true;
        st.peaks[i] = pk;
      }
      return moving;
    };

    const drawBars = (dt) => {
      const bars = barsRef.current ? [...barsRef.current.children] : [];
      const n = bars.length;
      if (!n) return false;
      const moving = levels(n, dt);
      bars.forEach((el, i) => {
        el.style.transform = `scaleY(${st.levels[i].toFixed(3)})`;
      });
      // Styles that flicker (Illusion) pick this up from the page.
      const fl = st.flicker ? '1' : '';
      if (barsRef.current.dataset.flicker !== fl) barsRef.current.dataset.flicker = fl;
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
      // A style can flicker to another colour for a moment now and then
      // (Illusion: Daffodill's blue breaking through Zankou's reds).
      const flicker = cs.getPropertyValue('--pulse-flicker').trim();
      if (flicker && st.flicker) return { fill: flicker, tip: flicker, glow: flicker, blur: 12 };
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

    // One sakura petal pointing up from (0, 0): rounded sides and a notched tip.
    const petal = (ctx, L, W) => {
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-W * 0.95, -L * 0.3, -W * 0.8, -L * 0.92, -W * 0.24, -L);
      ctx.lineTo(0, -L * 0.84);
      ctx.lineTo(W * 0.24, -L);
      ctx.bezierCurveTo(W * 0.8, -L * 0.92, W * 0.95, -L * 0.3, 0, 0);
      ctx.closePath();
    };

    // Bloom: a five-petal flower outline that turns slowly and swells on each
    // beat, shedding petals that drift off and fall (more on the downbeat).
    const drawBloom = (dt) => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const beatSec = 60 / st.bpm;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      const since = (b - kb) * beatSec;
      const throb = st.playing ? Math.exp(-since / (beatSec * 0.4)) * strength(kb) * lift() : 0;
      if (st.playing) st.spin = (st.spin ?? 0) + dt * 0.22;
      const spin = st.spin ?? 0;
      const cx = w / 2;
      const cy = h * 0.56;
      const R = Math.min(h * 0.5, w * 0.22) * (0.84 + 0.2 * throb);
      st.petals = st.petals ?? [];
      if (st.playing && kb !== st.lastBloom) {
        st.lastBloom = kb;
        const n = kb % 4 === 0 ? 4 : 1 + Math.round(hash(kb + 40));
        for (let i = 0; i < n; i++) {
          const r = (j) => hash(kb * 13 + i * 7 + j);
          st.petals.push({
            born: st.clock,
            a: spin + (i / n) * TAU + r(1) * 1.2,
            v: (0.35 + 0.4 * r(2)) * w * 0.5,
            rot: r(3) * TAU,
            turn: (r(4) - 0.5) * 5,
            size: R * (0.22 + 0.14 * r(5)),
            s: Math.min(1, 0.5 + strength(kb) * lift() * 0.6),
          });
        }
      }
      const life = beatSec * 4;
      st.petals = st.petals.filter((q) => st.clock - q.born < life);
      const p = paint(c, ctx, w);

      // Falling petals, behind the flower.
      for (const q of st.petals) {
        const t = st.clock - q.born;
        const a = t / life;
        const x = cx + Math.cos(q.a) * q.v * t * (1 - 0.35 * a) + Math.sin(t * 2.4 + q.rot) * 6 * dpr;
        const y = cy + Math.sin(q.a) * q.v * t * 0.45 + h * 0.5 * a * a;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(q.rot + q.turn * t);
        ctx.beginPath();
        petal(ctx, q.size, q.size * 0.62);
        ctx.fillStyle = p.fill;
        ctx.globalAlpha = (1 - a) ** 1.4 * q.s * 0.85;
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // The flower: a soft fill under a glowing outline.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spin);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * TAU) / 5);
        petal(ctx, R, R * 0.58);
        ctx.restore();
      }
      ctx.fillStyle = p.fill;
      ctx.globalAlpha = 0.1 + 0.18 * throb;
      ctx.fill();
      ctx.globalAlpha = 1;
      glowStroke(ctx, p, 1.4 + 0.8 * throb, dpr);
      // Stamens: short strokes out from the middle, ending in dots.
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const an = ((i + 0.5) * TAU) / 5;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(an) * R * 0.32, Math.sin(an) * R * 0.32);
      }
      glowStroke(ctx, p, 0.9, dpr);
      ctx.fillStyle = p.tip;
      for (let i = 0; i < 5; i++) {
        const an = ((i + 0.5) * TAU) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(an) * R * 0.34, Math.sin(an) * R * 0.34, (1.4 + throb) * dpr, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      // A glowing heart that throbs on the beat.
      ctx.beginPath();
      ctx.arc(cx, cy, (2.5 + 4 * throb) * dpr, 0, TAU);
      ctx.fillStyle = p.tip;
      ctx.globalAlpha = 0.6 + 0.4 * throb;
      ctx.fill();
      ctx.globalAlpha = 1;
      return st.playing || st.petals.length > 0;
    };

    // A four-point sparkle (Sunbringer's star) centred on (0, 0).
    const sparkle = (ctx, r) => {
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.14, -r * 0.14, r, 0);
      ctx.quadraticCurveTo(r * 0.14, r * 0.14, 0, r);
      ctx.quadraticCurveTo(-r * 0.14, r * 0.14, -r, 0);
      ctx.quadraticCurveTo(-r * 0.14, -r * 0.14, 0, -r);
      ctx.closePath();
    };

    // Embers: a row of flames along the bottom that leap on each beat, with
    // sparks drifting up; every fourth beat they flare (Emberburst) and throw
    // a burst of sparkles.
    const drawEmbers = (dt) => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const p = paint(c, ctx, w);
      const beatSec = 60 / st.bpm;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      const since = (b - kb) * beatSec;
      const kick = st.playing ? Math.exp(-since / (beatSec * 0.38)) * strength(kb) * lift() : 0;
      const burst = st.playing && kb % 4 === 0 ? Math.exp(-since / (beatSec * 0.7)) : 0;
      st.sparks = st.sparks ?? [];
      if (st.playing && kb !== st.lastEmber) {
        st.lastEmber = kb;
        const n = kb % 4 === 0 ? 7 : 2 + Math.round(hash(kb + 9) * 2);
        for (let i = 0; i < n; i++) {
          const r = (j) => hash(kb * 17 + i * 5 + j);
          st.sparks.push({
            born: st.clock,
            x: (0.08 + 0.84 * r(1)) * w,
            vy: (0.45 + 0.5 * r(2)) * h,
            sway: (r(3) - 0.5) * 30 * dpr,
            size: (kb % 4 === 0 ? 3.5 : 2.2) * dpr * (0.7 + 0.6 * r(4)),
            star: kb % 4 === 0 || r(5) > 0.6,
          });
        }
      }
      const life = beatSec * 3;
      st.sparks = st.sparks.filter((q) => st.clock - q.born < life);

      // Flames: each tongue a soft teardrop that sways and leaps with the kick.
      const N = 19;
      const base = h * 0.98;
      for (let layer = 0; layer < 2; layer++) {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const f = i / (N - 1);
          const x = (0.04 + 0.92 * f) * w;
          const t = st.clock;
          const flick = 0.5 + 0.5 * Math.sin(t * (5 + 3 * hash(i)) + i * 1.7);
          const centre = 1 - Math.abs(f - 0.5) * 1.1;
          const tall =
            h * (0.3 + 0.16 * flick * (st.playing ? 1 : 0.3) + (0.45 * kick + 0.3 * burst) * centre * (0.6 + 0.5 * hash(i + kb)));
          const hgt = layer ? tall * 0.55 : tall;
          const half = (w / N) * (layer ? 0.24 : 0.42);
          const lean = Math.sin(t * 2.3 + i) * half * 0.5;
          // Round at the bottom, curling to a sharp tip that leans with the sway.
          ctx.moveTo(x - half, base);
          ctx.bezierCurveTo(x - half * 1.1, base - hgt * 0.38, x + lean - half * 0.15, base - hgt * 0.62, x + lean * 1.4, base - hgt);
          ctx.bezierCurveTo(x + lean * 0.4 + half * 0.55, base - hgt * 0.55, x + half * 1.1, base - hgt * 0.35, x + half, base);
        }
        ctx.closePath();
        if (layer === 0) {
          ctx.fillStyle = p.fill;
          ctx.globalAlpha = 0.22 + 0.25 * kick + 0.2 * burst;
          ctx.fill();
          ctx.globalAlpha = 1;
          glowStroke(ctx, p, 1.1 + 0.6 * kick, dpr);
        } else {
          // The hot inner flames.
          ctx.fillStyle = p.tip;
          ctx.globalAlpha = 0.35 + 0.35 * kick + 0.3 * burst;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Sparks and sparkles rising.
      for (const q of st.sparks) {
        const t = st.clock - q.born;
        const a = t / life;
        const x = q.x + Math.sin(t * 3 + q.x) * q.sway * a;
        const y = base - h * 0.15 - q.vy * t * (1 - 0.3 * a);
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = (1 - a) ** 1.3;
        ctx.fillStyle = q.star ? p.tip : p.fill;
        ctx.beginPath();
        if (q.star) sparkle(ctx, q.size * (1.6 + 0.6 * Math.sin(t * 9)));
        else ctx.arc(0, 0, q.size * 0.6, 0, TAU);
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = 8 * dpr;
        }
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      return st.playing || st.sparks.length > 0;
    };

    // Spectrum styles, after audioMotion's looks: LED segments with peak caps,
    // mirrored bars with a reflection, a filled frequency curve, and a ring.
    const drawSpectrum = (kind, dt) => {
      const cv = canvasOf();
      if (!cv) return false;
      const { c, ctx, w, h, dpr } = cv;
      const n = kind === 'radial' ? 48 : kind === 'curve' ? 40 : kind === 'brush' ? 24 : 28;
      const moving = levels(n, dt);
      const p = paint(c, ctx, kind === 'radial' ? h : w);
      const L = st.levels;
      const P = st.peaks;
      ctx.fillStyle = p.fill;
      if (kind === 'led' || kind === 'mirror') {
        const gap = 3 * dpr;
        const bw = (w - gap * (n - 1)) / n;
        const base = kind === 'mirror' ? h * 0.62 : h;
        const top = kind === 'mirror' ? base : h;
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = (p.blur * dpr) / 2;
        }
        for (let i = 0; i < n; i++) {
          const x = i * (bw + gap);
          if (kind === 'led') {
            // Stacked segments, lit up to the level; the peak cap above.
            const seg = 3 * dpr;
            const sgap = 1.5 * dpr;
            const rows = Math.floor(h / (seg + sgap));
            const lit = Math.round(L[i] * rows);
            for (let r = 0; r < lit; r++) ctx.fillRect(x, h - (r + 1) * (seg + sgap) + sgap, bw, seg);
            const pr = Math.round(P[i].v * rows);
            if (pr > lit) {
              ctx.globalAlpha = 0.9;
              ctx.fillStyle = p.tip;
              ctx.fillRect(x, h - pr * (seg + sgap) + sgap, bw, seg);
              ctx.fillStyle = p.fill;
              ctx.globalAlpha = 1;
            }
          } else {
            const bh = L[i] * top * 0.96;
            ctx.fillRect(x, base - bh, bw, bh);
            ctx.fillStyle = p.tip;
            ctx.fillRect(x, base - P[i].v * top * 0.96 - 2 * dpr, bw, 2 * dpr);
            ctx.fillStyle = p.fill;
            // The reflection below, fading out.
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.28;
            ctx.fillRect(x, base + 2 * dpr, bw, bh * 0.55);
            ctx.restore();
          }
        }
        ctx.shadowBlur = 0;
      } else if (kind === 'brush') {
        // Brush: each bar is an ink stroke pressed at the bottom that splits
        // into dry bristles at its tip, and every two beats a wide stroke is
        // painted across behind them, alternating direction.
        ctx.strokeStyle = p.fill;
        const gap = 5 * dpr;
        const bw = (w - gap * (n - 1)) / n;
        if (st.playing) {
          const b = beatAt(st.clock) / 2;
          const k = Math.floor(b);
          const ph = b - k;
          const fade = ph < 0.55 ? 1 : Math.max(0, 1 - (ph - 0.55) / 0.35);
          const rtl = k % 2 === 1;
          const y = h * (0.45 + 0.2 * hash(k * 1.9));
          ctx.save();
          ctx.globalAlpha = 0.42 * fade;
          dryStroke(
            ctx,
            (t) => {
              const u = rtl ? 1 - t : t;
              return [w * (0.04 + 0.92 * u), y + Math.sin(u * Math.PI * 1.4 + k) * h * 0.08, 0, 1];
            },
            h * 0.34,
            k + 101,
            Math.min(1, ph / 0.3),
            9,
          );
          ctx.restore();
        }
        for (let i = 0; i < n; i++) {
          const cx = i * (bw + gap) + bw / 2;
          const bh = Math.max(bw * 0.5, L[i] * h * 0.95);
          const lean = (hash(i * 4.1) - 0.5) * bw * 0.6;
          dryStroke(
            ctx,
            (t) => [cx + lean * t * t, h - bw * 0.35 - t * (bh - bw * 0.35), 1, 0],
            bw * 0.75,
            i + 1,
            1,
            7,
          );
          // A small dab of ink where the peak was.
          const py = h - P[i].v * h * 0.95;
          if (P[i].v > L[i] + 0.04) {
            ctx.fillStyle = p.tip;
            ctx.beginPath();
            ctx.ellipse(cx + lean, py - 2 * dpr, bw * 0.28, 1.6 * dpr, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = p.fill;
          }
        }
      } else if (kind === 'curve') {
        // A smooth line through the levels, filled underneath.
        const pts = L.slice(0, n).map((v, i) => [(i / (n - 1)) * w, h - v * h * 0.92]);
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < n; i++) {
          const [x0, y0] = pts[i - 1];
          const [x1, y1] = pts[i];
          ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        }
        ctx.lineTo(w, pts[n - 1][1]);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < n; i++) {
          const [x0, y0] = pts[i - 1];
          const [x1, y1] = pts[i];
          ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        }
        ctx.lineTo(w, pts[n - 1][1]);
        glowStroke(ctx, p, 2.2, dpr);
      } else {
        // A ring of bars around the middle.
        const cx = w / 2;
        const cy = h / 2;
        const r0 = Math.min(w, h) * 0.2;
        const span = Math.min(w, h) * 0.3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = p.fill;
        ctx.lineWidth = Math.max(2, ((TAU * r0) / n) * 0.5);
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = (p.blur * dpr) / 2;
        }
        for (let i = 0; i < n; i++) {
          // Mirror left and right so low notes sit at the bottom.
          const a = Math.PI / 2 + (i / n) * Math.PI;
          for (const side of [1, -1]) {
            const ang = Math.PI / 2 + side * (a - Math.PI / 2);
            const len = L[i] * span;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
            ctx.lineTo(cx + Math.cos(ang) * (r0 + len), cy + Math.sin(ang) * (r0 + len));
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx, cy, r0 * 0.82, 0, TAU);
        ctx.lineWidth = 1.5 * dpr;
        ctx.strokeStyle = p.tip;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      return st.playing || moving;
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
      // Flicker: on about one beat in six, a stuttering moment just after the beat.
      {
        const b = beatAt(st.clock);
        const kb = Math.floor(b);
        const ph = b - kb;
        st.flicker = st.playing && hash(kb * 3.7 + 11) < 0.17 && ph > 0.08 && ph < 0.42 && Math.sin(st.clock * 70) > -0.2;
      }
      const keep =
        viz === 'pulse'
          ? drawPulse()
          : viz === 'wave'
            ? drawWave(dt)
            : viz === 'ripples'
              ? drawRipples()
              : viz === 'bloom'
                ? drawBloom(dt)
                : viz === 'embers'
                  ? drawEmbers(dt)
                  : SPECTRUM.has(viz)
                    ? drawSpectrum(viz, dt)
                    : drawBars(dt);
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

  // Wake the engine when playback or listening starts or stops.
  useEffect(() => {
    s.current.start?.();
  }, [playing, live]);
}

/**
 * Listen mode: the microphone through an analyser, only while `on`. Returns
 * { analyser, error }. Nothing is recorded or sent anywhere; the sound only
 * feeds the bars, and the microphone is released when it's switched off.
 */
export function useMicAnalyser(on) {
  const [state, setState] = useState({ analyser: null, error: '' });
  useEffect(() => {
    if (!on) {
      setState({ analyser: null, error: '' });
      return undefined;
    }
    let stream = null;
    let ctx = null;
    let gone = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (gone) return stream.getTracks().forEach((t) => t.stop());
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const an = ctx.createAnalyser();
        an.fftSize = 4096;
        an.smoothingTimeConstant = 0.55;
        an.minDecibels = -85;
        an.maxDecibels = -25;
        ctx.createMediaStreamSource(stream).connect(an);
        setState({ analyser: an, error: '' });
      } catch (e) {
        setState({
          analyser: null,
          error:
            e?.name === 'NotAllowedError'
              ? 'Microphone access was blocked. Allow it in your browser’s site settings to listen.'
              : e?.message === 'unsupported'
                ? 'This browser can’t listen through the microphone.'
                : 'No microphone found.',
        });
      }
    })();
    return () => {
      gone = true;
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, [on]);
  return state;
}
