// Megapolis — porownywarka mieszkan w layoucie KART (premium, zamiast tabeli)
// Uzywane glownie w /ulubione (wiecej miejsca, lepszy UX)
// API: window.renderMegapolisCompareCards(targetEl, ids, options)

(function () {
  function fmt(p) {
    return window.formatMegapolisPrice ? window.formatMegapolisPrice(p) : (p + ' zł');
  }

  function bestIndex(values, mode) {
    var best = -1;
    var bestVal = mode === 'min' ? Infinity : -Infinity;
    values.forEach(function (v, i) {
      if (typeof v !== 'number' || isNaN(v)) return;
      if (mode === 'min' && v < bestVal) { bestVal = v; best = i; }
      if (mode === 'max' && v > bestVal) { bestVal = v; best = i; }
    });
    return best;
  }

  function parseDelivery(s) {
    if (!s) return Infinity;
    var m = String(s).match(/Q(\d)\s*(\d{4})/i);
    if (m) return parseInt(m[2], 10) * 4 + parseInt(m[1], 10);
    var y = String(s).match(/(\d{4})/);
    if (y) return parseInt(y[1], 10) * 4;
    return Infinity;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]);
    });
  }

  // Mapa kolorow inwestycji - akcent na karcie
  var invColors = {
    ozon:    { c: '#2d7a5f', name: 'OZON' },
    clou:    { c: '#c9a55c', name: 'CLOU' },
    fi:      { c: '#e8614a', name: 'Fi' },
    bunscha: { c: '#1a5490', name: 'LINK' },
    link:    { c: '#1a5490', name: 'LINK' }
  };

  // Ikonki SVG dla wierszy specyfikacji
  var icons = {
    rooms:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M12 3v18M3 12h18"/></svg>',
    area:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M3 21L21 3"/></svg>',
    floor:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V2M5 9l7-7 7 7"/></svg>',
    direction:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    delivery: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    status:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    price:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    pricePerM2:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8M9 8h.01M15 16h.01"/></svg>'
  };

  function badge(label, color) {
    color = color || '#c9a96e';
    return '<span class="cmpc-badge" style="--badge-c: ' + color + ';">★ ' + label + '</span>';
  }

  function statusClass(status) {
    return 'cmpc-status cmpc-status--' + (status || 'available');
  }

  function render(targetEl, ids, options) {
    options = options || {};
    if (!targetEl) return;
    if (!Array.isArray(ids) || ids.length === 0) {
      targetEl.innerHTML = '';
      return;
    }
    if (!window.getMegapolisApartment) {
      targetEl.innerHTML = '<p class="cmpc-error">Brak danych mieszkan (apartments-data.js).</p>';
      return;
    }

    var apts = ids.map(window.getMegapolisApartment).filter(Boolean);
    if (apts.length === 0) {
      targetEl.innerHTML = '<p class="cmpc-empty">Wybrane mieszkania nie sa juz dostepne.</p>';
      return;
    }

    // Wyznacz "najlepsze" indeksy
    var prices       = apts.map(function (a) { return Number(a.price) || NaN; });
    var pricesPerM2  = apts.map(function (a) { return Number(a.pricePerM2 || (a.price / a.area)) || NaN; });
    var areas        = apts.map(function (a) { return Number(a.area) || NaN; });
    var deliveries   = apts.map(function (a) { return parseDelivery(a.delivery); });

    var bestPrice    = bestIndex(prices, 'min');
    var bestM2price  = bestIndex(pricesPerM2, 'min');
    var bestArea     = bestIndex(areas, 'max');
    var bestDelivery = bestIndex(deliveries, 'min');

    function buildCard(a, idx) {
      var inv = invColors[a.investment] || { c: '#003C71', name: a.invName };
      var pricePerM2 = pricesPerM2[idx];
      var pricePerM2Fmt = isNaN(pricePerM2) ? '—' : Math.round(pricePerM2).toLocaleString('pl-PL') + ' zł/m²';
      var promoHtml = a.promo ? '<span class="cmpc-promo">' + escapeHtml(a.promo) + '</span>' : '';
      var oldPriceHtml = a.priceOld ? '<span class="cmpc-old-price">' + fmt(a.priceOld) + '</span>' : '';

      // Plakietki "najlepsze"
      var badges = [];
      if (idx === bestPrice && apts.length > 1)    badges.push(badge('Najtańsza', '#1c5f48'));
      if (idx === bestM2price && apts.length > 1)  badges.push(badge('Najlepsza cena/m²', '#c9a96e'));
      if (idx === bestArea && apts.length > 1)     badges.push(badge('Największa', '#1a5490'));
      if (idx === bestDelivery && apts.length > 1) badges.push(badge('Najwcześniej', '#7a3a96'));

      // Funkcje
      var featLabels = { balkon:'Balkon', loggia:'Loggia', ogrodek:'Ogródek', taras:'Taras', antresola:'Antresola', 'miejsce-postojowe':'Mp.', komorka:'Komórka' };
      var featsHtml = (a.features || []).map(function (f) {
        return '<span class="cmpc-feat">' + escapeHtml(featLabels[f] || f) + '</span>';
      }).join('');

      var removeBtn = options.showRemove ?
        '<button class="cmpc-card__remove" data-cmpc-remove="' + escapeHtml(a.id) + '" aria-label="Usun ' + escapeHtml(a.id) + ' z porownywarki">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>'
        : '';

      // Klasy "best" dla wierszy specyfikacji
      var rowPriceCls = idx === bestPrice ? ' is-best' : '';
      var rowM2Cls    = idx === bestM2price ? ' is-best' : '';
      var rowAreaCls  = idx === bestArea ? ' is-best' : '';
      var rowDelCls   = idx === bestDelivery ? ' is-best' : '';

      return (
        '<article class="cmpc-card" style="--inv-c:' + inv.c + ';">' +
          removeBtn +
          (badges.length ? '<div class="cmpc-badges">' + badges.join('') + '</div>' : '<div class="cmpc-badges cmpc-badges--placeholder"></div>') +
          '<div class="cmpc-card__plan">' +
            (a.plan ? '<img src="' + escapeHtml(a.plan) + '" alt="Rzut ' + escapeHtml(a.id) + '" loading="lazy">' : '<span class="cmpc-card__plan-empty">Brak rzutu</span>') +
          '</div>' +
          '<div class="cmpc-card__head">' +
            '<span class="cmpc-card__inv">' + escapeHtml(a.invName) + ' &middot; ' + escapeHtml(a.city) + '</span>' +
            '<h3 class="cmpc-card__id">' + escapeHtml(a.id) + '</h3>' +
            '<span class="' + statusClass(a.status) + '">' + escapeHtml(a.statusLabel || '') + '</span>' +
          '</div>' +
          '<div class="cmpc-card__price' + rowPriceCls + '">' +
            '<span class="cmpc-card__price-val">' + fmt(a.price) + '</span>' +
            (oldPriceHtml + promoHtml) +
            '<span class="cmpc-card__price-m2' + rowM2Cls + '">' + pricePerM2Fmt + '</span>' +
          '</div>' +
          '<dl class="cmpc-specs">' +
            '<div class="cmpc-spec' + rowAreaCls + '">' +
              '<dt>' + icons.area + 'Powierzchnia</dt>' +
              '<dd>' + String(a.area).replace('.', ',') + ' m²</dd>' +
            '</div>' +
            '<div class="cmpc-spec">' +
              '<dt>' + icons.rooms + 'Pokoje</dt>' +
              '<dd>' + escapeHtml(a.rooms) + '</dd>' +
            '</div>' +
            '<div class="cmpc-spec">' +
              '<dt>' + icons.floor + 'Piętro</dt>' +
              '<dd>' + escapeHtml(a.floorLabel) + '</dd>' +
            '</div>' +
            '<div class="cmpc-spec">' +
              '<dt>' + icons.direction + 'Strona świata</dt>' +
              '<dd>' + escapeHtml(a.directionLabel) + '</dd>' +
            '</div>' +
            '<div class="cmpc-spec' + rowDelCls + '">' +
              '<dt>' + icons.delivery + 'Odbiór</dt>' +
              '<dd>' + escapeHtml(a.delivery) + '</dd>' +
            '</div>' +
          '</dl>' +
          (featsHtml ? '<div class="cmpc-feats">' + featsHtml + '</div>' : '') +
          '<a class="cmpc-card__cta" href="/mieszkanie/?id=' + escapeHtml(a.id) + '">' +
            'Zobacz mieszkanie' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
          '</a>' +
        '</article>'
      );
    }

    var cardsHtml = apts.map(buildCard).join('');
    var legendHtml =
      '<div class="cmpc-legend">' +
        '<span class="cmpc-legend__star">★</span> oznacza najlepszy parametr w danej kategorii. Plakietka pokazuje, w czym konkretne mieszkanie wyróżnia się na tle pozostałych.' +
      '</div>';

    targetEl.innerHTML =
      '<div class="cmpc-grid" data-count="' + apts.length + '">' + cardsHtml + '</div>' +
      legendHtml;

    if (options.showRemove && typeof options.removeAction === 'function') {
      targetEl.querySelectorAll('[data-cmpc-remove]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          options.removeAction(btn.dataset.cmpcRemove);
        });
      });
    }
  }

  window.renderMegapolisCompareCards = render;
})();
