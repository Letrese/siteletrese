/**
 * LETRESE - Interatividade e Filtros Client-side
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Menu Mobile Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isExpanded = navMenu.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // 2. Filtro Interativo de Membros por Categoria
  const memberFilterBtns = document.querySelectorAll('[data-member-filter]');
  const memberCards = document.querySelectorAll('.member-card[data-category]');
  const memberSearchInput = document.getElementById('member-search');

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
  }

  if (memberFilterBtns.length > 0) {
    memberFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        memberFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterMembers();
      });
    });
  }

  if (memberSearchInput) {
    memberSearchInput.addEventListener('input', filterMembers);
  }

  // 3. Filtro Interativo de Projetos por Status
    const projectCards = document.querySelectorAll('.project-item[data-status], .project-card[data-status]');
    const projectSearchInput = document.getElementById('project-search');

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
  }

  if (projectFilterBtns.length > 0) {
    projectFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        projectFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterProjects();
      });
    });
  }

  if (projectSearchInput) {
    projectSearchInput.addEventListener('input', filterProjects);
  }
});
