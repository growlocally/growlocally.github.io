// Shared portfolio JS — nav, reveals, filters

(() => {
  // Sticky nav shadow
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-stuck', window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu
  const menuBtn = document.querySelector('.nav__menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
    // close on link click
    document.querySelectorAll('.nav__panel a').forEach(a =>
      a.addEventListener('click', () => nav.classList.remove('is-open'))
    );
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Filter chips
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const chips = group.querySelectorAll('.chip');
    const targetSel = group.getAttribute('data-filter-target');
    const items = document.querySelectorAll(targetSel + ' [data-tags]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const f = chip.getAttribute('data-filter');
        items.forEach(item => {
          const tags = (item.getAttribute('data-tags') || '').split(' ');
          const show = f === 'all' || tags.includes(f);
          item.style.display = show ? '' : 'none';
        });
      });
    });
  });

  // Year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
