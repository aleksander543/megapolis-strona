// Megapolis — Floating Action Button (FAB) kontaktu
// Wstawia w prawym dolnym rogu pillowy przycisk z 2 akcjami: zadzwon + napisz
// UX: minimalistyczny domyslnie, rozwija sie po hover/klik na mobile
//
// Konfiguracja: window.MEGAPOLIS_CONTACT (opcjonalnie, fallback ponizej)
// Dezaktywacja na konkretnej stronie: <body data-no-fab="1"> lub <html data-no-fab="1">

(function () {
  if (document.body && document.body.dataset.noFab === '1') return;
  if (document.documentElement && document.documentElement.dataset.noFab === '1') return;

  // Idempotentny: nie dodawaj dwa razy
  if (document.getElementById('mpContactFab')) return;

  var cfg = window.MEGAPOLIS_CONTACT || {};
  var phone = cfg.phone || '+48123000077';
  var phoneDisplay = cfg.phoneDisplay || '12 300 00 77';
  var email = cfg.email || 'biuro@megapolis.pl';

  // === Style (jednorazowe wstrzyknięcie) ===
  if (!document.getElementById('mpContactFabStyle')) {
    var st = document.createElement('style');
    st.id = 'mpContactFabStyle';
    st.textContent = (
      '.mp-fab{position:fixed;right:22px;bottom:22px;z-index:90;display:flex;flex-direction:column;align-items:flex-end;gap:10px;font-family:inherit;}' +
      '.mp-fab__action{display:inline-flex;align-items:center;gap:10px;padding:12px 18px;background:#ffffff;color:#003C71;border:1px solid rgba(0,60,113,0.15);border-radius:9999px;font-size:13px;font-weight:600;letter-spacing:0.2px;text-decoration:none;box-shadow:0 14px 32px rgba(0,60,113,0.18);transition:transform 0.25s cubic-bezier(0.2,0.8,0.2,1),box-shadow 0.25s ease,background 0.2s ease;opacity:0;transform:translateY(8px) scale(0.96);pointer-events:none;}' +
      '.mp-fab__action svg{flex:0 0 auto;color:#c9a96e;}' +
      '.mp-fab__action:hover{background:#003C71;color:#ffffff;transform:translateY(-2px) scale(1);box-shadow:0 18px 40px rgba(0,60,113,0.3);}' +
      '.mp-fab__action:hover svg{color:#c9a96e;}' +
      '.mp-fab.is-open .mp-fab__action{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}' +
      '.mp-fab.is-open .mp-fab__action:nth-child(1){transition-delay:0.06s;}' +
      '.mp-fab.is-open .mp-fab__action:nth-child(2){transition-delay:0.12s;}' +
      '.mp-fab__toggle{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;background:linear-gradient(135deg,#003C71 0%,#1a5490 100%);color:#ffffff;border:0;border-radius:50%;box-shadow:0 18px 36px rgba(0,60,113,0.32);cursor:pointer;transition:transform 0.3s cubic-bezier(0.2,0.8,0.2,1),box-shadow 0.25s ease,background 0.25s ease;}' +
      '.mp-fab__toggle:hover{background:linear-gradient(135deg,#1a5490 0%,#003C71 100%);box-shadow:0 22px 44px rgba(0,60,113,0.4);}' +
      '.mp-fab__toggle svg{transition:transform 0.3s cubic-bezier(0.2,0.8,0.2,1);}' +
      '.mp-fab.is-open .mp-fab__toggle svg{transform:rotate(90deg);}' +
      '.mp-fab__toggle .mp-fab__close{display:none;}' +
      '.mp-fab.is-open .mp-fab__toggle .mp-fab__open{display:none;}' +
      '.mp-fab.is-open .mp-fab__toggle .mp-fab__close{display:block;}' +
      '@media (max-width:560px){' +
      '.mp-fab{right:14px;bottom:14px;}' +
      '.mp-fab__action{font-size:12px;padding:10px 14px;}' +
      '.mp-fab__toggle{width:54px;height:54px;}' +
      '}' +
      '/* Hide on /kontakt - FAB redundant */' +
      'body[data-page="kontakt"] .mp-fab{display:none;}'
    );
    document.head.appendChild(st);
  }

  // === HTML ===
  var fab = document.createElement('div');
  fab.id = 'mpContactFab';
  fab.className = 'mp-fab';
  fab.innerHTML = (
    '<a class="mp-fab__action" href="tel:' + phone + '" aria-label="Zadzwon do nas">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
      'Zadzwoń &middot; ' + phoneDisplay +
    '</a>' +
    '<a class="mp-fab__action" href="mailto:' + email + '" aria-label="Napisz do nas">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
      'Napisz mail' +
    '</a>' +
    '<button type="button" class="mp-fab__toggle" id="mpFabToggle" aria-label="Otworz akcje kontaktowe" aria-expanded="false">' +
      '<svg class="mp-fab__open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
      '<svg class="mp-fab__close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>'
  );
  document.body.appendChild(fab);

  var toggle = fab.querySelector('#mpFabToggle');
  toggle.addEventListener('click', function () {
    var open = !fab.classList.contains('is-open');
    fab.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Auto-zamykaj po klikach poza
  document.addEventListener('click', function (e) {
    if (!fab.contains(e.target)) {
      fab.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ESC zamyka
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && fab.classList.contains('is-open')) {
      fab.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
