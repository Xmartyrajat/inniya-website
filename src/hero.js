import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('hero-canvas');

const C = {
  green: '#0F3D2A',
  green2: '#1A5A3E',
  paper: '#FBF6EA',
  mustard: '#E2B04A',
  gold: '#C9952B',
  goldInk: '#8A6514',
  cream: '#F3ECDD',
};

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function fontsReady() {
  if (!document.fonts) return;
  const loads = [
    document.fonts.load('400 200px "Instrument Serif"'),
    document.fonts.load('italic 400 200px "Instrument Serif"'),
    document.fonts.load('800 50px "Manrope"'),
  ];
  await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 2500))]);
}

// ---------- Face textures ----------
const S = 1024;
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function spaced(ctx, text, x, y, spacing) {
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = spacing + 'px';
    ctx.fillText(text, x + spacing / 2, y);
    ctx.letterSpacing = '0px';
    return;
  }
  const chars = [...text];
  const total = chars.reduce((w, ch) => w + ctx.measureText(ch).width + spacing, -spacing);
  let cx = x - total / 2;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((ch) => { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + spacing; });
  ctx.textAlign = align;
}
function makeFace(bg, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  roundRect(ctx, 0, 0, S, S, 90);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.save();
  roundRect(ctx, 44, 44, S - 88, S - 88, 60);
  ctx.strokeStyle = 'rgba(201,149,43,0.55)';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  draw(ctx);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
function pill(ctx, text, cx, cy, fill, color, size = 50) {
  ctx.font = `800 ${size}px Manrope, sans-serif`;
  const w = ctx.measureText(text).width + size * 0.22 * text.length * 0.5 + 110;
  const h = size * 2;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.fillStyle = color;
  spaced(ctx, text, cx, cy + 3, size * 0.22);
}

function buildFaces(logo) {
  const front = makeFace(C.green, (ctx) => {
    if (logo) ctx.drawImage(logo, 152, 152, 720, 720);
    else {
      ctx.fillStyle = C.mustard;
      ctx.font = 'italic 400 520px "Instrument Serif", serif';
      ctx.fillText('N', S / 2, S / 2 + 20);
    }
  });
  const food = makeFace(C.green, (ctx) => {
    ctx.fillStyle = C.cream;
    ctx.font = '400 320px "Instrument Serif", serif';
    ctx.fillText('Food', S / 2, 440);
    pill(ctx, 'NOW LIVE', S / 2, 720, C.mustard, C.green, 52);
  });
  const soon = (word) => makeFace(C.paper, (ctx) => {
    ctx.fillStyle = C.green;
    ctx.font = `italic 400 ${word.length > 7 ? 230 : 270}px "Instrument Serif", serif`;
    ctx.fillText(word, S / 2, 450);
    ctx.fillStyle = C.goldInk;
    ctx.font = '800 64px Manrope, sans-serif';
    spaced(ctx, 'COMING SOON', S / 2, 720, 14);
  });
  const top = makeFace(C.mustard, (ctx) => {
    ctx.fillStyle = C.green;
    ctx.font = 'italic 400 230px "Instrument Serif", serif';
    ctx.fillText('Lifestyle', S / 2, 450);
    ctx.font = '800 64px Manrope, sans-serif';
    spaced(ctx, 'COMING SOON', S / 2, 720, 14);
  });
  const bottom = makeFace(C.green, (ctx) => {
    ctx.fillStyle = C.mustard;
    ctx.font = '800 64px Manrope, sans-serif';
    spaced(ctx, 'INNIYA', S / 2, S / 2, 26);
  });
  return { front, food, fashion: soon('Fashion'), home: soon('Home'), top, bottom };
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(15,61,42,0.55)');
  g.addColorStop(0.55, 'rgba(15,61,42,0.18)');
  g.addColorStop(1, 'rgba(15,61,42,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function leafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.22, 0.34, 0.78, 0.34, 1, 0);
  s.bezierCurveTo(0.78, -0.34, 0.22, -0.34, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24 });
  g.center();
  return g;
}

async function init() {
  if (!stage || !canvas || !supportsWebGL()) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [logo] = await Promise.all([loadImage('/assets/logo.png'), fontsReady()]);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.35, 9.2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xfff1d6, 1.6);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe2a0, 0.9);
  rim.position.set(-5, 2, -4);
  scene.add(rim);

  // ----- The box -----
  const root = new THREE.Group();
  scene.add(root);
  const box = new THREE.Group();
  root.add(box);

  const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xd4a440, metalness: 1, roughness: 0.26, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const core = new THREE.Mesh(new RoundedBoxGeometry(2, 2, 2, 8, 0.18), goldMat);
  box.add(core);

  const faces = buildFaces(logo);
  const plane = new THREE.PlaneGeometry(1.72, 1.72);
  const faceMat = (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.62, metalness: 0.05, transparent: true, alphaTest: 0.5 });
  const placements = [
    [faces.front, [0, 0, 1.004], [0, 0, 0]],
    [faces.food, [1.004, 0, 0], [0, Math.PI / 2, 0]],
    [faces.fashion, [0, 0, -1.004], [0, Math.PI, 0]],
    [faces.home, [-1.004, 0, 0], [0, -Math.PI / 2, 0]],
    [faces.top, [0, 1.004, 0], [-Math.PI / 2, 0, 0]],
    [faces.bottom, [0, -1.004, 0], [Math.PI / 2, 0, 0]],
  ];
  placements.forEach(([map, p, r]) => {
    const m = new THREE.Mesh(plane, faceMat(map));
    m.position.set(...p);
    m.rotation.set(...r);
    box.add(m);
  });

  // ----- Floating leaves + gold beads -----
  const leafGeo = leafGeometry();
  const leafMats = [
    new THREE.MeshPhysicalMaterial({ color: C.green2, roughness: 0.45, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
    new THREE.MeshPhysicalMaterial({ color: C.green, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
  ];
  const orbiters = [];
  const leafSpecs = [
    { r: 2.35, y: 0.9, a: 0.3, s: 0.8, sp: 0.32 },
    { r: 2.6, y: -0.7, a: 2.2, s: 0.65, sp: 0.26 },
    { r: 2.2, y: 1.45, a: 3.9, s: 0.55, sp: 0.38 },
    { r: 2.5, y: -1.3, a: 5.0, s: 0.7, sp: 0.3 },
  ];
  leafSpecs.forEach((sp, i) => {
    const m = new THREE.Mesh(leafGeo, leafMats[i % 2]);
    m.scale.setScalar(sp.s);
    root.add(m);
    orbiters.push({ mesh: m, ...sp, spin: 0.6 + i * 0.2, kind: 'leaf' });
  });
  const beadGeo = new THREE.SphereGeometry(1, 32, 32);
  [
    { r: 2.1, y: -0.2, a: 1.2, s: 0.09, sp: 0.42 },
    { r: 2.7, y: 0.35, a: 4.4, s: 0.12, sp: 0.22 },
    { r: 2.3, y: 1.1, a: 5.6, s: 0.07, sp: 0.5 },
    { r: 2.5, y: -1.0, a: 0.4, s: 0.1, sp: 0.35 },
  ].forEach((sp) => {
    const m = new THREE.Mesh(beadGeo, goldMat);
    m.scale.setScalar(sp.s);
    root.add(m);
    orbiters.push({ mesh: m, ...sp, spin: 0, kind: 'bead' });
  });

  // ----- Soft shadow -----
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 4.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.15;
  scene.add(shadow);

  // ----- Sizing -----
  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the scene framed on narrow stages
    const fit = w / h < 1 ? 10.8 + (1 - w / h) * 6 : 9.2;
    camera.position.z = fit;
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(stage);

  // ----- Interaction: hover tilt + drag spin -----
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let spinVel = 0;
  let spin = 0.6;
  let dragging = false;
  let lastX = 0;

  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tilt.tx = ny * 0.5;
    tilt.ty = nx * 0.6;
    if (dragging) {
      spinVel += (e.clientX - lastX) * 0.0022;
      lastX = e.clientX;
    }
  });
  stage.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; });
  window.addEventListener('pointerup', () => { dragging = false; });
  stage.addEventListener('pointerleave', () => { tilt.tx = 0; tilt.ty = 0; });

  // ----- Loop -----
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) tick(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  let last = performance.now();
  let elapsed = 0;
  let running = false;
  let firstFrame = true;

  function frame() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    const t = elapsed;

    if (!reduce) {
      spin += dt * 0.32 + spinVel;
      spinVel *= 0.92;
    }
    tilt.x += (tilt.tx - tilt.x) * 0.06;
    tilt.y += (tilt.ty - tilt.y) * 0.06;

    const bob = reduce ? 0 : Math.sin(t * 1.3) * 0.12;
    box.rotation.set(-0.22 + tilt.x * 0.5, spin, 0.04);
    box.position.y = 0.1 + bob;
    root.rotation.set(tilt.x * 0.4, tilt.y, 0);

    orbiters.forEach((o) => {
      const a = o.a + (reduce ? 0 : t * o.sp);
      o.mesh.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * 0.9 + o.a) * 0.15, Math.sin(a) * o.r * 0.7);
      if (o.kind === 'leaf') {
        o.mesh.rotation.set(Math.sin(t * 0.7 + o.a) * 0.6, -a + Math.PI / 2, Math.cos(t * o.spin) * 0.5);
      }
    });

    const sc = 1 - bob * 0.9;
    shadow.scale.set(sc, sc, sc);
    shadow.material.opacity = 0.85 - bob * 1.2;

    renderer.render(scene, camera);
    if (firstFrame) { firstFrame = false; stage.classList.add('is-ready'); }
  }

  function tick() {
    if (running) return;
    running = true;
    last = performance.now();
    const loop = () => {
      if (!visible || document.hidden) { running = false; return; }
      frame();
      if (reduce && !dragging) {
        // static render, but keep responding to tilt briefly
        if (Math.abs(tilt.tx - tilt.x) < 0.001 && Math.abs(tilt.ty - tilt.y) < 0.001) { running = false; return; }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
  if (reduce) stage.addEventListener('pointermove', tick);
  tick();
}

init().catch((err) => {
  console.warn('INNIYA hero: 3D unavailable, showing logo instead.', err);
});
