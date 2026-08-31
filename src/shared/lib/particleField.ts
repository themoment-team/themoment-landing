/* The particle field.

   About sixteen thousand grains that hold three shapes — the mark, and two
   service icons — and fall back into a dust cloud between them. Canvas 2D,
   no library, no shader: one context and a great many fillRects.

   Lifted from themoment-logo.html, which was a standalone page. What changed
   coming in, and only this:

     · the canvas is passed in rather than looked up by id
     · the controls are returned rather than hung on window
     · every listener and the animation frame are held and released in
       destroy(), because React 19 StrictMode mounts an effect twice in
       development and two copies of this would run two loops, seed two skies
       and double the trail
     · the canvas no longer toggles on pointerdown — it sits under the page
       and never receives the click
     · the frame stops while the tab is hidden

   The palette is tuned for black and only black. On a light ground the
   grains disappear and the trail leaves permanent 1/255 smudges; see the
   handoff for the destination-out recipe that fixes both. This page is
   black, so none of it applies.

   Everything below the constants is the original algorithm, unchanged. */

export interface ParticleField {
  gather(): void;
  scatter(): void;
  toggle(): void;
  isGathered(): boolean;
  morph(k: number): void;
  shape(): number;
  shapeCount(): number;
  autoplay(on: boolean): void;
  destroy(): void;
}

interface Accumulator {
  x: number[];
  y: number[];
  z: number[];
  p: number[];
  s: number[];
}

interface Shape {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
  s: Float32Array;
  p: Uint8Array;
}

const TAU = Math.PI * 2;
const VOID = "#000000";

/* The mark has a pose of its own: reclined 30 degrees backward about its OWN
   horizontal axis, then turned toward its left flank. Composing them in that
   order is what makes the two tilts interact — swinging the yaw carries the
   recline axis with it, which shows up on screen as roll. */
const BASE_YAW = -0.5;
const BASE_PITCH = (-30 * Math.PI) / 180;
const MOUSE_YAW = 0.3;
const MOUSE_PITCH = 0.22;
const FOCAL = 430; /* model units — short lens, real convergence */

const ICON_SRC: Record<string, string> = {
  devops:
    "data:image/svg+xml,%3Csvg%20width%3D%2234%22%20height%3D%2220%22%20viewBox%3D%220%200%2034%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cellipse%20cx%3D%228%22%20cy%3D%229.78448%22%20rx%3D%227%22%20ry%3D%226.69756%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M10.6007%2015.9581L11.1126%2015.1127C11.5819%2015.3957%2011.745%2015.9921%2011.4804%2016.4576L10.6007%2015.9581ZM7.48804%2015.2348C7.00965%2014.9462%206.85102%2014.3338%207.13372%2013.8669C7.41643%2013.4%208.03342%2013.2554%208.51181%2013.544L7.99992%2014.3894L7.48804%2015.2348ZM9.75452%2019.4935C9.48477%2019.968%208.87227%2020.129%208.38645%2019.8531C7.90064%2019.5772%207.72548%2018.9689%207.99522%2018.4944L8.87487%2018.9939L9.75452%2019.4935ZM10.6007%2015.9581L10.0889%2016.8035L7.48804%2015.2348L7.99992%2014.3894L8.51181%2013.544L11.1126%2015.1127L10.6007%2015.9581ZM10.6007%2015.9581L11.4804%2016.4576L9.75452%2019.4935L8.87487%2018.9939L7.99522%2018.4944L9.72109%2015.4585L10.6007%2015.9581Z%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M4.59135%203.89096L3.71363%203.38869C3.44274%203.86187%203.61492%204.47%204.09847%204.74793L4.59135%203.89096ZM7.12763%201.49615C7.3989%201.02231%207.22583%200.413321%206.74108%200.135926C6.25633%20-0.14147%205.64345%200.0177751%205.37219%200.491609L6.24991%200.993878L7.12763%201.49615ZM7.06945%206.45557C7.55367%206.73389%208.16688%206.57583%208.43909%206.10253C8.7113%205.62924%208.53943%205.01994%208.05521%204.74162L7.56233%205.59859L7.06945%206.45557ZM4.59135%203.89096L5.46907%204.39323L7.12763%201.49615L6.24991%200.993878L5.37219%200.491609L3.71363%203.38869L4.59135%203.89096ZM4.59135%203.89096L4.09847%204.74793L7.06945%206.45557L7.56233%205.59859L8.05521%204.74162L5.08423%203.03399L4.59135%203.89096Z%22%20fill%3D%22%23fff%22%2F%3E%3Cellipse%20cx%3D%2226%22%20cy%3D%229.7522%22%20rx%3D%227%22%20ry%3D%226.8108%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M23.0436%2016.1731L22.6048%2015.2835C22.3473%2015.4106%2022.1554%2015.6398%2022.0772%2015.9136C21.999%2016.1873%2022.0419%2016.4796%2022.1952%2016.7171L23.0436%2016.1731ZM26.6583%2015.4944C27.1575%2015.2479%2027.3657%2014.6498%2027.1233%2014.1585C26.881%2013.6672%2026.2799%2013.4687%2025.7807%2013.7152L26.2195%2014.6048L26.6583%2015.4944ZM24.0174%2019.539C24.3147%2019.9993%2024.9355%2020.1289%2025.404%2019.8285C25.8726%2019.528%2026.0115%2018.9113%2025.7143%2018.451L24.8659%2018.995L24.0174%2019.539ZM23.0436%2016.1731L23.4825%2017.0627L26.6583%2015.4944L26.2195%2014.6048L25.7807%2013.7152L22.6048%2015.2835L23.0436%2016.1731ZM23.0436%2016.1731L22.1952%2016.7171L24.0174%2019.539L24.8659%2018.995L25.7143%2018.451L23.8921%2015.629L23.0436%2016.1731Z%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M30.4495%204.23258L31.4093%203.91504C31.5792%204.42833%2031.2961%204.98589%2030.7738%205.16678L30.4495%204.23258ZM28.4182%201.31241C28.2466%200.793912%2028.5372%200.231421%2029.0673%200.0560541C29.5974%20-0.119313%2030.1662%200.158851%2030.3378%200.677351L29.378%200.994882L28.4182%201.31241ZM27.4462%206.31933C26.9186%206.50206%2026.3457%206.23194%2026.1666%205.71599C25.9875%205.20004%2026.27%204.63364%2026.7976%204.45091L27.1219%205.38512L27.4462%206.31933ZM30.4495%204.23258L29.4897%204.55011L28.4182%201.31241L29.378%200.994882L30.3378%200.677351L31.4093%203.91504L30.4495%204.23258ZM30.4495%204.23258L30.7738%205.16678L27.4462%206.31933L27.1219%205.38512L26.7976%204.45091L30.1252%203.29837L30.4495%204.23258Z%22%20fill%3D%22%23fff%22%2F%3E%3C%2Fsvg%3E",
  back: "data:image/svg+xml,%3Csvg%20width%3D%2236%22%20height%3D%2220%22%20viewBox%3D%220%200%2036%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7.35319%2019V14.5L3.6473%2016.6176L1.00024%2012.1176L4.70613%209.73529L1.00024%207.61765L3.6473%203.11765L7.35319%205.23529V1H12.6473V5.23529L16.3532%203.11765L19.0002%207.61765L15.2944%209.73529M15.0002%2014.5H35.0002M15.0002%2019H35.0002M24.5002%209.73529H35.0002%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E",
  front:
    "data:image/svg+xml,%3Csvg%20width%3D%2234%22%20height%3D%2218%22%20viewBox%3D%220%200%2034%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M15%2017L19%201M11%201L2%209L11%2017M23%201L32%209L23%2017%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E",
};

