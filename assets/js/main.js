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
});
