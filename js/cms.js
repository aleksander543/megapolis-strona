// Megapolis — CMS + i18n runtime (loads from /api, applies to DOM)
// Works on every frontend page. Looks for data-cms-* attributes and injects content.

(function () {
  'use strict';

  const API = '/api';
  const LANG_KEY = 'megapolis_lang';
  const SUPPORTED = ['pl', 'en'];

  const state = {
    lang: localStorage.getItem(LANG_KEY) || 'pl',
    i18n: null,
    settings: null,
    news: null,
    realizacje: null,
    faq: null,
    testimonials: null,
  };

  if (!SUPPORTED.includes(state.lang)) state.lang = 'pl';

  /* ============ API ============ */
  async function fetchJSON(path) {
    try { const r = await fetch(API + path); if (!r.ok) throw new Error('HTTP ' + r.status); return await r.json(); }
    catch (e) { console.warn('[CMS] fetch failed', path, e); return null; }
  }

  /* ============ i18n ============ */
  function t(path) {
    if (!state.i18n) return null;
    const lang = state.lang;
    const obj = state.i18n[lang] || state.i18n.pl || {};
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, obj);
  }
  function applyI18n(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const v = t(key);
      if (v != null) el.textContent = v;
    });
    (root || document).querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const v = t(el.getAttribute('data-i18n-placeholder'));
      if (v != null) el.setAttribute('placeholder', v);
    });
    (root || document).querySelectorAll('[data-i18n-aria]').forEach(el => {
      const v = t(el.getAttribute('data-i18n-aria'));
      if (v != null) el.setAttribute('aria-label', v);
    });
    document.documentElement.lang = state.lang;
  }

  /* ============ Language switcher ============ */
  function mountLangSwitcher() {
    // Inject into header if a slot exists; otherwise as a floating pill
    const slot = document.querySelector('[data-lang-switcher]') || createFloatingSlot();
    if (slot.dataset.cmsLangMounted === '1') return;
    slot.dataset.cmsLangMounted = '1';
    slot.innerHTML = '';
    SUPPORTED.forEach(l => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-switch__btn' + (l === state.lang ? ' is-active' : '');
      btn.setAttribute('data-lang', l);
      btn.textContent = l.toUpperCase();
      btn.addEventListener('click', () => setLang(l));
      slot.appendChild(btn);
    });
    slot.classList.add('lang-switch');
  }
  function createFloatingSlot() {
    const existing = document.getElementById('langSwitchFloat');
    if (existing) return existing;
    const el = document.createElement('div');
    el.id = 'langSwitchFloat';
    el.setAttribute('data-lang-switcher', '');
    document.body.appendChild(el);
    return el;
  }
  async function setLang(lang) {
    if (!SUPPORTED.includes(lang) || lang === state.lang) return;
    state.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyI18n();
    document.querySelectorAll('.lang-switch__btn').forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));
    // Re-render dynamic sections bound to i18n/data
    renderDynamic();
    window.dispatchEvent(new CustomEvent('cms:langchange', { detail: { lang } }));
  }

  /* ============ Settings application ============ */
  function applySettings() {
    const s = state.settings; if (!s) return;
    // Accent / bg
    if (s.accent) document.documentElement.style.setProperty('--accent', s.accent);
    if (s.bg) document.documentElement.style.setProperty('--bg', s.bg);
    // Top bar
    const tb = document.querySelector('[data-cms="topbar"]');
    if (tb && s.topBar) {
      if (!s.topBar.enabled) tb.style.display = 'none';
      const textEl = tb.querySelector('[data-cms-field="text"]'); if (textEl) textEl.textContent = s.topBar.text || '';
      const cta = tb.querySelector('[data-cms-field="ctaLink"]');
      if (cta) { cta.textContent = s.topBar.ctaText || ''; if (s.topBar.ctaLink) cta.setAttribute('href', s.topBar.ctaLink); }
    }
    // Promo modal
    const pm = document.querySelector('[data-cms="promoModal"]');
    if (pm && s.promoModal) {
      if (!s.promoModal.enabled) pm.dataset.cmsDisabled = '1';
      const titleEl = pm.querySelector('[data-cms-field="title"]'); if (titleEl) titleEl.textContent = s.promoModal.title || '';
      const bodyEl  = pm.querySelector('[data-cms-field="body"]');  if (bodyEl)  bodyEl.textContent = s.promoModal.body || '';
      const cta     = pm.querySelector('[data-cms-field="cta"]') || pm.querySelector('[data-cms-field="ctaLink"]');
      if (cta) { if (s.promoModal.ctaText) cta.textContent = s.promoModal.ctaText; if (s.promoModal.ctaLink) cta.setAttribute('href', s.promoModal.ctaLink); }
    }
    // Contact (phone, email, address)
    document.querySelectorAll('[data-cms="contact.phone"]').forEach(el => { el.textContent = (s.contact||{}).phone || ''; if (el.tagName === 'A') el.setAttribute('href', 'tel:' + ((s.contact||{}).phone || '').replace(/\s/g, '')); });
    document.querySelectorAll('[data-cms="contact.email"]').forEach(el => { el.textContent = (s.contact||{}).email || ''; if (el.tagName === 'A') el.setAttribute('href', 'mailto:' + ((s.contact||{}).email || '')); });
    document.querySelectorAll('[data-cms="contact.address"]').forEach(el => { el.textContent = (s.contact||{}).address || ''; });
    // Social
    document.querySelectorAll('[data-cms="social.facebook"]').forEach(el => { if ((s.social||{}).facebook) el.setAttribute('href', s.social.facebook); });
    document.querySelectorAll('[data-cms="social.instagram"]').forEach(el => { if ((s.social||{}).instagram) el.setAttribute('href', s.social.instagram); });
    document.querySelectorAll('[data-cms="social.linkedin"]').forEach(el => { if ((s.social||{}).linkedin) el.setAttribute('href', s.social.linkedin); });
    // SEO
    if (s.seo) {
      if (s.seo.title) document.title = s.seo.title;
      const md = document.querySelector('meta[name="description"]'); if (md && s.seo.description) md.setAttribute('content', s.seo.description);
    }
  }

  /* ============ News list renderer ============ */
  function renderNews() {
    const containers = document.querySelectorAll('[data-cms="news-list"]');
    if (!containers.length || !state.news) return;
    containers.forEach(container => {
      const limit = Number(container.getAttribute('data-limit') || 0) || state.news.length;
      const items = state.news.slice(0, limit);
      container.innerHTML = '';
      items.forEach((n, i) => {
        const card = document.createElement('article');
        card.className = 'news-card' + (i === 0 && container.dataset.feat === '1' ? ' news-card--feat' : '');
        card.innerHTML = `
          <a class="news-card__link" href="/aktualnosc/?slug=${encodeURIComponent(n.slug)}">
            <div class="news-card__img" style="background-image:url('${n.cover || ''}');"></div>
            <div class="news-card__body">
              <div class="news-card__date">${formatDate(n.date)}</div>
              <h3 class="news-card__title">${escapeHtml(n.title)}</h3>
              <p class="news-card__excerpt">${escapeHtml(n.excerpt || '')}</p>
              <span class="news-card__more">${t('news.more') || 'Czytaj wiecej'} &rarr;</span>
            </div>
          </a>`;
        container.appendChild(card);
      });
    });
  }

  /* ============ Realizacje list renderer ============ */
  function renderRealizacje() {
    const containers = document.querySelectorAll('[data-cms="realizacje-list"]');
    if (!containers.length || !state.realizacje) return;
    containers.forEach(container => {
      const limit = Number(container.getAttribute('data-limit') || 0) || state.realizacje.length;
      const items = state.realizacje.slice(0, limit);
      // Only populate if empty — don't override curated markup
      if (container.children.length > 0 && !container.dataset.cmsOverride) return;
      container.innerHTML = '';
      items.forEach(r => {
        const card = document.createElement('article');
        card.className = 'rlz-card';
        card.setAttribute('data-category', r.status);
        card.innerHTML = `
          <a class="rlz-card__link" href="/inwestycja/?slug=${encodeURIComponent(r.slug)}">
            <div class="rlz-card__img" style="background-image:url('${r.cover || ''}');"></div>
            <div class="rlz-card__body">
              <div class="rlz-card__meta"><span>${escapeHtml(r.city)}</span><span>&middot;</span><span>${r.year}</span></div>
              <h3 class="rlz-card__title">${escapeHtml(r.title)}</h3>
              <p class="rlz-card__desc">${escapeHtml((r.description || '').replace(/<[^>]+>/g, '').slice(0, 120))}</p>
              <div class="rlz-card__stats"><span>${r.units} lokali</span><span>${escapeHtml(r.area || '')}</span></div>
            </div>
          </a>`;
        container.appendChild(card);
      });
    });
  }

  /* ============ FAQ renderer ============ */
  function renderFaq() {
    const containers = document.querySelectorAll('[data-cms="faq-list"]');
    if (!containers.length || !state.faq) return;
    containers.forEach(container => {
      if (container.children.length > 0 && !container.dataset.cmsOverride) return;
      container.innerHTML = '';
      state.faq.forEach(f => {
        const d = document.createElement('details');
        d.className = 'faq-item';
        d.innerHTML = `<summary class="faq-item__q">${escapeHtml(f.q)}<span class="faq-item__icon">+</span></summary><div class="faq-item__a">${escapeHtml(f.a)}</div>`;
        container.appendChild(d);
      });
    });
  }

  /* ============ Testimonials ============ */
  function renderTestimonials() {
    const containers = document.querySelectorAll('[data-cms="testimonials-list"]');
    if (!containers.length || !state.testimonials) return;
    containers.forEach(container => {
      if (container.children.length > 0 && !container.dataset.cmsOverride) return;
      container.innerHTML = '';
      state.testimonials.forEach(t2 => {
        const el = document.createElement('blockquote');
        el.className = 'testimonial';
        el.innerHTML = `<p class="testimonial__text">&bdquo;${escapeHtml(t2.text)}&rdquo;</p><footer class="testimonial__author"><strong>${escapeHtml(t2.author)}</strong><span>${escapeHtml(t2.role || '')}</span></footer>`;
        container.appendChild(el);
      });
    });
  }

  /* ============ Forms wiring ============ */
  function wireForms() {
    document.querySelectorAll('form[data-cms-form]').forEach(form => {
      if (form.dataset.cmsWired) return;
      form.dataset.cmsWired = '1';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '...'; }
        const formData = new FormData(form);
        const body = {};
        formData.forEach((v, k) => body[k] = v);
        body.formType = form.getAttribute('data-cms-form') || 'contact';
        body.sourcePage = location.pathname;
        body.site = document.documentElement.getAttribute('data-site') || 'megapolis';
        try {
          const res = await fetch(API + '/forms/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Wyslanie nie powiodlo sie');
          form.reset();
          showFormFeedback(form, 'success', state.lang === 'en' ? 'Message sent. We will contact you soon.' : 'Wiadomosc wyslana. Skontaktujemy sie wkrotce.');
        } catch (err) {
          showFormFeedback(form, 'error', err.message);
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
      });
    });
  }
  function showFormFeedback(form, kind, msg) {
    let fb = form.querySelector('.cms-form-feedback');
    if (!fb) { fb = document.createElement('div'); fb.className = 'cms-form-feedback'; form.appendChild(fb); }
    fb.className = 'cms-form-feedback cms-form-feedback--' + kind;
    fb.textContent = msg;
    setTimeout(() => { fb.className = 'cms-form-feedback'; fb.textContent = ''; }, 6000);
  }

  /* ============ Helpers ============ */
  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function formatDate(d) { try { return new Date(d).toLocaleDateString(state.lang === 'en' ? 'en-US' : 'pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; } }

  function renderDynamic() {
    applyI18n();
    renderNews();
    renderRealizacje();
    renderFaq();
    renderTestimonials();
  }

  /* ============ Boot ============ */
  async function boot() {
    const [i18n, settings, news, realizacje, faq, testimonials] = await Promise.all([
      fetchJSON('/content/i18n'),
      fetchJSON('/content/settings'),
      fetchJSON('/content/news'),
      fetchJSON('/content/realizacje'),
      fetchJSON('/content/faq'),
      fetchJSON('/content/testimonials'),
    ]);
    state.i18n = i18n || { pl: {}, en: {} };
    state.settings = settings;
    state.news = news || [];
    state.realizacje = realizacje || [];
    state.faq = faq || [];
    state.testimonials = testimonials || [];

    applySettings();
    mountLangSwitcher();
    renderDynamic();
    wireForms();

    window.MegapolisCMS = { state, setLang, t, refresh: renderDynamic };
    window.__cmsSettings = settings;
    window.__cmsState = state;
    window.dispatchEvent(new CustomEvent('cms:ready', { detail: { state } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
