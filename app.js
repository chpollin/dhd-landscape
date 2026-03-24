/**
 * DHd Landscape — app.js
 * Shared infrastructure: Event Bus, Map, Data, Filters, Detail Panel
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
   2. App Object (global)
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

  // --- Parse JSON string or return array ---
  parse(v) { return typeof v === 'string' ? JSON.parse(v) : v; },

  /* ------------------------------------------------
     3. Convert items array to GeoJSON FeatureCollection
     ------------------------------------------------ */
  toGeoJSON(items) {
    return {
      type: 'FeatureCollection',
      features: items.map(p => ({
        type: 'Feature',
        id: p._index,
        geometry: { type: 'Point', coordinates: p.coordinates },
        properties: {
          id:                 p.id,
          name:               p.name,
          city:               p.city,
          country:            p.country,
          totalPositions:     p.totalPositions || 0,
          openPositions:      p.openPositions  || 0,
          dhPublicationCount: p.dhPublicationCount || 0,
          earliestYear:       p.earliestYear   || null
        }
      }))
    };
  },

  /* ------------------------------------------------
     4. Apply filters and broadcast
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

    console.log(`%c[Filter]%c ${App.filtered.length}/${App.data.length} Institutionen`, 'color:#fbbf24;font-weight:bold', 'color:inherit');
  },

  /* ------------------------------------------------
     5. Update map data source
     ------------------------------------------------ */
  updateMapData(items) {
    const src = App.map.getSource('institutions');
    if (src) src.setData(App.toGeoJSON(items));
  },

  /* ------------------------------------------------
     6. Show detail panel
     ------------------------------------------------ */
  showPanel(p) {
    const panel = document.getElementById('detail-panel');
    if (!panel) return;

    // Name
    const nameEl = document.getElementById('p-name');
    if (nameEl) nameEl.textContent = p.name;

    // Location
    const locEl = document.getElementById('p-loc');
    if (locEl) {
      const year = p.earliestYear ? ` · seit ${p.earliestYear}` : '';
      locEl.textContent = `${p.city}, ${p.country}${year}`;
    }

    // Stats
    const statsEl = document.getElementById('p-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="panel-stat">
          <div class="panel-stat-num">${p.totalPositions || 0}</div>
          <div class="panel-stat-label">Stellen</div>
        </div>
        <div class="panel-stat">
          <div class="panel-stat-num open">${p.openPositions || 0}</div>
          <div class="panel-stat-label">Offen</div>
        </div>
        <div class="panel-stat">
          <div class="panel-stat-num pubs">${p.dhPublicationCount || 0}</div>
          <div class="panel-stat-label">Publikationen</div>
        </div>`;
    }

    // Disciplines
    const discEl = document.getElementById('p-disc');
    if (discEl) {
      const discs = App.parse(p.disciplines || []);
      discEl.innerHTML = discs.map(d => `<span class="panel-tag">${d}</span>`).join('');
    }

    // Methods
    const methEl = document.getElementById('p-meth');
    if (methEl) {
      const meths = App.parse(p.methods || []);
      methEl.innerHTML = meths.map(m => `<span class="panel-tag method">${App.mLabel(m)}</span>`).join('');
    }

    // Positions
    const posEl = document.getElementById('p-positions');
    if (posEl) {
      const positions = App.parse(p.positions || []);
      posEl.innerHTML = positions.map(pos => {
        const badge = pos.status === 'open'
          ? '<span class="panel-pos-badge">offen</span>'
          : '';
        const temp = pos.temporary ? ' · befristet' : '';
        return `
          <div class="panel-position">
            <div class="panel-pos-name">${pos.name}${badge}</div>
            <div class="panel-pos-meta">${pos.level || ''} · ${pos.year || ''}${temp}</div>
          </div>`;
      }).join('');
    }

    // Links
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
      linksEl.innerHTML = html;
    }

    // Open panel
    panel.classList.add('open');
    console.log(`%c[Panel]%c ${p.name}`, 'color:#818cf8;font-weight:bold', 'color:inherit');
  },

  /* ------------------------------------------------
     7. Close detail panel
     ------------------------------------------------ */
  closePanel() {
    const panel = document.getElementById('detail-panel');
    if (panel) panel.classList.remove('open');
  },

  /* ------------------------------------------------
     8. Update stats bar
     ------------------------------------------------ */
  updateStats() {
    const el = document.getElementById('stats-text');
    if (!el) return;

    const f = App.filtered;
    const total = App.data.length;
    const stellen = f.reduce((s, p) => s + (p.totalPositions || 0), 0);
    const pubs = f.reduce((s, p) => s + (p.dhPublicationCount || 0), 0);
    const cities = new Set(f.map(p => p.city)).size;

    el.textContent = `${f.length} von ${total} Institutionen · ${stellen} Stellen · ${pubs} Publikationen · ${cities} Städte`;
  },

  /* ------------------------------------------------
     9. Initialization
     ------------------------------------------------ */
  async init() {
    console.log('%c[DHd Landscape]%c Loading data...', 'color:#818cf8;font-weight:bold', 'color:inherit');

    // Load data
    const res = await fetch('Data/institutions.json');
    App.data = await res.json();

    // Assign stable numeric index for GeoJSON feature ids
    App.data.forEach((p, i) => { p._index = i; });
    App.filtered = [...App.data];

    console.log(`%c[DHd Landscape]%c ${App.data.length} institutions loaded`, 'color:#818cf8;font-weight:bold', 'color:inherit');

    // ---- Map Initialization ----
    App.map = new maplibregl.Map({
      container: 'map',
      style: {
        version: 8,
        sources: {
          'carto': {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
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
      console.log('%c[Map]%c Loaded, adding layers...', 'color:#6ee7b7;font-weight:bold', 'color:inherit');

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
          'circle-color': '#818cf8',
          'circle-blur': 1,
          'circle-opacity': 0.06
        }
      });

      // Layer: circles
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
          'circle-color': [
            'case',
            ['>', ['get', 'openPositions'], 0],
            '#fbbf24',
            '#818cf8'
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
            '#ffffff',
            'rgba(255,255,255,0.15)'
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
          'text-color': 'rgba(255,255,255,0.6)',
          'text-halo-color': 'rgba(0,0,0,0.7)',
          'text-halo-width': 1
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

      console.log('%c[Map]%c Layers ready', 'color:#6ee7b7;font-weight:bold', 'color:inherit');

      // Emit ready event
      Events.emit('map:ready', { map: App.map, data: App.data });
    });
  }
};

/* ------------------------------------------------
   10. Boot
   ------------------------------------------------ */
App.init().then(() => {
  console.log('%c[DHd Landscape]%c Ready', 'color:#818cf8;font-weight:bold', 'color:inherit');
});