/* One line decides both which icons take part and the order the mark cycles
   through them. `back` still has its data above; adding the name revives it. */
const ICON_ORDER = ["front", "devops"];

export interface ParticleFieldOptions {
  /* Called once, the first time a frame has actually been painted — not
     when mount returns. The shapes are rasterised and the icons decoded
     asynchronously, so there is a stretch after mounting where the canvas is
     still blank; the opening waits on this so it does not play over
     nothing. */
  onReady?: () => void;

  /* Called once, when the grains have finished travelling into the mark —
     not when the gather was asked for. The two are about a second and a half
     apart, and that second and a half is the whole of the effect. */
  onGathered?: () => void;
  /* How long the field stays a loose cloud before it gathers into the mark.
     The default is the source page's own opening. The landing hands it the
     length of the intro instead, so the grains come together as the cover
     lifts rather than while it is still down. */
  openDelay?: number;
}

export function mountParticleField(
  canvas: HTMLCanvasElement,
  { openDelay = 430, onReady, onGathered }: ParticleFieldOptions = {},
): ParticleField {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("particleField: no 2d context");
  /* Re-bound with a non-nullable type rather than left to narrowing: the
     draw loop reads it from inside two nested closures, and the narrowing
     does not survive that far. */
  const ctx: CanvasRenderingContext2D = context;

  const REDUCED =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Everything the teardown has to reach. Populated as the field is built,
     because init() only runs once the icons have decoded — a destroy() that
     lands before that has to stop the build as well as the loop. */
  let destroyed = false;
  let rafId = 0;
  const teardown: Array<() => void> = [];

  /* 3x3 row-major rotations; p' = M . p */
  const rotX = (a: number) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [1, 0, 0, 0, c, -s, 0, s, c];
  };
  const rotY = (a: number) => {
    const c = Math.cos(a), s = Math.sin(a);
    return [c, 0, s, 0, 1, 0, -s, 0, c];
  };
  const mul3 = (A: number[], B: number[]) => {
    const C = new Array<number>(9);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c];
    return C;
  };
  const untransform = (M: number[], v: number[]) => [
    M[0] * v[0] + M[3] * v[1] + M[6] * v[2],
    M[1] * v[0] + M[4] * v[1] + M[7] * v[2],
    M[2] * v[0] + M[5] * v[1] + M[8] * v[2],
  ];
  const POSE = mul3(rotY(BASE_YAW), rotX(BASE_PITCH));

  /* ---- 1. Rasterise every shape into one shared mask buffer ---- */
  const S = 400, CX = 200, CY = 200;
  const D2R = Math.PI / 180;

  function raster(draw: (c: CanvasRenderingContext2D) => void): Uint8ClampedArray {
    const off = document.createElement("canvas");
    off.width = S;
    off.height = S;
    const c = off.getContext("2d");
    if (!c) throw new Error("particleField: no offscreen 2d context");
    c.strokeStyle = "#fff";
    c.fillStyle = "#fff";
    draw(c);
    return c.getImageData(0, 0, S, S).data;
  }

  const ringData = raster((c) => {
    c.lineCap = "round";
    c.lineWidth = 20;
    const r = 132;
    const segs = [[316, 446], [104, 176], [196, 300]];
    for (const seg of segs) {
      c.beginPath();
      c.arc(CX, CY, r, seg[0] * D2R, seg[1] * D2R);
      c.stroke();
    }
  });

  const glyphData = raster((c) => {
    /* Geometric heavy M as an explicit outline, so the V-notch and the two
       bottom counters hold their shape at any angle. */
    const w = 146, h = 118;
    const x0 = CX - w / 2, y0 = CY - h / 2;
    const stem = 0.235, tip = 0.378, notch = 0.4, shoulder = 0.05, vertex = 0.76;
    const pts = [
      [0, 0], [tip, 0], [0.5, notch], [1 - tip, 0], [1, 0], [1, 1],
      [1 - stem, 1], [1 - stem, shoulder], [0.5, vertex], [stem, shoulder],
      [stem, 1], [0, 1],
    ];
    c.beginPath();
    pts.forEach((pt, i) => {
      const px = x0 + pt[0] * w, py = y0 + pt[1] * h;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    });
    c.closePath();
    c.fill();
  });

  const LIGHT = Math.min(window.innerWidth, window.innerHeight) < 620 ? 0.62 : 1;

  /* One key light, up and to the left of the camera, carried back into the
     mark's own frame so a baked per-grain shade stays true to the pose. */
  const LIGHT_M = untransform(POSE, [-0.5, -0.45, -0.74]);
  const WALL = 1.0;

  function census(data: Uint8ClampedArray) {
    let lit = 0, edge = 0;
    for (let y = 1; y < S - 1; y++) {
      for (let x = 1; x < S - 1; x++) {
        const i = (y * S + x) * 4 + 3;
        if (data[i] < 128) continue;
        lit++;
        if (data[i - 4] < 128 || data[i + 4] < 128 || data[i - S * 4] < 128 || data[i + S * 4] < 128) edge++;
      }
    }
    return { lit, edge };
  }

  /* Skin the solid and nothing else: front face, back face, and the side
     wall along the silhouette. Same grains per unit of surface. */
  function shell(acc: Accumulator, data: Uint8ClampedArray, p: number, depth: number, D: number) {
    const h = depth / 2;
    const wall = depth * D * WALL, whole = wall | 0, frac = wall - whole;

    const grain = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
      acc.x.push(x - CX + (Math.random() - 0.5));
      acc.y.push(y - CY + (Math.random() - 0.5));
      acc.z.push(z);
      acc.p.push(p);
      const d = nx * LIGHT_M[0] + ny * LIGHT_M[1] + nz * LIGHT_M[2];
      let lit = d * 2.6;
      if (Math.random() < 0.1) lit += 2.6;
      acc.s.push(Math.max(-4, Math.min(5, lit)));
    };

    for (let y = 1; y < S - 1; y++) {
      for (let x = 1; x < S - 1; x++) {
        const i = (y * S + x) * 4 + 3;
        if (data[i] < 128) continue;
        if (Math.random() < D) grain(x, y, -h + Math.random() * 1.4, 0, 0, -1);
        if (Math.random() < D) grain(x, y, h - Math.random() * 1.4, 0, 0, 1);
        if (data[i - 4] >= 128 && data[i + 4] >= 128 && data[i - S * 4] >= 128 && data[i + S * 4] >= 128) continue;
        const gx = data[i + 4] - data[i - 4], gy = data[i + S * 4] - data[i - S * 4];
        const g = Math.sqrt(gx * gx + gy * gy);
        const nx = g > 0 ? -gx / g : 0, ny = g > 0 ? -gy / g : 0;
        for (let k = 0; k < whole; k++) grain(x, y, (Math.random() - 0.5) * depth, nx, ny, 0);
        if (Math.random() < frac) grain(x, y, (Math.random() - 0.5) * depth, nx, ny, 0);
      }
    }
  }

  const newAcc = (): Accumulator => ({ x: [], y: [], z: [], p: [], s: [] });

  /* Every shape is resampled to the same grain count and ordered by angle
     around the centre, so a morph flows around the form instead of every
     grain crossing every other one. */
  function bake(acc: Accumulator, count: number): Shape {
    const M = acc.x.length;
    const idx = new Int32Array(M);
    for (let i = 0; i < M; i++) idx[i] = i;
    const ang = new Float32Array(M);
    for (let i = 0; i < M; i++) ang[i] = Math.atan2(acc.y[i], acc.x[i]);
    idx.sort((a, b) => ang[a] - ang[b]);
    const out: Shape = {
      x: new Float32Array(count), y: new Float32Array(count), z: new Float32Array(count),
      s: new Float32Array(count), p: new Uint8Array(count),
    };
    for (let j = 0; j < count; j++) {
      const src = idx[((j * M) / count) | 0];
      out.x[j] = acc.x[src] + (Math.random() - 0.5) * 0.9;
      out.y[j] = acc.y[src] + (Math.random() - 0.5) * 0.9;
      out.z[j] = acc.z[src];
      out.s[j] = acc.s[src];
      out.p[j] = acc.p[src];
    }
    return out;
  }

  /* ---- 2. Build every shape, then start ---- */
  let SH: Array<Shape | undefined> = [];
  let N = 0;
  let PART: Uint8Array;
  const DEPTH_ICON = 15;

  {
    const acc = newAcc();
    shell(acc, glyphData, 0, 22, 0.083 * LIGHT);
    shell(acc, ringData, 1, 15, 0.068 * LIGHT);
    N = acc.x.length;
    SH[0] = bake(acc, N);
    PART = SH[0].p;
  }

  function buildIcon(data: Uint8ClampedArray): Shape {
    /* pick the dose that lands this shape on the same grain count */
    const c = census(data);
    const per = 2 * c.lit + c.edge * DEPTH_ICON * WALL;
    const dose = Math.min(0.9, N / Math.max(per, 1));
    const acc = newAcc();
    shell(acc, data, 0, DEPTH_ICON, dose);
    return bake(acc, N);
  }

  function rasterImage(img: HTMLImageElement): Uint8ClampedArray {
    const vw = img.naturalWidth || 36, vh = img.naturalHeight || 20;
    const box = 302; /* icons carry the mark's visual weight */
    const sc = Math.min(box / vw, (box * 0.62) / vh);
    const w = vw * sc, h = vh * sc;
    return raster((c) => {
      c.imageSmoothingEnabled = true;
      c.drawImage(img, CX - w / 2, CY - h / 2, w, h);
    });
  }

  let pending = ICON_ORDER.length;
  ICON_ORDER.forEach((name, i) => {
    const img = new Image();
    img.onload = img.onerror = () => {
      if (destroyed) return;
      try {
        if (img.naturalWidth) SH[i + 1] = buildIcon(rasterImage(img));
      } catch {
        /* an icon that failed to decode simply drops out of the rotation */
      }
      if (--pending === 0 && !destroyed) {
        SH = SH.filter(Boolean);
        init();
      }
    };
    img.src = ICON_SRC[name];
  });

  /* Filled in by init(); until then the controls are inert rather than
     absent, so a caller can hold them from the first render. */
  const control = {
    setMode: (_m: number) => {},
    morphTo: (_k: number) => {},
    mode: () => 0,
    shapeTo: () => 0,
    setAuto: (_on: boolean) => {},
  };

  /* ---- 3. Everything below runs once the shapes exist ---- */
  function init() {
    const shapes = SH as Shape[];

    /* The dispersed field is a resting state in its own right: every grain
       keeps a fixed home on a centre-weighted radius, and wanders around it.
       There is no net drift, so the distribution never decays. */
    const FHX = new Float32Array(N), FHY = new Float32Array(N), FHZ = new Float32Array(N);
    const FAMP = new Float32Array(N);
    const DELAY = new Float32Array(N), DUR = new Float32Array(N);
    const DELAYB = new Float32Array(N), DURB = new Float32Array(N);
    const MDELAY = new Float32Array(N), MDUR = new Float32Array(N);
    const PH = new Float32Array(N), PH2 = new Float32Array(N);
    const AMP = new Float32Array(N), FRQ = new Float32Array(N), GRAIN = new Float32Array(N);
    const MAXR = 180;
    let MMAX = 0;
    /* The last grain to land when the field assembles. Every grain leaves on
       its own delay and flies for its own duration, so the gather is over at
       the largest of those sums — not at the average, and not at the moment
       it was asked for. */
    let GMAX = 0;

    const HX = shapes[0].x, HY = shapes[0].y;
    for (let i = 0; i < N; i++) {
      const th = Math.random() * TAU, cz = Math.random() * 2 - 1, sz = Math.sqrt(1 - cz * cz);
      const r = 0.07 + Math.pow(Math.random(), 1.15) * 0.93;
      FHX[i] = sz * Math.cos(th) * r;
      FHY[i] = cz * r;
      FHZ[i] = sz * Math.sin(th) * r;
      FAMP[i] = 2.5 + Math.random() * 7;
      const ax = HX[i], ay = HY[i];
      const d = Math.sqrt(ax * ax + ay * ay) || 1;
      DELAY[i] = 0.17 * (d / MAXR) + Math.random() * 0.17;
      DUR[i] = 0.42 + Math.random() * Math.random() * 1.15;
      if (DELAY[i] + DUR[i] > GMAX) GMAX = DELAY[i] + DUR[i];
      DELAYB[i] = Math.random() * 0.09 + 0.07 * (d / MAXR);
      DURB[i] = 0.32 + Math.random() * Math.random() * 1.25;
      MDELAY[i] = Math.random() * 0.2;
      MDUR[i] = 0.46 + Math.random() * Math.random() * 1.05;
      if (MDELAY[i] + MDUR[i] > MMAX) MMAX = MDELAY[i] + MDUR[i];
      PH[i] = Math.random() * TAU;
      PH2[i] = Math.random() * TAU;
      AMP[i] = 0.35 + Math.random() * 0.95;
      FRQ[i] = 0.85 + Math.random() * 2.45;
      GRAIN[i] = 0.72 + Math.random() * 0.62;
    }

    /* form: 0 = dispersed, 1 = assembled */
    const E0 = new Float32Array(N);
    let MODE = 0, tPhase = 99;

    /* the mark's live target, and where it was when the current morph began */
    const curX = new Float32Array(shapes[0].x), curY = new Float32Array(shapes[0].y),
      curZ = new Float32Array(shapes[0].z), curS = new Float32Array(shapes[0].s);
    const frX = new Float32Array(curX), frY = new Float32Array(curY),
      frZ = new Float32Array(curZ), frS = new Float32Array(curS);
    let shapeTo = 0, mPhase = 99;

    /* ---- 4. Night sky ---- */
    const STAR_TINTS = ["236,240,255", "168,183,252", "255,242,228"];
    const ALEVELS = 15;
    const STAR_STYLE = new Array<string>(STAR_TINTS.length * ALEVELS);
    for (let ti = 0; ti < STAR_TINTS.length; ti++)
      for (let ai = 0; ai < ALEVELS; ai++)
        STAR_STYLE[ti * ALEVELS + ai] = `rgba(${STAR_TINTS[ti]},${(ai / (ALEVELS - 1)).toFixed(3)})`;

    let SN = 0;
    let stx = new Float32Array(0), sty = new Float32Array(0), ssz = new Float32Array(0),
      sph = new Float32Array(0), ssp = new Float32Array(0), sba = new Float32Array(0),
      sam = new Float32Array(0), sdep = new Float32Array(0);
    let stint = new Uint8Array(0);
    const SKY_MARGIN = 150;

    function seedStars(w: number, h: number) {
      const sw = w + SKY_MARGIN * 2, sh = h + SKY_MARGIN * 2;
      SN = Math.max(500, Math.min(2400, Math.round((sw * sh) / 1500)));
      stx = new Float32Array(SN); sty = new Float32Array(SN); ssz = new Float32Array(SN);
      sph = new Float32Array(SN); ssp = new Float32Array(SN); sba = new Float32Array(SN);
      sam = new Float32Array(SN); sdep = new Float32Array(SN); stint = new Uint8Array(SN);
      for (let i = 0; i < SN; i++) {
        stx[i] = -SKY_MARGIN + Math.random() * sw;
        sty[i] = -SKY_MARGIN + Math.random() * sh;
        const big = Math.random();
        ssz[i] = big > 0.99 ? 1.8 + Math.random() * 0.9 : big > 0.93 ? 1.1 + Math.random() * 0.5 : 0.7 + Math.random() * 0.4;
        sdep[i] = 0.22 + ((ssz[i] - 0.7) / 2.0) * 1.15 + Math.random() * 0.25;
        sph[i] = Math.random() * TAU;
        ssp[i] = 0.35 + Math.random() * 1.6;
        sba[i] = 0.12 + Math.random() * 0.32;
        sam[i] = 0.09 + Math.random() * 0.36;
        stint[i] = Math.random() > 0.88 ? (Math.random() > 0.5 ? 1 : 2) : 0;
      }
    }

    /* ---- 5. Colour ramps ---- */
    const NP = 4, NB = 46;
    const RAMPS = [
      { stops: [[255, 255, 255], [190, 202, 253], [48, 44, 132]], a: [0.62, 0.4, 0.09], size: 1.38 },
      { stops: [[224, 231, 255], [146, 161, 247], [37, 34, 106]], a: [0.56, 0.31, 0.07], size: 1.26 },
      { stops: [[255, 224, 252], [232, 160, 246], [124, 58, 180]], a: [0.62, 0.42, 0.15], size: 1.38 },
      { stops: [[214, 250, 255], [125, 211, 252], [30, 100, 180]], a: [0.62, 0.42, 0.15], size: 1.38 },
    ];
    const mix = (a: number[], b: number[], t: number) => [
      a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t,
    ];
    const STYLE = new Array<string>(NB * NP);
    const SIZE = new Float32Array(NB * NP);
    for (let b = 0; b < NB; b++) {
      const t = 1 - b / (NB - 1);
      for (let p = 0; p < NP; p++) {
        const R = RAMPS[p];
        let col: number[], al: number;
        if (t < 0.5) {
          col = mix(R.stops[0], R.stops[1], t / 0.5);
          al = R.a[0] + (R.a[1] - R.a[0]) * (t / 0.5);
        } else {
          col = mix(R.stops[1], R.stops[2], (t - 0.5) / 0.5);
          al = R.a[1] + (R.a[2] - R.a[1]) * ((t - 0.5) / 0.5);
        }
        STYLE[b * NP + p] = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${al.toFixed(3)})`;
        SIZE[b * NP + p] = R.size;
      }
    }

    /* ---- 6. Projection buffers ---- */
    const bufX = new Float32Array(N), bufY = new Float32Array(N), bufS = new Float32Array(N);
    const bufB = new Int32Array(N);
    const counts = new Int32Array(NB * NP + 1);
    const order = new Int32Array(N);

    let W = 0, H = 0, DPR = 1, SCALE = 1, PW = 0, PH_ = 0, fresh = true;
    let FIELD_X = 600, FIELD_Y = 380;
    const FIELD_Z = 380;
    const FADE = REDUCED ? 1 : 0.085;

    /* Measured off the canvas rather than the window. A fixed full-screen
       layer gives the same numbers, but it also means this keeps working if
       the field is ever put inside a section. */
    function resize() {
      const cw = canvas.clientWidth || window.innerWidth;
      const ch = canvas.clientHeight || window.innerHeight;
      /* iOS grows and shrinks the viewport as its address bar hides, which
         fires a resize on every scroll. Reseeding the sky and hard-clearing
         on each one tears the trail apart the whole way down the page, so a
         height-only change keeps the buffers it already has. */
      const widthChanged = cw !== W;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = cw;
      H = ch;
      PW = Math.round(W * DPR);
      PH_ = Math.round(H * DPR);
      canvas.width = PW;
      canvas.height = PH_;
      /* Resizing the backing store clears it, so the first frame after has
         to repaint the ground whatever we do about the sky. */
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      SCALE = (Math.min(PW, PH_) * 0.56) / 330;
      FIELD_X = (PW / 2 / SCALE) * 1.3;
      FIELD_Y = (PH_ / 2 / SCALE) * 1.3;
      fresh = true;
      if (widthChanged || SN === 0) seedStars(PW, PH_);
    }
    resize();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);
    teardown.push(() => {
      observer.disconnect();
      window.clearTimeout(resizeTimer);
    });

    /* ---- 7. Pointer ----
       Every layer answers the pointer the same way — it travels WITH it, on
       both axes — and only the amount differs, set by how near the layer is.
       One pointer value, right and down positive, shared by all of them: to
       flip an axis, flip that one constant. */
    const SKY_PAR_X = 72, SKY_PAR_Y = 72;   /* far background */
    const FIELD_PAR_X = 66, FIELD_PAR_Y = 66; /* the loose dust */

    /* the mark answers by leaning, not sliding; negative = leans away */
    const MARK_YAW = -MOUSE_YAW, MARK_PITCH = MOUSE_PITCH;

    let ptrX = 0, ptrY = 0, ptrTX = 0, ptrTY = 0;
    let lagX = 0, lagY = 0;

    /* On window, not on the canvas: the field sits under the page with
       pointer-events off and never sees an event of its own. */
    const onPointerMove = (e: PointerEvent) => {
      ptrTX = e.clientX / W - 0.5;
      ptrTY = e.clientY / H - 0.5;
    };
    window.addEventListener("pointermove", onPointerMove);
    teardown.push(() => window.removeEventListener("pointermove", onPointerMove));

    /* ---- 8. Transitions ----
       One curve for every transition: leaves at full speed, decelerates the
       whole way in, lands exactly on the target. Nothing overshoots — the
       variety comes from per-grain flight times, not from the curve. */
    const EASE_K = 8.5, EASE_N = 1 / (1 - Math.pow(2, -EASE_K));
    const easeOut = (x: number) => (1 - Math.pow(2, -EASE_K * x)) * EASE_N;

    function progress(j: number, mode: number, tp: number) {
      const pr = mode ? (tp - DELAY[j]) / DUR[j] : (tp - DELAYB[j]) / DURB[j];
      return pr <= 0 ? 0 : pr >= 1 ? 1 : easeOut(pr);
    }

    function setMode(m: number) {
      if (m === MODE) return;
      for (let j = 0; j < N; j++) E0[j] = E0[j] + (MODE - E0[j]) * progress(j, MODE, tPhase);
      MODE = m;
      tPhase = 0;
    }

    function morphTo(k: number) {
      if (!shapes[k] || k === shapeTo) return;
      /* snapshot wherever the mark is right now, so an interrupted morph
         picks up from the current form rather than snapping */
      if (mPhase < MMAX) {
        frX.set(curX); frY.set(curY); frZ.set(curZ); frS.set(curS);
      } else {
        const C = shapes[shapeTo];
        frX.set(C.x); frY.set(C.y); frZ.set(C.z); frS.set(C.s);
      }
      shapeTo = k;
      mPhase = 0;
    }

    let auto = true, cycleAt = 0;
    const CYCLE = 3.4;

    control.setMode = setMode;
    control.morphTo = morphTo;
    control.mode = () => MODE;
    control.shapeTo = () => shapeTo;
    control.setAuto = (on: boolean) => { auto = on; };

    /* ---- 9. Frame ---- */
    let clock = 0, last = performance.now();

    /* Default: open on the dispersed field, gather once, then cycle the mark
       through the icons on its own. */
    if (REDUCED) {
      E0.fill(1);
      MODE = 1;
      auto = false;
    } else {
      const openTimer = window.setTimeout(() => {
        setMode(1);
        cycleAt = clock + 2.6;
      }, openDelay);
      teardown.push(() => window.clearTimeout(openTimer));
    }

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;
      tPhase += dt;
      mPhase += dt;

      /* The mark is assembled: the field asked for it GMAX seconds ago and
         the last grain has now landed. Said once — the field goes on to
         scatter and gather again as the page is scrolled, and this is about
         the opening, not about every gather after it. */
      if (!gathered && MODE === 1 && tPhase >= GMAX) {
        gathered = true;
        onGathered?.();
      }

      if (auto && MODE === 1 && clock > cycleAt) {
        morphTo((shapeTo + 1) % shapes.length);
        cycleAt = clock + CYCLE;
      }

      if (REDUCED) {
        ptrX = ptrTX; ptrY = ptrTY; lagX = ptrX; lagY = ptrY;
      } else {
        ptrX += (ptrTX - ptrX) * Math.min(dt * 2.7, 1);
        ptrY += (ptrTY - ptrY) * Math.min(dt * 2.7, 1);
        lagX += (ptrX - lagX) * Math.min(dt * 3.1, 1);
        lagY += (ptrY - lagY) * Math.min(dt * 3.1, 1);
      }
      const yawOff = ptrX * MARK_YAW, pitchOff = ptrY * MARK_PITCH;

      /* pose the mark, then orbit the camera around the posed mark */
      const M = mul3(rotX(pitchOff), mul3(rotY(BASE_YAW + yawOff), rotX(BASE_PITCH)));
      const m0 = M[0], m1 = M[1], m2 = M[2], m3 = M[3], m4 = M[4], m5 = M[5], m6 = M[6], m7 = M[7], m8 = M[8];
      const cx = PW / 2, cy = PH_ * 0.49;

      if (fresh) {
        ctx.fillStyle = VOID;
        ctx.fillRect(0, 0, PW, PH_);
        fresh = false;
      } else {
        /* The canvas is never fully cleared — each frame is veiled instead,
           so a moving grain leaves a tail. This is the look. */
        ctx.fillStyle = `rgba(0,0,0,${FADE})`;
        ctx.fillRect(0, 0, PW, PH_);
      }

      /* --- night sky --- */
      for (let i = 0; i < SN; i++) {
        const a = REDUCED
          ? sba[i] + sam[i] * 0.5
          : sba[i] + sam[i] * (0.5 + 0.5 * Math.sin(clock * ssp[i] + sph[i]));
        if (a <= 0.02) continue;
        const pk = sdep[i] * DPR;
        const sxp = stx[i] + lagX * SKY_PAR_X * pk;
        if (sxp < -4 || sxp > PW) continue;
        const syp = sty[i] + lagY * SKY_PAR_Y * pk;
        if (syp < -4 || syp > PH_) continue;
        let lvl = (a * (ALEVELS - 1)) | 0;
        if (lvl > ALEVELS - 1) lvl = ALEVELS - 1;
        ctx.fillStyle = STAR_STYLE[stint[i] * ALEVELS + lvl];
        let ss = ssz[i] * DPR;
        if (ss < 1) ss = 1;
        ctx.fillRect(sxp | 0, syp | 0, ss | 0, ss | 0);
      }

      /* --- project --- */
      counts.fill(0);
      const fpx = lagX * FIELD_PAR_X, fpy = lagY * FIELD_PAR_Y;
      const TO = shapes[shapeTo], morphing = mPhase < MMAX;
      const tx_ = TO.x, ty_ = TO.y, tz_ = TO.z, ts_ = TO.s;

      for (let j = 0; j < N; j++) {
        /* where the mark is: somewhere between the shape it left and the one
           it is heading for. Once the morph has finished the target is read
           straight through — no per-grain blend in the steady state. */
        let gx: number, gy: number, gz: number, gs: number;
        if (morphing) {
          let mp = (mPhase - MDELAY[j]) / MDUR[j];
          mp = mp <= 0 ? 0 : mp >= 1 ? 1 : easeOut(mp);
          gx = frX[j] + (tx_[j] - frX[j]) * mp;
          gy = frY[j] + (ty_[j] - frY[j]) * mp;
          gz = frZ[j] + (tz_[j] - frZ[j]) * mp;
          gs = frS[j] + (ts_[j] - frS[j]) * mp;
          curX[j] = gx; curY[j] = gy; curZ[j] = gz; curS[j] = gs;
        } else {
          gx = tx_[j]; gy = ty_[j]; gz = tz_[j]; gs = ts_[j];
        }

        const e = REDUCED ? 1 : E0[j] + (MODE - E0[j]) * progress(j, MODE, tPhase);

        /* the pose belongs to the mark; a loose grain never feels the tilt */
        const mxr = m0 * gx + m1 * gy + m2 * gz;
        const myr = m3 * gx + m4 * gy + m5 * gz;
        const mzr = m6 * gx + m7 * gy + m8 * gz;

        const sx = FHX[j] * FIELD_X + fpx, sy = FHY[j] * FIELD_Y + fpy, sz = FHZ[j] * FIELD_Z;
        let rx = sx + (mxr - sx) * e;
        let ry = sy + (myr - sy) * e;
        let dz = sz + (mzr - sz) * e;

        if (!REDUCED) {
          const w = FAMP[j] * (1 - e) + AMP[j] * e, t1 = clock * FRQ[j];
          rx += Math.sin(t1 + PH[j]) * w;
          ry += Math.sin(t1 * 1.37 + PH2[j]) * w * 0.85;
          dz += Math.sin(t1 * 0.71 + PH[j] + PH2[j]) * w * 1.25;
        }

        let denom = FOCAL + dz;
        if (denom < 130) denom = 130;
        let persp = FOCAL / denom;
        if (persp > 2.6) persp = 2.6;

        bufX[j] = cx + rx * SCALE * persp;
        bufY[j] = cy + ry * SCALE * persp;

        const span = 400 + (72 - 400) * e;
        let depth = (dz + span) / (span + span);
        depth = depth < 0 ? 0 : depth > 1 ? 1 : depth;
        let bk = (((1 - depth) * (NB - 1)) | 0) + (gs | 0);
        if (bk < 0) bk = 0;
        else if (bk > NB - 1) bk = NB - 1;
        const idx = bk * NP + PART[j];
        bufB[j] = idx;
        bufS[j] = SIZE[idx] * GRAIN[j] * persp * DPR * (0.78 + 0.22 * e);
        counts[idx]++;
      }

      /* Counting sort by depth bucket, so sixteen thousand grains cost 184
         fillStyle changes rather than one each. */
      let run = 0;
      for (let k2 = 0; k2 < NB * NP; k2++) {
        const c = counts[k2];
        counts[k2] = run;
        run += c;
      }
      for (let m = 0; m < N; m++) order[counts[bufB[m]]++] = m;

      let cur = -1;
      for (let q = 0; q < N; q++) {
        const id = order[q], bb = bufB[id];
        if (bb !== cur) {
          cur = bb;
          ctx.fillStyle = STYLE[bb];
        }
        let szp = (bufS[id] + 0.42) | 0;
        if (szp < 1) szp = 1;
        ctx.fillRect(bufX[id] | 0, bufY[id] | 0, szp, szp);
      }

      /* The canvas now has something on it. Said once, and from inside the
         frame rather than after mount returns: the shapes are rasterised and
         the icons decoded asynchronously, so mount returns while the canvas
         is still blank. */
      if (!announced) {
        announced = true;
        onReady?.();
      }

      if (running && !destroyed) rafId = requestAnimationFrame(frame);
    }

    let announced = false;
    let gathered = false;

    /* Whether the loop is meant to be going, tracked outright rather than
       inferred from rafId.

       Inferring is what broke it: requestAnimationFrame in a hidden tab
       hands back a perfectly good id for a callback that never runs. Start
       the field on a page that opens in the background and rafId is
       non-zero while nothing is being drawn — so the "resume if there is no
       frame pending" test on the way back said one was pending, skipped the
       restart, and the field stayed frozen for the rest of the session. */
    let running = false;

    function play() {
      if (running || destroyed || REDUCED) return;
      running = true;
      /* Without this the first dt after a pause is however long the tab was
         away, and every grain jumps. The clamp inside frame() softens that,
         but only after it has already happened. */
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    function pause() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    }

    teardown.push(pause);

    if (REDUCED) {
      /* One still frame, no loop. */
      rafId = requestAnimationFrame(frame);
    } else {
      /* Always started, even where document.hidden says the tab is in the
         background. A hidden tab simply gets no callbacks until it is
         looked at, and the browser resumes them itself; withholding the
         start instead means trusting a flag that some embedders report
         wrongly, and a page that never draws at all is far worse than one
         that queues a frame nobody sees. */
      play();
    }

    const onVisibility = () => {
      if (REDUCED) return;
      if (document.hidden) pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    teardown.push(() => document.removeEventListener("visibilitychange", onVisibility));

    /* With motion reduced there is no loop, so a resize is the only thing
       that can ask for a repaint. */
    if (REDUCED) {
      const onReducedResize = () => requestAnimationFrame(frame);
      window.addEventListener("resize", onReducedResize);
      teardown.push(() => window.removeEventListener("resize", onReducedResize));
    }
  }

  return {
    gather: () => control.setMode(1),
    scatter: () => control.setMode(0),
    toggle: () => control.setMode(control.mode() ? 0 : 1),
    isGathered: () => control.mode() === 1,
    morph: (k) => control.morphTo(k),
    shape: () => control.shapeTo(),
    shapeCount: () => SH.length,
    autoplay: (on) => control.setAuto(on),
    destroy() {
      destroyed = true;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      for (const off of teardown) off();
      teardown.length = 0;
    },
  };
}
