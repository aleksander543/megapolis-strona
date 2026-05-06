// Megapolis — generator tabeli porownawczej dla mieszkan
// Uzywane w /wyszukiwarka i /ulubione
// API: window.renderMegapolisCompareTable(targetEl, ids, options)
//
// options.showRemove (bool): czy pokazac X usun z porownywarki
// options.removeAction (fn(id)): callback po klikniecu X

(function () {
  function fmt(p) {
    return window.formatMegapolisPrice ? window.formatMegapolisPrice(p) : (p + ' zł');
  }

  // Pomocnicze: znajdz indeks "najlepszego" w wierszu po wartosci
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

  // Sparsuj rok-kwartal z stringow typu "Q4 2024", "Zrealizowane · 2024"
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

  function render(targetEl, ids, options) {
    options = options || {};
    if (!targetEl) return;
    if (!Array.isArray(ids) || ids.length === 0) {
      targetEl.innerHTML = '';
      return;
    }
    if (!window.getMegapolisApartment) {
      targetEl.innerHTML = '<p class="cmp-error">Brak danych mieszkan (apartments-data.js).</p>';
      return;
    }

    var apts = ids.map(window.getMegapolisApartment).filter(Boolean);
    if (apts.length === 0) {
      targetEl.innerHTML = '<p class="cmp-empty">Wybrane mieszkania nie sa juz dostepne.</p>';
      return;
    }

    // Wartosci do wykrycia "najlepszego"
    var prices       = apts.map(function (a) { return Number(a.price) || NaN; });
    var pricesPerM2  = apts.map(function (a) { return Number(a.pricePerM2 || (a.price / a.area)) || NaN; });
    var areas        = apts.map(function (a) { return Number(a.area) || NaN; });
    var deliveries   = apts.map(function (a) { return parseDelivery(a.delivery); });

    var bestPrice    = bestIndex(prices, 'min');
    var bestM2price  = bestIndex(pricesPerM2, 'min');
    var bestArea     = bestIndex(areas, 'max');
    var bestDelivery = bestIndex(deliveries, 'min');

    var invColors = { ozon: '#2d7a5f', clou: '#c9a55c', fi: '#e8614a', bunscha: '#1a5490', link: '#1a5490' };

    // Naglowki kolumn (mieszkania)
    var headHtml = apts.map(function (a) {
      var color = invColors[a.investment] || '#003C71';
      var planSrc = a.plan || '';
      return (
        '<th data-id="' + escapeHtml(a.id) + '">' +
          '<div class="cmp-col-head">' +
            (options.showRemove ?
              '<button class="cmp-col-remove" data-cmp-remove="' + escapeHtml(a.id) + '" aria-label="Usun ' + escapeHtml(a.id) + ' z porownywarki" title="Usun z porownywarki">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
              '</button>'
              : ''
            ) +
            (planSrc ? '<div class="cmp-col-plan" style="--inv-c:' + color + ';"><img src="' + escapeHtml(planSrc) + '" alt="Rzut ' + escapeHtml(a.id) + '" loading="lazy"></div>' : '') +
            '<span class="cmp-col-id">' + escapeHtml(a.id) + '</span>' +
            '<span class="cmp-col-sub">' + escapeHtml(a.invName) + ' &middot; ' + escapeHtml(a.city) + '</span>' +
          '</div>' +
        '</th>'
      );
    }).join('');

    // Wiersze
    function row(label, valuesHtml, bestIdx) {
      var cells = valuesHtml.map(function (html, i) {
        var cls = 'cmp-cell' + (bestIdx >= 0 && i === bestIdx ? ' cmp-cell--best' : '');
        return '<td class="' + cls + '">' + html + '</td>';
      }).join('');
      return '<tr><th class="cmp-row-label">' + label + '</th>' + cells + '</tr>';
    }

    var rows = [
      row('Cena',         apts.map(function (a) { return '<span class="cmp-price">' + fmt(a.price) + '</span>'; }), bestPrice),
      row('Cena za m²',   apts.map(function (a, i) { var v = pricesPerM2[i]; return isNaN(v) ? '—' : Math.round(v).toLocaleString('pl-PL') + ' zł/m²'; }), bestM2price),
      row('Powierzchnia', apts.map(function (a) { return (a.area + ' m²').replace('.', ','); }), bestArea),
      row('Pokoje',       apts.map(function (a) { return a.rooms; }), -1),
      row('Piętro',       apts.map(function (a) { return escapeHtml(a.floorLabel); }), -1),
      row('Strona świata',apts.map(function (a) { return escapeHtml(a.directionLabel); }), -1),
      row('Dostawa',      apts.map(function (a) { return escapeHtml(a.delivery); }), bestDelivery),
      row('Status',       apts.map(function (a) { return '<span class="cmp-status cmp-status--' + escapeHtml(a.status) + '">' + escapeHtml(a.statusLabel) + '</span>'; }), -1),
      row('Funkcje',      apts.map(function (a) {
        var f = (a.features || []).map(function (x) {
          var labels = { balkon:'Balkon', loggia:'Loggia', ogrodek:'Ogrodek', taras:'Taras', antresola:'Antresola', 'miejsce-postojowe':'Mp', komorka:'Komorka' };
          return '<span class="cmp-feat">' + (labels[x] || x) + '</span>';
        }).join('');
        return f || '—';
      }), -1),
      row('Akcja',        apts.map(function (a) {
        return '<a class="cmp-link" href="/mieszkanie/?id=' + escapeHtml(a.id) + '">Zobacz szczegoly →</a>';
      }), -1)
    ];

    var tableHtml =
      '<div class="cmp-wrap">' +
        '<table class="cmp-table">' +
          '<thead><tr><th class="cmp-row-label-head">&nbsp;</th>' + headHtml + '</tr></thead>' +
          '<tbody>' + rows.join('') + '</tbody>' +
        '</table>' +
        '<p class="cmp-legend"><span class="cmp-legend-star">★</span> oznacza najlepszy parametr w danej kategorii (najnizsza cena, najmniejsza cena/m², najwieksza powierzchnia, najwczesniejsza dostawa).</p>' +
      '</div>';

    targetEl.innerHTML = tableHtml;

    // Hookup remove buttons
    if (options.showRemove && typeof options.removeAction === 'function') {
      targetEl.querySelectorAll('[data-cmp-remove]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          options.removeAction(btn.dataset.cmpRemove);
        });
      });
    }
  }

  window.renderMegapolisCompareTable = render;
})();
