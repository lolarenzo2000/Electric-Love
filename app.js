const N = 10000,
  RAD = 70;
// P reúne los valores que se pueden cambiar desde el panel de controles.
const P = {
  fire: false,
  fireRise: 10,
  fireWave: 3,
  leadSize: 5,
  leaders: 80,
  trailLen: 40,
  fireSpread: 0.6,
  leadBri: 2.5,
  walls: true,
  box: 40,
  showBox: true,
  bounce: true,
  mOn: false,
  mTips: 250,
  mSpeed: 1.2,
  mTurn: 0.15,
  mSens: 0.8,
  mBranch: 0.5,
  mLife: 8,
  mFlow: 0.15,
  mBri: 1,
  mFollow: 0,
  count: 5000,
  speed: 0.9,
  size: 0.8,
  bri: 0.5,
  dens: 2.5,
  flow: true,
  flowS: 1,
  flowScale: 0.05,
  flowSpd: 0.5,
  flock: true,
  sep: 1.4,
  ali: 1,
  coh: 0.6,
  wander: true,
  wanderS: 0.4,
  magnet: true,
  magnetS: 1.5,
  heart: false,
  heartS: 1,
  orbit: false,
  orbitS: 0.8,
  bolts: false,
  boltRate: 1.2,
  boltInt: 0.6,
  trails: true,
  persist: 0.9,
  tails: false,
  cam: 0,
  lfoOn: false,
  lfoRate: 0.2,
  lfoDepth: 0.6,
  lfoTarget: "flowS",
  pal: 0,
};
// DEF permite restaurar los valores iniciales; cada escena solo sobrescribe algunos.
const DEF = JSON.parse(JSON.stringify(P));
// Una escena es un nombre y un conjunto parcial de parámetros.
const SCENES = [
  // Fuego
  [
    "1 Fuego suave",
    {
      fire: true,
      count: 9000,
      size: 1.1,
      leadSize: 7,
      leaders: 80,
      trailLen: 80,
      fireSpread: 0.3,
      flock: true,
      sep: 1.6,
      coh: 1.2,
      wander: true,
      wanderS: 0.5,
      flow: true,
      flowS: 0.5,
      speed: 0.45,
      persist: 0.85,
    },
  ],
  [
    "2 Fuego",
    {
      fire: true,
      count: 9000,
      size: 1.4,
      leaders: 72,
      leadSize: 9,
      leadBri: 2,
      trailLen: 70,
      fireSpread: 0.8,
      fireRise: 12,
      fireWave: 3,
      flock: false,
      flow: true,
      flowS: 0.9,
      flowScale: 0.03,
      wander: true,
      wanderS: 0.9,
      speed: 0.5,
      magnet: true,
      coh: 0,
      persist: 0.85,
    },
  ],
  // Descarga y corazón
  [
    "3 Descarga",
    {
      bolts: false,
      boltRate: 2.5,
      heart: true,
      heartS: 0.8,
      lfoOn: true,
      lfoTarget: "heartS",
      lfoRate: 0.3,
      lfoDepth: 1,
      flow: true,
      flowS: 1,
      orbit: true,
      orbitS: 0.4,
    },
  ],
  [
    "4 Corazón",
    {
      heart: true,
      heartS: 1.4,
      flow: false,
      flock: true,
      sep: 0.6,
      coh: 0.3,
      speed: 1,
      lfoOn: true,
      lfoTarget: "heartS",
      lfoRate: 0.15,
      lfoDepth: 0.7,
    },
  ],
  // Rayo y sueño
  [
    "5 Rayo",
    {
      bolts: false,
      boltRate: 1.8,
      flow: true,
      flowS: 1.6,
      flowScale: 0.08,
      coh: 0.2,
      speed: 1.2,
      persist: 0.88,
    },
  ],
  [
    "6 Sueño",
    {
      flow: true,
      flowS: 1.2,
      flowScale: 0.03,
      flowSpd: 0.2,
      speed: 0.5,
      persist: 0.96,
      wanderS: 0.2,
      coh: 0.3,
      tails: false,
    },
  ],
  // Escenas independientes
  [
    "7 Imán",
    {
      magnet: true,
      magnetS: 2.5,
      orbit: true,
      orbitS: 1.2,
      coh: 1.5,
      flow: false,
      speed: 1.1,
    },
  ],
  [
    "8 Micelio",
    { mOn: true, mFollow: 1, flowS: 0.5, coh: 0.3, walls: true, box: 42 },
  ],
];
// Cada control declara su tipo, parámetro asociado y, si aplica, sus límites.
const UI = [
  [
    "Fuego · líderes y estelas",
    [
      ["t", "fire", "Activar fuego"],
      ["s", "fireRise", "Ascenso llama", 0, 30, 0.5],
      ["s", "fireWave", "Ondulación", 0, 8, 0.1],
      ["s", "leaders", "Líderes", 1, 800, 1],
      ["s", "trailLen", "Largo estela", 4, 120, 1],
      ["s", "fireSpread", "Dispersión fuego", 0, 3, 0.05],
      ["s", "leadBri", "Brillo líderes", 0.5, 4, 0.05],
      ["s", "leadSize", "Tamaño líderes", 1, 14, 0.5],
    ],
  ],
  [
    "Corriente · flow field",
    [
      ["t", "flow", "Activar"],
      ["s", "flowS", "Fuerza", 0, 3, 0.01],
      ["s", "flowScale", "Escala", 0.01, 0.2, 0.005],
      ["s", "flowSpd", "Evolución", 0, 2, 0.01],
    ],
  ],
  [
    "Atracción · flocking",
    [
      ["t", "flock", "Activar"],
      ["s", "sep", "Separación", 0, 4, 0.05],
      ["s", "ali", "Alineación", 0, 3, 0.05],
      ["s", "coh", "Cohesión", 0, 3, 0.05],
    ],
  ],
  [
    "Inquietud · wander",
    [
      ["t", "wander", "Activar"],
      ["s", "wanderS", "Cantidad", 0, 2, 0.01],
    ],
  ],
  [
    "Imán · seek / flee",
    [
      ["t", "magnet", "Activar"],
      ["s", "magnetS", "Fuerza", 0, 5, 0.05],
    ],
  ],
  [
    "Corazón · seek forma",
    [
      ["t", "heart", "Activar"],
      ["s", "heartS", "Fuerza", 0, 3, 0.01],
    ],
  ],
  [
    "Giro · órbita",
    [
      ["t", "orbit", "Activar"],
      ["s", "orbitS", "Fuerza", 0, 3, 0.01],
    ],
  ],
  [
    "Rayo · descarga",
    [
      ["b", "fire", "⚡ Disparar rayo (tecla B)"],
      ["t", "bolts", "Modo automático"],
      ["s", "boltRate", "Frecuencia auto", 0.1, 6, 0.1],
      ["s", "boltInt", "Intensidad", 0, 1, 0.01],
    ],
  ],
  [
    "Espacio · corazón",
    [
      ["t", "walls", "Espacio en forma de corazón"],
      ["s", "box", "Tamaño", 20, 60, 1],
      ["t", "bounce", "Rebote (apagado = loop)"],
      ["t", "showBox", "Mostrar contorno"],
    ],
  ],
  [
    "Micelio · red eléctrica",
    [
      ["t", "mOn", "Activar crecimiento"],
      ["b", "sow", "🌱 Sembrar en el cursor (M)"],
      ["b", "wave", "⚡ Descarga por la red (N)"],
      ["b", "clear", "Limpiar red"],
      ["s", "mTips", "Puntas", 20, 900, 10],
      ["s", "mSpeed", "Velocidad", 0.3, 4, 0.05],
      ["s", "mTurn", "Caos / curvatura", 0, 0.6, 0.01],
      ["s", "mSens", "Atracción a red", -3, 3, 0.05],
      ["s", "mBranch", "Ramificación", 0, 3, 0.05],
      ["s", "mFlow", "Seguir flujo", 0, 1, 0.01],
      ["s", "mLife", "Vida de hilos (s)", 1, 30, 0.5],
      ["s", "mBri", "Brillo hilos", 0.1, 3, 0.05],
      ["s", "mFollow", "Partículas siguen puntas", 0, 2, 0.05],
    ],
  ],
  [
    "Global",
    [
      ["s", "count", "Partículas", 500, N, 250],
      ["s", "speed", "Velocidad", 0.1, 3, 0.01],
      ["s", "size", "Tamaño", 0.2, 3, 0.05],
      ["s", "bri", "Brillo base", 0.05, 1.5, 0.01],
      ["s", "dens", "Brillo por densidad", 0, 8, 0.1],
      ["s", "cam", "Cámara orbita", -1, 1, 0.01],
    ],
  ],
  [
    "Modulación · LFO",
    [
      ["t", "lfoOn", "Activar"],
      ["s", "lfoRate", "Ritmo", 0.02, 2, 0.01],
      ["s", "lfoDepth", "Profundidad", 0, 1, 0.01],
      [
        "sel",
        "lfoTarget",
        "Destino",
        ["flowS", "heartS", "magnetS", "orbitS", "boltRate", "coh", "speed"],
      ],
    ],
  ],
];
// Cada paleta define los tres colores que se interpolan para las partículas.
const PALS = [
  ["Neón", ["#ff2d95", "#00e5ff", "#ffd400"]],
  ["Atardecer", ["#ff5e3a", "#ff2a6d", "#ffb347"]],
  ["Eléctrico", ["#2f6bff", "#8fe3ff", "#ffffff"]],
  ["Oro y violeta", ["#ffcc33", "#b36bff", "#ff6fb5"]],
];
// ---------- Panel de controles
// Se genera el panel desde UI para mantener juntos los controles y sus parámetros.
const ui = document.getElementById("ui"),
  ctl = {};
