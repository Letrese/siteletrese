/**
 * LETRESE - Banner interativo "Mapa vivo"
 * Cada linha de pesquisa é um núcleo; membros, projetos e notícias orbitam ao redor.
 * - Tamanho do ponto: quantidade de caracteres do conteúdo
 * - Opacidade: ano do conteúdo (mais antigo = mais transparente)
 * - Pulso: projetos em andamento e notícias recentes
 * - Linhas finas: conteúdos que compartilham tags ou membros
 * - Fundo: varia conforme a hora do dia
 * - Mouse: arrasta pontos/núcleos (o conjunto segue pela física), mostra o nome e abre a página ao clicar
 */
(function () {
  const banner = document.getElementById('data-banner');
  const canvas = document.getElementById('banner-canvas');
  const dataEl = document.getElementById('banner-data');
  if (!banner || !canvas || !dataEl) return;

  let raw;
  try { raw = JSON.parse(dataEl.textContent); } catch (e) { return; }

  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('banner-tooltip');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PALETTE = ['#7dd3fc', '#f9a8d4', '#fcd34d', '#86efac', '#c4b5fd', '#fdba74'];
  const FREE_COLOR = '#e2e8f0';
  const TYPE_LABEL = { member: 'Membro', project: 'Projeto', post: 'Notícia' };

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const keywords = s => norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 4);

  // ---------- Preparação dos dados ----------
  const lines = (raw.lines || []).map((l, i) => ({
    name: l.name, coordinator: l.coordinator || '', color: PALETTE[i % PALETTE.length],
    words: keywords(l.name), x: 0, y: 0, vx: 0, vy: 0, r: 14, count: 0
  }));
  const items = (raw.items || []).filter(Boolean).map(it => ({
    ...it, tags: (it.tags || []).map(norm), team: it.team || [], chars: Number(it.chars) || 0
  }));

  function scoreLine(text) {
    const t = norm(text);
    let best = null, bestScore = 0;
    lines.forEach(l => {
      const s = l.words.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
      if (s > bestScore) { bestScore = s; best = l; }
    });
    return best;
  }

  const projects = items.filter(i => i.type === 'project');
  // 1ª passada: projetos (os membros dependem deles)
  projects.forEach(it => {
    it.line = lines.find(l => norm(l.name) === norm(it.line)) || scoreLine(it.title + ' ' + it.summary);
  });
  // 2ª passada: membros e notícias
  items.forEach(it => {
    if (it.type === 'member') {
      const votes = new Map();
      lines.forEach(l => { if (norm(l.coordinator) && norm(l.coordinator) === norm(it.title)) votes.set(l, 3); });
      projects.forEach(p => {
        if (p.line && p.team.some(m => norm(m).includes(norm(it.name)))) votes.set(p.line, (votes.get(p.line) || 0) + 1);
      });
      let best = null, max = 0;
      votes.forEach((v, l) => { if (v > max) { max = v; best = l; } });
      it.line = best || scoreLine(it.tags.join(' '));
    } else if (it.type === 'post') {
      it.line = scoreLine(it.title + ' ' + it.tags.join(' ') + ' ' + it.summary);
    }
    if (it.line) it.line.count++;
  });

  // Ano / recência
  const yearOf = it => it.type === 'post' ? parseInt(String(it.date).slice(0, 4), 10) : parseInt(it.year, 10);
  const years = items.map(yearOf).filter(Number.isFinite);
  const minY = Math.min(...years), maxY = Math.max(...years);
  const postTimes = items.filter(i => i.type === 'post').map(i => Date.parse(i.date)).filter(Number.isFinite);
  const newestPost = postTimes.length ? Math.max(...postTimes) : 0;

  items.forEach((it, i) => {
    const y = yearOf(it);
    it.alpha = Number.isFinite(y) && maxY > minY ? 0.45 + 0.55 * (y - minY) / (maxY - minY) : 1;
    it.pulse = (it.type === 'project' && it.active) ||
      (it.type === 'post' && newestPost - Date.parse(it.date) < 120 * 864e5);
    it.r = Math.max(3.5, Math.min(11, 3 + Math.sqrt(it.chars) / 7));
    it.color = it.line ? it.line.color : FREE_COLOR;
    it.angle = Math.random() * Math.PI * 2;
    it.orbit = 0;
    it.speed = (0.0025 + Math.random() * 0.004) * (Math.random() < 0.5 ? -1 : 1);
    it.x = 0; it.y = 0; it.vx = 0; it.vy = 0;
  });
  lines.forEach(l => { l.r = 12 + Math.min(10, l.count * 1.6); });

  // Conexões (tags ou membros em comum)
  const links = [];
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      const A = items[a], B = items[b];
      const sharedTag = A.tags.some(t => B.tags.includes(t));
      const memberLink = (A.type === 'member' && B.team.some(m => norm(m).includes(norm(A.name)))) ||
        (B.type === 'member' && A.team.some(m => norm(m).includes(norm(B.name))));
      if (sharedTag || memberLink) links.push([A, B]);
    }
  }

  // ---------- Contadores e legenda ----------
  const totalChars = items.reduce((s, i) => s + i.chars, 0);
  const count = t => items.filter(i => i.type === t).length;
  const stats = [
    [count('member'), 'membros'], [count('project'), 'projetos'],
    [count('post'), 'notícias'], [lines.length, 'linhas'],
    [totalChars.toLocaleString('pt-BR'), 'caracteres']
  ];
  const statsEl = document.getElementById('banner-stats');
  if (statsEl) statsEl.innerHTML = stats.map(([n, l]) => `<li><strong>${n}</strong> ${l}</li>`).join('');

  const legendEl = document.getElementById('banner-legend');
  if (legendEl) {
    legendEl.innerHTML = lines.map(l =>
      `<li><span class="legend-dot" style="background:${l.color}"></span>${l.name}</li>`).join('') +
      '<li class="legend-shapes"><span>● membro</span><span>◆ projeto</span><span>▲ notícia</span></li>';
  }

  // ---------- Fundo por hora do dia ----------
  const SKY = [
    [0, '#0b1026', '#1e1b4b'], [5, '#1e1b4b', '#3b1d6e'], [7, '#4a2c6b', '#b4527a'],
    [9, '#1e3a8a', '#0e7490'], [13, '#1d4ed8', '#0e7490'], [17, '#9a3412', '#6b21a8'],
    [19, '#4c1d95', '#1e1b4b'], [22, '#0b1026', '#1e1b4b'], [24, '#0b1026', '#1e1b4b']
  ];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  let sky = ['#0b1026', '#1e1b4b'];
  function updateSky() {
    const d = new Date();
    const h = d.getHours() + d.getMinutes() / 60;
    for (let i = 0; i < SKY.length - 1; i++) {
      if (h >= SKY[i][0] && h < SKY[i + 1][0]) {
        const t = (h - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]);
        sky = [mix(SKY[i][1], SKY[i + 1][1], t), mix(SKY[i][2], SKY[i + 1][2], t)];
        break;
      }
    }
  }
  updateSky();
  setInterval(updateSky, 60000);

  // ---------- Dimensões ----------
  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = banner.getBoundingClientRect();
    const first = W === 0;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (first) placeInitial();
    lines.forEach(clamp); items.forEach(clamp);
  }

  function placeInitial() {
    const n = lines.length || 1;
    lines.forEach((l, i) => {
      l.x = W * (i + 0.5) / n + (Math.random() - 0.5) * 40;
      l.y = H * (0.45 + (i % 2 ? 0.12 : -0.08));
      l.vx = (Math.random() - 0.5) * 0.3; l.vy = (Math.random() - 0.5) * 0.3;
    });
    items.forEach(it => {
      const c = it.line || { x: W / 2, y: H / 2 };
      it.x = c.x + (Math.random() - 0.5) * 60;
      it.y = c.y + (Math.random() - 0.5) * 60;
    });
  }

  function clamp(p) {
    if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx); }
    if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx); }
    if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy); }
    if (p.y > H - p.r) { p.y = H - p.r; p.vy = -Math.abs(p.vy); }
  }

  // ---------- Física ----------
  const mouse = { x: -9999, y: -9999, active: false };
  const drag = { node: null, startX: 0, startY: 0, moved: false, lastX: 0, lastY: 0, vx: 0, vy: 0 };
  function step(dt) {
    const orbitBase = Math.min(W, H) * 0.12;

    // Núcleos: deriva suave + repulsão mútua
    lines.forEach((l, i) => {
      l.vx += (Math.random() - 0.5) * 0.02 * dt;
      l.vy += (Math.random() - 0.5) * 0.02 * dt;
      lines.forEach((o, j) => {
        if (i === j) return;
        const dx = l.x - o.x, dy = l.y - o.y, d2 = dx * dx + dy * dy + 1, d = Math.sqrt(d2);
        const min = orbitBase * 2.6;
        if (d < min) { const f = (min - d) / min * 0.04 * dt; l.vx += dx / d * f; l.vy += dy / d * f; }
      });
      if (applyDrag(l, dt)) return;
      l.vx *= 0.97; l.vy *= 0.97;
      const sp = Math.hypot(l.vx, l.vy);
      if (sp > 0.6) { const k = Math.max(0.6 / sp, 0.94); l.vx *= k; l.vy *= k; }
      l.x += l.vx * dt; l.y += l.vy * dt;
      clamp(l);
    });

    // Itens: mola em direção à órbita + repulsão entre si + mouse
    items.forEach((it, idx) => {
      const c = it.line || { x: W / 2, y: H / 2, r: 0 };
      it.angle += it.speed * dt;
      const R = (it.line ? c.r + orbitBase * 0.55 : orbitBase * 1.6) + (idx % 3) * 16;
      const tx = c.x + Math.cos(it.angle) * R, ty = c.y + Math.sin(it.angle) * R;
      it.vx += (tx - it.x) * 0.0035 * dt;
      it.vy += (ty - it.y) * 0.0035 * dt;
      for (let j = idx + 1; j < items.length; j++) {
        const o = items[j];
        const dx = it.x - o.x, dy = it.y - o.y, d = Math.hypot(dx, dy) || 0.01, min = it.r + o.r + 6;
        if (d < min) {
          const f = (min - d) / min * 0.3 * dt;
          it.vx += dx / d * f; it.vy += dy / d * f; o.vx -= dx / d * f; o.vy -= dy / d * f;
        }
      }
      if (applyDrag(it, dt)) {
        // Item arrastado puxa seu núcleo (e, por consequência, o conjunto)
        if (it.line) {
          it.line.vx += (it.x - it.line.x) * 0.002 * dt;
          it.line.vy += (it.y - it.line.y) * 0.002 * dt;
        }
        return;
      }
      it.vx *= 0.92; it.vy *= 0.92;
      it.x += it.vx * dt; it.y += it.vy * dt;
      clamp(it);
    });
  }

  // Nó arrastado segue o ponteiro; guarda a velocidade para o "arremesso"
  function applyDrag(p, dt) {
    if (drag.node !== p || !drag.moved) return false;
    p.vx = drag.vx; p.vy = drag.vy;
    p.x = mouse.x; p.y = mouse.y;
    clamp(p);
    return true;
  }

  // ---------- Desenho ----------
  let hovered = null, time = 0;
  function rgba(hexColor, a) { const [r, g, b] = hex(hexColor); return `rgba(${r},${g},${b},${a})`; }

  function shape(it, r) {
    ctx.beginPath();
    if (it.type === 'project') {
      ctx.moveTo(it.x, it.y - r * 1.2); ctx.lineTo(it.x + r * 1.2, it.y);
      ctx.lineTo(it.x, it.y + r * 1.2); ctx.lineTo(it.x - r * 1.2, it.y); ctx.closePath();
    } else if (it.type === 'post') {
      ctx.moveTo(it.x, it.y - r * 1.2); ctx.lineTo(it.x + r * 1.1, it.y + r * 0.8);
      ctx.lineTo(it.x - r * 1.1, it.y + r * 0.8); ctx.closePath();
    } else {
      ctx.arc(it.x, it.y, r, 0, Math.PI * 2);
    }
  }

  function draw() {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Conexões entre conteúdos
    links.forEach(([a, b]) => {
      const near = hovered && (hovered === a || hovered === b);
      ctx.strokeStyle = near ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.09)';
      ctx.lineWidth = near ? 1.2 : 0.7;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });

    // Fios até o núcleo
    items.forEach(it => {
      if (!it.line) return;
      ctx.strokeStyle = rgba(it.color, 0.16 * it.alpha);
      ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(it.line.x, it.line.y); ctx.lineTo(it.x, it.y); ctx.stroke();
    });

    // Núcleos
    lines.forEach(l => {
      const glow = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 3.2);
      glow.addColorStop(0, rgba(l.color, 0.45)); glow.addColorStop(1, rgba(l.color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = l.color;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); ctx.fill();
      ctx.font = '600 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.fillText(l.name.length > 34 ? l.name.slice(0, 32) + '…' : l.name, l.x, l.y + l.r + 18);
    });

    // Itens
    items.forEach(it => {
      if (it.pulse) {
        const pr = it.r + 4 + Math.sin(time * 0.003 + it.angle * 3) * 2.5;
        ctx.strokeStyle = rgba(it.color, 0.45 * it.alpha);
        ctx.lineWidth = 1.5;
        shape(it, pr); ctx.stroke();
      }
      ctx.fillStyle = rgba(it.color, it.alpha);
      shape(it, it === hovered ? it.r * 1.35 : it.r);
      ctx.fill();
      if (it === hovered) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke(); }
    });
  }

  // ---------- Interação ----------
  function pick(x, y) {
    let best = null, bestD = 18;
    items.forEach(it => {
      const d = Math.hypot(it.x - x, it.y - y) - it.r;
      if (d < bestD) { bestD = d; best = it; }
    });
    return best;
  }

  function pickLine(x, y) {
    return lines.find(l => Math.hypot(l.x - x, l.y - y) < l.r + 6) || null;
  }

  function showTooltip(it) {
    if (!it) { tooltip.hidden = true; return; }
    const meta = [TYPE_LABEL[it.type], it.line ? it.line.name : null,
      it.type === 'project' ? (it.active ? 'Em andamento' : 'Concluído') : null].filter(Boolean).join(' · ');
    tooltip.innerHTML = '';
    const strong = document.createElement('strong'); strong.textContent = it.title;
    const span = document.createElement('span'); span.textContent = meta;
    tooltip.append(strong, span);
    tooltip.hidden = false;
    const tx = Math.min(it.x + 14, W - tooltip.offsetWidth - 8);
    const ty = Math.max(8, it.y - tooltip.offsetHeight - 12);
    tooltip.style.transform = `translate(${tx}px, ${ty}px)`;
  }

  function setPointer(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.active = true;
  }

  function onMove(e) {
    setPointer(e);
    if (drag.node) {
      if (!drag.moved && Math.hypot(mouse.x - drag.startX, mouse.y - drag.startY) > 4) drag.moved = true;
      drag.vx = drag.vx * 0.5 + (mouse.x - drag.lastX) * 0.5;
      drag.vy = drag.vy * 0.5 + (mouse.y - drag.lastY) * 0.5;
      drag.lastX = mouse.x; drag.lastY = mouse.y;
      if (drag.moved) { showTooltip(null); banner.style.cursor = 'grabbing'; }
      if (reduceMotion && drag.moved) { applyDrag(drag.node, 1); draw(); }
      return;
    }
    hovered = pick(mouse.x, mouse.y);
    const overLine = !hovered && pickLine(mouse.x, mouse.y);
    banner.style.cursor = hovered ? 'pointer' : overLine ? 'grab' : 'default';
    showTooltip(hovered);
    if (reduceMotion) draw();
  }

  banner.addEventListener('pointermove', onMove);
  banner.addEventListener('pointerdown', e => {
    if (e.target.closest('a, .banner-legend, .banner-stats')) return;
    setPointer(e);
    const node = pick(mouse.x, mouse.y) || pickLine(mouse.x, mouse.y);
    if (!node) return;
    hovered = items.includes(node) ? node : null;
    Object.assign(drag, { node, startX: mouse.x, startY: mouse.y, lastX: mouse.x, lastY: mouse.y, moved: false, vx: 0, vy: 0 });
    banner.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  function endDrag(e) {
    if (!drag.node) return;
    const { node, moved } = drag;
    if (moved) { node.vx = drag.vx; node.vy = drag.vy; }
    drag.node = null;
    if (banner.hasPointerCapture && banner.hasPointerCapture(e.pointerId)) banner.releasePointerCapture(e.pointerId);
    if (!moved && e.type === 'pointerup' && node.url) { window.location.href = node.url; return; }
    onMove(e);
  }
  banner.addEventListener('pointerup', endDrag);
  banner.addEventListener('pointercancel', endDrag);
  banner.addEventListener('pointerleave', () => {
    if (drag.node) return;
    mouse.active = false; hovered = null; showTooltip(null); banner.style.cursor = 'default';
    if (reduceMotion) draw();
  });

  // ---------- Loop ----------
  let visible = true, last = performance.now();
  function loop(now) {
    const dt = Math.min(3, (now - last) / 16.67);
    last = now; time = now;
    if (visible && !document.hidden) { step(dt); draw(); }
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(banner);
  }

  if (reduceMotion) {
    for (let i = 0; i < 400; i++) step(1);
    draw();
    setInterval(() => { updateSky(); draw(); }, 60000);
  } else {
    requestAnimationFrame(loop);
  }
})();
