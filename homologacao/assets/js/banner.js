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
  if (!ctx) return;
  const tooltip = document.getElementById('banner-tooltip');
  const reduceMotion = typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Cores para as linhas de pesquisa e destaque complementar para atividades
  const PALETTE = ['#37BFA5', '#BF3752', '#38bdf8'];
  const ACTIVITY_COLOR = '#BF3752';
  const FREE_COLOR = '#e2ece8';
  const TYPE_LABEL = { activity: 'Atividade', member: 'Membro', project: 'Projeto', post: 'Notícia' };

  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const keywords = s => norm(s).split(/[^a-z0-9]+/).filter(w => w.length > 4);

  // ---------- Preparação dos dados ----------
  const lines = (raw.lines || []).map((l, i) => ({
    name: l.name, coordinator: l.coordinator || '', color: PALETTE[i % PALETTE.length],
    words: keywords(l.name), x: 0, y: 0, vx: 0, vy: 0, r: 14, count: 0, hoverAmt: 0
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
    } else if (it.type === 'post' || it.type === 'activity') {
      it.line = scoreLine(it.title + ' ' + it.tags.join(' ') + ' ' + (it.summary || '')) || lines[0] || null;
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
    it.pulse = it.type === 'activity' ||
      (it.type === 'project' && it.active) ||
      (it.type === 'post' && newestPost - Date.parse(it.date) < 120 * 864e5);
    it.baseR = Math.max(8, Math.min(19, 6.5 + Math.sqrt(it.chars) / 4.8));
    it.r = it.baseR;
    it.color = it.type === 'activity' ? ACTIVITY_COLOR : (it.line ? it.line.color : FREE_COLOR);
    it.angle = Math.random() * Math.PI * 2;
    it.orbit = 0;
    it.speed = (0.0022 + Math.random() * 0.0032) * (Math.random() < 0.5 ? -1 : 1);
    it.x = 0; it.y = 0; it.vx = 0; it.vy = 0;
    it.legendFocus = 1;
    it.legendHighlight = 0;
    it.hoverFocus = 1;
    it.hoverSelf = 0;
    it.hoverNeighbor = 0;
  });
  lines.forEach(l => {
    l.baseR = 22 + Math.min(16, l.count * 2.2);
    l.r = l.baseR;
  });

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

  // ---------- Legenda das formas ----------
  let hoveredType = null;
  let pinnedType = null;
  let hoveredLine = null;
  let legendActive = 0;
  let nodeHoverActive = 0;
  const activeLegendType = () => hoveredType || pinnedType;
  const legendEl = document.getElementById('banner-legend');
  if (legendEl) {
    legendEl.innerHTML =
      '<li class="legend-shapes">' +
      '<button type="button" class="legend-shape-item" data-legend-type="activity" aria-pressed="false" aria-label="Destacar atividades no mapa"><span aria-hidden="true">■</span> atividade</button>' +
      '<button type="button" class="legend-shape-item" data-legend-type="member" aria-pressed="false" aria-label="Destacar membros no mapa"><span aria-hidden="true">●</span> membro</button>' +
      '<button type="button" class="legend-shape-item" data-legend-type="project" aria-pressed="false" aria-label="Destacar projetos no mapa"><span aria-hidden="true">◆</span> projeto</button>' +
      '<button type="button" class="legend-shape-item" data-legend-type="post" aria-pressed="false" aria-label="Destacar notícias no mapa"><span aria-hidden="true">▲</span> notícia</button>' +
      '</li>';

    const legendBtns = legendEl.querySelectorAll('[data-legend-type]');
    const syncLegendUI = () => {
      legendBtns.forEach(btn => {
        const t = btn.getAttribute('data-legend-type');
        const isPinned = pinnedType === t;
        btn.setAttribute('aria-pressed', isPinned ? 'true' : 'false');
        btn.classList.toggle('is-active', isPinned || hoveredType === t);
      });
    };

    legendBtns.forEach(el => {
      const t = el.getAttribute('data-legend-type');
      const onEnter = () => {
        hoveredType = t;
        syncLegendUI();
        if (reduceMotion) draw();
      };
      const onLeave = () => {
        hoveredType = null;
        syncLegendUI();
        if (reduceMotion) draw();
      };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('focus', onEnter);
      el.addEventListener('blur', onLeave);
      el.addEventListener('click', () => {
        pinnedType = pinnedType === t ? null : t;
        syncLegendUI();
        if (reduceMotion) draw();
      });
    });
  }

  // ---------- Fundo por hora do dia ----------
  const SKY = [
    [0, '#041412', '#08231f'], [5, '#08231f', '#0d362f'], [7, '#0d362f', '#12483e'],
    [9, '#092723', '#0e3a33'], [13, '#0b302a', '#145247'], [17, '#0d3730', '#165c50'],
    [19, '#082723', '#051816'], [22, '#041412', '#08231f'], [24, '#041412', '#08231f']
  ];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
  let W = 0, H = 0;
  let sky = ['#041412', '#08231f'];
  let bgCache = null;
  let glowSprite = null;

  function buildGlowSprite() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const gctx = c.getContext('2d');
    if (!gctx) return;
    const r = size / 2;
    const gr = gctx.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, 'rgba(55, 191, 165, 1)');
    gr.addColorStop(0.4, 'rgba(55, 191, 165, 0.62)');
    gr.addColorStop(0.75, 'rgba(55, 191, 165, 0.2)');
    gr.addColorStop(1, 'rgba(55, 191, 165, 0)');
    gctx.fillStyle = gr;
    gctx.fillRect(0, 0, size, size);
    glowSprite = c;
  }

  function rebuildBgCache() {
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = bgCache || document.createElement('canvas');
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    const bctx = c.getContext('2d');
    if (!bctx) return;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const g = bctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
    bctx.fillStyle = g;
    bctx.fillRect(0, 0, W, H);

    bctx.fillStyle = 'rgba(184, 232, 222, 0.18)';
    const dotStep = 30;
    for (let dx = 16; dx < W; dx += dotStep) {
      for (let dy = 16; dy < H; dy += dotStep) {
        bctx.beginPath();
        bctx.arc(dx, dy, 1.4, 0, Math.PI * 2);
        bctx.fill();
      }
    }
    bgCache = c;
  }

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
    rebuildBgCache();
  }
  buildGlowSprite();
  updateSky();
  setInterval(updateSky, 60000);

  // ---------- Dimensões ----------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = banner.getBoundingClientRect();
    const first = W === 0;
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Escala os raios proporcionalmente
    const scale = W < 600 ? 0.85 : 1.15;
    items.forEach(it => { it.r = Math.max(6.5, it.baseR * scale); });
    lines.forEach(l => { l.r = l.baseR * scale; });

    if (first) placeInitial();
    else if (!userInteracted) updateHomes();
    lines.forEach(clamp); items.forEach(clamp);
    rebuildBgCache();
  }

  let userInteracted = false;

  function getContainerBounds() {
    // Área útil limite do site (container central: 1060px máx)
    const containerMax = 1060;
    const pad = W < 640 ? 20 : 36;
    const cW = Math.min(W - pad * 2, containerMax);
    const left = (W - cW) / 2;
    const right = left + cW;
    return { left, right, width: cW };
  }

  function updateHomes() {
    const isStacked = W < 860;
    const cb = getContainerBounds();
    const n = lines.length || 1;
    if (isStacked) {
      const positions = [
        { x: cb.left + cb.width * 0.5, y: H * 0.58 },
        { x: cb.left + cb.width * 0.3, y: H * 0.62 },
        { x: cb.left + cb.width * 0.7, y: H * 0.62 }
      ];
      lines.forEach((l, i) => {
        const pos = positions[i] || { x: cb.left + cb.width * 0.5, y: H * 0.58 };
        l.homeX = pos.x; l.homeY = pos.y;
      });
    } else if (n === 1) {
      // Sem o card lateral, centraliza o núcleo principal com leve respiro para a legenda à direita
      lines[0].homeX = cb.left + cb.width * 0.44;
      lines[0].homeY = H * 0.5;
    } else {
      const usableLeft = cb.left + 80;
      const usableRight = cb.right - 80;
      const usableW = Math.max(240, usableRight - usableLeft);
      lines.forEach((l, i) => {
        l.homeX = usableLeft + usableW * (i + 0.5) / n;
        l.homeY = H * (0.48 + (i % 2 ? 0.08 : -0.04));
      });
    }
  }

  function placeInitial() {
    const isMobile = W < 640;
    const cb = getContainerBounds();
    updateHomes();

    lines.forEach((l, i) => {
      l.x = l.homeX + (Math.random() - 0.5) * (isMobile ? 16 : 24);
      l.y = l.homeY + (Math.random() - 0.5) * (isMobile ? 16 : 20);
      l.vx = (Math.random() - 0.5) * 0.2; l.vy = (Math.random() - 0.5) * 0.2;
    });

    items.forEach(it => {
      const c = it.line || { x: cb.left + cb.width / 2, y: H / 2 };
      const spread = isMobile ? 60 : 120;
      it.x = c.x + (Math.random() - 0.5) * spread;
      it.y = c.y + (Math.random() - 0.5) * spread;
    });
  }

  function clamp(p) {
    const bottomMargin = 38;
    if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx); }
    if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx); }
    if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy); }
    if (p.y > H - p.r - bottomMargin) { p.y = H - p.r - bottomMargin; p.vy = -Math.abs(p.vy); }
  }

  // ---------- Física e Efeito de Iluminação ----------
  const mouse = { x: -9999, y: -9999, active: false, intensity: 0 };
  const glowTrail = [];
  const ripples = [];
  let groupByType = false;
  let chimeCtx = null;
  const chimeNotes = [523.25, 587.33, 659.25, 783.99, 880.0];

  function playSoftBell(seed = 0) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      if (!chimeCtx) chimeCtx = new AudioCtx();
      if (chimeCtx.state === 'suspended') chimeCtx.resume();
      const now = chimeCtx.currentTime;
      const freq = chimeNotes[Math.abs(seed) % chimeNotes.length];

      const osc1 = chimeCtx.createOscillator();
      const osc2 = chimeCtx.createOscillator();
      const gain = chimeCtx.createGain();
      const overtoneGain = chimeCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.0, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      overtoneGain.gain.setValueAtTime(0.2, now);

      osc1.connect(gain);
      osc2.connect(overtoneGain);
      overtoneGain.connect(gain);
      gain.connect(chimeCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.95);
      osc2.stop(now + 0.95);
    } catch (_) {}
  }

  const TYPE_ORDER = ['activity', 'member', 'project', 'post'];
  const drag = { node: null, startX: 0, startY: 0, moved: false, lastX: 0, lastY: 0, vx: 0, vy: 0 };
  function step(dt) {
    const isMobile = W < 640;
    const orbitBase = isMobile ? Math.min(W, H) * 0.2 : Math.min(W, H) * 0.21;

    // Núcleos: deriva suave + repulsão mútua
    lines.forEach((l, i) => {
      l.vx += (Math.random() - 0.5) * 0.02 * dt;
      l.vy += (Math.random() - 0.5) * 0.02 * dt;

      // No carregamento inicial, mantém os núcleos suavemente ancorados na área útil do site
      if (!userInteracted && l.homeX !== undefined) {
        l.vx += (l.homeX - l.x) * 0.0008 * dt;
        l.vy += (l.homeY - l.y) * 0.0008 * dt;
      }

      lines.forEach((o, j) => {
        if (i === j) return;
        const dx = l.x - o.x, dy = l.y - o.y, d2 = dx * dx + dy * dy + 1, d = Math.sqrt(d2);
        const min = orbitBase * (isMobile ? 2.1 : 2.6);
        if (d < min) { const f = (min - d) / min * 0.04 * dt; l.vx += dx / d * f; l.vy += dy / d * f; }
      });
      if (applyDrag(l, dt)) return;
      l.vx *= 0.97; l.vy *= 0.97;
      const sp = Math.hypot(l.vx, l.vy);
      if (sp > 0.6) { const k = Math.max(0.6 / sp, 0.94); l.vx *= k; l.vy *= k; }
      l.x += l.vx * dt; l.y += l.vy * dt;
      clamp(l);
    });

    // Itens: mola em direção à órbita (ou agrupamento por tipo) + repulsão entre si + mouse
    const cb = getContainerBounds();
    const isStacked = W < 860;
    const areaLeft = cb.left + (isStacked ? 28 : 48);
    const areaRight = cb.right - (isStacked ? 28 : 48);
    const areaW = Math.max(220, areaRight - areaLeft);
    const areaTop = isStacked ? H * 0.34 : H * 0.22;
    const areaH = isStacked ? H * 0.48 : H * 0.56;

    items.forEach((it, idx) => {
      const c = it.line || { x: W / 2, y: H / 2, r: 0 };
      it.angle += it.speed * dt;
      let tx, ty;

      if (groupByType) {
        const typeIdx = Math.max(0, TYPE_ORDER.indexOf(it.type));
        const sameType = items.filter(x => x.type === it.type);
        const posInType = sameType.indexOf(it);
        const cols = TYPE_ORDER.length;
        tx = areaLeft + areaW * ((typeIdx + 0.5) / cols);
        ty = areaTop + areaH * ((posInType + 0.5) / Math.max(1, sameType.length));
      } else {
        const R = (it.line ? c.r + orbitBase * (isMobile ? 0.82 : 0.92) : orbitBase * (isMobile ? 1.45 : 1.65)) + (idx % 4) * (isMobile ? 16 : 26);
        tx = c.x + Math.cos(it.angle) * R;
        ty = c.y + Math.sin(it.angle) * R;
      }

      it.vx += (tx - it.x) * (groupByType ? 0.014 : 0.0035) * dt;
      it.vy += (ty - it.y) * (groupByType ? 0.014 : 0.0035) * dt;
      for (let j = idx + 1; j < items.length; j++) {
        const o = items[j];
        const dx = it.x - o.x, dy = it.y - o.y, d = Math.hypot(dx, dy) || 0.01, min = it.r + o.r + 16;
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

    // Decaimento do rastro suave de iluminação e das ondas de duplo clique
    for (let i = glowTrail.length - 1; i >= 0; i--) {
      glowTrail[i].life -= 0.028 * dt;
      if (glowTrail[i].life <= 0) {
        glowTrail.splice(i, 1);
      }
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].r += 4.2 * dt;
      ripples[i].life -= 0.025 * dt;
      if (ripples[i].life <= 0) ripples.splice(i, 1);
    }

    // Transição suave de entrada e saída para todos os estados de hover (legenda, nós e núcleos)
    const focusType = activeLegendType();
    const hoverEase = reduceMotion ? 1 : Math.min(1, 0.15 * dt);
    legendActive += ((focusType ? 1 : 0) - legendActive) * hoverEase;
    nodeHoverActive += ((hovered ? 1 : 0) - nodeHoverActive) * hoverEase;

    let hoverNeighbors = null;
    if (hovered) {
      hoverNeighbors = new Set([hovered]);
      links.forEach(([a, b]) => {
        if (a === hovered) hoverNeighbors.add(b);
        else if (b === hovered) hoverNeighbors.add(a);
      });
    }

    lines.forEach(l => {
      const targetLineHover = (l === hoveredLine || drag.node === l) ? 1 : 0;
      l.hoverAmt += (targetLineHover - l.hoverAmt) * hoverEase;
    });

    items.forEach(it => {
      const targetFocus = !focusType || it.type === focusType ? 1 : 0.22;
      const targetHighlight = focusType && it.type === focusType ? 1 : 0;
      it.legendFocus += (targetFocus - it.legendFocus) * hoverEase;
      it.legendHighlight += (targetHighlight - it.legendHighlight) * hoverEase;

      const targetSelf = it === hovered ? 1 : 0;
      const targetNeighbor = hoverNeighbors && hoverNeighbors.has(it) && it !== hovered ? 1 : 0;
      const targetHoverFocus = !hoverNeighbors || hoverNeighbors.has(it) ? 1 : 0.22;
      it.hoverSelf += (targetSelf - it.hoverSelf) * hoverEase;
      it.hoverNeighbor += (targetNeighbor - it.hoverNeighbor) * hoverEase;
      it.hoverFocus += (targetHoverFocus - it.hoverFocus) * hoverEase;
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
    if (it.type === 'activity') {
      ctx.rect(it.x - r, it.y - r, r * 2, r * 2);
    } else if (it.type === 'project') {
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
    if (bgCache) {
      ctx.drawImage(bgCache, 0, 0, W, H);
    } else {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    // Decaimento suave do rastro e fade in/out da intensidade do mouse
    const targetIntensity = (mouse.active && mouse.x >= -120 && mouse.x <= W + 120 && mouse.y >= -120 && mouse.y <= H + 120) ? 1 : 0;
    mouse.intensity += (targetIntensity - mouse.intensity) * (targetIntensity > mouse.intensity ? 0.05 : 0.025);

    // 1. Caminho suave de degradê no fundo (sprite pré-renderizado para alta performance)
    if (glowSprite) {
      const trailR = Math.max(400, Math.min(W, H) * 0.85);
      for (let i = 0; i < glowTrail.length; i++) {
        const p = glowTrail[i];
        if (p.life <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha = 0.02 * p.life;
        ctx.drawImage(glowSprite, p.x - trailR, p.y - trailR, trailR * 2, trailR * 2);
        ctx.restore();
      }

      // 2. Foco principal sobre o cursor restrito ao fundo
      if (mouse.intensity > 0.01) {
        const glowR = Math.max(540, Math.min(W, H) * 1.1);
        ctx.save();
        ctx.globalAlpha = 0.042 * mouse.intensity;
        ctx.drawImage(glowSprite, mouse.x - glowR, mouse.y - glowR, glowR * 2, glowR * 2);
        ctx.restore();
      }
    }

    // Ondas suaves de duplo clique no fundo
    ripples.forEach(rp => {
      ctx.strokeStyle = `rgba(55, 191, 165, ${0.42 * rp.life})`;
      ctx.lineWidth = 1.75;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Vizinhança conectada ao nó sob o cursor (destaque de vizinhança)
    let neighbors = null;
    if (hovered) {
      neighbors = new Set([hovered]);
      links.forEach(([a, b]) => {
        if (a === hovered) neighbors.add(b);
        else if (b === hovered) neighbors.add(a);
      });
    }

    // Conexões curvas suaves entre conteúdos (opacidade graduada pela distância)
    const focusType = activeLegendType();
    if (reduceMotion) {
      legendActive = focusType ? 1 : 0;
      nodeHoverActive = hovered ? 1 : 0;
      lines.forEach(l => { l.hoverAmt = (l === hoveredLine || drag.node === l) ? 1 : 0; });
      items.forEach(it => {
        it.legendFocus = !focusType || it.type === focusType ? 1 : 0.22;
        it.legendHighlight = focusType && it.type === focusType ? 1 : 0;
        it.hoverSelf = it === hovered ? 1 : 0;
        it.hoverNeighbor = neighbors && neighbors.has(it) && it !== hovered ? 1 : 0;
        it.hoverFocus = !neighbors || neighbors.has(it) ? 1 : 0.22;
      });
    }
    links.forEach(([a, b], idx) => {
      const near = (a.hoverSelf + b.hoverSelf) > 0.5;
      const nearFactor = Math.max(a.hoverSelf, b.hoverSelf);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const baseAlpha = Math.max(0.07, 0.34 - dist / 650);
      const typeMatchFactor = Math.max(a.legendHighlight, b.legendHighlight);
      const legendMult = (1 - legendActive) + legendActive * (typeMatchFactor * 1.4 + (1 - typeMatchFactor) * 0.25);
      const legendAlpha = Math.min(0.6, baseAlpha * legendMult);
      const hoverAlpha = nearFactor * 0.78 + (1 - nearFactor) * baseAlpha * 0.35;
      const alpha = (1 - nodeHoverActive) * legendAlpha + nodeHoverActive * hoverAlpha;

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 0.85 + 0.65 * nearFactor;

      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const curve = Math.min(28, dist * 0.14) * (idx % 2 === 0 ? 1 : -1);
      const cx = mx - (dy / dist) * curve;
      const cy = my + (dx / dist) * curve;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cx, cy, b.x, b.y);
      ctx.stroke();
    });

    // Fios até o núcleo
    items.forEach(it => {
      if (!it.line) return;
      const dim = it.hoverFocus * it.legendFocus;
      ctx.strokeStyle = rgba(it.color, 0.32 * it.alpha * dim);
      ctx.lineWidth = 0.75;
      ctx.beginPath(); ctx.moveTo(it.line.x, it.line.y); ctx.lineTo(it.x, it.y); ctx.stroke();
    });

    // Núcleos com anéis orbitais concêntricos girando suavemente
    lines.forEach((l, lIdx) => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(time * 0.00018 * (lIdx % 2 === 0 ? 1 : -1));
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = rgba(l.color, 0.32);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, l.r + 22, 0, Math.PI * 2); ctx.stroke();
      ctx.rotate(-time * 0.00032 * (lIdx % 2 === 0 ? 1 : -1));
      ctx.setLineDash([2, 8]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath(); ctx.arc(0, 0, l.r + 42, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      ctx.fillStyle = l.color;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.32 + 0.68 * l.hoverAmt})`;
      ctx.lineWidth = 1.2 + 0.8 * l.hoverAmt;
      ctx.stroke();

      if (l.hoverAmt > 0.01) {
        const isMobile = W < 640;
        ctx.font = isMobile ? '700 10.5px Raleway, sans-serif' : '700 13px Raleway, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255,255,255,${0.92 * l.hoverAmt})`;
        const maxLen = isMobile ? 22 : 34;
        const label = l.name.length > maxLen ? l.name.slice(0, maxLen - 2) + '…' : l.name;
        ctx.fillText(label, l.x, l.y + l.r + (isMobile ? 14 : 18));
      }
    });

    // Itens com destaque de vizinhança e destaque por legenda
    items.forEach(it => {
      const effectiveAlpha = it.alpha * it.hoverFocus * it.legendFocus;
      const scaleMult = Math.max(1 + 0.35 * it.hoverSelf, 1 + 0.25 * it.legendHighlight);
      const radius = it.r * scaleMult;

      if (it.pulse && it.hoverFocus > 0.5 && it.legendFocus > 0.5) {
        const pr = it.r + 4 + Math.sin(time * 0.003 + it.angle * 3) * 2.5;
        ctx.strokeStyle = rgba(it.color, 0.45 * effectiveAlpha);
        ctx.lineWidth = 1.5;
        shape(it, pr); ctx.stroke();
      }

      ctx.fillStyle = rgba(it.color, effectiveAlpha);
      shape(it, radius);
      ctx.fill();

      const highlightAmt = Math.max(it.hoverSelf, it.legendHighlight, 0.65 * it.hoverNeighbor);
      const baseStrokeAlpha = 0.24 * effectiveAlpha;
      const strokeAlpha = baseStrokeAlpha + (1 - baseStrokeAlpha) * highlightAmt;
      ctx.strokeStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
      ctx.lineWidth = 1 + Math.max(it.hoverSelf, it.legendHighlight, 0.4 * it.hoverNeighbor);
      ctx.stroke();
    });
  }

  // ---------- Interação ----------
  function pick(x, y, maxDist = 18) {
    let best = null, bestD = maxDist;
    items.forEach(it => {
      const d = Math.hypot(it.x - x, it.y - y) - it.r;
      if (d < bestD) { bestD = d; best = it; }
    });
    return best;
  }

  function pickLine(x, y, extra = 6) {
    return lines.find(l => Math.hypot(l.x - x, l.y - y) < l.r + extra) || null;
  }

  function showTooltip(it) {
    if (!tooltip) return;
    if (!it) { tooltip.hidden = true; return; }
    const meta = [TYPE_LABEL[it.type], it.line ? it.line.name : null,
      it.type === 'project' ? (it.active ? 'Em andamento' : 'Concluído') : null].filter(Boolean).join(' · ');
    tooltip.innerHTML = '';
    const strong = document.createElement('strong'); strong.textContent = it.title;
    const span = document.createElement('span'); span.textContent = meta;
    tooltip.append(strong, span);
    tooltip.hidden = false;

    const isMobile = W < 640;
    if (isMobile) {
      const tx = Math.max(12, Math.min(W - tooltip.offsetWidth - 12, it.x - tooltip.offsetWidth / 2));
      const ty = (it.y < 120) ? Math.min(H - tooltip.offsetHeight - 45, it.y + it.r + 14) : Math.max(54, it.y - tooltip.offsetHeight - 14);
      tooltip.style.transform = `translate(${tx}px, ${ty}px)`;
    } else {
      const tx = Math.min(it.x + 14, W - tooltip.offsetWidth - 8);
      const ty = Math.max(8, it.y - tooltip.offsetHeight - 12);
      tooltip.style.transform = `translate(${tx}px, ${ty}px)`;
    }
  }

  function setPointer(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.active = true;
  }

  function onMove(e) {
    setPointer(e);

    // Registra ponto para o rastro suave de degradê
    const lastP = glowTrail[glowTrail.length - 1];
    if (!lastP || Math.hypot(mouse.x - lastP.x, mouse.y - lastP.y) > 9) {
      glowTrail.push({ x: mouse.x, y: mouse.y, life: 1.0 });
      if (glowTrail.length > 32) glowTrail.shift();
    }

    if (drag.node) {
      if (!drag.moved && Math.hypot(mouse.x - drag.startX, mouse.y - drag.startY) > 6) {
        drag.moved = true;
        userInteracted = true;
        if (banner.setPointerCapture && !banner.hasPointerCapture(e.pointerId)) {
          try { banner.setPointerCapture(e.pointerId); } catch (_) {}
        }
      }
      if (drag.moved && e.cancelable) e.preventDefault();
      drag.vx = drag.vx * 0.5 + (mouse.x - drag.lastX) * 0.5;
      drag.vy = drag.vy * 0.5 + (mouse.y - drag.lastY) * 0.5;
      drag.lastX = mouse.x; drag.lastY = mouse.y;
      if (drag.moved) { showTooltip(null); banner.style.cursor = 'grabbing'; }
      if (reduceMotion && drag.moved) { applyDrag(drag.node, 1); draw(); }
      return;
    }
    hovered = pick(mouse.x, mouse.y);
    hoveredLine = !hovered ? pickLine(mouse.x, mouse.y) : null;
    banner.style.cursor = hovered ? 'pointer' : hoveredLine ? 'grab' : 'default';
    showTooltip(hovered);
    if (reduceMotion) draw();
  }

  banner.addEventListener('pointermove', onMove);
  banner.addEventListener('pointerdown', e => {
    if (e.target.closest('a, button, .banner-hero-card, .banner-legend, .banner-stats')) return;
    userInteracted = true;
    setPointer(e);
    const isTouch = e.pointerType === 'touch';
    const hitRadius = isTouch ? 30 : 18;
    const lineExtra = isTouch ? 14 : 8;
    const node = pick(mouse.x, mouse.y, hitRadius) || pickLine(mouse.x, mouse.y, lineExtra);
    if (!node) {
      if (isTouch) { hovered = null; showTooltip(null); }
      return;
    }
    hovered = items.includes(node) ? node : null;
    showTooltip(hovered);
    Object.assign(drag, { node, startX: mouse.x, startY: mouse.y, lastX: mouse.x, lastY: mouse.y, moved: false, vx: 0, vy: 0 });
    if (!isTouch) {
      banner.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  });
  function endDrag(e) {
    if (!drag.node) return;
    const { node, moved } = drag;
    if (moved) {
      node.vx = drag.vx; node.vy = drag.vy;
      const noteIdx = Math.max(0, items.indexOf(node));
      playSoftBell(noteIdx);
      ripples.push({ x: node.x, y: node.y, r: node.r + 4, life: 0.7 });
    }
    drag.node = null;
    if (banner.hasPointerCapture && banner.hasPointerCapture(e.pointerId)) banner.releasePointerCapture(e.pointerId);
    if (!moved && e.type === 'pointerup' && node.url) { window.location.href = node.url; return; }
    onMove(e);
  }
  banner.addEventListener('pointerup', endDrag);
  banner.addEventListener('pointercancel', endDrag);
  banner.addEventListener('pointerleave', () => {
    if (drag.node) return;
    mouse.active = false; hovered = null; hoveredLine = null; showTooltip(null); banner.style.cursor = 'default';
    if (reduceMotion) draw();
  });

  // Impulso por duplo clique em área vazia do banner
  banner.addEventListener('dblclick', (e) => {
    if (e.target.closest('a, button, .banner-hero-card, .banner-legend, .banner-stats')) return;
    const rect = canvas.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    if (pick(rx, ry, 20) || pickLine(rx, ry, 10)) return;

    ripples.push({ x: rx, y: ry, r: 8, life: 1 });
    playSoftBell(Math.round(rx + ry));
    items.forEach(it => {
      const dx = it.x - rx;
      const dy = it.y - ry;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 220) {
        const push = ((220 - dist) / 220) * 6.5;
        it.vx += (dx / dist) * push;
        it.vy += (dy / dist) * push;
      }
    });
    if (reduceMotion) draw();
  });

  // Alternar entre "Órbita livre" e "Agrupar por tipo"
  const modeBtn = document.getElementById('banner-mode-btn');
  if (modeBtn) {
    modeBtn.hidden = false;
    modeBtn.addEventListener('click', () => {
      groupByType = !groupByType;
      modeBtn.setAttribute('aria-pressed', groupByType ? 'true' : 'false');
      modeBtn.classList.toggle('active', groupByType);
      modeBtn.textContent = groupByType ? 'Órbita livre' : 'Agrupar por tipo';
      if (reduceMotion) {
        for (let i = 0; i < 120; i++) step(1);
        draw();
      }
    });
  }

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