document.getElementById("tg").onclick = () => ui.classList.toggle("h");
let html =
  '<h1>Electric Love</h1><div class="sub">Máquina de patrones · atajos: 1-8 escenas, C/Shift+C colores, Espacio pulso, B rayo, M sembrar, N descarga, H ocultar</div><h2>Escenas</h2><div class="g" id="sc"></div><div class="g" style="margin-top:4px"><button id="pulse">⚡ Pulso</button><button id="rst">Reiniciar</button></div><h2>Color</h2><div class="g" id="pals">' +
  PALS.map(
    (p, i) =>
      `<button class="pb" data-p="${i}"><span class="sw">${p[1].map((c) => `<i style="background:${c}"></i>`).join("")}</span>${p[0]}</button>`,
  ).join("") +
  "</div>";
UI.forEach(([t, items]) => {
  html += `<h2>${t}</h2>`;
  items.forEach((it) => {
    const [k, key, l, a, b, c] = it;
    if (k == "t")
      html += `<label class="t"><input type="checkbox" data-k="${key}">${l}</label>`;
    else if (k == "s")
      html += `<div class="r"><span>${l}</span><input type="range" data-k="${key}" min="${a}" max="${b}" step="${c}"></div>`;
    else if (k == "b")
      html += `<button class="ab" data-a="${key}" style="width:100%;margin:4px 0">${l}</button>`;
    else
      html += `<div class="r"><span>${l}</span><select data-k="${key}">${a.map((o) => `<option>${o}</option>`).join("")}</select></div>`;
  });
});
html +=
  '<h2>Música</h2><div class="music"><audio id="music" src="assets/music.mp3" controls loop preload="metadata">Tu navegador no admite audio HTML.</audio><label class="music-picker">Elegir archivo de audio<input id="musicFile" type="file" accept="audio/*"></label></div>';
html +=
  '<div class="hint">Clic = atrae · Shift+clic = repele · Rueda = zoom · M siembra micelio · C/Shift+C cambia color</div>';
