// Megapolis — porownywarka mieszkan
// API globalne: window.MegapolisCompare
//   .toggle(id)       - dodaj/usun z porownywarki (max 4), zwraca true/false (czy w liscie po toggle)
//   .add(id)          - dodaj (zwraca false gdy max)
//   .remove(id)       - usun
//   .has(id)          - czy w liscie
//   .getAll()         - tablica ID (max 4)
//   .count()          - ile
//   .clear()          - wyczysc
//   .on(cb)           - subskrybuj zmiany (cb dostaje liste)
//   .MAX              - 4
//
// Persystencja: sessionStorage (wyczysci sie po zamknieciu karty - intencjonalnie)

(function () {
  var STORAGE_KEY = 'megapolis_compare_v1';
  var MAX = 4;
  var listeners = [];

  function read() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter(function (x) { return typeof x === 'string'; }).slice(0, MAX) : [];
    } catch (e) { return []; }
  }

  function write(arr) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
    listeners.forEach(function (cb) { try { cb(arr); } catch (e) {} });
    try {
      window.dispatchEvent(new CustomEvent('megapolis-compare-change', { detail: arr }));
    } catch (e) {}
  }

  var api = {
    MAX: MAX,
    toggle: function (id) {
      if (!id) return false;
      id = String(id).toUpperCase();
      var list = read();
      var idx = list.indexOf(id);
      if (idx >= 0) {
        list.splice(idx, 1);
        write(list);
        return false;
      }
      if (list.length >= MAX) return false;       // limit
      list.push(id);
      write(list);
      return true;
    },
    add: function (id) {
      if (!id) return false;
      id = String(id).toUpperCase();
      var list = read();
      if (list.indexOf(id) !== -1) return true;
      if (list.length >= MAX) return false;
      list.push(id);
      write(list);
      return true;
    },
    remove: function (id) {
      if (!id) return;
      id = String(id).toUpperCase();
      var list = read();
      var idx = list.indexOf(id);
      if (idx >= 0) {
        list.splice(idx, 1);
        write(list);
      }
    },
    has: function (id) {
      if (!id) return false;
      return read().indexOf(String(id).toUpperCase()) !== -1;
    },
    getAll: function () { return read(); },
    count: function () { return read().length; },
    clear: function () { write([]); },
    on: function (cb) { if (typeof cb === 'function') listeners.push(cb); }
  };

  window.MegapolisCompare = api;
})();
