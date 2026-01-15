const canvas = document.getElementById("globeCanvas");
const ctx = canvas.getContext("2d");

let w, h;
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = document.querySelector(".flex-hero").offsetHeight;
}
resize();
window.addEventListener("resize", resize);

/* ===============================
   GLOBE CONFIG
================================ */
const globe = {
  x: w * 0.78,   // 🔥 MORE RIGHT
  y: h * 0.52,
  r: Math.min(w, h) * 0.30,
  rotation: 0
};

/* ===============================
   COUNTRY NODES (200+ FEEL)
================================ */
const nodes = [];
for (let i = 0; i < 200; i++) {
  nodes.push({
    name: `Country ${i + 1}`,
    lat: Math.random() * Math.PI - Math.PI / 2,
    lon: Math.random() * Math.PI * 2,
    pulse: Math.random() * 100
  });
}

/* ===============================
   CONNECTION ARCS
================================ */
const arcs = [];
for (let i = 0; i < 35; i++) {
  const a = nodes[Math.floor(Math.random() * nodes.length)];
  const b = nodes[Math.floor(Math.random() * nodes.length)];
  arcs.push({ a, b, t: Math.random() });
}

/* ===============================
   MOUSE INTERACTION
================================ */
let mouseX = 0, mouseY = 0;
let hoveredNode = null;

window.addEventListener("mousemove", e => {
  mouseX = (e.clientX / w - 0.5) * 0.35;
  mouseY = (e.clientY / h - 0.5) * 0.25;
});

/* ===============================
   PROJECTION
================================ */
function project(lat, lon) {
  const rot = globe.rotation + mouseX;
  const x = globe.r * Math.cos(lat) * Math.cos(lon + rot);
  const y = globe.r * Math.sin(lat);
  const z = Math.cos(lat) * Math.sin(lon + rot);
  return { x, y, z };
}

/* ===============================
   DRAW LOOP
================================ */
function draw() {
  ctx.clearRect(0, 0, w, h);

  globe.rotation += 0.0016;

  /* Glow */
  const glow = ctx.createRadialGradient(
    globe.x, globe.y, globe.r * 0.25,
    globe.x, globe.y, globe.r
  );
  glow.addColorStop(0, "rgba(56,189,248,0.35)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(globe.x, globe.y, globe.r, 0, Math.PI * 2);
  ctx.fill();

  /* ===== CONNECTION ARCS ===== */
  arcs.forEach(a => {
    const p1 = project(a.a.lat, a.a.lon);
    const p2 = project(a.b.lat, a.b.lon);

    if (p1.z > 0 && p2.z > 0) {
      ctx.strokeStyle = "rgba(124,58,237,0.35)";
      ctx.lineWidth = 1.1;

      ctx.beginPath();
      ctx.moveTo(globe.x + p1.x, globe.y + p1.y);
      ctx.quadraticCurveTo(
        globe.x,
        globe.y - globe.r * 0.6,
        globe.x + p2.x,
        globe.y + p2.y
      );
      ctx.stroke();
    }
  });

  /* ===== COUNTRY NODES ===== */
  hoveredNode = null;

  nodes.forEach(n => {
    const p = project(n.lat, n.lon);
    if (p.z > 0) {
      const x = globe.x + p.x;
      const y = globe.y + p.y;

      n.pulse += 0.05;
      const r = 2.2 + Math.sin(n.pulse) * 0.8;

      ctx.beginPath();
      ctx.fillStyle = "rgba(124,58,237,0.85)";
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      /* Hover detection */
      const dx = x - mouseX * w - w / 2;
      const dy = y - mouseY * h - h / 2;
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
        hoveredNode = { x, y, name: n.name };
      }
    }
  });

  /* ===== TOOLTIP ===== */
  if (hoveredNode) {
    ctx.fillStyle = "rgba(15,23,42,0.95)";
    ctx.fillRect(hoveredNode.x + 10, hoveredNode.y - 18, 92, 22);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "12px Inter";
    ctx.fillText(hoveredNode.name, hoveredNode.x + 16, hoveredNode.y - 3);
  }

  requestAnimationFrame(draw);
}

draw();