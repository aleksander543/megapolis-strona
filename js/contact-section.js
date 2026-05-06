// Megapolis — sekcja kontaktowa wstrzykiwana automatycznie przed <footer>
// Pokazuje doradce, telefon, email, formularz CTA. Cel: kontakt w wielu miejscach.
//
// Konfiguracja: window.MEGAPOLIS_CONTACT (opcjonalnie)
// Dezaktywacja: <body data-no-contact-section="1">

(function () {
  if (document.body && document.body.dataset.noContactSection === '1') return;
  if (document.documentElement && document.documentElement.dataset.noContactSection === '1') return;
  if (document.getElementById('mpContactSection')) return;

  // Skip /kontakt - tam juz jest pelny formularz
  var p = window.location.pathname || '';
  if (p.indexOf('/kontakt') === 0) return;

  var cfg = window.MEGAPOLIS_CONTACT || {};
  var phone = cfg.phone || '+48123000077';
  var phoneDisplay = cfg.phoneDisplay || '12 300 00 77';
  var email = cfg.email || 'biuro@megapolis.pl';

  // Style (jednorazowo)
  if (!document.getElementById('mpContactSectionStyle')) {
    var st = document.createElement('style');
    st.id = 'mpContactSectionStyle';
    st.textContent = (
      '.mp-contact-section{position:relative;padding:64px 24px;background:linear-gradient(180deg,#ffffff 0%,#f4f2ec 100%);border-top:1px solid rgba(0,60,113,0.06);}' +
      '.mp-contact-section__inner{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;}' +
      '.mp-contact-section__head{}' +
      '.mp-contact-section__eyebrow{display:inline-block;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:800;color:#003C71;padding:6px 16px;border:1px solid rgba(0,60,113,0.18);border-radius:9999px;margin-bottom:16px;}' +
      '.mp-contact-section__title{font-family:Ubuntu,sans-serif;font-size:clamp(26px,3vw,40px);font-weight:800;line-height:1.1;color:#003C71;margin:0 0 14px;letter-spacing:-0.4px;}' +
      '.mp-contact-section__title em{font-style:italic;font-weight:300;color:#c9a96e;}' +
      '.mp-contact-section__lead{font-size:15px;line-height:1.6;color:rgba(0,0,0,0.7);margin:0 0 8px;max-width:480px;}' +
      '.mp-contact-section__actions{display:flex;flex-direction:column;gap:14px;}' +
      '.mp-contact-action{display:flex;align-items:center;gap:18px;padding:18px 22px;background:#ffffff;border:1px solid rgba(0,60,113,0.12);border-radius:16px;text-decoration:none;color:#003C71;transition:all 0.25s ease;box-shadow:0 4px 14px rgba(0,60,113,0.05);}' +
      '.mp-contact-action:hover{border-color:#003C71;transform:translateY(-2px);box-shadow:0 14px 38px rgba(0,60,113,0.14);}' +
      '.mp-contact-action__ico{flex:0 0 auto;width:48px;height:48px;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#003C71 0%,#1a5490 100%);color:#c9a96e;border-radius:14px;}' +
      '.mp-contact-action__body{display:flex;flex-direction:column;gap:2px;flex:1;}' +
      '.mp-contact-action__lbl{font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:rgba(0,0,0,0.55);}' +
      '.mp-contact-action__val{font-family:Ubuntu,sans-serif;font-size:18px;font-weight:800;color:#003C71;letter-spacing:-0.2px;}' +
      '.mp-contact-action__arrow{flex:0 0 auto;color:rgba(0,60,113,0.3);transition:transform 0.25s ease,color 0.25s ease;}' +
      '.mp-contact-action:hover .mp-contact-action__arrow{transform:translateX(4px);color:#c9a96e;}' +
      '@media (max-width:760px){.mp-contact-section{padding:48px 20px;}.mp-contact-section__inner{grid-template-columns:1fr;gap:28px;}.mp-contact-action{padding:14px 18px;}.mp-contact-action__val{font-size:16px;}}'
    );
    document.head.appendChild(st);
  }

  // HTML
  var section = document.createElement('section');
  section.id = 'mpContactSection';
  section.className = 'mp-contact-section';
  section.setAttribute('aria-label', 'Kontakt z doradcą Megapolis');
  section.innerHTML = (
    '<div class="mp-contact-section__inner">' +
      '<div class="mp-contact-section__head">' +
        '<span class="mp-contact-section__eyebrow">Porozmawiajmy</span>' +
        '<h2 class="mp-contact-section__title">Wybierz dogodną <em>formę kontaktu</em></h2>' +
        '<p class="mp-contact-section__lead">Doradca odpowie na pytania o&nbsp;mieszkania, finansowanie i&nbsp;dostępność. Zwykle oddzwaniamy w&nbsp;godzinę.</p>' +
      '</div>' +
      '<div class="mp-contact-section__actions">' +
        '<a class="mp-contact-action" href="tel:' + phone + '" aria-label="Zadzwon do doradcy">' +
          '<span class="mp-contact-action__ico">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
          '</span>' +
          '<span class="mp-contact-action__body">' +
            '<span class="mp-contact-action__lbl">Zadzwoń &middot; pn-pt 9-17</span>' +
            '<span class="mp-contact-action__val">' + phoneDisplay + '</span>' +
          '</span>' +
          '<svg class="mp-contact-action__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</a>' +
        '<a class="mp-contact-action" href="mailto:' + email + '" aria-label="Napisz do nas">' +
          '<span class="mp-contact-action__ico">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
          '</span>' +
          '<span class="mp-contact-action__body">' +
            '<span class="mp-contact-action__lbl">Napisz mail</span>' +
            '<span class="mp-contact-action__val">' + email + '</span>' +
          '</span>' +
          '<svg class="mp-contact-action__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</a>' +
        '<a class="mp-contact-action" href="/kontakt" aria-label="Otworz formularz kontaktowy">' +
          '<span class="mp-contact-action__ico">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"/><line x1="3" y1="22" x2="21" y2="22"/></svg>' +
          '</span>' +
          '<span class="mp-contact-action__body">' +
            '<span class="mp-contact-action__lbl">Pełny formularz</span>' +
            '<span class="mp-contact-action__val">Umów rozmowę online</span>' +
          '</span>' +
          '<svg class="mp-contact-action__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        '</a>' +
      '</div>' +
    '</div>'
  );

  // Wstaw przed <footer>
  var footer = document.querySelector('footer.footer') || document.querySelector('footer');
  if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(section, footer);
  } else {
    document.body.appendChild(section);
  }
})();
