/**
 * LETRESE - Interatividade, Acessibilidade e Filtros Client-side
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Menu Mobile Toggle com Suporte a Teclado (Acessibilidade)
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    const closeMobileMenu = (restoreFocus = false) => {
      if (!navMenu.classList.contains('open')) return;
      navMenu.classList.remove('open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
      if (restoreFocus) navToggle.focus();
    };

    navToggle.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('open');
      document.body.classList.toggle('nav-open', isExpanded);
      navToggle.setAttribute('aria-expanded', isExpanded);
      navToggle.setAttribute('aria-label', isExpanded ? 'Fechar menu' : 'Abrir menu');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMobileMenu(false));
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !e.target.closest('.navbar')) {
        closeMobileMenu(false);
      }
    });

    // Fechar menu mobile com tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu(true);
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

  // 4. Filtro Interativo de Atividades por Contexto, Ano, Ordenação, Tags e Busca
  const activityFilterBtns = document.querySelectorAll('[data-activity-filter]');
  const activitiesList = document.getElementById('activities-list');
  const activityCards = Array.from(document.querySelectorAll('.activity-item[data-context]'));
  const activitySearchInput = document.getElementById('activity-search');
  const activitySearchClear = document.getElementById('activity-search-clear');
  const activityYearFilter = document.getElementById('activity-year-filter');
  const activitySortSelect = document.getElementById('activity-sort');
  const activityTagBar = document.getElementById('activity-tag-bar');
  const activityTagList = document.getElementById('activity-tag-list');
  const activityResultsCount = document.getElementById('activity-results-count');
  const activityResetBtn = document.getElementById('activity-reset-filters');
  const activityEmptyResetBtn = document.getElementById('activity-empty-reset');

  let selectedTag = 'all';

  function sortActivityCards() {
    if (!activitiesList || activityCards.length === 0) return;
    const order = activitySortSelect ? activitySortSelect.value : 'desc';
    const sorted = [...activityCards].sort((a, b) => {
      const da = a.getAttribute('data-date') ? new Date(a.getAttribute('data-date')).getTime() : 0;
      const db = b.getAttribute('data-date') ? new Date(b.getAttribute('data-date')).getTime() : 0;
      return order === 'asc' ? da - db : db - da;
    });
    sorted.forEach(card => activitiesList.appendChild(card));
  }

  function updateTagUrlParam(tag) {
    if (!window.history || !window.history.replaceState) return;
    const url = new URL(window.location.href);
    if (tag && tag !== 'all') {
      url.searchParams.set('tag', tag);
    } else {
      url.searchParams.delete('tag');
    }
    window.history.replaceState({}, '', url.toString());
  }

  function syncTagButtonsState() {
    if (!activityTagList) return;
    const tagBtns = activityTagList.querySelectorAll('[data-activity-tag]');
    tagBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-activity-tag').toLowerCase() === selectedTag.toLowerCase();
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function filterActivities() {
    const activeBtn = document.querySelector('[data-activity-filter].active');
    const selectedContext = activeBtn ? activeBtn.getAttribute('data-activity-filter') : 'all';
    const selectedYear = activityYearFilter ? activityYearFilter.value : 'all';
    const searchQuery = activitySearchInput ? activitySearchInput.value.toLowerCase().trim() : '';

    let visibleCount = 0;

    activityCards.forEach(card => {
      const cardContext = card.getAttribute('data-context');
      const cardYear = card.getAttribute('data-year') || '';
      const cardTagsRaw = card.getAttribute('data-tags') || '';
      const cardTags = cardTagsRaw
        .split('|')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);
      const cardTitle = (card.querySelector('.activity-item-title')?.textContent || '').toLowerCase();
      const cardSummary = (card.querySelector('.activity-summary')?.textContent || '').toLowerCase();
      const cardMeta = (card.querySelector('.activity-meta, .activity-authors-inline')?.textContent || '').toLowerCase();
      const cardBadge = (card.querySelector('.activity-eyebrow, .status-badge')?.textContent || '').toLowerCase();

      const matchesContext = selectedContext === 'all' || cardContext === selectedContext;
      const matchesYear = selectedYear === 'all' || cardYear === selectedYear;
      const matchesTag = selectedTag === 'all' || cardTags.includes(selectedTag.toLowerCase());
      const matchesSearch = !searchQuery ||
        cardTitle.includes(searchQuery) ||
        cardSummary.includes(searchQuery) ||
        cardMeta.includes(searchQuery) ||
        cardBadge.includes(searchQuery) ||
        cardTags.some(t => t.includes(searchQuery));

      if (matchesContext && matchesYear && matchesTag && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const noResultsMsg = document.getElementById('no-activities-msg');
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (activityResultsCount) {
      const label = visibleCount === 1 ? 'atividade' : 'atividades';
      activityResultsCount.textContent = `Mostrando ${visibleCount} de ${activityCards.length} ${label}`;
    }

    const hasActiveFilter = selectedContext !== 'all' || selectedYear !== 'all' || selectedTag !== 'all' || Boolean(searchQuery);
    if (activityResetBtn) {
      activityResetBtn.hidden = !hasActiveFilter;
    }

    if (activitySearchClear && activitySearchInput) {
      activitySearchClear.style.display = activitySearchInput.value ? 'flex' : 'none';
    }
  }

  function resetAllActivityFilters() {
    activityFilterBtns.forEach((b, idx) => {
      const isFirst = b.getAttribute('data-activity-filter') === 'all' || idx === 0;
      b.classList.toggle('active', isFirst);
      b.setAttribute('aria-pressed', isFirst ? 'true' : 'false');
    });
    if (activityYearFilter) activityYearFilter.value = 'all';
    if (activitySearchInput) activitySearchInput.value = '';
    selectedTag = 'all';
    syncTagButtonsState();
    updateTagUrlParam('all');
    filterActivities();
  }

  if (activityResetBtn) {
    activityResetBtn.addEventListener('click', resetAllActivityFilters);
  }
  if (activityEmptyResetBtn) {
    activityEmptyResetBtn.addEventListener('click', resetAllActivityFilters);
  }

  if (activityCards.length > 0 && activityYearFilter) {
    const years = Array.from(new Set(
      activityCards.map(c => c.getAttribute('data-year')).filter(Boolean)
    )).sort((a, b) => b.localeCompare(a));

    years.forEach(year => {
      const opt = document.createElement('option');
      opt.value = year;
      opt.textContent = year;
      activityYearFilter.appendChild(opt);
    });

    activityYearFilter.addEventListener('change', filterActivities);
  }

  if (activitySortSelect) {
    activitySortSelect.addEventListener('change', () => {
      sortActivityCards();
      filterActivities();
    });
  }

  function selectActivityTag(tag) {
    selectedTag = tag || 'all';
    syncTagButtonsState();
    updateTagUrlParam(selectedTag);
    filterActivities();
  }

  if (activityCards.length > 0 && activityTagBar && activityTagList) {
    const tagMap = new Map();
    activityCards.forEach(card => {
      const raw = card.getAttribute('data-tags') || '';
      raw.split('|').map(t => t.trim()).filter(Boolean).forEach(tag => {
        const key = tag.toLowerCase();
        if (!tagMap.has(key)) {
          tagMap.set(key, tag);
        }
      });
    });

    if (tagMap.size > 0) {
      const allBtn = document.createElement('button');
      allBtn.type = 'button';
      allBtn.className = 'tag-filter-btn active';
      allBtn.setAttribute('data-activity-tag', 'all');
      allBtn.setAttribute('aria-pressed', 'true');
      allBtn.textContent = 'Todas as tags';
      allBtn.addEventListener('click', () => selectActivityTag('all'));
      activityTagList.appendChild(allBtn);

      Array.from(tagMap.values())
        .sort((a, b) => a.localeCompare(b, 'pt-BR'))
        .forEach(tag => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'tag-filter-btn';
          btn.setAttribute('data-activity-tag', tag);
          btn.setAttribute('aria-pressed', 'false');
          btn.textContent = tag;
          btn.addEventListener('click', () => {
            const isSame = selectedTag.toLowerCase() === tag.toLowerCase();
            selectActivityTag(isSame ? 'all' : tag);
          });
          activityTagList.appendChild(btn);
        });

      activityTagBar.hidden = false;
    }

    const initialTagParam = new URLSearchParams(window.location.search).get('tag');
    if (initialTagParam && tagMap.has(initialTagParam.trim().toLowerCase())) {
      selectedTag = tagMap.get(initialTagParam.trim().toLowerCase());
      syncTagButtonsState();
      filterActivities();
    }

    const initialQParam = new URLSearchParams(window.location.search).get('q');
    if (initialQParam && activitySearchInput) {
      activitySearchInput.value = initialQParam;
      filterActivities();
    }

    document.querySelectorAll('[data-tag-link]').forEach(link => {
      link.addEventListener('click', (e) => {
        const tag = link.getAttribute('data-tag-link');
        if (tag && activityTagList) {
          e.preventDefault();
          selectActivityTag(tag);
          activityTagBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  // Destaque da tag correspondente ao passar o mouse sobre a forma 3D no card ou no hero da atividade
  document.querySelectorAll('.activity-item, .activity-hero-grid').forEach(scope => {
    const shapeNodes = scope.querySelectorAll('[data-shape-tag]');
    const tagLinks = scope.querySelectorAll('.activity-tag-link[data-tag-link]');
    if (shapeNodes.length === 0 || tagLinks.length === 0) return;

    function highlightTag(tagName, active) {
      const target = (tagName || '').trim().toLowerCase();
      tagLinks.forEach(link => {
        const linkTag = (link.getAttribute('data-tag-link') || '').trim().toLowerCase();
        if (linkTag === target) {
          link.classList.toggle('is-highlighted', active);
        }
      });
    }

    shapeNodes.forEach(shape => {
      const tagName = shape.getAttribute('data-shape-tag');
      shape.addEventListener('mouseenter', () => {
        shape.classList.add('is-shape-active');
        highlightTag(tagName, true);
      });
      shape.addEventListener('mouseleave', () => {
        shape.classList.remove('is-shape-active');
        highlightTag(tagName, false);
      });
    });
  });

  // Destaque bidirecional: Tag (na barra de filtros, card ou hero) -> Forma correspondente
  function highlightShapesByTag(tagName, active) {
    const target = (tagName || '').trim().toLowerCase();
    if (!target || target === 'all') return;
    document.querySelectorAll('[data-shape-tag]').forEach(shape => {
      const sTag = (shape.getAttribute('data-shape-tag') || '').trim().toLowerCase();
      if (sTag === target) {
        shape.classList.toggle('is-shape-active', active);
      }
    });
  }

  document.addEventListener('mouseover', (e) => {
    const tagEl = e.target.closest('[data-activity-tag], [data-tag-link]');
    if (!tagEl) return;
    const tagVal = tagEl.getAttribute('data-activity-tag') || tagEl.getAttribute('data-tag-link');
    highlightShapesByTag(tagVal, true);
  });

  document.addEventListener('mouseout', (e) => {
    const tagEl = e.target.closest('[data-activity-tag], [data-tag-link]');
    if (!tagEl) return;
    const tagVal = tagEl.getAttribute('data-activity-tag') || tagEl.getAttribute('data-tag-link');
    highlightShapesByTag(tagVal, false);
  });

  document.addEventListener('focusin', (e) => {
    const tagEl = e.target.closest('[data-activity-tag], [data-tag-link]');
    if (!tagEl) return;
    const tagVal = tagEl.getAttribute('data-activity-tag') || tagEl.getAttribute('data-tag-link');
    highlightShapesByTag(tagVal, true);
  });

  document.addEventListener('focusout', (e) => {
    const tagEl = e.target.closest('[data-activity-tag], [data-tag-link]');
    if (!tagEl) return;
    const tagVal = tagEl.getAttribute('data-activity-tag') || tagEl.getAttribute('data-tag-link');
    highlightShapesByTag(tagVal, false);
  });

  // Física de arraste e retorno elástico para as formas 3D no hero da atividade
  const heroIllustration = document.querySelector('.activity-hero-illustration svg');
  if (heroIllustration) {
    const heroShapes = Array.from(heroIllustration.querySelectorAll('.poly-shape-node'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const states = heroShapes.map((shape, idx) => {
      const shapeIdx = shape.getAttribute('data-shape-idx') || String(idx);
      const tf = shape.getAttribute('transform') || '';
      const tMatch = tf.match(/translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
      const sMatch = tf.match(/scale\(\s*([-\d.]+)\s*\)/);
      const baseX = tMatch ? parseFloat(tMatch[1]) : 0;
      const baseY = tMatch ? parseFloat(tMatch[2]) : 0;
      const baseScale = sMatch ? parseFloat(sMatch[1]) : 1;

      const prevEl = shape.previousElementSibling;
      let shadowBaseX = baseX;
      let shadowBaseY = baseY;
      if (prevEl) {
        const stf = prevEl.getAttribute('transform') || '';
        const sm = stf.match(/translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/);
        if (sm) {
          shadowBaseX = parseFloat(sm[1]);
          shadowBaseY = parseFloat(sm[2]);
        }
      }

      const linksFrom = Array.from(heroIllustration.querySelectorAll(`[data-link-from="${shapeIdx}"]`));
      const linksTo = Array.from(heroIllustration.querySelectorAll(`[data-link-to="${shapeIdx}"]`));
      const satLine = heroIllustration.querySelector(`[data-sat-line="${shapeIdx}"]`);
      const satNode = heroIllustration.querySelector(`[data-sat-node="${shapeIdx}"]`);
      const orbits = Array.from(heroIllustration.querySelectorAll(`[data-orbit-parent="${shapeIdx}"]`));

      return {
        el: shape,
        shadowEl: prevEl,
        linksFrom,
        linksTo,
        satLine,
        satNode,
        orbits,
        baseX,
        baseY,
        baseScale,
        shadowBaseX,
        shadowBaseY,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        dragging: false,
        lastClientX: 0,
        lastClientY: 0
      };
    });

    let rafId = null;
    let chimeCtx = null;
    const chimeNotes = [523.25, 587.33, 659.25, 783.99, 880.0];

    function playSoftBell(idx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      try {
        if (!chimeCtx) chimeCtx = new AudioCtx();
        if (chimeCtx.state === 'suspended') chimeCtx.resume();

        const now = chimeCtx.currentTime;
        const freq = chimeNotes[idx % chimeNotes.length];

        const osc1 = chimeCtx.createOscillator();
        const osc2 = chimeCtx.createOscillator();
        const gain = chimeCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.0, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        const overtoneGain = chimeCtx.createGain();
        overtoneGain.gain.setValueAtTime(0.22, now);

        osc1.connect(gain);
        osc2.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(chimeCtx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.95);
        osc2.stop(now + 0.95);
      } catch (_) {}

      if (heroBoundsEl && !reduceMotion) {
        heroBoundsEl.classList.remove('is-chime-pulsing');
        void heroBoundsEl.offsetWidth;
        heroBoundsEl.classList.add('is-chime-pulsing');
        clearTimeout(heroBoundsEl._chimeTimer);
        heroBoundsEl._chimeTimer = setTimeout(() => {
          heroBoundsEl.classList.remove('is-chime-pulsing');
        }, 1100);
      }
    }

    const heroBoundsEl = heroIllustration.closest('.page-header') || heroIllustration;

    function getHeroSvgBounds(st) {
      const svgRect = heroIllustration.getBoundingClientRect();
      const boxRect = heroBoundsEl.getBoundingClientRect();
      if (!svgRect.width || !svgRect.height) {
        return { minX: 50, maxX: 590, minY: 50, maxY: 310 };
      }
      const scaleX = 640 / svgRect.width;
      const scaleY = 360 / svgRect.height;
      const pad = 52 * st.baseScale;
      return {
        minX: (boxRect.left - svgRect.left) * scaleX + pad,
        maxX: (boxRect.right - svgRect.left) * scaleX - pad,
        minY: (boxRect.top - svgRect.top) * scaleY + pad,
        maxY: (boxRect.bottom - svgRect.top) * scaleY - pad
      };
    }

    function clampAndCollide(st, bounce) {
      const b = getHeroSvgBounds(st);
      const restitution = bounce ? 0.65 : 0;
      let absX = st.baseX + st.dx;
      let absY = st.baseY + st.dy;

      if (absX < b.minX) {
        absX = b.minX;
        if (bounce && st.vx < 0) st.vx = -st.vx * restitution;
      } else if (absX > b.maxX) {
        absX = b.maxX;
        if (bounce && st.vx > 0) st.vx = -st.vx * restitution;
      }

      if (absY < b.minY) {
        absY = b.minY;
        if (bounce && st.vy < 0) st.vy = -st.vy * restitution;
      } else if (absY > b.maxY) {
        absY = b.maxY;
        if (bounce && st.vy > 0) st.vy = -st.vy * restitution;
      }

      st.dx = absX - st.baseX;
      st.dy = absY - st.baseY;
    }

    function applyState(st) {
      const curX = st.baseX + st.dx;
      const curY = st.baseY + st.dy;
      st.el.setAttribute(
        'transform',
        `translate(${curX.toFixed(2)}, ${curY.toFixed(2)}) scale(${st.baseScale})`
      );
      if (st.shadowEl) {
        st.shadowEl.setAttribute(
          'transform',
          `translate(${(st.shadowBaseX + st.dx * 0.9).toFixed(2)}, ${(st.shadowBaseY + st.dy * 0.18).toFixed(2)})`
        );
      }
      st.linksFrom.forEach(line => {
        line.setAttribute('x1', curX.toFixed(2));
        line.setAttribute('y1', curY.toFixed(2));
      });
      st.linksTo.forEach(line => {
        line.setAttribute('x2', curX.toFixed(2));
        line.setAttribute('y2', curY.toFixed(2));
      });
      st.orbits.forEach(orb => {
        orb.setAttribute('cx', curX.toFixed(2));
        orb.setAttribute('cy', curY.toFixed(2));
      });
      if (st.satLine && st.satNode) {
        const ox = parseFloat(st.satLine.getAttribute('data-ox') || '0');
        const oy = parseFloat(st.satLine.getAttribute('data-oy') || '0');
        const sx = curX + ox * 0.75 + st.dx * 0.15;
        const sy = curY + oy * 0.75 + st.dy * 0.15;
        st.satLine.setAttribute('x1', curX.toFixed(2));
        st.satLine.setAttribute('y1', curY.toFixed(2));
        st.satLine.setAttribute('x2', sx.toFixed(2));
        st.satLine.setAttribute('y2', sy.toFixed(2));
        st.satNode.setAttribute('transform', `translate(${sx.toFixed(2)}, ${sy.toFixed(2)})`);
      }
    }

    function tickPhysics() {
      let anyMoving = false;
      const stiffness = 0.12;
      const damping = 0.84;

      states.forEach((st, idx) => {
        if (st.dragging) {
          anyMoving = true;
          return;
        }
        if (Math.abs(st.dx) > 0.12 || Math.abs(st.dy) > 0.12 || Math.abs(st.vx) > 0.12 || Math.abs(st.vy) > 0.12) {
          if (reduceMotion) {
            st.dx = 0; st.dy = 0; st.vx = 0; st.vy = 0;
          } else {
            st.vx = (st.vx - st.dx * stiffness) * damping;
            st.vy = (st.vy - st.dy * stiffness) * damping;
            st.dx += st.vx;
            st.dy += st.vy;
            clampAndCollide(st, true);
            anyMoving = true;
          }
          applyState(st);
        } else if (st.dx !== 0 || st.dy !== 0) {
          st.dx = 0; st.dy = 0; st.vx = 0; st.vy = 0;
          applyState(st);
        }
      });

      if (anyMoving) {
        rafId = requestAnimationFrame(tickPhysics);
      } else {
        rafId = null;
      }
    }

    function startPhysicsLoop() {
      if (!rafId) rafId = requestAnimationFrame(tickPhysics);
    }

    states.forEach((st, idx) => {
      st.el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        st.dragging = true;
        st.vx = 0;
        st.vy = 0;
        st.lastClientX = e.clientX;
        st.lastClientY = e.clientY;
        st.el.classList.add('is-dragging');
        if (st.el.setPointerCapture) {
          try { st.el.setPointerCapture(e.pointerId); } catch (_) {}
        }
        startPhysicsLoop();
      });

      st.el.addEventListener('pointermove', (e) => {
        if (!st.dragging) return;
        const rect = heroIllustration.getBoundingClientRect();
        const scaleX = rect.width ? 640 / rect.width : 1;
        const scaleY = rect.height ? 360 / rect.height : 1;
        const stepX = (e.clientX - st.lastClientX) * scaleX;
        const stepY = (e.clientY - st.lastClientY) * scaleY;

        st.vx = st.vx * 0.4 + stepX * 0.6;
        st.vy = st.vy * 0.4 + stepY * 0.6;
        st.dx += stepX;
        st.dy += stepY;
        clampAndCollide(st, false);
        st.lastClientX = e.clientX;
        st.lastClientY = e.clientY;
        applyState(st);
      });

      function releaseShape(e) {
        if (!st.dragging) return;
        st.dragging = false;
        st.el.classList.remove('is-dragging');
        if (st.el.hasPointerCapture && st.el.hasPointerCapture(e.pointerId)) {
          try { st.el.releasePointerCapture(e.pointerId); } catch (_) {}
        }
        if (Math.hypot(st.dx, st.dy) > 4) {
          playSoftBell(idx);
        }
        startPhysicsLoop();
      }

      st.el.addEventListener('pointerup', releaseShape);
      st.el.addEventListener('pointercancel', releaseShape);

      // "Rolar o dado" no duplo clique: gira a forma e mostra apenas a tag correspondente
      st.el.addEventListener('dblclick', () => {
        const tagLabel = st.el.getAttribute('data-shape-tag') || '';
        const floatInner = st.el.querySelector('.poly-float');
        if (floatInner && !reduceMotion) {
          floatInner.classList.remove('is-rolling');
          void floatInner.offsetWidth;
          floatInner.classList.add('is-rolling');
          floatInner.addEventListener('animationend', () => {
            floatInner.classList.remove('is-rolling');
          }, { once: true });
        }

        const wrap = heroIllustration.closest('.activity-hero-illustration');
        if (wrap && tagLabel) {
          let badge = wrap.querySelector('.hero-dice-badge');
          if (!badge) {
            badge = document.createElement('div');
            badge.className = 'hero-dice-badge';
            badge.setAttribute('role', 'status');
            badge.setAttribute('aria-live', 'polite');
            wrap.appendChild(badge);
          }
          badge.textContent = tagLabel;
          badge.classList.add('is-visible');
          clearTimeout(badge._hideTimer);
          badge._hideTimer = setTimeout(() => {
            badge.classList.remove('is-visible');
          }, 2800);
        }
      });
    });
  }

  if (activityFilterBtns.length > 0) {
    activityFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activityFilterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        filterActivities();
      });
    });
  }

  if (activitySearchInput) {
    activitySearchInput.addEventListener('input', filterActivities);
  }

  if (activitySearchClear && activitySearchInput) {
    activitySearchClear.addEventListener('click', () => {
      activitySearchInput.value = '';
      filterActivities();
      activitySearchInput.focus();
    });
  }

  // 5. Galeria Lightbox Acessível para Imagens das Atividades
  const galleryTriggers = Array.from(document.querySelectorAll('.activity-gallery-trigger'));
  const lightbox = document.getElementById('activity-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxBackdrop = document.querySelector('[data-lightbox-close]');

  if (galleryTriggers.length > 0 && lightbox && lightboxImg) {
    let currentGalleryIndex = 0;
    let lastFocusedTrigger = null;

    function updateLightbox(index) {
      currentGalleryIndex = (index + galleryTriggers.length) % galleryTriggers.length;
      const trigger = galleryTriggers[currentGalleryIndex];
      const src = trigger.getAttribute('data-gallery-src') || '';
      const alt = trigger.getAttribute('data-gallery-alt') || '';
      const caption = trigger.getAttribute('data-gallery-caption') || alt;

      lightboxImg.src = src;
      lightboxImg.alt = alt;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentGalleryIndex + 1} de ${galleryTriggers.length}`;
      }

      const showNav = galleryTriggers.length > 1;
      if (lightboxPrev) lightboxPrev.style.display = showNav ? 'flex' : 'none';
      if (lightboxNext) lightboxNext.style.display = showNav ? 'flex' : 'none';
    }

    function openLightbox(index, triggerEl) {
      lastFocusedTrigger = triggerEl || document.activeElement;
      updateLightbox(index);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
        lastFocusedTrigger.focus();
      }
    }

    galleryTriggers.forEach((trigger, idx) => {
      trigger.addEventListener('click', () => openLightbox(idx, trigger));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => updateLightbox(currentGalleryIndex - 1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => updateLightbox(currentGalleryIndex + 1));

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && galleryTriggers.length > 1) {
        updateLightbox(currentGalleryIndex - 1);
      } else if (e.key === 'ArrowRight' && galleryTriggers.length > 1) {
        updateLightbox(currentGalleryIndex + 1);
      }
    });
  }

  // Botão "Ver melhor" na visualização para desvanecer o card Sobre no lugar
  const heroSobreCard = document.getElementById('hero-sobre-card');
  const heroCardToggle = document.getElementById('hero-card-toggle');
  if (heroSobreCard && heroCardToggle) {
    heroCardToggle.addEventListener('click', () => {
      const collapsed = heroSobreCard.classList.toggle('is-collapsed');
      heroSobreCard.setAttribute('aria-hidden', collapsed ? 'true' : 'false');
      heroCardToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
      heroCardToggle.classList.toggle('active', collapsed);
      heroCardToggle.textContent = collapsed ? 'Mostrar sobre' : 'Ver melhor';
    });
  }

  // Efeito de comemoração com partículas ao clicar no botão de download
  const reduceMotionPref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', () => {
      if (reduceMotionPref) return;
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const colors = ['#37bfa5', '#125c4e', '#bf3752', '#7be0cb', '#ea8b9f'];
      const shapes = ['circle', 'square', 'diamond'];
      const count = 14;

      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        const shape = shapes[i % shapes.length];
        p.className = `download-particle download-particle--${shape}`;
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const dist = 36 + Math.random() * 44;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 14;
        const rot = Math.round((Math.random() - 0.5) * 240);

        p.style.left = `${cx}px`;
        p.style.top = `${cy}px`;
        p.style.backgroundColor = colors[i % colors.length];
        p.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        p.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        p.style.setProperty('--rot', `${rot}deg`);
        document.body.appendChild(p);

        const cleanup = () => { if (p.parentNode) p.remove(); };
        p.addEventListener('animationend', cleanup, { once: true });
        setTimeout(cleanup, 750);
      }
    });
  });
});