ui.innerHTML = html;
const musicPlayer = document.getElementById("music");
let previewMusicUrl;
document.getElementById("musicFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (previewMusicUrl) URL.revokeObjectURL(previewMusicUrl);
  previewMusicUrl = URL.createObjectURL(file);
  musicPlayer.src = previewMusicUrl;
  musicPlayer.load();
});
const sc = document.getElementById("sc");
SCENES.forEach((s, i) => {
  const b = document.createElement("button");
  b.textContent = s[0];
  b.onclick = () => scene(i);
  sc.appendChild(b);
});
ui.querySelectorAll(".ab").forEach(
  (b) => (b.onclick = () => ACT[b.dataset.a]()),
);
ui.querySelectorAll("[data-k]").forEach((el) => {
  const k = el.dataset.k;
  ctl[k] = el;
  el.oninput = () => {
    P[k] =
      el.type == "checkbox"
        ? el.checked
        : el.type == "range"
          ? +el.value
          : el.value;
    if (k == "count") geo.setDrawRange(0, P.count);
  };
});
// Sincroniza los controles visibles con P después de cambiar de escena o reiniciar.
function sync() {
  for (const k in ctl) {
    const e = ctl[k];
    if (e.type == "checkbox") e.checked = P[k];
    else e.value = P[k];
  }
  document
    .querySelectorAll(".pb")
    .forEach((b) => b.classList.toggle("on", +b.dataset.p == P.pal));
  geo.setDrawRange(0, P.count);
  palette();
}
function scene(i) {
  const p = P.pal;
  Object.assign(P, JSON.parse(JSON.stringify(DEF)), SCENES[i][1]);
  P.pal = p;
  sync();
}
document.getElementById("rst").onclick = () => {
  const p = P.pal;
  Object.assign(P, JSON.parse(JSON.stringify(DEF)));
  P.pal = p;
  sync();
};
document.querySelectorAll(".pb").forEach(
  (b) =>
    (b.onclick = () => {
      P.pal = +b.dataset.p;
      sync();
    }),
);
document.getElementById("pulse").onclick = pulse;
addEventListener("keydown", (e) => {
  if (e.key == "h" || e.key == "H") ui.classList.toggle("h");
  else if (e.code == "Space") {
    e.preventDefault();
    pulse();
  } else if (e.key.toLowerCase() == "c") {
    P.pal = (P.pal + (e.shiftKey ? -1 : 1) + PALS.length) % PALS.length;
    sync();
  } else if (e.key == "b" || e.key == "B") ACT.fire();
  else if (e.key == "m" || e.key == "M") ACT.sow();
  else if (e.key == "n" || e.key == "N") ACT.wave();
  else if (/^[1-8]$/.test(e.key)) scene(+e.key - 1);
});
// ---------- Escena y renderizado de Three.js
// La textura intermedia conserva los fotogramas anteriores para crear estelas.
const ren = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true,
});
ren.setPixelRatio(Math.min(devicePixelRatio, 2));
ren.autoClear = false;
document.body.appendChild(ren.domElement);
const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 500),
  scn = new THREE.Scene();
const fadeS = new THREE.Scene(),
  fadeC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const fadeM = new THREE.MeshBasicMaterial({
  color: 0x05020d,
  transparent: true,
  opacity: 0.1,
  depthTest: false,
});
fadeS.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeM));
const bscn = new THREE.Scene();
let camD = 95,
  camA = 0;
const rt = new THREE.WebGLRenderTarget(2, 2),
  quadS = new THREE.Scene();
