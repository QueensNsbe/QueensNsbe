// NSBE Queen's — shared site behaviour
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll progress bar ---------- */
  const progress = document.querySelector('.scroll-progress');
  const nav = document.querySelector('.site-nav');
  const backToTop = document.querySelector('.back-to-top');

  function onScroll() {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-scrolled', scrolled > 40);
    if (backToTop) backToTop.classList.toggle('is-visible', scrolled > 600);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-open');
      links.classList.toggle('is-open');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('is-open');
      links.classList.remove('is-open');
    }));
  }

  /* ---------- Hero parallax ---------- */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
      }
    }, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Counters (re-triggers every time they scroll into view) ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    if (el.dataset.animating === '1') return;
    el.dataset.animating = '1';
    const target = parseFloat(el.getAttribute('data-count'));
    const duration = 1400;
    const start = performance.now();
    const isFloat = el.getAttribute('data-count').includes('.');
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString();
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
        el.dataset.animating = '0';
      }
    }
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          animateCount(el);
        } else if (el.dataset.animating !== '1') {
          el.textContent = '0';
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- IntersectionObserver safety net ---------- */
  // Some embedded/preview browsers never deliver IO callbacks. Without this,
  // every .reveal element would stay at opacity:0 and the page would look empty.
  // Probe IO health, and if it is not delivering, drive reveals/counters on scroll.
  let ioWorks = false;
  if ('IntersectionObserver' in window) {
    // document.body is on-screen by definition, so a healthy IO must report it
    // as intersecting. Some panes fire the callback but always say false.
    const probe = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) ioWorks = true;
      probe.disconnect();
    });
    probe.observe(document.body);
  }
  setTimeout(() => {
    if (ioWorks) return;
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };
    const sweep = () => {
      revealEls.forEach(el => { if (inView(el)) el.classList.add('is-visible'); });
      counters.forEach(el => { if (inView(el)) animateCount(el); });
    };
    document.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
    sweep();
  }, 400);

  /* ---------- Exec card 3D tilt ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.exec-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 12}deg) rotateX(${-py * 12}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Testimonial slider ---------- */
  document.querySelectorAll('.testimonial-slider').forEach(slider => {
    const track = slider.querySelector('.testimonial-slides');
    const slides = slider.querySelectorAll('.testimonial-slide');
    const dotsWrap = slider.querySelector('.testimonial-nav');
    const prevBtn = slider.querySelector('.testimonial-arrow.prev');
    const nextBtn = slider.querySelector('.testimonial-arrow.next');
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', () => go(i));
      dotsWrap && dotsWrap.appendChild(dot);
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotsWrap && dotsWrap.querySelectorAll('.testimonial-dot').forEach((d, di) => d.classList.toggle('active', di === index));
      resetTimer();
    }
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 6000);
    }
    prevBtn && prevBtn.addEventListener('click', () => go(index - 1));
    nextBtn && nextBtn.addEventListener('click', () => go(index + 1));

    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    let touchStartX = null;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
      touchStartX = null;
    }, { passive: true });

    resetTimer();
  });

  /* ---------- Smooth in-page anchor scroll ---------- */
  document.querySelectorAll('a[href*="#"]').forEach(a => {
    const [pagePart, hash] = a.getAttribute('href').split('#');
    if (!hash) return;
    const samePage = pagePart === '' || pagePart === window.location.pathname.replace(/\/+$/, '');
    if (!samePage) return;
    a.addEventListener('click', (e) => {
      const target = document.getElementById(hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Active nav link ---------- */
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.nav-links a[href^="/"]').forEach(a => {
    const href = a.getAttribute('href').replace(/\/+$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href + '/'))) a.classList.add('active');
  });

  /* ---------- Quick-nav scroll spy (About page) ---------- */
  const quickNavLinks = document.querySelectorAll('.quick-nav a');
  if (quickNavLinks.length && 'IntersectionObserver' in window) {
    const sections = Array.from(quickNavLinks).map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          quickNavLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-140px 0px -70% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Events calendar ---------- */
  const calGrid = document.getElementById('calGrid');
  if (calGrid) {
    const calDataEl = document.getElementById('calendar-data');
    let calEvents = [];
    try {
      calEvents = calDataEl ? JSON.parse(calDataEl.textContent) : [];
    } catch (err) {
      calEvents = [];
    }
    calEvents.sort((a, b) => a.date.localeCompare(b.date));

    const calTitle = document.getElementById('calTitle');
    const calPrev = document.getElementById('calPrev');
    const calNext = document.getElementById('calNext');
    const calToday = document.getElementById('calToday');
    const calEventList = document.getElementById('calEventList');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let viewYear = now.getFullYear();
    let viewMonth = now.getMonth();
    let selectedDate = null;

    const eventsOn = (dateStr) => calEvents.filter(e => e.date === dateStr);

    function renderCalendar() {
      calTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;
      calGrid.innerHTML = '';
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day is-empty';
        calGrid.appendChild(empty);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = eventsOn(dateStr);
        const cell = document.createElement('div');
        cell.className = 'cal-day'
          + (dateStr === todayStr ? ' is-today' : '')
          + (dayEvents.length ? ' has-event' : '')
          + (dateStr === selectedDate ? ' is-selected' : '');
        cell.innerHTML = `<span>${d}</span>` + (dayEvents.length ? '<span class="dot"></span>' : '');
        if (dayEvents.length) {
          cell.addEventListener('click', () => {
            selectedDate = dateStr;
            renderCalendar();
            renderEventList();
          });
        }
        calGrid.appendChild(cell);
      }
    }

    function renderEventList() {
      calEventList.innerHTML = '';
      if (!calEvents.length) {
        calEventList.innerHTML = '<li class="cal-empty">No events logged yet — check back soon.</li>';
        return;
      }
      calEvents.forEach(e => {
        const li = document.createElement('li');
        const d = new Date(e.date + 'T00:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const item = document.createElement('div');
        item.className = 'cal-event-item' + (e.date === selectedDate ? ' is-active' : '');
        item.innerHTML = e.href
          ? `<div class="cal-event-date">${label}</div><a class="cal-event-title" href="${e.href}">${e.title}</a>`
          : `<div class="cal-event-date">${label}</div><div class="cal-event-title">${e.title}</div>`;
        item.addEventListener('click', () => {
          const [y, m] = e.date.split('-').map(Number);
          viewYear = y;
          viewMonth = m - 1;
          selectedDate = e.date;
          renderCalendar();
          renderEventList();
        });
        li.appendChild(item);
        calEventList.appendChild(li);
      });
    }

    calPrev.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    calNext.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });
    if (calToday) {
      calToday.addEventListener('click', () => {
        viewYear = now.getFullYear();
        viewMonth = now.getMonth();
        renderCalendar();
      });
    }

    renderCalendar();
    renderEventList();
  }
});
