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
  off(e, fn) { if (this._h[e]) this._h[e] = this._h[e].filter(f => f !== fn); },
  emit(e, d) { (this._h[e] || []).forEach(fn => fn(d)); }
};

/* ------------------------------------------------
   2. Configuration Constants
   ------------------------------------------------ */
const CONFIG = {
  YEAR_MIN: 2008,
  YEAR_MAX: 2026,
  YEAR_RANGE_END: 2027,        // exclusive end for d3.range()
  MAP_CENTER: [10.5, 50.0],
  MAP_ZOOM_INITIAL: 3.5,
  MAP_ZOOM_TARGET: 5.5,
  MAP_ZOOM_DETAIL: 7,
  MAP_MAX_BOUNDS: [[-5, 43], [25, 57]],
  FLY_DURATION: 600,
  FLY_DURATION_LONG: 2000,
  BOUNDS_PADDING: 60
};

/* ------------------------------------------------
   3. TaDiRAH Color Constants (canonical source: DHdCharts)
   ------------------------------------------------ */
const TADIRAH_COLORS = DHdCharts.TADIRAH_COLORS;

/** Build a MapLibre match expression for TaDiRAH-based circle colors */
function tadirahMatchExpr() {
  const entries = Object.entries(TADIRAH_COLORS).flatMap(([k, v]) => [k, v]);
  return ['match', ['get', 'dominantTadirah'], ...entries, '#95A5A6'];
}

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
  yearMin: CONFIG.YEAR_MIN,

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
      if (App.yearMin > CONFIG.YEAR_MIN && (!p.earliestYear || p.earliestYear > App.yearMin)) return false;

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
      App.map.fitBounds(bounds, { padding: CONFIG.BOUNDS_PADDING, duration: 800 });
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
    this._renderPanelName(p);
    this._renderPanelLocation(p);
    this._renderPanelStats(p);
    this._renderPanelTaDiRAH(p);
    this._renderPanelDisciplines(p);
    this._renderPanelMethods(p);
    this._renderPanelZenodoTopics(p);
    this._renderPanelCollaborators(p);
    this._renderPanelCourses(p);
    this._renderPanelClarin(p);
    this._renderPanelPositions(p);
    this._renderPanelLinks(p);
    panel.classList.add('open');
  },

  _renderPanelName(p) {
    const el = document.getElementById('p-name');
    if (el) el.textContent = p.name;
  },

  _renderPanelLocation(p) {
    const el = document.getElementById('p-loc');
    if (el) {
      const founded = p.founded ? ` · gegr. ${p.founded}` : '';
      el.textContent = `${p.city}, ${p.country}${founded}`;
    }
  },

  _renderPanelStats(p) {
    const el = document.getElementById('p-stats');
    if (!el) return;
    const courses = App.parse(p.dhCourses || []);
    el.innerHTML = `
      <div class="panel-stat-item">
        <div class="panel-stat-value">${p.totalPositions || 0}</div>
        <div class="panel-stat-label">Stellen</div>
      </div>
      <div class="panel-stat-item">
        <div class="panel-stat-value">${p.zenodoRecordCount || 0}</div>
        <div class="panel-stat-label">Zenodo-Records</div>
      </div>
      <div class="panel-stat-item">
        <div class="panel-stat-value">${courses.length}</div>
        <div class="panel-stat-label">DH-Kurse</div>
      </div>`;
  },

  _renderPanelTaDiRAH(p) {
    const el = document.getElementById('p-tadirah');
    if (!el) return;
    const profile = p.tadirahProfile || {};
    const entries = Object.entries(profile).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) { el.innerHTML = ''; return; }
    const maxVal = entries[0][1];
    el.innerHTML = `<div class="panel-section-title">TaDiRAH-Profil</div>` +
      entries.map(([cat, val]) => {
        const pct = Math.round((val / maxVal) * 100);
        const color = TADIRAH_COLORS[cat] || TADIRAH_COLORS['Meta'];
        return `<div class="tadirah-bar-row">
          <span class="tadirah-bar-label">${cat}</span>
          <div class="tadirah-bar-track">
            <div class="tadirah-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <span class="tadirah-bar-value">${val}</span>
        </div>`;
      }).join('');
  },

  _renderPanelDisciplines(p) {
    const el = document.getElementById('p-disc');
    if (!el) return;
    const discs = App.parse(p.disciplines || []);
    el.innerHTML = discs.length > 0
      ? `<div class="panel-section-title">Disziplinen</div>
         <div class="panel-tags">${discs.map(d => `<span class="tag tag-neutral">${d}</span>`).join('')}</div>`
      : '';
  },

  _renderPanelMethods(p) {
    const el = document.getElementById('p-meth');
    if (!el) return;
    const meths = App.parse(p.methods || []);
    if (meths.length === 0) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="panel-section-title">Methoden</div>
      <div class="panel-tags">${meths.map(m => {
        const label = App.mLabel(m);
        const cat = App.mCategory(m);
        const tagClass = cat ? `tag tag-${cat.toLowerCase()}` : 'tag tag-neutral';
        return `<span class="${tagClass}">${label}</span>`;
      }).join('')}</div>`;
  },

  _renderPanelZenodoTopics(p) {
    const el = document.getElementById('p-zenodo');
    if (!el) return;
    const topics = p.zenodoTopics || [];
    if (topics.length === 0 && !p.zenodoRecordCount) { el.innerHTML = ''; return; }
    let html = `<div class="panel-section-title">DHd-Konferenzbeiträge</div>`;
    if (p.zenodoRecordCount) {
      html += `<div class="panel-zenodo-count">${p.zenodoRecordCount} Beiträge auf Zenodo</div>`;
    }
    if (topics.length > 0) {
      const maxCount = topics[0].count;
      html += `<div class="panel-tags">${topics.slice(0, 10).map(t => {
        const opacity = 0.4 + 0.6 * (t.count / maxCount);
        return `<span class="tag tag-neutral" style="opacity:${opacity.toFixed(2)}" title="${t.count} Beiträge">${t.topic}</span>`;
      }).join('')}</div>`;
    }
    el.innerHTML = html;
  },

  _renderPanelCollaborators(p) {
    const el = document.getElementById('p-collabs');
    if (!el) return;
    const collabs = p.collaborators || [];
    if (collabs.length === 0) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="panel-section-title">Kooperationspartner (DHd)</div>
      <div class="panel-collabs">${collabs.slice(0, 8).map(c => {
        const topics = c.sharedTopics.map(t => t.topic).join(', ');
        return `<div class="collab-item">
          <span class="collab-name">${c.institution}</span>
          <span class="collab-count">${c.sharedPapers}</span>
          ${topics ? `<span class="collab-topics">${topics}</span>` : ''}
        </div>`;
      }).join('')}</div>`;
  },

  _renderPanelCourses(p) {
    const el = document.getElementById('p-courses');
    if (!el) return;
    const courses = App.parse(p.dhCourses || []);
    if (courses.length === 0) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="panel-section-title">DH-Studiengänge</div>
      <div class="panel-tags">${courses.map(c => {
        const label = typeof c === 'object' ? (c.name || c.label || c) : c;
        return `<span class="tag tag-neutral">${label}</span>`;
      }).join('')}</div>`;
  },

  _renderPanelClarin(p) {
    const el = document.getElementById('p-clarin');
    if (!el) return;
    if (!p.clarinCentre) { el.innerHTML = ''; return; }
    const cc = p.clarinCentre;
    const typeLabel = typeof cc === 'object' ? (cc.type || cc.label || JSON.stringify(cc)) : cc;
    el.innerHTML = `<div class="panel-section-title">CLARIN-Zentrum</div>
      <div class="panel-tags"><span class="tag tag-neutral">${typeLabel}</span></div>`;
  },

  _renderPanelPositions(p) {
    const el = document.getElementById('p-positions');
    if (!el) return;
    const positions = App.parse(p.positions || []);
    if (positions.length === 0) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="panel-section-title">Positionen</div>` +
      positions.map(pos => {
        const temp = pos.temporary ? ' · befristet' : '';
        return `<div class="position-item">
          <div class="position-name">${pos.name}</div>
          <div class="position-detail">${pos.level || ''}${pos.year ? ' · ' + pos.year : ''}${temp}</div>
        </div>`;
      }).join('');
  },

  _renderPanelLinks(p) {
    const el = document.getElementById('p-links');
    if (!el) return;
    let html = '';
    if (p.url) {
      html += `<a class="panel-link" href="${p.url}" target="_blank" rel="noopener">Website</a>`;
    }
    if (p.wikidataId) {
      const wdUrl = p.wikidataId.startsWith('http') ? p.wikidataId : `https://www.wikidata.org/wiki/${p.wikidataId}`;
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
    el.innerHTML = html;
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

    el.textContent = `${f.length} Institutionen · ${stellen} Stellen · ${discs.size} Disziplinen · ${cities} Standorte`;
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
      center: CONFIG.MAP_CENTER,
      zoom: CONFIG.MAP_ZOOM_INITIAL,
      maxBounds: CONFIG.MAP_MAX_BOUNDS
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
          'circle-color': tadirahMatchExpr(),
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
          'circle-color': tadirahMatchExpr(),
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
            App.map.flyTo({ center: inst.coordinates, zoom: Math.max(App.map.getZoom(), CONFIG.MAP_ZOOM_DETAIL), duration: CONFIG.FLY_DURATION });
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
        center: CONFIG.MAP_CENTER,
        zoom: CONFIG.MAP_ZOOM_TARGET,
        duration: CONFIG.FLY_DURATION_LONG
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