quadS.add(
  new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ map: rt.texture, depthTest: false }),
  ),
);
function resize() {
  ren.setSize(innerWidth, innerHeight);
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
  ren.setClearColor(0x05020d, 1);
  const pr = ren.getPixelRatio();
  rt.setSize(innerWidth * pr, innerHeight * pr);
  ren.setRenderTarget(rt);
  ren.clear();
  ren.setRenderTarget(null);
  ren.clear();
}
addEventListener("resize", resize);
addEventListener(
  "wheel",
  (e) => {
    camD = Math.max(30, Math.min(220, camD + e.deltaY * 0.08));
  },
  { passive: true },
);
const cv = document.createElement("canvas");
cv.width = cv.height = 64;
{
  const g = cv.getContext("2d"),
    gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "#fff");
  gr.addColorStop(0.3, "rgba(255,255,255,.6)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
}
// Los arreglos tipados guardan posición, velocidad y color sin crear objetos por partícula.
const pos = new Float32Array(N * 3),
  vel = new Float32Array(N * 3),
  col = new Float32Array(N * 3),
  base = new Float32Array(N * 3),
  flash = new Float32Array(N),
  hh = new Float32Array(N),
  ph = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const r = 40 * Math.cbrt(Math.random()),
    a = Math.random() * 6.283,
    b = Math.acos(2 * Math.random() - 1);
  pos.set(
    [
      r * Math.sin(b) * Math.cos(a),
      r * Math.cos(b),
      r * Math.sin(b) * Math.sin(a),
    ],
    i * 3,
  );
  vel.set(
    [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
    i * 3,
  );
  hh[i] = Math.random();
  ph[i] = Math.random() * 100;
}
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
const pm = new THREE.PointsMaterial({
  size: 1.8,
  map: new THREE.CanvasTexture(cv),
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
scn.add(new THREE.Points(geo, pm));
const geoL = new THREE.BufferGeometry();
geoL.setAttribute("position", geo.attributes.position);
geoL.setAttribute("color", geo.attributes.color);
const pmL = pm.clone();
pmL.map = pm.map;
scn.add(new THREE.Points(geoL, pmL));
const tp = new Float32Array(N * 6),
  tc = new Float32Array(N * 6),
  tg = new THREE.BufferGeometry();
tg.setAttribute("position", new THREE.BufferAttribute(tp, 3));
tg.setAttribute("color", new THREE.BufferAttribute(tc, 3));
const tl = new THREE.LineSegments(
  tg,
  new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
tl.frustumCulled = false;
scn.add(tl);
let pcols = [];
// Reparte cada partícula entre los colores de la paleta elegida.
function palette() {
  const c = PALS[P.pal][1].map((h) => new THREE.Color(h));
  pcols = c;
  for (let i = 0; i < N; i++) {
    const f = hh[i] * 2.999,
      j = Math.floor(f),
      m = new THREE.Color().copy(c[j]).lerp(c[(j + 1) % 3], f - j);
    base.set([m.r, m.g, m.b], i * 3);
  }
}
// ---------- Rayos y pulso
// Se reutilizan cuatro geometrías de rayo para evitar crear objetos cada vez que cae uno.
const bolts = [];
for (let i = 0; i < 4; i++) {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(33 * 3), 3),
  );
  const l = new THREE.Line(
    g,
    new THREE.LineBasicMaterial({
      color: 0xcfe9ff,
      transparent: true,
      blending: THREE.AdditiveBlending,
    }),
  );
  l.visible = false;
  l.frustumCulled = false;
  bscn.add(l);
  bolts.push({ l, life: 0 });
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function spawnBolt() {
  const b = bolts.find((b) => b.life <= 0);
  if (!b) return;
  const a = V((Math.random() - 0.5) * 60, 60, (Math.random() - 0.5) * 60),
    e = V(
      (Math.random() - 0.5) * 70,
      -45 + Math.random() * 30,
      (Math.random() - 0.5) * 70,
    );
  let pts = [a, e],
    off = 22;
  for (let k = 0; k < 5; k++) {
    const n = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const m = pts[i]
        .clone()
        .add(pts[i + 1])
        .multiplyScalar(0.5);
      m.add(
        V(
          (Math.random() - 0.5) * off,
          (Math.random() - 0.5) * off * 0.3,
          (Math.random() - 0.5) * off,
        ),
      );
      n.push(pts[i], m);
    }
    n.push(pts[pts.length - 1]);
    pts = n;
    off *= 0.55;
  }
  const arr = b.l.geometry.attributes.position.array;
  pts.forEach((p, i) => p.toArray(arr, i * 3));
  b.l.geometry.attributes.position.needsUpdate = true;
  b.life = 0.25;
  b.l.visible = true;
  for (let i = 0; i < P.count; i++) {
    const dx = pos[i * 3] - e.x,
      dy = pos[i * 3 + 1] - e.y,
      dz = pos[i * 3 + 2] - e.z,
      d = Math.hypot(dx, dy, dz);
    if (d < 26) {
      const k = 2.5 / (d + 1);
      vel[i * 3] += dx * k;
      vel[i * 3 + 1] += dy * k;
      vel[i * 3 + 2] += dz * k;
      flash[i] = 1;
    }
  }
}
function pulse() {
  for (let i = 0; i < P.count; i++) {
    const x = pos[i * 3],
      y = pos[i * 3 + 1],
      z = pos[i * 3 + 2],
      d = Math.hypot(x, y, z) + 0.01;
    vel[i * 3] += (x / d) * 3;
    vel[i * 3 + 1] += (y / d) * 3;
    vel[i * 3 + 2] += (z / d) * 3;
    flash[i] = 0.9;
  }
}
// ---------- Interacción con el cursor
// El rayo de cámara proyecta la posición 2D del cursor sobre un plano 3D.
const mouse = new THREE.Vector2(),
  ray = new THREE.Raycaster(),
  mp = V(0, 0, 0);
let down = 0;
ren.domElement.addEventListener("pointerdown", (e) => {
  down = e.shiftKey ? -1 : 1;
});
addEventListener("pointerup", () => (down = 0));
addEventListener("pointermove", (e) => {
  mouse.set(
    (e.clientX / innerWidth) * 2 - 1,
    -(e.clientY / innerHeight) * 2 + 1,
  );
});
const pl = new THREE.Plane(),
  dir = V(0, 0, 0);
// ---------- Micelio
// Las puntas avanzan por el espacio y los segmentos dibujados forman la red.
const SEG = 50000,
  MAXT = 900,
  G = 32,
  gridD = new Float32Array(G * G * G);
const sp = new Float32Array(SEG * 6),
  sc2 = new Float32Array(SEG * 6),
  sb = new Float32Array(SEG * 2).fill(-1e4);
const mg = new THREE.BufferGeometry();
mg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
mg.setAttribute("aCol", new THREE.BufferAttribute(sc2, 3));
mg.setAttribute("aBirth", new THREE.BufferAttribute(sb, 1));
const mu = {
  uTime: { value: 0 },
  uLife: { value: 8 },
  uWave: { value: -1 },
  uBri: { value: 1 },
  uCenter: { value: new THREE.Vector3() },
};
const mm = new THREE.ShaderMaterial({
  uniforms: mu,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  vertexShader: `attribute vec3 aCol;attribute float aBirth;uniform float uTime,uLife,uWave,uBri;uniform vec3 uCenter;varying vec3 vC;varying float vA;
void main(){float age=uTime-aBirth;float f=clamp(1.-age/uLife,0.,1.);f*=f;float h=exp(-age*2.5);float x=(distance(position,uCenter)-uWave)*.12;float w=uWave<0.?0.:exp(-x*x);
vC=mix(aCol,vec3(1.),clamp(h*.8+w,0.,1.));vA=(f*.55+h*.6+w*1.2)*uBri;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `varying vec3 vC;varying float vA;void main(){gl_FragColor=vec4(vC,vA);}`,
});
const ml = new THREE.LineSegments(mg, mm);
ml.frustumCulled = false;
scn.add(ml);
const tX = new Float32Array(MAXT * 3),
  tD = new Float32Array(MAXT * 3),
  tL = new Float32Array(MAXT * 3),
  tA = new Uint8Array(MAXT),
  tC = new Int32Array(MAXT),
  act = new Int32Array(MAXT);
let nAct = 0,
  segHead = 0,
  segN = 0,
  rov = 0,
  frame = 0;
// La función implícita permite comprobar si un punto está dentro del corazón 3D.
function hF(x, y, z, S) {
  const u = x / S,
    w = y / S,
    d = z / (S * 1.5),
    a = u * u + 2.25 * d * d + w * w - 1;
  return a * a * a - u * u * w * w * w - 0.1125 * d * d * w * w * w;
}
function addTip(x, y, z, dx, dy, dz) {
  for (let k = 0; k < MAXT; k++) {
    const i = (rov + k) % MAXT;
    if (!tA[i]) {
      rov = i + 1;
      tA[i] = 1;
      tC[i] = 0;
      tX.set([x, y, z], i * 3);
      tL.set([x, y, z], i * 3);
      const l = Math.hypot(dx, dy, dz) || 1;
      tD.set([dx / l, dy / l, dz / l], i * 3);
      return;
    }
  }
}
function rdir() {
  const z = Math.random() * 2 - 1,
    a = Math.random() * 6.283,
    r = Math.sqrt(1 - z * z);
  return [r * Math.cos(a), z, r * Math.sin(a)];
}
function sowAt(x, y, z, n) {
  for (let i = 0; i < n; i++) {
    const d = rdir();
    addTip(x, y, z, d[0], d[1], d[2]);
  }
}
// Muestrea la superficie de la misma forma para dibujar el contorno visible.
const shP = [];
for (let i = 0; i < 3500; i++) {
  const d = rdir();
  let lo = 0,
    hi = 2.5;
  for (let k = 0; k < 22; k++) {
    const m = (lo + hi) / 2;
    if (hF(d[0] * m, d[1] * m, d[2] * m, 1) > 0) hi = m;
    else lo = m;
  }
  shP.push(d[0] * lo, d[1] * lo, d[2] * lo);
}
const shG = new THREE.BufferGeometry();
shG.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(shP), 3),
);
const shell = new THREE.Points(
  shG,
  new THREE.PointsMaterial({
    size: 0.8,
    map: pm.map,
    color: 0x9a7cff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
scn.add(shell);
function gi(x, y, z, H) {
  const c = (H * 2) / G;
  let a = Math.floor((x + H) / c) % G,
    b = Math.floor((y + H) / c) % G,
    d = Math.floor((z + H) / c) % G;
  if (a < 0) a += G;
  if (b < 0) b += G;
  if (d < 0) d += G;
  return (a * G + b) * G + d;
}
function wrapv(v, H) {
  return v > H ? v - 2 * H : v < -H ? v + 2 * H : v;
}
function growMyc(dt, H, S) {
  // La densidad acumulada sirve para orientar las puntas hacia zonas ya recorridas.
  frame++;
  if (!(frame & 1)) for (let i = 0; i < gridD.length; i++) gridD[i] *= 0.99;
  let alive = 0;
  for (let i = 0; i < MAXT; i++) alive += tA[i];
  if (P.mOn) {
    if (!segN && !alive) {
      sowAt(0, 0, 0, 6);
      alive = 6;
    }
    let tr = 3;
    while (alive < P.mTips && tr-- > 0 && segN) {
      const k =
          (segHead -
            1 -
            Math.floor(Math.random() * Math.min(segN, 2500)) +
            SEG * 2) %
          SEG,
        d = rdir();
      addTip(sp[k * 6 + 3], sp[k * 6 + 4], sp[k * 6 + 5], d[0], d[1], d[2]);
      alive++;
    }
  }
  nAct = 0;
  let wrote = false;
  const sens = P.mSens,
    sd = ((H * 2) / G) * 2.5,
    stp = P.mSpeed * dt;
  for (let i = 0; i < MAXT; i++) {
    if (!tA[i]) continue;
    act[nAct++] = i;
    if (!P.mOn) continue;
    const i3 = i * 3;
    let x = tX[i3],
      y = tX[i3 + 1],
      z = tX[i3 + 2],
      dx = tD[i3],
      dy = tD[i3 + 1],
      dz = tD[i3 + 2];
    dx += (Math.random() - 0.5) * P.mTurn * 2;
    dy += (Math.random() - 0.5) * P.mTurn * 2;
    dz += (Math.random() - 0.5) * P.mTurn * 2;
    if (P.mFlow > 0) {
      const q = P.flowScale * 20;
      field(x * q, y * q, z * q, T * P.flowSpd * 3, fo);
      dx += fo[0] * P.mFlow * 0.3;
      dy += fo[1] * P.mFlow * 0.3;
      dz += fo[2] * P.mFlow * 0.3;
    }
    if (sens != 0) {
      let bv = sens > 0 ? -1 : 1e9,
        bx = dx,
        by = dy,
        bz = dz;
      for (let q = 0; q < 3; q++) {
        let cx = dx + (Math.random() - 0.5) * 1.4,
          cy = dy + (Math.random() - 0.5) * 1.4,
          cz = dz + (Math.random() - 0.5) * 1.4;
        const l = Math.hypot(cx, cy, cz) || 1;
        cx /= l;
        cy /= l;
        cz /= l;
        const v = gridD[gi(x + cx * sd, y + cy * sd, z + cz * sd, H)];
        if (sens > 0 ? v > bv : v < bv) {
          bv = v;
          bx = cx;
          by = cy;
          bz = cz;
        }
      }
      const w = Math.min(1, Math.abs(sens) * 0.25);
      dx += (bx - dx) * w;
      dy += (by - dy) * w;
      dz += (bz - dz) * w;
    }
    const l = Math.hypot(dx, dy, dz) || 1;
    dx /= l;
    dy /= l;
    dz /= l;
    x += dx * stp;
    y += dy * stp;
    z += dz * stp;
    let wr = false;
    if (S > 0) {
      if (hF(x, y, z, S) > 0) {
        tA[i] = 0;
        continue;
      }
    } else {
      const ox = x,
        oy = y,
        oz = z;
      x = wrapv(x, H);
      y = wrapv(y, H);
      z = wrapv(z, H);
      wr = x != ox || y != oy || z != oz;
    }
    gridD[gi(x, y, z, H)] += 1;
    if (wr) {
      tL[i3] = x;
      tL[i3 + 1] = y;
      tL[i3 + 2] = z;
    } else if (++tC[i] % 3 == 0) {
      const k = segHead,
        c = pcols[i % 3];
      sp[k * 6] = tL[i3];
      sp[k * 6 + 1] = tL[i3 + 1];
      sp[k * 6 + 2] = tL[i3 + 2];
      sp[k * 6 + 3] = x;
      sp[k * 6 + 4] = y;
      sp[k * 6 + 5] = z;
      for (let q = 0; q < 2; q++) {
        sc2[k * 6 + q * 3] = c.r;
        sc2[k * 6 + q * 3 + 1] = c.g;
        sc2[k * 6 + q * 3 + 2] = c.b;
        sb[k * 2 + q] = T;
      }
      segHead = (segHead + 1) % SEG;
      segN = Math.min(SEG, segN + 1);
      wrote = true;
      tL[i3] = x;
      tL[i3 + 1] = y;
      tL[i3 + 2] = z;
    }
    if (alive < P.mTips && Math.random() < P.mBranch * 0.01 * dt) {
      const d = rdir();
      addTip(x, y, z, dx + d[0] * 0.9, dy + d[1] * 0.9, dz + d[2] * 0.9);
      alive++;
    }
    if (Math.random() < 0.003 * dt) tA[i] = 0;
    tX[i3] = x;
    tX[i3 + 1] = y;
    tX[i3 + 2] = z;
    tD[i3] = dx;
    tD[i3 + 1] = dy;
    tD[i3 + 2] = dz;
  }
  if (wrote) {
    mg.attributes.position.needsUpdate =
      mg.attributes.aCol.needsUpdate =
      mg.attributes.aBirth.needsUpdate =
        true;
  }
  mu.uTime.value = T;
  mu.uLife.value = P.mLife;
  mu.uBri.value = P.mBri;
  if (mu.uWave.value >= 0) {
    mu.uWave.value += (100 * dt) / 60;
    if (mu.uWave.value > 260) mu.uWave.value = -1;
  }
}
const ACT = {
  fire: () => spawnBolt(),
  sow: () => {
    let x = mp.x,
      y = mp.y,
      z = mp.z;
    const S = P.walls ? P.box / 1.2 : 0;
    if (S > 0) {
      let k = 0;
      while (hF(x, y, z, S) > 0 && k++ < 30) {
        x *= 0.92;
        y *= 0.92;
        z *= 0.92;
      }
    }
    sowAt(x, y, z, 14);
    if (!P.mOn) {
      P.mOn = true;
      sync();
    }
  },
  wave: () => {
    mu.uCenter.value.copy(mp);
    mu.uWave.value = 0;
  },
  clear: () => {
    sb.fill(-1e4);
    segN = 0;
    gridD.fill(0);
    tA.fill(0);
    mg.attributes.aBirth.needsUpdate = true;
  },
};
// ---------- Cálculos auxiliares de la simulación
// La cuadrícula reduce las comparaciones de vecinos del flocking a celdas cercanas.
const CS = 14,
  GD = Math.ceil((2 * RAD) / CS) + 1,
  head = new Int32Array(GD * GD * GD),
  nxt = new Int32Array(N);
const ci = (v) => Math.max(0, Math.min(GD - 1, Math.floor((v + RAD) / CS)));
// Campo vectorial suave: devuelve una dirección cambiante según posición y tiempo.
function field(x, y, z, t, o) {
  o[0] = (Math.sin(y * 1.7 + t) + Math.cos(z * 1.3 - t * 0.8)) * 0.5;
  o[1] = (Math.sin(z * 1.5 + t * 0.9) + Math.cos(x * 1.1 + t * 0.6)) * 0.5;
  o[2] = (Math.sin(x * 1.4 - t * 0.7) + Math.cos(y * 1.2 + t)) * 0.5;
}
const fo = [0, 0, 0];
const FC = [0, 0, 0],
  PALETTE_SEGMENTS = PALS[0][1].length - 1;
// El color de las estelas se interpola entre los tonos de la paleta seleccionada.
function fireCol(u) {
  const position = Math.min(0.999, u) * PALETTE_SEGMENTS,
    index = Math.floor(position),
    blend = position - index,
    from = pcols[index],
    to = pcols[index + 1];
  FC[0] = from.r + (to.r - from.r) * blend;
  FC[1] = from.g + (to.g - from.g) * blend;
  FC[2] = from.b + (to.b - from.b) * blend;
}
const HL = 128,
  HM = 800,
  hist = new Float32Array(HL * HM * 3);
let hHead = 0,
  histLeaders = 0,
  fireWasActive = false;
let T = 0,
  bt = 0,
  last = performance.now();
// Aplica una oscilación periódica a un parámetro sin modificar su valor base.
function ev(k) {
  return P.lfoOn && P.lfoTarget == k
    ? P[k] * (1 + P.lfoDepth * Math.sin(T * 6.283 * P.lfoRate))
    : P[k];
}
function tick(now) {
  // dt limita los saltos si el navegador se pausa y mantiene el movimiento estable.
  requestAnimationFrame(tick);
  const dt = Math.min((now - last) / 1000, 0.05) * 60;
  last = now;
  T += dt / 60;
  const n = P.count,
    SP = P.fire,
    nL = SP ? Math.max(1, Math.min(P.leaders, n, HM)) : n,
    MS = ev("speed"),
    MF = 0.05 * MS + 0.01,
    MS2 = MS * MS;
  let ax, ay, az;
  const flowS = ev("flowS"),
    heartS = ev("heartS"),
    magS = ev("magnetS"),
    orbS = ev("orbitS"),
    coh = ev("coh");
  // Convierte el cursor a coordenadas del mundo antes de aplicar sus interacciones.
  ray.setFromCamera(mouse, cam);
  cam.getWorldDirection(dir);
  pl.setFromNormalAndCoplanarPoint(dir, V(0, 0, 0));
  ray.ray.intersectPlane(pl, mp) || 0;
  const HS = P.walls ? P.box / 1.2 : 0,
    BH = P.walls ? P.box * 1.15 : 60;
  growMyc(dt, BH, HS);
  const wv = mu.uWave.value,
    wc = mu.uCenter.value;
  shell.visible = P.walls && P.showBox;
  shell.scale.setScalar(HS || 1);
  // Al iniciar el fuego o cambiar el número de líderes, llena el historial
  // con sus posiciones actuales para que las estelas no partan del origen.
  if (SP && (!fireWasActive || histLeaders !== nL)) {
    hHead = 0;
    histLeaders = nL;
    for (let frame = 0; frame < HL; frame++) {
      for (let leader = 0; leader < nL; leader++) {
        const offset = (frame * HM + leader) * 3;
        hist[offset] = pos[leader * 3];
        hist[offset + 1] = pos[leader * 3 + 1];
        hist[offset + 2] = pos[leader * 3 + 2];
      }
    }
  }
  fireWasActive = SP;
  // Indexa las partículas por celda para buscar solo vecinos próximos.
  if (P.flock) {
    head.fill(-1);
    for (let i = 0; i < nL; i++) {
      const c =
        (ci(pos[i * 3]) * GD + ci(pos[i * 3 + 1])) * GD + ci(pos[i * 3 + 2]);
      nxt[i] = head[c];
      head[c] = i;
    }
  }
  if (SP) {
    hHead = (hHead + 1) % HL;
    for (let l = 0; l < nL; l++) {
      const o = (hHead * HM + l) * 3;
      hist[o] = pos[l * 3];
      hist[o + 1] = pos[l * 3 + 1];
      hist[o + 2] = pos[l * 3 + 2];
    }
  }
  const ca = 1,
    sa = 0,
    beat = 1 + 0.07 * Math.sin(T * 9);
  // steer limita la fuerza de giro; dirTo apunta a un destino y frena al acercarse.
  function steer(dx, dy, dz, w, vx, vy, vz) {
    let sx = dx - vx,
      sy = dy - vy,
      sz = dz - vz;
    const l = Math.hypot(sx, sy, sz);
    if (l > MF) {
      const k = MF / l;
      sx *= k;
      sy *= k;
      sz *= k;
    }
    ax += sx * w;
    ay += sy * w;
    az += sz * w;
  }
  function dirTo(tx, ty, tz, px, py, pz, sp, arrive) {
    const dx = tx - px,
      dy = ty - py,
      dz = tz - pz,
      d = Math.hypot(dx, dy, dz) + 1e-4;
    const s = d < arrive ? (sp * d) / arrive : sp;
    return [(dx / d) * s, (dy / d) * s, (dz / d) * s];
  }
  // Cada partícula combina las fuerzas activadas y luego actualiza su movimiento.
  for (let i = 0; i < n; i++) {
    const i3 = i * 3,
      px = pos[i3],
      py = pos[i3 + 1],
      pz = pos[i3 + 2],
      vx = vel[i3],
      vy = vel[i3 + 1],
      vz = vel[i3 + 2];
    ax = ay = az = 0;
    let dn = 0;
    if (SP && i >= nL) {
      const f = i - nL,
        l = f % nL,
        m = Math.max(1, Math.ceil((n - nL) / nL)),
        q = Math.floor(f / nL),
        u = q / m,
        lag = 1 + Math.floor(u * P.trailLen),
        o = (((((hHead - lag) % HL) + HL) % HL) * HM + l) * 3;
      const sway = Math.sin(T * 7 + ph[i] * 2 + u * 9) * u * P.fireWave,
        rise = u * P.fireRise,
        flicker = Math.sin(T * 18 + ph[i] * 8 + u * 5) * u * P.fireSpread,
        targetX = hist[o] + sway + flicker,
        targetY =
          hist[o + 1] +
          rise +
          Math.cos(T * 16 + ph[i] * 5 + u * 7) * u * P.fireSpread * 0.35,
        targetZ =
          hist[o + 2] +
          Math.cos(T * 6 + ph[i] * 3 + u * 8) * u * P.fireWave +
          Math.sin(T * 12 + ph[i] * 6 + u * 3) * u * P.fireSpread * 0.5,
        follow = 1 - Math.exp(-0.18 * dt);
      // La interpolación lleva cada partícula hasta la estela sin teletransportarla.
      pos[i3] += (targetX - pos[i3]) * follow;
      pos[i3 + 1] += (targetY - pos[i3 + 1]) * follow;
      pos[i3 + 2] += (targetZ - pos[i3 + 2]) * follow;
      vel[i3] = vel[l * 3];
      vel[i3 + 1] = vel[l * 3 + 1];
      vel[i3 + 2] = vel[l * 3 + 2];
      if (P.fire) {
        fireCol(u);
        const fa =
          Math.pow(1 - u, 1.2) * (0.6 + 0.8 * Math.random()) * P.bri * 2;
        col[i3] = FC[0] * fa;
        col[i3 + 1] = FC[1] * fa;
        col[i3 + 2] = FC[2] * fa;
      }
      continue;
    }
    // Los comportamientos aportan fuerzas: flujo, grupo, deriva, cursor y formas.
    if (P.flow) {
      const s = P.flowScale;
      field(px * s * 20, py * s * 20, pz * s * 20, T * P.flowSpd * 3, fo);
      steer(fo[0] * MS, fo[1] * MS, fo[2] * MS, flowS, vx, vy, vz);
    }
    if (P.flock) {
      let sx = 0,
        sy = 0,
        sz = 0,
        lx = 0,
        ly = 0,
        lz = 0,
        cx = 0,
        cy = 0,
        cz = 0,
        c = 0;
      const gx = ci(px),
        gy = ci(py),
        gz = ci(pz);
      outer: for (
        let x = Math.max(0, gx - 1);
        x <= Math.min(GD - 1, gx + 1);
        x++
      )
        for (let y = Math.max(0, gy - 1); y <= Math.min(GD - 1, gy + 1); y++)
          for (
            let z = Math.max(0, gz - 1);
            z <= Math.min(GD - 1, gz + 1);
            z++
          ) {
            for (let j = head[(x * GD + y) * GD + z]; j >= 0; j = nxt[j]) {
              if (j == i) continue;
              const dx = px - pos[j * 3],
                dy = py - pos[j * 3 + 1],
                dz = pz - pos[j * 3 + 2],
                d2 = dx * dx + dy * dy + dz * dz;
              if (d2 > 196) continue;
              if (d2 < 36) {
                const k = 1 / (d2 + 0.5);
                sx += dx * k;
                sy += dy * k;
                sz += dz * k;
              }
              lx += vel[j * 3];
              ly += vel[j * 3 + 1];
              lz += vel[j * 3 + 2];
              cx += pos[j * 3];
              cy += pos[j * 3 + 1];
              cz += pos[j * 3 + 2];
              if (++c >= 14) break outer;
            }
          }
      if (c) {
        dn = c / 14;
        const d = dirTo(cx / c, cy / c, cz / c, px, py, pz, MS, 1);
        steer(d[0], d[1], d[2], coh * 0.6, vx, vy, vz);
        const m = Math.hypot(lx, ly, lz) + 1e-4;
        steer((lx / m) * MS, (ly / m) * MS, (lz / m) * MS, P.ali, vx, vy, vz);
      }
      const sm = Math.hypot(sx, sy, sz);
      if (sm > 1e-5)
        steer(
          (sx / sm) * MS,
          (sy / sm) * MS,
          (sz / sm) * MS,
          P.sep,
          vx,
          vy,
          vz,
        );
    }
    if (P.wander) {
      const t = T * 2 + ph[i];
      steer(
        Math.sin(t * 1.3 + ph[i]) * MS,
        Math.cos(t * 0.9) * MS,
        Math.sin(t * 1.7 + 1) * MS,
        P.wanderS,
        vx,
        vy,
        vz,
      );
    }
    if (P.magnet && down) {
      const d = dirTo(mp.x, mp.y, mp.z, px, py, pz, MS * 1.8, 30);
      steer(d[0] * down, d[1] * down, d[2] * down, magS, vx, vy, vz);
    }
    if (P.heart) {
      const t = ph[i] * 2.4,
        hs = 2.1 * beat,
        r = 0.45 + 0.55 * hh[i],
        hx = 16 * Math.pow(Math.sin(t), 3) * hs * r,
        hy =
          (13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t) +
            3) *
          hs *
          r,
        hz = (hh[i] - 0.5) * 18;
      const d = dirTo(
        hx * ca + hz * sa,
        hy,
        -hx * sa + hz * ca,
        px,
        py,
        pz,
        MS * 1.6,
        18,
      );
      steer(d[0], d[1], d[2], heartS, vx, vy, vz);
    }
    if (P.orbit) {
      const r = Math.hypot(px, pz) + 1e-3,
        tx = (-pz / r) * MS,
        tz = (px / r) * MS,
        rad = (36 - r) * 0.05;
      steer(
        tx + (px / r) * rad,
        Math.sin(r * 0.1 + T) * 0.3 - py * 0.03,
        tz + (pz / r) * rad,
        orbS,
        vx,
        vy,
        vz,
      );
    }
    if (P.mFollow > 0 && nAct) {
      const j = act[i % nAct] * 3,
        d = dirTo(tX[j], tX[j + 1], tX[j + 2], px, py, pz, MS * 1.6, 10);
      steer(d[0], d[1], d[2], P.mFollow, vx, vy, vz);
    }
    const r = P.walls ? 0 : Math.hypot(px, py, pz);
    if (r > RAD * 0.8) {
      const d = dirTo(0, 0, 0, px, py, pz, MS, 1);
      steer(d[0], d[1], d[2], ((r - RAD * 0.8) / RAD) * 6, vx, vy, vz);
    }
    let nx = vx + ax * dt,
      ny = vy + ay * dt,
      nz = vz + az * dt;
    const s2 = nx * nx + ny * ny + nz * nz,
      mx = MS2 * 5;
    if (s2 > mx) {
      const k = Math.sqrt(mx / s2);
      nx *= k;
      ny *= k;
      nz *= k;
    }
    vel[i3] = nx * 0.995;
    vel[i3 + 1] = ny * 0.995;
    vel[i3 + 2] = nz * 0.995;
    pos[i3] = px + nx * dt;
    pos[i3 + 1] = py + ny * dt;
    pos[i3 + 2] = pz + nz * dt;
    // La superficie del corazón funciona como límite: rebote o retorno al interior.
    if (HS > 0) {
      let x = pos[i3],
        y = pos[i3 + 1],
        z = pos[i3 + 2];
      if (hF(x, y, z, HS) > 0) {
        if (P.bounce) {
          const e = 0.4;
          let nx_ = hF(x + e, y, z, HS) - hF(x - e, y, z, HS),
            ny_ = hF(x, y + e, z, HS) - hF(x, y - e, z, HS),
            nz_ = hF(x, y, z + e, HS) - hF(x, y, z - e, HS);
          const l = Math.hypot(nx_, ny_, nz_) + 1e-9;
          nx_ /= l;
          ny_ /= l;
          nz_ /= l;
          const vn = vel[i3] * nx_ + vel[i3 + 1] * ny_ + vel[i3 + 2] * nz_;
          if (vn > 0) {
            vel[i3] = (vel[i3] - 2 * vn * nx_) * 0.9;
            vel[i3 + 1] = (vel[i3 + 1] - 2 * vn * ny_) * 0.9;
            vel[i3 + 2] = (vel[i3 + 2] - 2 * vn * nz_) * 0.9;
          }
        } else {
          x = -x;
          y = -y;
          z = -z;
        }
        let k = 0;
        while (hF(x, y, z, HS) > 0 && k++ < 30) {
          x *= 0.94;
          y *= 0.94;
          z *= 0.94;
        }
        pos[i3] = x;
        pos[i3 + 1] = y;
        pos[i3 + 2] = z;
      }
    }
    if (
      wv >= 0 &&
      Math.abs(
        Math.hypot(pos[i3] - wc.x, pos[i3 + 1] - wc.y, pos[i3 + 2] - wc.z) - wv,
      ) < 5
    )
      flash[i] = Math.max(flash[i], 0.9);
    const f = Math.min(1, flash[i]);
    flash[i] *= 0.94;
    for (let k = 0; k < 3; k++) {
      const b = base[i3 + k],
        c = b + (1 - b) * f;
      col[i3 + k] = c * P.bri * (1 + dn * P.dens) * (SP ? P.leadBri : 1);
      if (P.tails) {
        tp[i * 6 + k] = pos[i3 + k];
        tp[i * 6 + 3 + k] = pos[i3 + k] - vel[i3 + k] * 4;
        tc[i * 6 + k] = c;
        tc[i * 6 + 3 + k] = 0;
      }
    }
  }
  // Actualiza la duración y el parpadeo de los rayos activos.
  if (P.bolts) {
    bt -= dt / 60;
    if (bt <= 0) {
      spawnBolt();
      bt = (1 / ev("boltRate")) * (0.5 + Math.random());
    }
  }
  bolts.forEach((b) => {
    if (b.life > 0) {
      b.life -= dt / 60;
      b.l.material.opacity =
        Math.max(0, b.life / 0.25) *
        (Math.random() > 0.3 ? 1 : 0.3) *
        P.boltInt;
      if (b.life <= 0) b.l.visible = false;
    }
  });
  // Three.js solo sube al GPU los buffers marcados como modificados.
  geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
  tl.visible = P.tails;
  if (P.tails) {
    tg.setDrawRange(0, n * 2);
    tg.attributes.position.needsUpdate = tg.attributes.color.needsUpdate = true;
  }
  pm.size = P.size;
  pmL.size = P.size * P.leadSize;
  geo.setDrawRange(SP ? nL : 0, SP ? n - nL : n);
  geoL.setDrawRange(0, SP ? nL : 0);
  camA += P.cam * 0.005 * dt;
  cam.position.set(
    Math.sin(camA) * camD,
    18 * Math.sin(camA * 0.6),
    Math.cos(camA) * camD,
  );
  cam.lookAt(0, 0, 0);
  fadeM.opacity = 1;
  // Dibuja la escena sobre el fotograma anterior y presenta el resultado en pantalla.
  ren.setRenderTarget(rt);
  ren.render(fadeS, fadeC);
  ren.render(scn, cam);
  ren.setRenderTarget(null);
  ren.clear();
  ren.render(quadS, fadeC);
  ren.render(bscn, cam);
}
resize();
sync();
requestAnimationFrame(tick);
