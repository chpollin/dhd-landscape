/**
 * DHd Landscape — app.js
 * Light-mode redesign with TaDiRAH-based marker colors
 */

/* ------------------------------------------------
   1. Event Bus
   ------------------------------------------------ */
const Events = {
  _h: {},
  on(e, fn) { (this._h[e] = this._h[e] || []).push(fn); },
  emit(e, d) { (this._h[e] || []).forEach(fn => fn(d)); }
};

/* ------------------------------------------------
   2. TaDiRAH Color Constants
   ------------------------------------------------ */
const TADIRAH_COLORS = {
  'Capture': '#3498DB',
  'Creation': '#9B59B6',
  'Enrichment': '#27AE60',
  'Analysis': '#E67E22',
  'Interpretation': '#C0392B',
  'Storage': '#34495E',
  'Dissemination': '#16A085',
  'Meta': '#95A5A6'
};

/* ------------------------------------------------
   3. TaDiRAH Helper
   ------------------------------------------------ */
function getDominantTadirah(inst) {
  const profile = inst.tadirahProfile || {};
  const entries = Object.entries(profile);
  if (entries.length === 0) return 'Meta';
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

/* ------------------------------------------------
   4. App Object (global)
   ------------------------------------------------ */
const App = {
  map: null,
  data: [],
  filtered: [],
  active: { disc: new Set(), meth: new Set(), country: new Set() },
  searchTerm: '',
  yearMin: 2008,

  // --- Helper: method label (handles string or {label, tadirahUri} objects) ---
  mLabel(m) { return typeof m === 'object' ? m.label : m; },

  // --- Helper: get TaDiRAH category for a method object ---
  mCategory(m) {
    if (typeof m === 'object' && m.tadirahCategory) return m.tadirahCategory;
    return null;
  },

  // --- Parse JSON string or return array ---
  parse(v) { return typeof v === 'string' ? JSON.parse(v) : v; },

  /* ------------------------------------------------
     5. Convert items array to GeoJSON FeatureCollection
     ------------------------------------------------ */
  toGeoJSON(items) {
    return {
      type: 'FeatureCollection',
      features: items.map(p => ({
        type: 'Feature',
        id: p._index,
        geometry: { type: 'Point', coordinates: p.coordinates },
        properties: {
          id:               p.id,
          name:             p.name,
          city:             p.city,
          country:          p.country,
          totalPositions:   p.totalPositions || 0,
          earliestYear:     p.earliestYear   || null,
          dominantTadirah:  getDominantTadirah(p)
        }
      }))
    };
  },

  /* ------------------------------------------------
     6. Apply filters and broadcast
     ------------------------------------------------ */
  applyFilters() {
    const { disc, meth, country } = App.active;
    const term = App.searchTerm.toLowerCase().trim();

    App.filtered = App.data.filter(p => {
      // Year filter
      if (App.yearMin > 2008 && (!p.earliestYear || p.earliestYear > App.yearMin)) return false;

      // Discipline filter
      if (disc.size > 0) {
        const pDisc = App.parse(p.disciplines || []);
        if (!pDisc.some(d => disc.has(d))) return false;
      }

      // Method filter
      if (meth.size > 0) {
        const pMeth = App.parse(p.methods || []);
        if (!pMeth.some(m => meth.has(App.mLabel(m)))) return false;
      }

      // Country filter
      if (country.size > 0 && !country.has(p.country)) return false;

      // Search filter
      if (term) {
        const haystack = [
          p.name, p.city, p.country,
          ...(App.parse(p.disciplines || [])),
          ...(App.parse(p.methods || []).map(m => App.mLabel(m)))
        ].join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      return true;
    });

    // Update map source
    App.updateMapData(App.filtered);

    // Update stats
    App.updateStats();

    // Emit event
    Events.emit('filter:changed', { filtered: App.filtered, full: App.data });

    // Fit bounds if filtered < total and there are results
    if (App.filtered.length > 0 && App.filtered.length < App.data.length) {
      const coords = App.filtered.map(p => p.coordinates);
      const lngs = coords.map(c => c[0]);
      const lats = coords.map(c => c[1]);
      const bounds = [
        [Math.min(...lngs) - 0.5, Math.min(...lats) - 0.3],
        [Math.max(...lngs) + 0.5, Math.max(...lats) + 0.3]
      ];
      App.map.fitBounds(bounds, { padding: 60, duration: 800 });
    }

    console.log(`%c[Filter]%c ${App.filtered.length}/${App.data.length} Institutionen`, 'color:#3498DB;font-weight:bold', 'color:inherit');
  },

  /* ------------------------------------------------
     7. Update map data source
     ------------------------------------------------ */
  updateMapData(items) {
    const src = App.map.getSource('institutions');
    if (src) src.setData(App.toGeoJSON(items));
  },

  /* ------------------------------------------------
     8. Show detail panel
     ------------------------------------------------ */
  showPanel(p) {
    const panel = document.getElementById('detail-panel');
    if (!panel) return;

    // Name
    const nameEl = document.getElementById('p-name');
    if (nameEl) nameEl.textContent = p.name;

    // Location + founded
    const locEl = document.getElementById('p-loc');
    if (locEl) {
      const founded = p.founded ? ` · gegr. ${p.founded}` : '';
      locEl.textContent = `${p.city}, ${p.country}${founded}`;
    }

    // Stats: Professuren, Zenodo-Records, DH-Kurse
    const statsEl = document.getElementById('p-stats');
    if (statsEl) {
      const courses = App.parse(p.dhCourses || []);
      statsEl.innerHTML = `
        <div class="panel-stat">
          <div class="panel-stat-num">${p.totalPositions || 0}</div>
          <div class="panel-stat-label">Professuren</div>
        </div>
        <div class="panel-stat">
          <div class="panel-stat-num">${p.zenodoRecordCount || 0}</div>
          <div class="panel-stat-label">Zenodo-Records</div>
        </div>
        <div class="panel-stat">
          <div class="panel-stat-num">${courses.length}</div>
          <div class="panel-stat-label">DH-Kurse</div>
        </div>`;
    }

    // TaDiRAH Profile as colored horizontal bars
    const tadirahEl = document.getElementById('p-tadirah');
    if (tadirahEl) {
      const profile = p.tadirahProfile || {};
      const entries = Object.entries(profile).sort((a, b) => b[1] - a[1]);
      if (entries.length > 0) {
        const maxVal = entries[0][1];
        tadirahEl.innerHTML = `<div class="panel-section-title">TaDiRAH-Profil</div>` +
          entries.map(([cat, val]) => {
            const pct = Math.round((val / maxVal) * 100);
            const color = TADIRAH_COLORS[cat] || TADIRAH_COLORS['Meta'];
            return `<div class="panel-tadirah-bar">
              <span class="panel-tadirah-label">${cat}</span>
              <div class="panel-tadirah-track">
                <div class="panel-tadirah-fill" style="width:${pct}%;background:${color}"></div>
              </div>
              <span class="panel-tadirah-val">${val}</span>
            </div>`;
          }).join('');
      } else {
        tadirahEl.innerHTML = '';
      }
    }

    // Disciplines as tags
    const discEl = document.getElementById('p-disc');
    if (discEl) {
      const discs = App.parse(p.disciplines || []);
      if (discs.length > 0) {
        discEl.innerHTML = `<div class="panel-section-title">Disziplinen</div>
          <div class="panel-tags">${discs.map(d => `<span class="panel-tag">${d}</span>`).join('')}</div>`;
      } else {
        discEl.innerHTML = '';
      }
    }

    // Methods as tags with TaDiRAH category color
    const methEl = document.getElementById('p-meth');
    if (methEl) {
      const meths = App.parse(p.methods || []);
      if (meths.length > 0) {
        methEl.innerHTML = `<div class="panel-section-title">Methoden</div>
          <div class="panel-tags">${meths.map(m => {
            const label = App.mLabel(m);
            const cat = App.mCategory(m);
            const color = cat && TADIRAH_COLORS[cat] ? TADIRAH_COLORS[cat] : '';
            const style = color ? ` style="border-color:${color};color:${color}"` : '';
            return `<span class="panel-tag"${style}>${label}</span>`;
          }).join('')}</div>`;
      } else {
        methEl.innerHTML = '';
      }
    }

    // DH-Studiengaenge
    const coursesEl = document.getElementById('p-courses');
    if (coursesEl) {
      const courses = App.parse(p.dhCourses || []);
      if (courses.length > 0) {
        coursesEl.innerHTML = `<div class="panel-section-title">DH-Studiengänge</div>
          <div class="panel-tags">${courses.map(c => {
            const label = typeof c === 'object' ? (c.name || c.label || c) : c;
            return `<span class="panel-tag">${label}</span>`;
          }).join('')}</div>`;
      } else {
        coursesEl.innerHTML = '';
      }
    }

    // CLARIN Centre
    const clarinEl = document.getElementById('p-clarin');
    if (clarinEl) {
      if (p.clarinCentre) {
        const cc = p.clarinCentre;
        const typeLabel = typeof cc === 'object' ? (cc.type || cc.label || JSON.stringify(cc)) : cc;
        clarinEl.innerHTML = `<div class="panel-section-title">CLARIN-Zentrum</div>
          <div class="panel-tags"><span class="panel-tag">${typeLabel}</span></div>`;
      } else {
        clarinEl.innerHTML = '';
      }
    }

    // Positions (without open/filled distinction)
    const posEl = document.getElementById('p-positions');
    if (posEl) {
      const positions = App.parse(p.positions || []);
      if (positions.length > 0) {
        posEl.innerHTML = `<div class="panel-section-title">Professuren</div>` +
          positions.map(pos => {
            const temp = pos.temporary ? ' · befristet' : '';
            return `
              <div class="panel-position">
                <div class="panel-pos-name">${pos.name}</div>
                <div class="panel-pos-meta">${pos.level || ''}${pos.year ? ' · ' + pos.year : ''}${temp}</div>
              </div>`;
          }).join('');
      } else {
        posEl.innerHTML = '';
      }
    }

    // Links: Website, Wikidata, ROR, GND
    const linksEl = document.getElementById('p-links');
    if (linksEl) {
      let html = '';
      if (p.url) {
        html += `<a class="panel-link" href="${p.url}" target="_blank" rel="noopener">Website</a>`;
      }
      if (p.wikidataId) {
        const wdUrl = p.wikidataId.startsWith('http')
          ? p.wikidataId
          : `https://www.wikidata.org/wiki/${p.wikidataId}`;
        html += `<a class="panel-link" href="${wdUrl}" target="_blank" rel="noopener">Wikidata</a>`;
      }
      if (p.rorId) {
        const rorUrl = p.rorId.startsWith('http') ? p.rorId : `https://ror.org/${p.rorId}`;
        html += `<a class="panel-link" href="${rorUrl}" target="_blank" rel="noopener">ROR</a>`;
      }
      if (p.gndId) {
        const gndUrl = p.gndId.startsWith('http') ? p.gndId : `https://d-nb.info/gnd/${p.gndId}`;
        html += `<a class="panel-link" href="${gndUrl}" target="_blank" rel="noopener">GND</a>`;
      }
      linksEl.innerHTML = html;
    }

    // Open panel
    panel.classList.add('open');
    console.log(`%c[Panel]%c ${p.name}`, 'color:#3498DB;font-weight:bold', 'color:inherit');
  },

  /* ------------------------------------------------
     9. Close detail panel
     ------------------------------------------------ */
  closePanel() {
    const panel = document.getElementById('detail-panel');
    if (panel) panel.classList.remove('open');
  },

  /* ------------------------------------------------
     10. Update stats bar
     ------------------------------------------------ */
  updateStats() {
    const el = document.getElementById('stats-text');
    if (!el) return;

    const f = App.filtered;
    const stellen = f.reduce((s, p) => s + (p.totalPositions || 0), 0);
    const discs = new Set();
    f.forEach(p => {
      const d = App.parse(p.disciplines || []);
      d.forEach(x => discs.add(x));
    });
    const cities = new Set(f.map(p => p.city)).size;

    el.textContent = `${f.length} Institutionen · ${stellen} Professuren · ${discs.size} Disziplinen · ${cities} Standorte`;
  },

  /* ------------------------------------------------
     11. Build legend
     ------------------------------------------------ */
  buildLegend() {
    const legendItems = document.getElementById('legend-items');
    if (legendItems) {
      Object.entries(TADIRAH_COLORS).forEach(([cat, color]) => {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `<span class="legend-dot" style="background:${color}"></span> ${cat}`;
        legendItems.appendChild(div);
      });
    }
  },

  /* ------------------------------------------------
     12. Initialization
     ------------------------------------------------ */
  async init() {
    console.log('%c[DHd Landscape]%c Loading data...', 'color:#3498DB;font-weight:bold', 'color:inherit');

    // Load data
    const res = await fetch('Data/institutions.json');
    App.data = await res.json();

    // Assign stable numeric index for GeoJSON feature ids
    App.data.forEach((p, i) => { p._index = i; });
    App.filtered = [...App.data];

    console.log(`%c[DHd Landscape]%c ${App.data.length} institutions loaded`, 'color:#3498DB;font-weight:bold', 'color:inherit');

    // Build legend
    App.buildLegend();

    // Panel close button
    const closeBtn = document.getElementById('panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => App.closePanel());
    }

    // ---- Map Initialization ----
    App.map = new maplibregl.Map({
      container: 'map-container',
      style: {
        version: 8,
        sources: {
          'carto': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          }
        },
        layers: [{
          id: 'carto-tiles',
          type: 'raster',
          source: 'carto',
          minzoom: 0,
          maxzoom: 20
        }],
        glyphs: 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=get_your_own_OpIi9ZULNHzrESv6T2vL'
      },
      center: [10.5, 50.0],
      zoom: 3.5,
      maxBounds: [[-5, 43], [25, 57]]
    });

    App.map.addControl(new maplibregl.NavigationControl(), 'top-right');

    // ---- Map Layers (on load) ----
    App.map.on('load', () => {
      console.log('%c[Map]%c Loaded, adding layers...', 'color:#27AE60;font-weight:bold', 'color:inherit');

      // Source
      App.map.addSource('institutions', {
        type: 'geojson',
        data: App.toGeoJSON(App.data),
        promoteId: 'id'
      });

      // Layer: glow
      App.map.addLayer({
        id: 'inst-glow',
        type: 'circle',
        source: 'institutions',
        paint: {
          'circle-radius': 30,
          'circle-color': ['match', ['get', 'dominantTadirah'],
            'Capture', '#3498DB',
            'Creation', '#9B59B6',
            'Enrichment', '#27AE60',
            'Analysis', '#E67E22',
            'Interpretation', '#C0392B',
            'Storage', '#34495E',
            'Dissemination', '#16A085',
            '#95A5A6'
          ],
          'circle-blur': 1,
          'circle-opacity': 0.08
        }
      });

      // Layer: circles (TaDiRAH-based color)
      App.map.addLayer({
        id: 'inst-circles',
        type: 'circle',
        source: 'institutions',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'totalPositions'],
            1, 5,
            3, 9,
            5, 12,
            7, 15
          ],
          'circle-color': ['match', ['get', 'dominantTadirah'],
            'Capture', '#3498DB',
            'Creation', '#9B59B6',
            'Enrichment', '#27AE60',
            'Analysis', '#E67E22',
            'Interpretation', '#C0392B',
            'Storage', '#34495E',
            'Dissemination', '#16A085',
            '#95A5A6'
          ],
          'circle-stroke-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            1
          ],
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#2C3E50',
            'rgba(0,0,0,0.15)'
          ],
          'circle-opacity': 0.85
        }
      });

      // Layer: count labels (for totalPositions >= 3)
      App.map.addLayer({
        id: 'inst-count',
        type: 'symbol',
        source: 'institutions',
        filter: ['>=', ['get', 'totalPositions'], 3],
        layout: {
          'text-field': ['to-string', ['get', 'totalPositions']],
          'text-font': ['Open Sans Semibold'],
          'text-size': 10,
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Layer: city labels
      App.map.addLayer({
        id: 'inst-labels',
        type: 'symbol',
        source: 'institutions',
        minzoom: 6.5,
        layout: {
          'text-field': ['get', 'city'],
          'text-font': ['Open Sans Regular'],
          'text-size': 11,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': 'rgba(44,62,80,0.7)',
          'text-halo-color': 'rgba(255,255,255,0.9)',
          'text-halo-width': 1.5
        }
      });

      // ---- Hover handlers ----
      let hoveredId = null;

      App.map.on('mousemove', 'inst-circles', (e) => {
        App.map.getCanvas().style.cursor = 'pointer';
        if (e.features.length > 0) {
          if (hoveredId !== null) {
            App.map.setFeatureState({ source: 'institutions', id: hoveredId }, { hover: false });
          }
          hoveredId = e.features[0].id;
          App.map.setFeatureState({ source: 'institutions', id: hoveredId }, { hover: true });
        }
      });

      App.map.on('mouseleave', 'inst-circles', () => {
        App.map.getCanvas().style.cursor = '';
        if (hoveredId !== null) {
          App.map.setFeatureState({ source: 'institutions', id: hoveredId }, { hover: false });
          hoveredId = null;
        }
      });

      // ---- Click handler ----
      App.map.on('click', 'inst-circles', (e) => {
        if (e.features.length > 0) {
          const fId = e.features[0].properties.id;
          const inst = App.data.find(p => p.id === fId);
          if (inst) {
            App.map.flyTo({ center: inst.coordinates, zoom: Math.max(App.map.getZoom(), 7), duration: 600 });
            App.showPanel(inst);
          }
        }
      });

      // Click elsewhere to close panel
      App.map.on('click', (e) => {
        const features = App.map.queryRenderedFeatures(e.point, { layers: ['inst-circles'] });
        if (features.length === 0) {
          App.closePanel();
        }
      });

      // ---- Initial stats ----
      App.updateStats();

      // ---- Fly-to animation on load ----
      App.map.flyTo({
        center: [10.5, 50.0],
        zoom: 5.5,
        duration: 2000
      });

      console.log('%c[Map]%c Layers ready', 'color:#27AE60;font-weight:bold', 'color:inherit');

      // Emit ready event
      Events.emit('map:ready', { map: App.map, data: App.data });
    });
  }
};

/* ------------------------------------------------
   13. Boot
   ------------------------------------------------ */
App.init().then(() => {
  Events.emit('app:ready');
  console.log('%c[DHd Landscape]%c Ready', 'color:#3498DB;font-weight:bold', 'color:inherit');
});
