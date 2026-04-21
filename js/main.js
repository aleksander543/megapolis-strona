document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     PAGE LOADER
     ============================================ */
  const loader = document.getElementById('pageLoader');
  if (loader) {
    document.body.classList.add('loading');
    const dismiss = () => {
      loader.classList.add('done');
      document.body.classList.remove('loading');
    };
    window.addEventListener('load', () => setTimeout(dismiss, 1800));
    setTimeout(dismiss, 3500); // fallback max wait
  }

  /* ============================================
     LENIS SMOOTH SCROLL
     ============================================ */
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    // Sync Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ============================================
     GSAP SCROLL TRIGGER SETUP
     ============================================ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance animation
    const heroTl = gsap.timeline({ delay: 0.3 });
    heroTl
      .to('.hero__tagline', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero__title', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.5')
      .to('.hero__subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to('.hero__search', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.hero__buttons', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55');

    // ── Sobha-style dome reveal ──
    // Hero stays fixed. Next section scales up from dome shape over it.
    const introDome = document.getElementById('introDome');
    const introReveal = document.getElementById('introReveal');

    if (introDome && introReveal) {
      gsap.to(introDome, {
        scale: 1,
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        ease: 'power1.out',
        scrollTrigger: {
          trigger: introReveal,
          start: 'top 50%',
          end: 'top 0%',
          scrub: 1,
        }
      });

      // Fade out hero subtitle early — elegant disappear
      gsap.to('.hero__subtitle', {
        opacity: 0,
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: introReveal,
          start: 'top 95%',
          end: 'top 65%',
          scrub: 1,
        }
      });

      // Fade out hero content as dome rises
      gsap.to('.hero__content', {
        y: -50,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: introReveal,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1,
        }
      });

      // Fade out scroll indicator early
      gsap.to('.hero__scroll-indicator', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: introReveal,
          start: 'top 95%',
          end: 'top 70%',
          scrub: 1,
        }
      });
    }

    /* ---- Hero video: obsługa natywnego <video> (autoplay + loop wbudowane w tag) ---- */
    (function initHeroVideoLoop() {
      const vid = document.getElementById('heroVideo');
      if (!vid) return;

      // Dla starego iframe YouTube: zachowaj obsługę postMessage (gdyby wrócić do YT)
      if (vid.tagName === 'IFRAME') {
        window.addEventListener('message', function(e) {
          try {
            const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
            if (d.event === 'onStateChange' && d.info === 0) {
              vid.contentWindow.postMessage('{"event":"command","func":"seekTo","args":[3,true]}', '*');
              vid.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            }
          } catch(ex) {}
        });
        vid.addEventListener('load', function() {
          vid.contentWindow.postMessage('{"event":"listening"}', '*');
        });
        return;
      }

      // Dla natywnego <video>: wymuś autoplay (niektóre przeglądarki blokują bez interakcji)
      if (vid.tagName === 'VIDEO') {
        vid.muted = true;           // muted=true jest wymagane dla autoplay w Chromie
        const tryPlay = () => vid.play().catch(() => {});
        tryPlay();
        // Retry po interakcji użytkownika (fallback, gdy autoplay policy zablokuje)
        ['click', 'touchstart', 'scroll'].forEach(evt => {
          document.addEventListener(evt, tryPlay, { once: true, passive: true });
        });
      }
    })();

    // Scroll-triggered reveals for [data-reveal]
    document.querySelectorAll('[data-reveal]').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            end: 'top 60%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Investment cards — staggered reveal with clip-path
    const invCards = document.querySelectorAll('.inv-card');
    invCards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.8,
          ease: 'power3.out',
          delay: i * 0.15,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
            onEnter: () => card.classList.add('revealed'),
          }
        }
      );
    });

    // Why cards — staggered
    const whyCards = document.querySelectorAll('.why__card');
    whyCards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: '.why__grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Review cards — staggered
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.12,
          scrollTrigger: {
            trigger: '.reviews__grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Programs cards — slide in from sides
    document.querySelectorAll('.programs__card').forEach((card, i) => {
      const dir = i % 2 === 0 ? -60 : 60;
      gsap.fromTo(card,
        { opacity: 0, x: dir },
        {
          opacity: 1, x: 0, duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Stats numbers — scale in
    document.querySelectorAll('.stats__item').forEach((item, i) => {
      gsap.fromTo(item,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: '.stats__grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    // Marquee speed on scroll
    const marqueeTrack = document.querySelector('.marquee__track');
    if (marqueeTrack) {
      gsap.to(marqueeTrack, {
        animationDuration: '15s',
        ease: 'none',
        scrollTrigger: {
          trigger: '.marquee',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          onUpdate: self => {
            marqueeTrack.style.animationDuration = (30 - self.progress * 15) + 's';
          }
        }
      });
    }

  } else {
    // Fallback: basic reveal without GSAP
    const reveals = document.querySelectorAll('[data-reveal]');
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => revealObs.observe(el));

    // Fallback hero animation
    document.querySelectorAll('.hero__tagline, .hero__title, .hero__subtitle, .hero__search, .hero__buttons').forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 200);
    });
  }

  /* ============================================
     SCROLL PROGRESS BAR
     ============================================ */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ============================================
     CUSTOM CURSOR
     ============================================ */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (cursor && follower && window.matchMedia('(pointer:fine)').matches) {
    let cx = 0, cy = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
    });

    (function followTick() {
      fx += (cx - fx) * 0.12;
      fy += (cy - fy) * 0.12;
      follower.style.left = fx + 'px';
      follower.style.top = fy + 'px';
      requestAnimationFrame(followTick);
    })();

    // Hover state on interactive elements
    document.querySelectorAll('a, button, .inv-card, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--hover');
        follower.classList.add('cursor--hover');
        document.body.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--hover');
        follower.classList.remove('cursor--hover');
        document.body.classList.remove('cursor--hover');
      });
    });

    // Magnetic effect on buttons
    document.querySelectorAll('.btn--pill, .header__cta-btn, .newsletter__btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============================================
     HEADER SCROLL STATE
     ============================================ */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ============================================
     MOBILE MENU
     ============================================ */
  const burger = document.getElementById('burgerBtn');
  const mobile = document.getElementById('mobileMenu');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const open = mobile.classList.toggle('active');
      burger.classList.toggle('active');
      document.body.classList.toggle('no-scroll', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => {
      // Linki z klasą mobile-menu__toggle tylko rozwijają submenu — nie zamykają drawera
      if (a.classList.contains('mobile-menu__toggle')) return;
      mobile.classList.remove('active');
      burger.classList.remove('active');
      document.body.classList.remove('no-scroll');
      if (lenis) lenis.start();
    }));
  }

  /* ============================================
     ANIMATED COUNTERS
     ============================================ */
  const counters = document.querySelectorAll('[data-count]');
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.count);
        const dur = 2500;
        const start = performance.now();
        const fmt = n => n.toLocaleString('pl-PL');
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(Math.round(target * ease));
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        cObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cObs.observe(c));

  /* ============================================
     FAQ ACCORDION
     ============================================ */
  document.querySelectorAll('.faq-item__question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  /* ============================================
     CONTACT FORM
     ============================================ */
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    if (!fd.get('name') || !fd.get('email') || !fd.get('privacy')) {
      alert('Proszę wypełnić wymagane pola.');
      return;
    }
    alert('Dziękujemy! Twoja wiadomość została wysłana.');
    form.reset();
  });

  /* ============================================
     SMOOTH ANCHOR SCROLL (via Lenis or native)
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ============================================
     COOKIE CONSENT
     ============================================ */
  const cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner && !localStorage.getItem('megapolis_cookies')) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1500);
    cookieBanner.querySelectorAll('[data-cookie]').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem('megapolis_cookies', btn.dataset.cookie);
        cookieBanner.classList.remove('visible');
      });
    });
  }

  /* ============================================
     CHATBOT
     ============================================ */
  const chatFab = document.getElementById('chatbotFab');
  const chatWin = document.getElementById('chatbotWindow');
  if (chatFab && chatWin) {
    chatFab.addEventListener('click', () => {
      chatFab.classList.toggle('open');
      chatWin.classList.toggle('open');
    });
    chatWin.querySelectorAll('.chatbot-msg--quick button').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = chatWin.querySelector('.chatbot-window__body');
        const userMsg = document.createElement('div');
        userMsg.className = 'chatbot-msg chatbot-msg--user';
        userMsg.style.cssText = 'align-self:flex-end; background:var(--accent); color:var(--bg); border-radius:var(--radius) var(--radius) 4px var(--radius);';
        userMsg.textContent = btn.textContent;
        body.appendChild(userMsg);
        btn.parentElement.remove();
        setTimeout(() => {
          const reply = document.createElement('div');
          reply.className = 'chatbot-msg chatbot-msg--bot';
          reply.textContent = 'Dziękujemy za wiadomość! Nasz doradca skontaktuje się z Tobą wkrótce. W pilnych sprawach dzwoń: 12 300 00 77.';
          body.appendChild(reply);
          body.scrollTop = body.scrollHeight;
        }, 800);
      });
    });
    const chatInput = chatWin.querySelector('.chatbot-window__input');
    if (chatInput) {
      const inp = chatInput.querySelector('input');
      const sendBtn = chatInput.querySelector('button');
      const sendMsg = () => {
        if (!inp.value.trim()) return;
        const body = chatWin.querySelector('.chatbot-window__body');
        const userMsg = document.createElement('div');
        userMsg.className = 'chatbot-msg chatbot-msg--user';
        userMsg.style.cssText = 'align-self:flex-end; background:var(--accent); color:var(--bg); border-radius:var(--radius) var(--radius) 4px var(--radius);';
        userMsg.textContent = inp.value;
        body.appendChild(userMsg);
        inp.value = '';
        setTimeout(() => {
          const reply = document.createElement('div');
          reply.className = 'chatbot-msg chatbot-msg--bot';
          reply.textContent = 'Dziękujemy za wiadomość! Nasz doradca odpowie najszybciej jak to możliwe.';
          body.appendChild(reply);
          body.scrollTop = body.scrollHeight;
        }, 800);
      };
      sendBtn.addEventListener('click', sendMsg);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(); });
    }
  }

  /* ============================================
     BACK TO TOP
     ============================================ */
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ============================================
     MORTGAGE CALCULATOR
     ============================================ */
  const calcForm = document.getElementById('mortgageCalc');
  if (calcForm) {
    const price = calcForm.querySelector('#calc-price');
    const down = calcForm.querySelector('#calc-down');
    const years = calcForm.querySelector('#calc-years');
    const rate = calcForm.querySelector('#calc-rate');
    const fmt = n => n.toLocaleString('pl-PL');
    const update = () => {
      const P = +price.value - (+price.value * +down.value / 100);
      const r = +rate.value / 100 / 12;
      const n = +years.value * 12;
      const monthly = r > 0 ? P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : P / n;
      const total = monthly * n;
      const interest = total - P;
      calcForm.querySelector('#calc-price-val').textContent = fmt(+price.value) + ' zł';
      calcForm.querySelector('#calc-down-val').textContent = down.value + '% (' + fmt(Math.round(+price.value * +down.value / 100)) + ' zł)';
      calcForm.querySelector('#calc-years-val').textContent = years.value + ' lat';
      calcForm.querySelector('#calc-rate-val').textContent = rate.value + '%';
      calcForm.querySelector('#calc-monthly').textContent = fmt(Math.round(monthly)) + ' zł';
      calcForm.querySelector('#calc-total').textContent = fmt(Math.round(total)) + ' zł';
      calcForm.querySelector('#calc-interest').textContent = fmt(Math.round(interest)) + ' zł';
      calcForm.querySelector('#calc-loan').textContent = fmt(Math.round(P)) + ' zł';
    };
    [price, down, years, rate].forEach(el => el.addEventListener('input', update));
    update();
  }

  /* ============================================
     NEWSLETTER
     ============================================ */
  const nlForm = document.getElementById('newsletterForm');
  nlForm?.addEventListener('submit', e => {
    e.preventDefault();
    const email = nlForm.querySelector('input[type="email"]').value;
    if (!email) return;
    nlForm.innerHTML = '<p style="color:var(--accent); font-family:var(--font-serif); font-size:20px; font-weight:400;">Dziękujemy za zapis!</p>';
  });

  /* ============================================
     MEGA MENU — Sobha-style interactions
     ============================================ */
  const megaMenu = document.getElementById('megaMenu');
  const megaPreviewImg = document.getElementById('megaPreviewImg');
  const megaNavItem = document.querySelector('.nav__item--has-mega');

  if (megaMenu && megaNavItem) {
    const items = megaMenu.querySelectorAll('.mega-menu__item');

    // Item hover → change preview image
    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const newSrc = item.dataset.img;
        if (newSrc && megaPreviewImg && megaPreviewImg.src !== newSrc) {
          megaPreviewImg.classList.add('mega-fade');
          setTimeout(() => {
            megaPreviewImg.src = newSrc;
            megaPreviewImg.classList.remove('mega-fade');
          }, 200);
        }
      });
    });

    // Keep mega menu open when moving from nav link to menu
    let megaTimeout;
    megaNavItem.addEventListener('mouseleave', () => {
      megaTimeout = setTimeout(() => {
        megaMenu.classList.remove('mega-menu--open');
      }, 80);
    });
    megaMenu.addEventListener('mouseenter', () => {
      clearTimeout(megaTimeout);
      megaMenu.classList.add('mega-menu--open');
    });
    megaMenu.addEventListener('mouseleave', () => {
      megaMenu.classList.remove('mega-menu--open');
    });

    // Close mega menu on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        megaMenu.classList.remove('mega-menu--open');
      }
    });
  }

  /* ============================================
     OFERTY MEGA2 — category switch + image preview
     ============================================ */
  const mega2 = document.getElementById('megaOferty');
  const mega2Img = document.getElementById('mega2Img');
  const mega2NavItem = document.querySelector('.nav__item--has-mega2');

  if (mega2 && mega2NavItem) {
    const cats2 = mega2.querySelectorAll('.mega2__cat');
    const groups2 = mega2.querySelectorAll('.mega2__group');
    const offers2 = mega2.querySelectorAll('.mega2__offer');

    // Category hover → switch listing group + update preview
    cats2.forEach(cat => {
      cat.addEventListener('mouseenter', () => {
        const target = cat.dataset.cat2;
        cats2.forEach(c => c.classList.remove('mega2__cat--active'));
        cat.classList.add('mega2__cat--active');
        groups2.forEach(g => {
          if (g.dataset.cat2Target === target) {
            g.style.display = '';
            const first = g.querySelector('.mega2__offer');
            if (first && mega2Img) {
              const src = first.dataset.img;
              if (src && mega2Img.src !== src) {
                mega2Img.classList.add('mega2-fade');
                setTimeout(() => { mega2Img.src = src; mega2Img.classList.remove('mega2-fade'); }, 200);
              }
            }
          } else {
            g.style.display = 'none';
          }
        });
      });
      cat.addEventListener('click', e => e.preventDefault());
    });

    // Offer hover → change preview image
    offers2.forEach(offer => {
      offer.addEventListener('mouseenter', () => {
        const src = offer.dataset.img;
        if (src && mega2Img && mega2Img.src !== src) {
          mega2Img.classList.add('mega2-fade');
          setTimeout(() => { mega2Img.src = src; mega2Img.classList.remove('mega2-fade'); }, 200);
        }
      });
    });

    // Keep open on mouse transition
    let mega2Timeout;
    mega2NavItem.addEventListener('mouseleave', () => {
      mega2Timeout = setTimeout(() => mega2.classList.remove('mega2--open'), 80);
    });
    mega2.addEventListener('mouseenter', () => {
      clearTimeout(mega2Timeout);
      mega2.classList.add('mega2--open');
    });
    mega2.addEventListener('mouseleave', () => {
      mega2.classList.remove('mega2--open');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') mega2.classList.remove('mega2--open');
    });
  }

  /* ============================================
     MOBILE MENU — sub-dropdown toggle
     ============================================ */
  document.querySelectorAll('.mobile-menu__toggle').forEach(toggle => {
    toggle.addEventListener('click', e => {
      e.preventDefault();
      toggle.parentElement.classList.toggle('active');
    });
  });

  /* ============================================
     HERO TITLE — SPLIT ON MEGA MENU HOVER
     Syncs: title spans + tagline + gold frame
     ============================================ */
  const heroTitle = document.querySelector('.hero__title');
  const heroSection = document.querySelector('.hero');
  if (heroTitle && heroSection) {
    document.querySelectorAll('.nav__item--has-mega, .nav__item--has-mega2').forEach(item => {
      item.addEventListener('mouseenter', () => {
        heroTitle.classList.add('hero-title--split');
        heroSection.classList.add('hero--mega-open');
      });
      item.addEventListener('mouseleave', () => {
        heroTitle.classList.remove('hero-title--split');
        heroSection.classList.remove('hero--mega-open');
      });
    });
  }

  /* ============================================
     REALIZACJE — Filter Tabs
     ============================================ */
  const filterTabs = document.querySelectorAll('.realizacje__tab');
  const rlzCards = document.querySelectorAll('.rlz-card');
  const filterMapPins = document.querySelectorAll('.inv-pin[data-status]');
  if (filterTabs.length && rlzCards.length) {
    filterTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        // Update active tab
        filterTabs.forEach(function(t) { t.classList.remove('realizacje__tab--active'); });
        tab.classList.add('realizacje__tab--active');

        var filter = tab.dataset.filter;
        rlzCards.forEach(function(card) {
          if (filter === 'all') {
            card.classList.remove('rlz-card--hidden');
          } else {
            var status = card.dataset.status;
            if (status === filter) {
              card.classList.remove('rlz-card--hidden');
            } else {
              card.classList.add('rlz-card--hidden');
            }
          }
        });
        // Sync map pins — dim non-matching
        filterMapPins.forEach(function(pin) {
          var match = filter === 'all' || pin.dataset.status === filter;
          pin.style.opacity = match ? '' : '0.2';
          pin.style.pointerEvents = match ? '' : 'none';
        });
      });
    });
  }

  /* ============================================
     REALIZACJE — Detail sections GSAP reveal
     ============================================ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    document.querySelectorAll('.rlz-detail').forEach(function(detail) {
      var info = detail.querySelector('.rlz-detail__info');
      var visual = detail.querySelector('.rlz-detail__visual');

      if (info) {
        gsap.fromTo(info,
          { opacity: 0, x: -40 },
          {
            opacity: 1, x: 0, duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: detail,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          }
        );
      }
      if (visual) {
        gsap.fromTo(visual,
          { opacity: 0, x: 40 },
          {
            opacity: 1, x: 0, duration: 0.9,
            ease: 'power3.out',
            delay: 0.15,
            scrollTrigger: {
              trigger: detail,
              start: 'top 80%',
              toggleActions: 'play none none none',
            }
          }
        );
      }
    });

    // Card grid staggered reveal
    document.querySelectorAll('.rlz-card').forEach(function(card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.1,
          scrollTrigger: {
            trigger: '.realizacje__grid',
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });
  }

  /* ============================================
     LAZY IMAGE BLUR-UP
     ============================================ */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.classList.add('lazy-blur');
    if (img.complete) {
      img.classList.remove('lazy-blur');
      img.classList.add('lazy-loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.remove('lazy-blur');
        img.classList.add('lazy-loaded');
      }, { once: true });
    }
  });

  /* ============================================
     TOP PROMO BAR
     ============================================ */
  const topBar = document.getElementById('topBar');
  const topBarClose = document.getElementById('topBarClose');
  if (topBar && topBarClose) {
    if (sessionStorage.getItem('topBarClosed') === '1') {
      topBar.classList.add('top-bar--hidden');
    }
    topBarClose.addEventListener('click', () => {
      topBar.classList.add('top-bar--hidden');
      sessionStorage.setItem('topBarClosed', '1');
    });
  }

  /* ============================================
     INVESTMENT MAP — pin switcher
     ============================================ */
  const invPins = document.querySelectorAll('.inv-pin');
  const invInfos = document.querySelectorAll('[data-inv-info]');
  invPins.forEach(pin => {
    pin.addEventListener('click', () => {
      const target = pin.getAttribute('data-inv');
      invPins.forEach(p => p.classList.remove('inv-pin--active'));
      pin.classList.add('inv-pin--active');
      invInfos.forEach(info => {
        info.classList.toggle('inv-info--active', info.getAttribute('data-inv-info') === target);
      });
    });
  });

  /* ============================================
     REALIZACJE — view toggle (grid / map)
     ============================================ */
  const viewBtns = document.querySelectorAll('.realizacje__view-btn');
  const viewPanels = document.querySelectorAll('[data-view-panel]');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-view');
      viewBtns.forEach(b => b.classList.remove('realizacje__view-btn--active'));
      btn.classList.add('realizacje__view-btn--active');
      viewPanels.forEach(p => {
        p.style.display = p.getAttribute('data-view-panel') === target ? '' : 'none';
      });
      // refresh ScrollTrigger so animations re-calc for the revealed panel
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  // (Realizacje filter logic is handled in the earlier block — extended to sync map pins)

  /* ============================================
     SEARCH TABS (text / 3D)
     ============================================ */
  const searchTabs = document.querySelectorAll('[data-search-tab]');
  const searchPanels = document.querySelectorAll('[data-search-panel]');
  searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-search-tab');
      searchTabs.forEach(t => t.classList.remove('search-tabs__btn--active'));
      tab.classList.add('search-tabs__btn--active');
      searchPanels.forEach(panel => {
        panel.style.display = panel.getAttribute('data-search-panel') === target ? '' : 'none';
      });
    });
  });

  /* ============================================
     SEARCH FILTER CHIPS
     ============================================ */
  document.querySelectorAll('[data-filter-chips]').forEach(group => {
    const multi = group.getAttribute('data-multi') === 'true';
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (multi) {
          btn.classList.toggle('is-active');
        } else {
          group.querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        }
        updateResultsCount();
      });
    });
  });

  /* Double range slider (area + price) */
  function setupRange(minId, maxId, valId, trackId, formatter) {
    const mn = document.getElementById(minId);
    const mx = document.getElementById(maxId);
    const lbl = document.getElementById(valId);
    const trk = document.getElementById(trackId);
    if (!mn || !mx) return;
    const upd = () => {
      let a = +mn.value, b = +mx.value;
      if (a > b - 5) { if (this === mn) a = b - 5; else b = a + 5; mn.value = a; mx.value = b; }
      const min = +mn.min, max = +mn.max;
      const pa = ((a - min) / (max - min)) * 100;
      const pb = ((b - min) / (max - min)) * 100;
      if (trk) { trk.style.left = pa + '%'; trk.style.width = (pb - pa) + '%'; }
      if (lbl) lbl.textContent = formatter(a, b);
      updateResultsCount();
    };
    mn.addEventListener('input', upd);
    mx.addEventListener('input', upd);
    upd();
  }
  setupRange('areaMin', 'areaMax', 'areaVal', 'areaTrack', (a, b) => `${a} — ${b} m²`);
  setupRange('priceMin', 'priceMax', 'priceVal', 'priceTrack', (a, b) => `${a} — ${b} tys. zł`);

  function updateResultsCount() {
    const el = document.getElementById('searchResultsCount');
    if (!el) return;
    // Simulate a count based on active filters
    const activeChips = document.querySelectorAll('[data-filter-chips] button.is-active').length;
    const base = 54;
    const count = Math.max(3, base - activeChips * 7 - Math.floor(Math.random() * 4));
    el.innerHTML = `Dopasowane oferty: <strong>${count}</strong>`;
  }

  const searchForm = document.getElementById('searchFilters');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      searchForm.querySelector('.search-filters__count').style.color = 'var(--accent)';
      setTimeout(() => {
        searchForm.querySelector('.search-filters__count').style.color = '';
      }, 1200);
    });
    searchForm.addEventListener('reset', () => {
      document.querySelectorAll('[data-filter-chips] button').forEach(b => b.classList.remove('is-active'));
      setTimeout(updateResultsCount, 0);
    });
  }

  /* ============================================
     FAQ accordion (ensure only one open at a time — optional single-mode)
     ============================================ */
  document.querySelectorAll('.faq__item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        document.querySelectorAll('.faq__item').forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  /* ============================================
     GALLERY LIGHTBOX
     ============================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const galleryCells = document.querySelectorAll('[data-lightbox]');
  let lightboxIdx = 0;
  const lightboxItems = Array.from(galleryCells).map(c => ({
    src: c.getAttribute('data-src'),
    caption: c.getAttribute('data-caption') || ''
  }));

  function openLightbox(i) {
    if (!lightbox || !lightboxItems.length) return;
    lightboxIdx = (i + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[lightboxIdx];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCounter) lightboxCounter.textContent = `${lightboxIdx + 1} / ${lightboxItems.length}`;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  galleryCells.forEach((cell, i) => {
    cell.addEventListener('click', () => openLightbox(i));
  });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => openLightbox(lightboxIdx - 1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => openLightbox(lightboxIdx + 1));
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(lightboxIdx - 1);
    if (e.key === 'ArrowRight') openLightbox(lightboxIdx + 1);
  });

  /* ============================================
     PROMO POP-UP MODAL
     ============================================ */
  const promoModal = document.getElementById('promoModal');
  if (promoModal && promoModal.dataset.cmsDisabled !== '1') {
    const showPromo = () => {
      if (promoModal.dataset.cmsDisabled === '1') return; // admin wylaczyl pop-up
      if (localStorage.getItem('promoHidden') === '1') return;
      if (sessionStorage.getItem('promoShown') === '1') return;
      promoModal.classList.add('is-open');
      sessionStorage.setItem('promoShown', '1');
      document.body.style.overflow = 'hidden';
    };
    const hidePromo = () => {
      promoModal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (document.getElementById('promoNoRemind')?.checked) {
        localStorage.setItem('promoHidden', '1');
      }
    };
    // Trigger after 18s OR when scroll > 45%
    let fired = false;
    const tryFire = () => { if (!fired) { fired = true; showPromo(); } };
    setTimeout(tryFire, 18000);
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct > 0.45) tryFire();
    }, { passive: true });
    promoModal.querySelectorAll('[data-promo-close]').forEach(b => b.addEventListener('click', hidePromo));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && promoModal.classList.contains('is-open')) hidePromo();
    });
  }

  /* ============================================
     TOUR BOOKING MODAL (Calendly placeholder)
     ============================================ */
  const tourModal = document.getElementById('tourModal');
  if (tourModal) {
    const openTour = () => {
      tourModal.classList.add('is-open');
      tourModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeTour = () => {
      tourModal.classList.remove('is-open');
      tourModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    document.querySelectorAll('[data-tour-open]').forEach(b => b.addEventListener('click', openTour));
    tourModal.querySelectorAll('[data-tour-close]').forEach(b => b.addEventListener('click', closeTour));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && tourModal.classList.contains('is-open')) closeTour();
    });
  }

  /* ============================================
     ACCESSIBILITY PANEL (WCAG 2.1)
     ============================================ */
  const a11yFab = document.getElementById('a11yFab');
  const a11yPanel = document.getElementById('a11yPanel');
  const a11yClose = document.getElementById('a11yClose');
  const a11yRoot = document.documentElement;
  const A11Y_KEY = 'megapolis-a11y';

  function loadA11yState() {
    try {
      const state = JSON.parse(localStorage.getItem(A11Y_KEY) || '{}');
      if (state.fontSize) a11yRoot.style.fontSize = state.fontSize + '%';
      ['contrast','grayscale','highlight-links','no-animations','light'].forEach(mode => {
        if (state[mode]) a11yRoot.classList.add('a11y-' + mode);
      });
      document.querySelectorAll('[data-a11y]').forEach(el => {
        const k = el.getAttribute('data-a11y');
        if (k === 'high-contrast' && state.contrast) el.checked = true;
        if (k === 'grayscale' && state.grayscale) el.checked = true;
        if (k === 'highlight-links' && state['highlight-links']) el.checked = true;
        if (k === 'no-animations' && state['no-animations']) el.checked = true;
        if (k === 'light-mode' && state.light) el.checked = true;
      });
    } catch (e) {}
  }
  function saveA11yState(key, value) {
    const state = JSON.parse(localStorage.getItem(A11Y_KEY) || '{}');
    state[key] = value;
    localStorage.setItem(A11Y_KEY, JSON.stringify(state));
  }
  function resetA11y() {
    localStorage.removeItem(A11Y_KEY);
    a11yRoot.style.fontSize = '';
    ['a11y-contrast','a11y-grayscale','a11y-highlight-links','a11y-no-animations','a11y-light'].forEach(c => a11yRoot.classList.remove(c));
    document.querySelectorAll('[data-a11y][type="checkbox"]').forEach(el => el.checked = false);
  }

  if (a11yFab && a11yPanel) {
    a11yFab.addEventListener('click', () => {
      const isOpen = a11yPanel.classList.toggle('is-open');
      a11yFab.setAttribute('aria-expanded', isOpen);
    });
    a11yClose?.addEventListener('click', () => {
      a11yPanel.classList.remove('is-open');
      a11yFab.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', (e) => {
      if (!a11yPanel.contains(e.target) && !a11yFab.contains(e.target) && a11yPanel.classList.contains('is-open')) {
        a11yPanel.classList.remove('is-open');
        a11yFab.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Font size
  let fontSizePct = 100;
  document.querySelector('[data-a11y="font-increase"]')?.addEventListener('click', () => {
    fontSizePct = Math.min(fontSizePct + 10, 140);
    a11yRoot.style.fontSize = fontSizePct + '%';
    saveA11yState('fontSize', fontSizePct);
  });
  document.querySelector('[data-a11y="font-decrease"]')?.addEventListener('click', () => {
    fontSizePct = Math.max(fontSizePct - 10, 80);
    a11yRoot.style.fontSize = fontSizePct + '%';
    saveA11yState('fontSize', fontSizePct);
  });
  document.querySelector('[data-a11y="font-reset"]')?.addEventListener('click', () => {
    fontSizePct = 100;
    a11yRoot.style.fontSize = '';
    saveA11yState('fontSize', null);
  });

  // Mode toggles
  const modeMap = {
    'high-contrast': 'contrast',
    'grayscale': 'grayscale',
    'highlight-links': 'highlight-links',
    'no-animations': 'no-animations',
    'light-mode': 'light'
  };
  Object.keys(modeMap).forEach(key => {
    const input = document.querySelector(`[data-a11y="${key}"]`);
    const cls = 'a11y-' + modeMap[key];
    input?.addEventListener('change', () => {
      a11yRoot.classList.toggle(cls, input.checked);
      saveA11yState(modeMap[key], input.checked);
    });
  });

  document.querySelector('[data-a11y="reset-all"]')?.addEventListener('click', () => {
    fontSizePct = 100;
    resetA11y();
  });

  loadA11yState();
  // Restore fontSizePct from state
  try {
    const state = JSON.parse(localStorage.getItem(A11Y_KEY) || '{}');
    if (state.fontSize) fontSizePct = state.fontSize;
  } catch (e) {}

  /* ============================================
     WYSZUKIWARKA — przyciski Strony Świata i Przynależności
     Multi-toggle (można zaznaczyć kilka kierunków lub cech jednocześnie)
     ============================================ */
  document.querySelectorAll('.finder__rose-btn, .finder__feat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('is-active');
      btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
    });
  });

  /* Miasto w finder — single-select (tylko jedno aktywne) */
  const cityPills = document.querySelectorAll('.finder__city-pill');
  cityPills.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cityPills.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });

  /* ============================================
     PORTFOLIO — alfabetyczna kolejność inwestycji + filtr statusu
     Wszystkie | W sprzedaży (building) | Zrealizowane (done) | Wkrótce (planned)
     ============================================ */
  (function () {
    const grid = document.querySelector('.allinv__grid');
    if (grid) {
      // Sortuj karty alfabetycznie po nazwie (wartości data-status zostają — filtr działa)
      const all = Array.from(grid.querySelectorAll('.allinv__card'));
      all.sort((a, b) => {
        const na = (a.querySelector('.allinv__card-name')?.textContent || '').trim();
        const nb = (b.querySelector('.allinv__card-name')?.textContent || '').trim();
        return na.localeCompare(nb, 'pl', { sensitivity: 'base' });
      });
      // Wstaw z powrotem w nowej kolejności
      all.forEach(card => grid.appendChild(card));
    }

    const filterBtns = document.querySelectorAll('.allinv__filter');
    const cards      = document.querySelectorAll('.allinv__grid .allinv__card');
    const emptyMsg   = document.getElementById('allinvEmpty');
    if (!filterBtns.length || !cards.length) return;

    const FADE_MS = 350;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Podświetl aktywny przycisk
        filterBtns.forEach(b => {
          const active = (b === btn);
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        // Filtruj karty z animacją fade
        let visibleCount = 0;
        cards.forEach(card => {
          const status = card.dataset.status;
          const shouldShow = (filter === 'all') || (status === filter);
          const isCurrentlyHidden = card.classList.contains('is-hidden');

          if (shouldShow) {
            visibleCount++;
            if (isCurrentlyHidden) {
              // Pojawianie: display na flex + fade-in (z is-fading → bez is-fading)
              card.classList.remove('is-hidden');
              card.classList.add('is-fading');
              requestAnimationFrame(() => {
                requestAnimationFrame(() => card.classList.remove('is-fading'));
              });
            } else {
              // Już widoczna — upewnij się, że nie ma is-fading
              card.classList.remove('is-fading');
            }
          } else {
            if (!isCurrentlyHidden && !card.classList.contains('is-fading')) {
              // Zanikanie: najpierw fade-out, potem display:none
              card.classList.add('is-fading');
              setTimeout(() => card.classList.add('is-hidden'), FADE_MS);
            } else if (isCurrentlyHidden) {
              // już ukryta — nic nie robimy
            }
          }
        });

        // Pokaż komunikat "Brak inwestycji" jeśli nic nie pasuje (po zakończeniu fade)
        if (emptyMsg) {
          setTimeout(() => {
            emptyMsg.hidden = (visibleCount > 0);
          }, FADE_MS);
        }
      });
    });
  })();

});
