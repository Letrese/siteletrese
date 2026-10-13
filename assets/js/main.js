/**
 * LETRESE - Interatividade, Acessibilidade e Filtros Client-side
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Menu Mobile Toggle com Suporte a Teclado (Acessibilidade)
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Fechar menu mobile com tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  // 2. Filtro Interativo de Membros por Categoria
  const memberFilterBtns = document.querySelectorAll('[data-member-filter]');
  const memberCards = document.querySelectorAll('.member-card[data-category]');
  const memberSearchInput = document.getElementById('member-search');
  const memberSearchClear = document.getElementById('search-clear');

  function filterMembers() {
    const activeBtn = document.querySelector('[data-member-filter].active');
    const selectedCategory = activeBtn ? activeBtn.getAttribute('data-member-filter') : 'all';
    const searchQuery = memberSearchInput ? memberSearchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;

    memberCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardName = (card.querySelector('.member-name')?.textContent || '').toLowerCase();
      const cardInterests = (card.querySelector('.member-interests')?.textContent || '').toLowerCase();
      const cardRole = (card.querySelector('.member-role')?.textContent || '').toLowerCase();

      const matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
      const matchesSearch = !searchQuery || 
        cardName.includes(searchQuery) || 
        cardInterests.includes(searchQuery) || 
        cardRole.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResultsMsg = document.getElementById('no-members-msg');
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (memberSearchClear && memberSearchInput) {
      memberSearchClear.style.display = memberSearchInput.value ? 'flex' : 'none';
    }
  }

  if (memberFilterBtns.length > 0) {
    memberFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        memberFilterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        filterMembers();
      });
    });
  }

  if (memberSearchInput) {
    memberSearchInput.addEventListener('input', filterMembers);
  }

  if (memberSearchClear && memberSearchInput) {
    memberSearchClear.addEventListener('click', () => {
      memberSearchInput.value = '';
      filterMembers();
      memberSearchInput.focus();
    });
  }

  // 3. Filtro Interativo de Projetos por Status
  const projectFilterBtns = document.querySelectorAll('[data-project-filter]');
  const projectCards = document.querySelectorAll('.project-item[data-status], .project-card[data-status]');
  const projectSearchInput = document.getElementById('project-search');
  const projectSearchClear = document.getElementById('project-search-clear');

  function filterProjects() {
    const activeBtn = document.querySelector('[data-project-filter].active');
    const selectedStatus = activeBtn ? activeBtn.getAttribute('data-project-filter') : 'all';
    const searchQuery = projectSearchInput ? projectSearchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;

    projectCards.forEach(card => {
      const cardStatus = card.getAttribute('data-status');
      const cardTitle = (card.querySelector('.project-item-title, .project-title')?.textContent || '').toLowerCase();
      const cardSummary = (card.querySelector('.project-summary')?.textContent || '').toLowerCase();
      const cardCoordinator = (card.querySelector('.project-meta, .project-coordinator')?.textContent || '').toLowerCase();

      const matchesStatus = selectedStatus === 'all' || cardStatus === selectedStatus;
      const matchesSearch = !searchQuery || 
        cardTitle.includes(searchQuery) || 
        cardSummary.includes(searchQuery) || 
        cardCoordinator.includes(searchQuery);

      if (matchesStatus && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResultsMsg = document.getElementById('no-projects-msg');
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (projectSearchClear && projectSearchInput) {
      projectSearchClear.style.display = projectSearchInput.value ? 'flex' : 'none';
    }
  }

  if (projectFilterBtns.length > 0) {
    projectFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        projectFilterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        filterProjects();
      });
    });
  }

  if (projectSearchInput) {
    projectSearchInput.addEventListener('input', filterProjects);
  }

  if (projectSearchClear && projectSearchInput) {
    projectSearchClear.addEventListener('click', () => {
      projectSearchInput.value = '';
      filterProjects();
      projectSearchInput.focus();
    });
  }

  // 3. Efeito de degradê suave com rastro amplo, fade in e fade out acompanhando o mouse pelo corpo
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const trailCanvas = document.createElement('canvas');
    trailCanvas.id = 'cursor-trail-canvas';
    document.body.appendChild(trailCanvas);
    const ctx = trailCanvas.getContext('2d');

    let width = 0, height = 0;
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      trailCanvas.width = width * dpr;
      trailCanvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const trail = [];
    const mouse = { x: -9999, y: -9999, active: false, intensity: 0 };
    let animId = null;
    let stopTimeout = null;

    function renderTrail() {
      ctx.clearRect(0, 0, width, height);

      // Fade in suave ao mover e fade out suave ao parar/sair
      const targetIntensity = mouse.active ? 1 : 0;
      mouse.intensity += (targetIntensity - mouse.intensity) * (targetIntensity > mouse.intensity ? 0.08 : 0.035);

      // Decaimento e desenho dos pontos do rastro (caminho suave)
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.life -= 0.022; // dura cerca de 1 a 1.2 segundos
        if (p.life <= 0.01) {
          trail.splice(i, 1);
          continue;
        }

        const r = p.radius;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(55, 191, 165, ${0.038 * p.life})`);
        g.addColorStop(0.4, `rgba(55, 191, 165, ${0.015 * p.life})`);
        g.addColorStop(0.75, `rgba(55, 191, 165, ${0.004 * p.life})`);
        g.addColorStop(1, 'rgba(55, 191, 165, 0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Foco principal do mouse (raio ampliado com fade in e fade out)
      if (mouse.intensity > 0.01 && mouse.x >= 0 && mouse.y >= 0) {
        const mainR = Math.max(340, Math.min(width, height) * 0.48);
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mainR);
        g.addColorStop(0, `rgba(55, 191, 165, ${0.045 * mouse.intensity})`);
        g.addColorStop(0.4, `rgba(55, 191, 165, ${0.018 * mouse.intensity})`);
        g.addColorStop(0.75, `rgba(55, 191, 165, ${0.005 * mouse.intensity})`);
        g.addColorStop(1, 'rgba(55, 191, 165, 0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mainR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Se ainda houver pontos vivos ou intensidade ativa, continua o loop; senão pausa para economizar recursos
      if (trail.length > 0 || mouse.intensity > 0.01) {
        animId = requestAnimationFrame(renderTrail);
      } else {
        animId = null;
      }
    }

    function startLoop() {
      if (!animId) {
        animId = requestAnimationFrame(renderTrail);
      }
    }

    document.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Adiciona ponto ao rastro se o ponteiro tiver percorrido uma distância mínima
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(mouse.x - last.x, mouse.y - last.y) > 12) {
        const radius = Math.max(300, Math.min(width, height) * 0.42);
        trail.push({ x: mouse.x, y: mouse.y, life: 1.0, radius });
        if (trail.length > 26) trail.shift();
      }

      startLoop();

      // Temporizador para fade out suave se o mouse ficar parado
      clearTimeout(stopTimeout);
      stopTimeout = setTimeout(() => {
        mouse.active = false;
        startLoop();
      }, 1000);
    }, { passive: true });

    document.addEventListener('pointerleave', () => {
      mouse.active = false;
      startLoop();
    });
  }
});
