// Megapolis Admin — SPA logic (vanilla JS)
// Handles: auth, section rendering, CRUD for every content collection, WYSIWYG, i18n editor

(function () {
  'use strict';

  const API = '/api';
  const TOKEN_KEY = 'megapolis_admin_token';

  /* ============ State ============ */
  const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    section: 'dashboard',
    data: {},
  };

  /* ============ API helpers ============ */
  async function api(method, path, body) {
    const opts = { method, headers: {} };
    if (state.token) opts.headers['Authorization'] = 'Bearer ' + state.token;
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(API + path, opts);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) throw new Error((data && data.error) || ('HTTP ' + res.status));
    return data;
  }

  /* ============ Auth ============ */
  async function login(user, pass) {
    const res = await api('POST', '/auth/login', { user, pass });
    state.token = res.token;
    localStorage.setItem(TOKEN_KEY, res.token);
    return res;
  }
  async function logout() {
    try { await api('POST', '/auth/logout'); } catch {}
    state.token = null;
    localStorage.removeItem(TOKEN_KEY);
    showLogin();
  }
  async function checkSession() {
    if (!state.token) return false;
    try { await api('GET', '/auth/me'); return true; }
    catch { state.token = null; localStorage.removeItem(TOKEN_KEY); return false; }
  }

  /* ============ UI utilities ============ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') el.className = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(el.style, attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) el.setAttribute(k, attrs[k]);
    }
    for (const c of children) {
      if (c == null || c === false) continue;
      if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(String(c)));
      else if (Array.isArray(c)) c.forEach(x => x && el.appendChild(x.nodeType ? x : document.createTextNode(String(x))));
      else if (c.nodeType) el.appendChild(c);
    }
    return el;
  }
  function setSaveStatus(state_, msg) {
    const el = $('#saveStatus');
    el.className = 'save-status ' + (state_ || '');
    el.textContent = msg || '';
    if (state_ === 'saved') setTimeout(() => { el.className = 'save-status'; el.textContent = ''; }, 2500);
  }
  function confirm2(msg) { return window.confirm(msg); }

  /* ============ WYSIWYG ============ */
  function mountWysiwyg(container, initialHtml) {
    const tpl = $('#wysiwygTpl').content.cloneNode(true);
    container.innerHTML = '';
    container.appendChild(tpl);
    const editor = container.querySelector('.wysiwyg__editor');
    const html = container.querySelector('.wysiwyg__html');
    editor.innerHTML = initialHtml || '';
    html.value = initialHtml || '';

    container.querySelectorAll('.wysiwyg__toolbar [data-cmd]').forEach(btn => {
      const cmd = btn.dataset.cmd;
      if (btn.tagName === 'SELECT') {
        btn.addEventListener('change', () => {
          editor.focus();
          document.execCommand(cmd, false, btn.value);
        });
        return;
      }
      btn.addEventListener('click', () => {
        editor.focus();
        if (cmd === 'createLink') {
          const url = window.prompt('Adres URL:', 'https://');
          if (url) document.execCommand('createLink', false, url);
        } else if (cmd === 'insertImage') {
          const url = window.prompt('URL obrazu:', 'https://');
          if (url) document.execCommand('insertImage', false, url);
        } else if (cmd === 'viewHtml') {
          if (html.hidden) {
            html.value = editor.innerHTML;
            html.hidden = false; editor.hidden = true;
          } else {
            editor.innerHTML = html.value;
            html.hidden = true; editor.hidden = false;
          }
        } else {
          document.execCommand(cmd, false, null);
        }
      });
    });

    return {
      getValue: () => {
        if (!html.hidden) return html.value;
        return editor.innerHTML;
      },
      setValue: (v) => {
        editor.innerHTML = v || '';
        html.value = v || '';
      },
    };
  }

  /* ============ Renderers ============ */
  const renderers = {
    dashboard: renderDashboard,
    news: renderNewsList,
    realizacje: renderRealizacjeList,
    faq: renderFaqList,
    testimonials: renderTestimonialsList,
    apartments: renderApartmentsList,
    jobs: renderJobsList,
    osiedla: renderOsiedlaList,
    settings: renderSettings,
    i18n: renderI18n,
    submissions: renderSubmissions,
  };
  const sectionTitles = {
    dashboard: ['Pulpit', 'Podsumowanie aktywnosci w serwisie'],
    news: ['Aktualnosci', 'Dodawaj i edytuj artykuly publikowane na stronie'],
    realizacje: ['Realizacje', 'Lista inwestycji widocznych na stronie'],
    faq: ['FAQ', 'Pytania i odpowiedzi wyswietlane na stronie'],
    testimonials: ['Opinie klientow', 'Referencje wyswietlane w karuzeli'],
    apartments: ['Mieszkania (THTG)', 'Mock: dane zaciagane z integracji CRM THTG'],
    jobs: ['Oferty pracy (eRecruiter)', 'Mock: dane zaciagane z integracji eRecruiter API'],
    osiedla: ['Strony osiedli (Multisite)', 'Tworz i zarzadzaj podstronami osiedli'],
    settings: ['Ustawienia strony', 'Globalne ustawienia Theme Options'],
    i18n: ['Tlumaczenia (WPML)', 'Edytuj tlumaczenia tekstow interfejsu'],
    submissions: ['Wiadomosci z formularzy', 'Lista zgloszen wyslanych przez formularze'],
  };

  async function renderSection(name) {
    state.section = name;
    $$('.admin-nav__item').forEach(b => b.classList.toggle('is-active', b.dataset.section === name));
    const [title, sub] = sectionTitles[name] || [name, ''];
    $('#pageTitle').textContent = title;
    $('#pageSub').textContent = sub;
    const root = $('#sectionRoot');
    root.innerHTML = '<p style="color:rgba(255,255,255,0.5); padding:20px 0;">Ladowanie...</p>';
    try {
      await renderers[name](root);
    } catch (e) {
      root.innerHTML = '';
      root.appendChild(h('div', { class: 'empty-state' },
        h('div', { class: 'empty-state__title' }, 'Wystapil blad'),
        h('div', { class: 'empty-state__text' }, e.message),
      ));
    }
  }

  /* --------- Dashboard ---------- */
  async function renderDashboard(root) {
    const [news, realizacje, jobs, apartments, osiedla, subs] = await Promise.all([
      api('GET', '/content/news'),
      api('GET', '/content/realizacje'),
      api('GET', '/content/jobs'),
      api('GET', '/content/apartments'),
      api('GET', '/content/osiedla'),
      api('GET', '/forms/submissions').catch(() => ({ items: [] })),
    ]);
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'stats-grid' },
      stat('Aktualnosci', (news || []).length, 'opublikowane'),
      stat('Realizacje', (realizacje || []).length, 'inwestycje w katalogu'),
      stat('Oferty pracy', (jobs || []).length, 'otwartych ogloszen'),
      stat('Mieszkania (THTG)', (apartments || []).length, 'w bazie'),
      stat('Strony osiedli', (osiedla || []).length, 'w multisite'),
      stat('Nowe wiadomosci', (subs.items || []).length, 'lacznie'),
    ));
    root.appendChild(h('h2', { class: 'admin-section-title' }, 'Szybkie akcje'));
    root.appendChild(h('div', { class: 'quick-actions' },
      quickAction('Nowa aktualnosc', 'Dodaj artykul do sekcji aktualnosci', () => go('news', 'new')),
      quickAction('Nowa realizacja', 'Dodaj inwestycje do katalogu', () => go('realizacje', 'new')),
      quickAction('Nowe osiedle', 'Utworz nowa podstrone w multisite', () => go('osiedla', 'new')),
      quickAction('Nowe FAQ', 'Dodaj pytanie i odpowiedz', () => go('faq', 'new')),
      quickAction('Nowa oferta pracy', 'Opublikuj oferte w Kariera', () => go('jobs', 'new')),
      quickAction('Edytuj ustawienia', 'Logo, kolory, kontakt, SEO', () => go('settings')),
    ));
  }
  function stat(label, value, hint) {
    return h('div', { class: 'stat-card' },
      h('div', { class: 'stat-card__label' }, label),
      h('div', { class: 'stat-card__value' }, String(value)),
      hint ? h('div', { class: 'stat-card__hint' }, hint) : null,
    );
  }
  function quickAction(label, desc, onclick) {
    return h('button', { class: 'quick-action', onclick },
      h('div', { class: 'quick-action__label' }, label),
      h('div', { class: 'quick-action__desc' }, desc),
    );
  }
  function go(section, action) {
    state.pendingAction = action;
    renderSection(section);
  }

  /* --------- News ---------- */
  async function renderNewsList(root) {
    const list = (await api('GET', '/content/news')) || [];
    root.innerHTML = '';
    if (state.pendingAction === 'new') { state.pendingAction = null; return renderNewsForm(root, null, list); }

    root.appendChild(h('div', { class: 'list-header' },
      h('input', { class: 'list-header__search', type: 'search', placeholder: 'Szukaj...', oninput: e => filterItems(root, e.target.value) }),
      h('button', { class: 'btn btn--primary', onclick: () => renderNewsForm(root, null, list) }, '+ Nowa aktualnosc'),
    ));
    const ul = h('div', { class: 'item-list' });
    list.forEach(item => {
      ul.appendChild(h('div', { class: 'item-row', 'data-search': (item.title + ' ' + item.slug).toLowerCase() },
        h('div', { class: 'item-row__main' },
          h('div', { class: 'item-row__title' }, item.title),
          h('div', { class: 'item-row__meta' },
            h('span', {}, item.date),
            h('span', {}, '/' + item.slug),
            h('span', { class: 'badge badge--gold' }, 'Opublikowane'),
          ),
        ),
        h('div', { class: 'item-row__actions' },
          h('button', { class: 'btn btn--ghost btn--sm', onclick: () => renderNewsForm(root, item, list) }, 'Edytuj'),
          h('button', { class: 'btn btn--danger btn--sm', onclick: async () => {
            if (!confirm2('Usunac ten artykul?')) return;
            const next = list.filter(x => x.id !== item.id);
            await api('PUT', '/content/news', next); setSaveStatus('saved', 'Usunieto');
            renderSection('news');
          } }, 'Usun'),
        ),
      ));
    });
    root.appendChild(ul);
  }
  function renderNewsForm(root, item, list) {
    const isNew = !item;
    const data = item ? { ...item } : { id: 'n' + Date.now(), slug: '', title: '', date: new Date().toISOString().slice(0,10), excerpt: '', body: '', cover: '' };
    root.innerHTML = '';
    const wrap = h('div', { class: 'editor-wrap' });
    const main = h('div', {});
    const card = h('div', { class: 'editor-card' }, h('div', { class: 'editor-card__title' }, isNew ? 'Nowa aktualnosc' : 'Edycja aktualnosci'));
    card.appendChild(field('Tytul', data.title, v => data.title = v));
    card.appendChild(field('Slug (URL)', data.slug, v => data.slug = v, 'np. nowa-inwestycja-ozon'));
    card.appendChild(field('Zajawka (excerpt)', data.excerpt, v => data.excerpt = v, null, 'textarea'));
    // WYSIWYG body
    card.appendChild(h('div', { class: 'field' },
      h('label', { class: 'field__label' }, 'Tresc artykulu'),
      (() => { const wr = h('div'); const inst = mountWysiwyg(wr, data.body || ''); data.__bodyInst = inst; return wr; })(),
    ));
    main.appendChild(card);

    const side = h('div', {});
    const metaCard = h('div', { class: 'editor-card' },
      h('div', { class: 'editor-card__title' }, 'Metadane'),
      field('Data publikacji', data.date, v => data.date = v, null, 'date'),
      field('URL okladki (obraz)', data.cover, v => data.cover = v, 'https://...'),
    );
    side.appendChild(metaCard);

    wrap.appendChild(main); wrap.appendChild(side); root.appendChild(wrap);

    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--ghost', onclick: () => renderSection('news') }, 'Anuluj'),
      h('button', { class: 'btn btn--primary', onclick: async () => {
        data.body = data.__bodyInst.getValue(); delete data.__bodyInst;
        if (!data.title || !data.slug) return alert('Wymagane: Tytul, Slug');
        const next = isNew ? [...list, data] : list.map(x => x.id === data.id ? data : x);
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/news', next); setSaveStatus('saved', 'Zapisano'); renderSection('news'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz'),
    ));
  }

  /* --------- Realizacje ---------- */
  async function renderRealizacjeList(root) {
    const list = (await api('GET', '/content/realizacje')) || [];
    root.innerHTML = '';
    if (state.pendingAction === 'new') { state.pendingAction = null; return renderRealizacjaForm(root, null, list); }
    root.appendChild(h('div', { class: 'list-header' },
      h('input', { class: 'list-header__search', type: 'search', placeholder: 'Szukaj...', oninput: e => filterItems(root, e.target.value) }),
      h('button', { class: 'btn btn--primary', onclick: () => renderRealizacjaForm(root, null, list) }, '+ Nowa realizacja'),
    ));
    const ul = h('div', { class: 'item-list' });
    list.forEach(item => {
      ul.appendChild(h('div', { class: 'item-row', 'data-search': (item.title + ' ' + item.city).toLowerCase() },
        h('div', { class: 'item-row__main' },
          h('div', { class: 'item-row__title' }, item.title),
          h('div', { class: 'item-row__meta' },
            h('span', {}, item.city),
            h('span', { class: 'badge ' + (item.status === 'building' ? 'badge--gold' : 'badge--green') }, item.status === 'building' ? 'W budowie' : 'Zrealizowane'),
            h('span', {}, item.units + ' lokali'),
            h('span', {}, item.area),
          ),
        ),
        h('div', { class: 'item-row__actions' },
          h('a', { class: 'btn btn--ghost btn--sm', href: '/inwestycja/?slug=' + item.slug, target: '_blank' }, 'Podglad'),
          h('button', { class: 'btn btn--ghost btn--sm', onclick: () => renderRealizacjaForm(root, item, list) }, 'Edytuj'),
          h('button', { class: 'btn btn--danger btn--sm', onclick: async () => {
            if (!confirm2('Usunac te realizacje?')) return;
            const next = list.filter(x => x.id !== item.id);
            await api('PUT', '/content/realizacje', next); setSaveStatus('saved', 'Usunieto');
            renderSection('realizacje');
          } }, 'Usun'),
        ),
      ));
    });
    root.appendChild(ul);
  }
  function renderRealizacjaForm(root, item, list) {
    const isNew = !item;
    const data = item ? { ...item } : { id: 'r' + Date.now(), slug: '', title: '', city: '', status: 'building', type: 'apartamenty', year: 2026, cover: '', lat: 54.37, lng: 18.63, description: '', units: 0, area: '' };
    root.innerHTML = '';
    const wrap = h('div', { class: 'editor-wrap' });
    const main = h('div', {},
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, isNew ? 'Nowa realizacja' : 'Edycja realizacji'),
        field('Nazwa inwestycji', data.title, v => data.title = v),
        field('Slug (URL)', data.slug, v => data.slug = v, 'np. cloud-lindego'),
        twoCol(field('Miasto', data.city, v => data.city = v), field('Rok zakonczenia', data.year, v => data.year = Number(v), null, 'number')),
        twoCol(selectField('Status', data.status, v => data.status = v, [['building','W budowie'],['done','Zrealizowane']]), selectField('Typ', data.type, v => data.type = v, [['apartamenty','Apartamenty'],['osiedle','Osiedle'],['dom','Dom jednorodzinny']])),
        twoCol(field('Liczba lokali', data.units, v => data.units = Number(v), null, 'number'), field('Zakres metrazu', data.area, v => data.area = v, 'np. 42-135 m2')),
        field('URL okladki (obraz)', data.cover, v => data.cover = v, 'https://...'),
        h('div', { class: 'field' },
          h('label', { class: 'field__label' }, 'Opis inwestycji'),
          (() => { const wr = h('div'); const inst = mountWysiwyg(wr, data.description || ''); data.__descInst = inst; return wr; })(),
        ),
      ),
    );
    const side = h('div', {},
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'Lokalizacja (mapa)'),
        twoCol(field('Szerokosc (lat)', data.lat, v => data.lat = Number(v), null, 'number'), field('Dlugosc (lng)', data.lng, v => data.lng = Number(v), null, 'number')),
        h('p', { class: 'field__hint' }, 'Wspolrzedne GPS uzywane na mapie Google Maps'),
      ),
    );
    wrap.appendChild(main); wrap.appendChild(side); root.appendChild(wrap);
    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--ghost', onclick: () => renderSection('realizacje') }, 'Anuluj'),
      h('button', { class: 'btn btn--primary', onclick: async () => {
        data.description = data.__descInst.getValue(); delete data.__descInst;
        if (!data.title || !data.slug) return alert('Wymagane: Nazwa, Slug');
        const next = isNew ? [...list, data] : list.map(x => x.id === data.id ? data : x);
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/realizacje', next); setSaveStatus('saved', 'Zapisano'); renderSection('realizacje'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz'),
    ));
  }

  /* --------- FAQ ---------- */
  async function renderFaqList(root) {
    const list = (await api('GET', '/content/faq')) || [];
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'list-header' },
      h('h2', { class: 'admin-section-title', style: 'margin:0' }, 'Lista pytan'),
      h('button', { class: 'btn btn--primary', onclick: () => {
        list.push({ id: 'f' + Date.now(), q: '', a: '' });
        renderFaqEdit(root, list);
      } }, '+ Nowe pytanie'),
    ));
    renderFaqEdit(root, list);
  }
  function renderFaqEdit(root, list) {
    // keep list-header at top, attach edit cards
    while (root.children.length > 1) root.removeChild(root.lastChild);
    const box = h('div', {});
    list.forEach((item, idx) => {
      const card = h('div', { class: 'editor-card', style: { marginBottom: '12px' } },
        h('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px' },
          h('div', { class: 'editor-card__title', style: 'margin:0;padding:0;border:0' }, 'Pytanie #' + (idx + 1)),
          h('button', { class: 'btn btn--danger btn--sm', onclick: () => { list.splice(idx, 1); renderFaqEdit(root, list); } }, 'Usun'),
        ),
        field('Pytanie', item.q, v => item.q = v),
        field('Odpowiedz', item.a, v => item.a = v, null, 'textarea'),
      );
      box.appendChild(card);
    });
    root.appendChild(box);
    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--primary', onclick: async () => {
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/faq', list); setSaveStatus('saved', 'Zapisano'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz zmiany'),
    ));
  }

  /* --------- Testimonials ---------- */
  async function renderTestimonialsList(root) {
    const list = (await api('GET', '/content/testimonials')) || [];
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'list-header' },
      h('h2', { class: 'admin-section-title', style: 'margin:0' }, 'Opinie'),
      h('button', { class: 'btn btn--primary', onclick: () => { list.push({ id: 't' + Date.now(), author: '', role: '', text: '', photo: '' }); renderTestimonialsEdit(root, list); } }, '+ Nowa opinia'),
    ));
    renderTestimonialsEdit(root, list);
  }
  function renderTestimonialsEdit(root, list) {
    while (root.children.length > 1) root.removeChild(root.lastChild);
    const box = h('div', {});
    list.forEach((item, idx) => {
      box.appendChild(h('div', { class: 'editor-card', style: { marginBottom: '12px' } },
        h('div', { style: 'display:flex;justify-content:space-between;margin-bottom:12px' },
          h('div', { class: 'editor-card__title', style: 'margin:0;padding:0;border:0' }, 'Opinia #' + (idx + 1)),
          h('button', { class: 'btn btn--danger btn--sm', onclick: () => { list.splice(idx, 1); renderTestimonialsEdit(root, list); } }, 'Usun'),
        ),
        twoCol(field('Autor', item.author, v => item.author = v), field('Stanowisko', item.role, v => item.role = v)),
        field('Tresc', item.text, v => item.text = v, null, 'textarea'),
        field('URL zdjecia', item.photo, v => item.photo = v, 'https://...'),
      ));
    });
    root.appendChild(box);
    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--primary', onclick: async () => {
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/testimonials', list); setSaveStatus('saved', 'Zapisano'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz'),
    ));
  }

  /* --------- Apartments (read-only mock) ---------- */
  async function renderApartmentsList(root) {
    const list = (await api('GET', '/content/apartments')) || [];
    root.innerHTML = '';
    root.appendChild(h('div', { class: 'editor-card' },
      h('p', { style: 'color:rgba(255,255,255,0.65);margin-bottom:12px' },
        h('strong', {}, 'Uwaga: '),
        'Dane mieszkan sa zaciagane przez integracje API z systemem THTG i edytowane po stronie THTG. Ponizej podglad danych zsynchronizowanych.',
      ),
    ));
    const table = h('table', { class: 'data-table' });
    table.appendChild(h('thead', {}, h('tr', {},
      ['ID','Inwestycja','Budynek','Pietro','Pokoje','Metraz','Cena','Status'].map(c => h('th', {}, c)))));
    const tbody = h('tbody');
    list.forEach(a => {
      const badge = a.status === 'available' ? 'badge--green' : a.status === 'reserved' ? 'badge--gold' : 'badge--red';
      tbody.appendChild(h('tr', {},
        h('td', {}, a.id),
        h('td', {}, a.investment),
        h('td', {}, a.building),
        h('td', {}, String(a.floor)),
        h('td', {}, String(a.rooms)),
        h('td', {}, a.area + ' m2'),
        h('td', {}, (a.priceOld ? ('Promocja: ' + a.price.toLocaleString('pl-PL')) : a.price.toLocaleString('pl-PL')) + ' PLN'),
        h('td', {}, h('span', { class: 'badge ' + badge }, a.status === 'available' ? 'Dostepne' : a.status === 'reserved' ? 'Zarezerwowane' : 'Sprzedane')),
      ));
    });
    table.appendChild(tbody);
    root.appendChild(table);
  }

  /* --------- Jobs ---------- */
  async function renderJobsList(root) {
    const list = (await api('GET', '/content/jobs')) || [];
    root.innerHTML = '';
    if (state.pendingAction === 'new') { state.pendingAction = null; return renderJobForm(root, null, list); }
    root.appendChild(h('div', { class: 'list-header' },
      h('div', { class: 'editor-card__title', style: 'margin:0;padding:0;border:0' }, 'Oferty pracy (mock eRecruiter)'),
      h('button', { class: 'btn btn--primary', onclick: () => renderJobForm(root, null, list) }, '+ Nowa oferta'),
    ));
    const ul = h('div', { class: 'item-list' });
    list.forEach(item => {
      ul.appendChild(h('div', { class: 'item-row' },
        h('div', { class: 'item-row__main' },
          h('div', { class: 'item-row__title' }, item.title),
          h('div', { class: 'item-row__meta' },
            h('span', {}, item.city),
            h('span', {}, item.department),
            h('span', { class: 'badge badge--blue' }, item.type),
            h('span', {}, 'Opublikowano: ' + item.published),
          ),
        ),
        h('div', { class: 'item-row__actions' },
          h('a', { class: 'btn btn--ghost btn--sm', href: '/kariera/?slug=' + item.slug, target: '_blank' }, 'Podglad'),
          h('button', { class: 'btn btn--ghost btn--sm', onclick: () => renderJobForm(root, item, list) }, 'Edytuj'),
          h('button', { class: 'btn btn--danger btn--sm', onclick: async () => {
            if (!confirm2('Usunac te oferte?')) return;
            const next = list.filter(x => x.id !== item.id);
            await api('PUT', '/content/jobs', next); setSaveStatus('saved', 'Usunieto');
            renderSection('jobs');
          } }, 'Usun'),
        ),
      ));
    });
    root.appendChild(ul);
  }
  function renderJobForm(root, item, list) {
    const isNew = !item;
    const data = item ? { ...item } : { id: 'j' + Date.now(), slug: '', title: '', city: '', department: '', type: 'pelny etat', published: new Date().toISOString().slice(0,10), salary: '', description: '' };
    root.innerHTML = '';
    const wrap = h('div', { class: 'editor-wrap' });
    const main = h('div', {},
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, isNew ? 'Nowa oferta pracy' : 'Edycja oferty pracy'),
        field('Stanowisko', data.title, v => data.title = v),
        field('Slug (URL)', data.slug, v => data.slug = v),
        twoCol(field('Miasto', data.city, v => data.city = v), field('Dzial', data.department, v => data.department = v)),
        twoCol(selectField('Wymiar pracy', data.type, v => data.type = v, [['pelny etat','Pelny etat'],['niepelny etat','Niepelny etat'],['kontrakt B2B','Kontrakt B2B'],['staz','Staz']]), field('Data publikacji', data.published, v => data.published = v, null, 'date')),
        field('Wynagrodzenie', data.salary, v => data.salary = v, 'np. 10 000 - 14 000 PLN'),
        h('div', { class: 'field' },
          h('label', { class: 'field__label' }, 'Opis oferty'),
          (() => { const wr = h('div'); const inst = mountWysiwyg(wr, data.description || ''); data.__descInst = inst; return wr; })(),
        ),
      ),
    );
    const side = h('div', {});
    wrap.appendChild(main); wrap.appendChild(side); root.appendChild(wrap);
    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--ghost', onclick: () => renderSection('jobs') }, 'Anuluj'),
      h('button', { class: 'btn btn--primary', onclick: async () => {
        data.description = data.__descInst.getValue(); delete data.__descInst;
        if (!data.title || !data.slug) return alert('Wymagane: Tytul, Slug');
        const next = isNew ? [...list, data] : list.map(x => x.id === data.id ? data : x);
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/jobs', next); setSaveStatus('saved', 'Zapisano'); renderSection('jobs'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz'),
    ));
  }

  /* --------- Osiedla (Multisite) ---------- */
  async function renderOsiedlaList(root) {
    const list = (await api('GET', '/content/osiedla')) || [];
    root.innerHTML = '';
    if (state.pendingAction === 'new') { state.pendingAction = null; return renderOsiedleForm(root, null, list); }
    root.appendChild(h('div', { class: 'list-header' },
      h('div', { class: 'editor-card__title', style: 'margin:0;padding:0;border:0' }, 'Strony osiedli (WordPress Multisite)'),
      h('button', { class: 'btn btn--primary', onclick: () => renderOsiedleForm(root, null, list) }, '+ Dodaj strone osiedla'),
    ));
    const ul = h('div', { class: 'item-list' });
    list.forEach(item => {
      ul.appendChild(h('div', { class: 'item-row' },
        h('div', { class: 'item-row__main' },
          h('div', { class: 'item-row__title' }, h('span', { style: 'display:inline-block;width:12px;height:12px;background:' + item.accent + ';margin-right:10px;vertical-align:middle' }), item.name),
          h('div', { class: 'item-row__meta' },
            h('span', {}, item.city),
            h('span', {}, '/' + item.slug),
            h('span', { class: 'badge ' + (item.published ? 'badge--green' : 'badge--gray') }, item.published ? 'Opublikowana' : 'Ukryta'),
          ),
        ),
        h('div', { class: 'item-row__actions' },
          h('a', { class: 'btn btn--ghost btn--sm', href: '/site/' + item.slug, target: '_blank' }, 'Podglad'),
          h('button', { class: 'btn btn--ghost btn--sm', onclick: () => renderOsiedleForm(root, item, list) }, 'Edytuj'),
          h('button', { class: 'btn btn--danger btn--sm', onclick: async () => {
            if (!confirm2('Usunac te strone z multisite?')) return;
            const next = list.filter(x => x.id !== item.id);
            await api('PUT', '/content/osiedla', next); setSaveStatus('saved', 'Usunieto');
            renderSection('osiedla');
          } }, 'Usun'),
        ),
      ));
    });
    root.appendChild(ul);
  }
  function renderOsiedleForm(root, item, list) {
    const isNew = !item;
    const data = item ? { ...item } : { id: 's' + Date.now(), slug: '', name: '', city: '', accent: '#c9a96e', tagline: '', published: false };
    root.innerHTML = '';
    const wrap = h('div', { class: 'editor-wrap' });
    const main = h('div', {},
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, isNew ? 'Nowa strona osiedla' : 'Edycja strony'),
        field('Nazwa osiedla', data.name, v => data.name = v),
        field('Slug (adres URL strony)', data.slug, v => data.slug = v, 'np. osiedle-ozon'),
        twoCol(field('Miasto', data.city, v => data.city = v), field('Kolor akcentu', data.accent, v => data.accent = v, '#c9a96e', 'color')),
        field('Tagline (nad glownym naglowkiem)', data.tagline, v => data.tagline = v),
        h('label', { class: 'field', style: 'display:flex;align-items:center;gap:10px;margin-top:14px' },
          h('span', { class: 'switch' },
            (() => { const inp = h('input', { type: 'checkbox' }); if (data.published) inp.checked = true; inp.onchange = () => data.published = inp.checked; return inp; })(),
            h('span', { class: 'switch__track' }),
          ),
          h('span', {}, 'Opublikowana (widoczna publicznie)'),
        ),
      ),
    );
    const side = h('div', {},
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'Podglad'),
        h('p', { class: 'field__hint' }, 'Po zapisaniu strona bedzie dostepna pod adresem:'),
        h('code', { style: 'display:block;background:rgba(255,255,255,0.04);padding:10px;margin-top:8px;font-size:12px;color:#c9a96e' }, '/site/' + (data.slug || 'slug')),
      ),
    );
    wrap.appendChild(main); wrap.appendChild(side); root.appendChild(wrap);
    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--ghost', onclick: () => renderSection('osiedla') }, 'Anuluj'),
      h('button', { class: 'btn btn--primary', onclick: async () => {
        if (!data.name || !data.slug) return alert('Wymagane: Nazwa, Slug');
        const next = isNew ? [...list, data] : list.map(x => x.id === data.id ? data : x);
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/osiedla', next); setSaveStatus('saved', 'Zapisano'); renderSection('osiedla'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz'),
    ));
  }

  /* --------- Settings ---------- */
  async function renderSettings(root) {
    const s = (await api('GET', '/content/settings')) || {};
    root.innerHTML = '';
    const contact = s.contact || {};
    const social = s.social || {};
    const topBar = s.topBar || {};
    const promo = s.promoModal || {};
    const seo = s.seo || {};

    const grid = h('div', { class: 'editor-wrap' });
    const main = h('div', {},
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'Brand'),
        field('Nazwa logo', s.logo, v => s.logo = v),
        twoCol(field('Kolor akcentu', s.accent, v => s.accent = v, '#c9a96e', 'color'), field('Kolor tla', s.bg, v => s.bg = v, '#06080e', 'color')),
      ),
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'SEO'),
        field('Tytul (title)', seo.title, v => seo.title = v),
        field('Opis (meta description)', seo.description, v => seo.description = v, null, 'textarea'),
      ),
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'Dane kontaktowe'),
        twoCol(field('Telefon', contact.phone, v => contact.phone = v), field('Email', contact.email, v => contact.email = v)),
        field('Adres', contact.address, v => contact.address = v),
      ),
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'Social media'),
        field('Facebook', social.facebook, v => social.facebook = v),
        field('Instagram', social.instagram, v => social.instagram = v),
        field('LinkedIn', social.linkedin, v => social.linkedin = v),
      ),
    );

    const side = h('div', {},
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'Top bar (pasek gorny)'),
        toggleField('Wlaczony', !!topBar.enabled, v => topBar.enabled = v),
        field('Tekst', topBar.text, v => topBar.text = v),
        field('Etykieta przycisku CTA', topBar.ctaText, v => topBar.ctaText = v),
        field('Link CTA', topBar.ctaLink, v => topBar.ctaLink = v, '#sekcja lub https://...'),
      ),
      h('div', { class: 'editor-card' },
        h('div', { class: 'editor-card__title' }, 'Pop-up promocyjny'),
        toggleField('Wlaczony', !!promo.enabled, v => promo.enabled = v),
        field('Tytul', promo.title, v => promo.title = v),
        field('Tresc', promo.body, v => promo.body = v, null, 'textarea'),
        field('Etykieta przycisku', promo.ctaText, v => promo.ctaText = v),
        field('Link', promo.ctaLink, v => promo.ctaLink = v),
      ),
    );
    grid.appendChild(main); grid.appendChild(side); root.appendChild(grid);

    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--primary', onclick: async () => {
        s.contact = contact; s.social = social; s.topBar = topBar; s.promoModal = promo; s.seo = seo;
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/settings', s); setSaveStatus('saved', 'Zapisano'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz ustawienia'),
    ));
  }

  /* --------- I18n editor ---------- */
  async function renderI18n(root) {
    const data = (await api('GET', '/content/i18n')) || { pl: {}, en: {} };
    root.innerHTML = '';

    // Flatten keys (only 2 levels deep for simplicity)
    const keys = new Set();
    function collect(obj, prefix) {
      for (const k in obj) {
        const v = obj[k]; const path = prefix ? prefix + '.' + k : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) collect(v, path);
        else keys.add(path);
      }
    }
    collect(data.pl || {}, '');
    collect(data.en || {}, '');
    const sortedKeys = Array.from(keys).sort();

    const wrapCard = h('div', { class: 'editor-card' },
      h('div', { class: 'editor-card__title' }, 'Tlumaczenia (PL / EN)'),
      h('p', { class: 'field__hint', style: 'margin-bottom:16px' }, 'Klikaj w pole aby edytowac. Zmiany zapisujesz przyciskiem na dole.'),
    );
    const grid = h('div', { class: 'i18n-grid' },
      h('div', { class: 'i18n-header' }, 'Klucz'),
      h('div', { class: 'i18n-header' }, 'PL'),
      h('div', { class: 'i18n-header' }, 'EN'),
    );

    function getVal(obj, path) { return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : '', obj); }
    function setVal(obj, path, val) {
      const parts = path.split('.'); let o = obj;
      for (let i = 0; i < parts.length - 1; i++) { if (!o[parts[i]]) o[parts[i]] = {}; o = o[parts[i]]; }
      o[parts[parts.length - 1]] = val;
    }

    sortedKeys.forEach(k => {
      grid.appendChild(h('div', { style: 'color:rgba(255,255,255,0.65);font-size:12px;font-family:ui-monospace,monospace' }, k));
      const plInp = h('input', { type: 'text', value: getVal(data.pl, k) });
      plInp.addEventListener('input', () => setVal(data.pl, k, plInp.value));
      grid.appendChild(h('div', {}, plInp));
      const enInp = h('input', { type: 'text', value: getVal(data.en, k) });
      enInp.addEventListener('input', () => setVal(data.en, k, enInp.value));
      grid.appendChild(h('div', {}, enInp));
    });
    wrapCard.appendChild(grid);
    root.appendChild(wrapCard);

    root.appendChild(h('div', { class: 'editor-actions' },
      h('button', { class: 'btn btn--primary', onclick: async () => {
        setSaveStatus('saving', 'Zapisywanie...');
        try { await api('PUT', '/content/i18n', data); setSaveStatus('saved', 'Zapisano'); }
        catch (e) { setSaveStatus('error', e.message); }
      } }, 'Zapisz tlumaczenia'),
    ));
  }

  /* --------- Submissions ---------- */
  async function renderSubmissions(root) {
    const res = await api('GET', '/forms/submissions');
    const items = res.items || [];
    root.innerHTML = '';
    if (items.length === 0) {
      root.appendChild(h('div', { class: 'empty-state' },
        h('div', { class: 'empty-state__title' }, 'Brak zgloszen'),
        h('div', { class: 'empty-state__text' }, 'Wiadomosci wyslane przez formularze pojawia sie tutaj.'),
      ));
      return;
    }
    const table = h('table', { class: 'data-table' });
    table.appendChild(h('thead', {}, h('tr', {}, ['Data','Formularz','Strona','Od','Email','Telefon','Wiadomosc'].map(c => h('th', {}, c)))));
    const tbody = h('tbody');
    items.forEach(s => {
      const d = s.data || {};
      tbody.appendChild(h('tr', {},
        h('td', {}, new Date(s.createdAt).toLocaleString('pl-PL')),
        h('td', {}, h('span', { class: 'badge badge--blue' }, s.formType || 'contact')),
        h('td', {}, s.sourcePage || '-'),
        h('td', {}, d.name || '-'),
        h('td', {}, h('a', { href: 'mailto:' + d.email }, d.email || '-')),
        h('td', {}, d.phone || '-'),
        h('td', { style: 'max-width:320px;white-space:pre-wrap' }, d.message || ''),
      ));
    });
    table.appendChild(tbody);
    root.appendChild(table);
  }

  /* ============ Helpers for forms ============ */
  function field(label, value, onChange, placeholder, type) {
    const t = type || 'text';
    const wrapTag = t === 'textarea' ? 'textarea' : 'input';
    const attrs = { class: t === 'textarea' ? 'field__textarea' : 'field__input', oninput: e => onChange(e.target.value) };
    if (t !== 'textarea') attrs.type = t;
    if (placeholder) attrs.placeholder = placeholder;
    if (value !== undefined && value !== null && t !== 'textarea') attrs.value = value;
    const el = h(wrapTag, attrs);
    if (t === 'textarea' && value) el.value = value;
    return h('label', { class: 'field' },
      h('span', { class: 'field__label' }, label),
      el,
    );
  }
  function selectField(label, value, onChange, options) {
    const select = h('select', { class: 'field__select', onchange: e => onChange(e.target.value) },
      ...options.map(([v, l]) => {
        const opt = h('option', { value: v }, l);
        if (v === value) opt.selected = true;
        return opt;
      }),
    );
    return h('label', { class: 'field' },
      h('span', { class: 'field__label' }, label),
      select,
    );
  }
  function toggleField(label, value, onChange) {
    const cb = h('input', { type: 'checkbox' });
    cb.checked = !!value;
    cb.addEventListener('change', () => onChange(cb.checked));
    return h('label', { class: 'field', style: 'display:flex;align-items:center;gap:10px;margin-bottom:10px' },
      h('span', { class: 'switch' }, cb, h('span', { class: 'switch__track' })),
      h('span', {}, label),
    );
  }
  function twoCol(a, b) { return h('div', { class: 'editor-row cols-2' }, a, b); }
  function filterItems(root, query) {
    const q = (query || '').toLowerCase();
    root.querySelectorAll('[data-search]').forEach(r => {
      r.style.display = r.getAttribute('data-search').includes(q) ? '' : 'none';
    });
  }

  /* ============ UI wiring ============ */
  function showLogin() {
    $('#loginScreen').hidden = false;
    $('#adminApp').hidden = true;
  }
  function showApp() {
    $('#loginScreen').hidden = true;
    $('#adminApp').hidden = false;
    renderSection('dashboard');
  }

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await login(fd.get('user'), fd.get('pass'));
      $('#loginError').hidden = true;
      showApp();
    } catch (err) {
      const eb = $('#loginError'); eb.hidden = false; eb.textContent = 'Nieprawidlowe dane logowania.';
    }
  });

  $$('.admin-nav__item').forEach(b => b.addEventListener('click', () => renderSection(b.dataset.section)));
  $('#logoutBtn').addEventListener('click', logout);

  /* ============ Boot ============ */
  (async () => {
    const ok = await checkSession();
    if (ok) showApp();
    else showLogin();
  })();
})();
