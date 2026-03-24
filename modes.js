/**
 * DHd Landscape — Mode Controller & Mode Implementations
 * Narrative (Scrollytelling), Explore (Floating Panels), Overview (HUD)
 */

/* =============================================
   MINI-VIZ HELPERS (used by Narrative + Overview)
   ============================================= */

function renderCounterViz(containerId, numbers) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;gap:20px;justify-content:center;padding:8px 0';

  numbers.forEach(({ label, value }) => {
    const item = document.createElement('div');
    item.style.cssText = 'text-align:center';

    const num = document.createElement('div');
    num.style.cssText = 'font-size:1.6rem;font-weight:600;color:var(--accent-indigo);font-family:var(--font-sans)';
    num.textContent = '0';
    item.appendChild(num);

    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:0.65rem;color:var(--text-tertiary);margin-top:2px';
    lbl.textContent = label;
    item.appendChild(lbl);

    wrap.appendChild(item);

    // Animate
    const start = performance.now();
    const duration = 1200;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(value * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  el.appendChild(wrap);
}

function renderMiniDonut(containerId, disciplines) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  if (!disciplines || disciplines.length === 0) return;

  const width = 200, height = 150;
  const radius = Math.min(width, height) / 2 - 10;

  // Count disciplines
  const counts = {};
  disciplines.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const pieData = entries.map(([name, value]) => ({ name, value }));

  const colorFn = DHdCharts.discColor || (d => '#818cf8');

  const svg = d3.select(el).append('svg')
    .attr('width', width).attr('height', height)
    .append('g')
    .attr('transform', `translate(${width * 0.35},${height / 2})`);

  const pie = d3.pie().value(d => d.value).sort(null).padAngle(0.03);
  const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

  svg.selectAll('path')
    .data(pie(pieData))
    .join('path')
    .attr('d', arc)
    .attr('fill', d => colorFn(d.data.name))
    .attr('opacity', 0.85)
    .attr('stroke', 'var(--bg-base)')
    .attr('stroke-width', 1);

  // Legend on the right
  const legend = svg.append('g')
    .attr('transform', `translate(${radius + 14}, ${-pieData.length * 7})`);

  pieData.forEach((d, i) => {
    const g = legend.append('g').attr('transform', `translate(0,${i * 16})`);
    g.append('circle').attr('r', 4).attr('fill', colorFn(d.name));
    g.append('text')
      .attr('x', 10).attr('y', 4)
      .attr('fill', 'var(--text-secondary)')
      .attr('font-size', '0.55rem')
      .attr('font-family', 'Inter, sans-serif')
      .text(`${d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name} (${d.value})`);
  });
}

function renderMiniBars(containerId, institutions) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  if (!institutions || institutions.length === 0) return;

  const sorted = [...institutions].sort((a, b) => b.totalPositions - a.totalPositions);
  const margin = { top: 4, right: 30, bottom: 4, left: 120 };
  const barH = 20;
  const width = 260 - margin.left - margin.right;
  const height = sorted.length * barH;

  const svg = d3.select(el).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(sorted, d => d.totalPositions) || 1])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(sorted.map(d => d.name))
    .range([0, height])
    .padding(0.25);

  svg.selectAll('rect')
    .data(sorted)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('width', d => x(d.totalPositions))
    .attr('height', y.bandwidth())
    .attr('fill', 'var(--accent-indigo)')
    .attr('opacity', 0.75)
    .attr('rx', 3);

  // Labels
  svg.selectAll('.bar-label')
    .data(sorted)
    .join('text')
    .attr('x', -6)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('text-anchor', 'end')
    .attr('dominant-baseline', 'central')
    .attr('fill', 'var(--text-secondary)')
    .attr('font-size', '0.55rem')
    .attr('font-family', 'Inter, sans-serif')
    .text(d => d.name.length > 18 ? d.name.slice(0, 16) + '…' : d.name);

  // Counts
  svg.selectAll('.count-label')
    .data(sorted)
    .join('text')
    .attr('x', d => x(d.totalPositions) + 4)
    .attr('y', d => y(d.name) + y.bandwidth() / 2)
    .attr('dominant-baseline', 'central')
    .attr('fill', 'var(--text-tertiary)')
    .attr('font-size', '0.5rem')
    .attr('font-family', 'Inter, sans-serif')
    .text(d => d.totalPositions);
}

function renderMiniTimeline(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  if (!data || data.length === 0) return;

  const colorFn = DHdCharts.discColor || (d => '#818cf8');
  const COUNTRY_COLORS = DHdCharts.COUNTRY_COLORS || { DE: '#6366f1', AT: '#6ee7b7', CH: '#fbbf24', LU: '#a78bfa' };

  const years = d3.range(2008, 2027);

  // Collect positions
  const allPositions = [];
  data.forEach(inst => {
    (inst.positions || []).forEach(pos => {
      allPositions.push({
        year: pos.year,
        discipline: (pos.disciplines && pos.disciplines[0]) || 'Other',
        country: inst.country
      });
    });
  });

  // Use top disciplines
  const dFreq = {};
  allPositions.forEach(p => { dFreq[p.discipline] = (dFreq[p.discipline] || 0) + 1; });
  const categories = Object.entries(dFreq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(d => d[0]);

  // Build cumulative data
  const yearData = years.map(y => {
    const row = { year: y };
    categories.forEach(c => { row[c] = 0; });
    return row;
  });

  allPositions.forEach(p => {
    const cat = categories.includes(p.discipline) ? p.discipline : null;
    if (!cat) return;
    const yi = years.indexOf(p.year);
    if (yi < 0) return;
    for (let i = yi; i < yearData.length; i++) {
      yearData[i][cat] += 1;
    }
  });

  const rect = el.getBoundingClientRect();
  const margin = { top: 4, right: 4, bottom: 18, left: 24 };
  const width = Math.max(150, (rect.width || 240) - margin.left - margin.right);
  const height = Math.max(60, (rect.height || 100) - margin.top - margin.bottom);

  const svg = d3.select(el).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2008, 2026]).range([0, width]);
  const stack = d3.stack().keys(categories).order(d3.stackOrderDescending);
  const series = stack(yearData);
  const yMax = d3.max(series, s => d3.max(s, d => d[1])) || 1;
  const y = d3.scaleLinear().domain([0, yMax]).range([height, 0]);

  const area = d3.area()
    .x(d => x(d.data.year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveMonotoneX);

  svg.selectAll('.area')
    .data(series)
    .join('path')
    .attr('d', area)
    .attr('fill', d => colorFn(d.key))
    .attr('opacity', 0.7);

  // Minimal axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format('d')))
    .selectAll('text').attr('fill', 'var(--text-tertiary)').attr('font-size', '0.5rem');

  svg.append('g')
    .call(d3.axisLeft(y).ticks(3))
    .selectAll('text').attr('fill', 'var(--text-tertiary)').attr('font-size', '0.5rem');

  // Style axis lines
  svg.selectAll('.domain, .tick line').attr('stroke', 'var(--border-subtle)');
}

/* =============================================
   ANIMATED COUNTER (shared utility)
   ============================================= */

function animateCounter(el, target, duration) {
  if (!el) return;
  duration = duration || 1500;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}


/* =============================================
   STATION DEFINITIONS (Narrative Mode)
   ============================================= */

const STATIONS = [
  {
    id: 'intro',
    mapState: { center: [10.5, 50.0], zoom: 5.5, pitch: 0, bearing: 0, duration: 2000 },
    filter: null,
    onEnter: function(data) {
      if (!data) return;
      const totalInst = data.length;
      const totalPos = data.reduce((s, d) => s + (d.totalPositions || 0), 0);
      const totalDisc = new Set(data.flatMap(d => d.disciplines || [])).size;
      renderCounterViz('viz-intro', [
        { label: 'Institutionen', value: totalInst },
        { label: 'Professuren', value: totalPos },
        { label: 'Disziplinen', value: totalDisc }
      ]);
    }
  },
  {
    id: 'pioneers',
    mapState: { center: [10.2, 50.5], zoom: 6.0, duration: 1500 },
    filter: function(d) { return d.earliestYear <= 2012; },
    onEnter: function(data, filtered) {
      if (!filtered) return;
      renderMiniBars('viz-pioneers', filtered);
    }
  },
  {
    id: 'koeln',
    mapState: { center: [6.96, 50.94], zoom: 12, duration: 1800 },
    filter: function(d) { return d.city === 'Köln'; },
    onEnter: function(data, filtered) {
      if (!filtered || filtered.length === 0) return;
      // Collect all disciplines from Köln institutions
      const allDisc = [];
      filtered.forEach(inst => {
        (inst.positions || []).forEach(pos => {
          (pos.disciplines || []).forEach(d => allDisc.push(d));
        });
      });
      renderMiniDonut('viz-koeln', allDisc);
    }
  },
  {
    id: 'berlin',
    mapState: { center: [13.39, 52.52], zoom: 11, duration: 1800 },
    filter: function(d) { return d.city === 'Berlin'; },
    onEnter: function(data, filtered) {
      if (!filtered) return;
      renderMiniBars('viz-berlin', filtered);
    }
  },
  {
    id: 'austria',
    mapState: { center: [14.5, 47.5], zoom: 7, duration: 2000 },
    filter: function(d) { return d.country === 'AT'; },
    onEnter: function(data, filtered) {
      if (!filtered || filtered.length === 0) return;
      const el = document.getElementById('viz-austria');
      if (!el) return;
      el.innerHTML = '';

      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;padding:4px 0';

      filtered.forEach(inst => {
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--bg-raised);border-radius:var(--radius-sm);padding:8px 10px;flex:1;min-width:100px';
        card.innerHTML = `
          <div style="font-size:0.7rem;font-weight:600;color:var(--text-primary);margin-bottom:2px">${inst.name}</div>
          <div style="font-size:0.6rem;color:var(--text-tertiary)">${inst.city}</div>
          <div style="font-size:1rem;font-weight:600;color:var(--accent-green);margin-top:4px">${inst.totalPositions}</div>
          <div style="font-size:0.55rem;color:var(--text-tertiary)">Stellen seit ${inst.earliestYear}</div>
        `;
        wrap.appendChild(card);
      });

      el.appendChild(wrap);
    }
  },
  {
    id: 'timeline',
    mapState: { center: [10.5, 50.0], zoom: 5.5, duration: 1500 },
    filter: null,
    onEnter: function(data) {
      if (!data) return;
      renderMiniTimeline('viz-timeline', data);
    }
  },
  {
    id: 'explore-cta',
    mapState: { center: [10.5, 50.0], zoom: 5.5, duration: 1000 },
    filter: null,
    onEnter: function() { /* CTA is static HTML, nothing to render */ }
  }
];


/* =============================================
   NARRATIVE MODE
   ============================================= */

const NarrativeMode = {
  observer: null,
  activeStation: null,

  enter: function() {
    console.log('%c[Narrative]%c Entering', 'color:#a78bfa;font-weight:bold', 'color:inherit');

    // Show all markers on the map
    if (App.data && App.data.length) {
      App.updateMapData(App.data);
    }

    // Setup IntersectionObserver on stations
    this._setupObserver();

    // Trigger first station
    const firstStation = STATIONS[0];
    this._activateStation(firstStation);

    // Show scroll hint
    const hint = document.querySelector('.scroll-hint');
    if (hint) hint.style.display = '';
  },

  exit: function() {
    console.log('%c[Narrative]%c Exiting', 'color:#a78bfa;font-weight:bold', 'color:inherit');
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.activeStation = null;

    // Hide scroll hint
    const hint = document.querySelector('.scroll-hint');
    if (hint) hint.style.display = 'none';

    // Remove active class from all stations
    document.querySelectorAll('.station').forEach(s => s.classList.remove('active'));
  },

  _setupObserver: function() {
    if (this.observer) this.observer.disconnect();

    const self = this;
    this.observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const stationId = entry.target.dataset.station;
          const station = STATIONS.find(s => s.id === stationId);
          if (station && self.activeStation !== stationId) {
            self._activateStation(station);
          }
        }
      });
    }, {
      root: document.getElementById('narrative-scroll'),
      threshold: 0.5
    });

    document.querySelectorAll('.station').forEach(function(el) {
      self.observer.observe(el);
    });
  },

  _activateStation: function(station) {
    if (!station) return;

    console.log('%c[Narrative]%c Station: %s', 'color:#a78bfa;font-weight:bold', 'color:inherit', station.id);
    this.activeStation = station.id;

    // Update active class on DOM
    document.querySelectorAll('.station').forEach(s =>
      s.classList.toggle('active', s.dataset.station === station.id)
    );

    // Fly the map
    if (App.map && station.mapState) {
      App.map.flyTo({
        center: station.mapState.center,
        zoom: station.mapState.zoom,
        pitch: station.mapState.pitch || 0,
        bearing: station.mapState.bearing || 0,
        duration: station.mapState.duration || 1500,
        essential: true
      });
    }

    // Filter data for this station
    const data = App.data || [];
    let filtered;
    if (station.filter) {
      filtered = data.filter(station.filter);
      App.updateMapData(filtered);
    } else {
      filtered = data;
      App.updateMapData(data);
    }

    // Run station's onEnter with a short delay so map starts moving first
    setTimeout(function() {
      if (station.onEnter) {
        station.onEnter(data, filtered);
      }
    }, 200);
  }
};


/* =============================================
   EXPLORE MODE
   ============================================= */

const ExploreMode = {
  panelCharts: {},   // track which panels have been rendered
  dragState: null,
  timelineInterval: null,
  timelinePlaying: false,
  filtersBuilt: false,

  enter: function() {
    console.log('%c[Explore]%c Entering', 'color:#6ee7b7;font-weight:bold', 'color:inherit');

    // Show all markers
    if (App.data && App.data.length) {
      App.updateMapData(App.filtered || App.data);
    }

    // Build filter sidebar if not yet done
    if (!this.filtersBuilt) {
      this._buildFilters();
      this.filtersBuilt = true;
    }

    // Wire up panel toggles
    this._setupPanelToggles();

    // Wire up timeline play/pause
    this._setupTimeline();

    // Wire up filter reset
    this._setupResetButtons();

    // Update stats bar
    this._updateStatsBar();

    // Make floating panels draggable
    document.querySelectorAll('.float-panel').forEach(p => this._makeDraggable(p));
  },

  exit: function() {
    console.log('%c[Explore]%c Exiting', 'color:#6ee7b7;font-weight:bold', 'color:inherit');

    // Close all panels
    document.querySelectorAll('.float-panel').forEach(p => { p.hidden = true; });
    this.panelCharts = {};

    // Close sidebar
    const sidebar = document.getElementById('filter-sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // Stop timeline playback
    this._stopTimeline();

    // Close detail panel
    if (App.closePanel) App.closePanel();
  },

  toggleSidebar: function() {
    const sidebar = document.getElementById('filter-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  },

  togglePanel: function(name) {
    const panel = document.getElementById('panel-' + name);
    if (!panel) return;

    if (panel.hidden) {
      // Show it
      panel.hidden = false;
      requestAnimationFrame(function() { panel.classList.add('visible'); });
      this._renderPanelChart(name);

      // Highlight toggle button
      const btn = document.querySelector(`.toggle-btn[data-panel="${name}"]`);
      if (btn) btn.classList.add('active');
    } else {
      this.closePanel(name);
    }
  },

  closePanel: function(name) {
    const panel = document.getElementById('panel-' + name);
    if (!panel) return;
    panel.hidden = true;
    panel.classList.remove('visible');
    delete this.panelCharts[name];

    // Remove toggle highlight
    const btn = document.querySelector(`.toggle-btn[data-panel="${name}"]`);
    if (btn) btn.classList.remove('active');
  },

  onFilterChanged: function(filtered, full) {
    // Update any open chart panels
    Object.keys(this.panelCharts).forEach(function(name) {
      ExploreMode._renderPanelChart(name);
    });

    // Update stats bar
    this._updateStatsBar();

    // Update filter indicator
    this._updateFilterIndicator();
  },

  _renderPanelChart: function(name) {
    const bodyEl = document.getElementById('chart-' + name);
    if (!bodyEl) return;

    const filtered = App.filtered || App.data || [];
    const full = App.data || [];

    // Map panel names to chart types
    const chartMap = {
      'timeline': 'timeline',
      'barchart': 'barchart',
      'heatmap': 'heatmap'
    };

    const chartType = chartMap[name];
    if (chartType && DHdCharts.renderTo) {
      DHdCharts.renderTo(chartType, bodyEl, filtered, full);
    }

    this.panelCharts[name] = true;
  },

  _buildFilters: function() {
    const data = App.data || [];
    if (data.length === 0) return;

    const groups = document.getElementById('filter-groups');
    if (!groups) return;
    groups.innerHTML = '';

    // Count disciplines
    const discCounts = {};
    data.forEach(function(inst) {
      (inst.disciplines || []).forEach(function(d) {
        discCounts[d] = (discCounts[d] || 0) + 1;
      });
    });

    // Count methods
    const methCounts = {};
    data.forEach(function(inst) {
      (inst.methods || []).forEach(function(m) {
        var label = typeof m === 'object' ? m.label : m;
        methCounts[label] = (methCounts[label] || 0) + 1;
      });
    });

    // Count countries
    const countryCounts = {};
    data.forEach(function(inst) {
      countryCounts[inst.country] = (countryCounts[inst.country] || 0) + 1;
    });

    const countryNames = { DE: 'Deutschland', AT: 'Österreich', CH: 'Schweiz', LU: 'Luxemburg' };

    // Build discipline group (count >= 3)
    const topDisc = Object.entries(discCounts)
      .filter(function(e) { return e[1] >= 3; })
      .sort(function(a, b) { return b[1] - a[1]; });

    if (topDisc.length > 0) {
      groups.appendChild(this._buildFilterGroup('Disziplinen', topDisc, 'discipline'));
    }

    // Build methods group (count >= 3)
    const topMeth = Object.entries(methCounts)
      .filter(function(e) { return e[1] >= 3; })
      .sort(function(a, b) { return b[1] - a[1]; });

    if (topMeth.length > 0) {
      groups.appendChild(this._buildFilterGroup('Methoden', topMeth, 'method'));
    }

    // Build country group (all)
    const allCountries = Object.entries(countryCounts)
      .sort(function(a, b) { return b[1] - a[1]; })
      .map(function(e) { return [countryNames[e[0]] || e[0], e[1], e[0]]; });

    if (allCountries.length > 0) {
      var countryGroup = document.createElement('div');
      countryGroup.className = 'filter-group';
      countryGroup.innerHTML = '<div class="filter-group-title">Länder</div>';

      var items = document.createElement('div');
      items.className = 'filter-items';

      allCountries.forEach(function(entry) {
        var displayName = entry[0], count = entry[1], code = entry[2];
        var item = document.createElement('label');
        item.className = 'filter-item';
        item.innerHTML = '<input type="checkbox" data-type="country" data-value="' + code + '"> ' +
          '<span class="filter-item-label">' + displayName + '</span>' +
          '<span class="filter-item-count">' + count + '</span>';
        items.appendChild(item);
      });

      countryGroup.appendChild(items);
      groups.appendChild(countryGroup);
    }

    // Wire up checkbox changes
    groups.addEventListener('change', function(e) {
      if (e.target.type !== 'checkbox') return;
      var type = e.target.dataset.type;
      var value = e.target.dataset.value;

      if (App.active && App.active[type]) {
        if (e.target.checked) {
          App.active[type].add(value);
        } else {
          App.active[type].delete(value);
        }
        App.applyFilters();
      }
    });

    // Wire up sidebar search
    var sidebarSearch = document.getElementById('sidebar-search');
    if (sidebarSearch) {
      sidebarSearch.addEventListener('input', function(e) {
        var q = e.target.value.toLowerCase();
        groups.querySelectorAll('.filter-item').forEach(function(item) {
          var label = item.querySelector('.filter-item-label');
          if (label) {
            item.style.display = label.textContent.toLowerCase().includes(q) ? '' : 'none';
          }
        });
      });
    }
  },

  _buildFilterGroup: function(title, entries, type) {
    var group = document.createElement('div');
    group.className = 'filter-group';
    group.innerHTML = '<div class="filter-group-title">' + title + '</div>';

    var items = document.createElement('div');
    items.className = 'filter-items';

    entries.forEach(function(entry) {
      var name = entry[0], count = entry[1];
      var item = document.createElement('label');
      item.className = 'filter-item';
      item.innerHTML = '<input type="checkbox" data-type="' + type + '" data-value="' + name + '"> ' +
        '<span class="filter-item-label">' + name + '</span>' +
        '<span class="filter-item-count">' + count + '</span>';
      items.appendChild(item);
    });

    group.appendChild(items);
    return group;
  },

  _setupPanelToggles: function() {
    var self = this;
    document.querySelectorAll('.toggle-btn[data-panel]').forEach(function(btn) {
      // Remove old listeners by cloning
      var clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);

      clone.addEventListener('click', function() {
        var panel = clone.dataset.panel;
        if (panel === 'filter') {
          self.toggleSidebar();
        } else {
          self.togglePanel(panel);
        }
      });
    });

    // Wire up chart toggle buttons inside float panels
    document.querySelectorAll('.float-panel .chart-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var panel = btn.closest('.float-panel');
        if (!panel) return;
        // Update active state within toggle group
        btn.parentElement.querySelectorAll('.chart-toggle').forEach(function(b) {
          b.classList.toggle('active', b === btn);
        });
        // Re-render the chart panel
        var panelId = panel.id.replace('panel-', '');
        self._renderPanelChart(panelId);
      });
    });
  },

  _setupTimeline: function() {
    var self = this;
    var playBtn = document.getElementById('tl-play');
    var slider = document.getElementById('timeline-slider');
    var valueLabel = document.getElementById('tl-value');

    if (!playBtn || !slider) return;

    // Clone to remove old listeners
    var newPlay = playBtn.cloneNode(true);
    playBtn.parentNode.replaceChild(newPlay, playBtn);

    var newSlider = slider.cloneNode(true);
    slider.parentNode.replaceChild(newSlider, slider);

    newPlay.addEventListener('click', function() {
      if (self.timelinePlaying) {
        self._stopTimeline();
        newPlay.innerHTML = '&#9654;';
      } else {
        self._startTimeline(newSlider, valueLabel);
        newPlay.innerHTML = '&#9646;&#9646;';
      }
    });

    newSlider.addEventListener('input', function() {
      var year = parseInt(newSlider.value);
      if (valueLabel) {
        valueLabel.textContent = year <= 2008 ? 'alle' : year;
      }
      if (App.yearMin !== undefined) {
        App.yearMin = year <= 2008 ? null : year;
      }
      App.applyFilters();
    });
  },

  _startTimeline: function(slider, valueLabel) {
    var self = this;
    self.timelinePlaying = true;

    // If at end, reset
    if (parseInt(slider.value) >= 2026) {
      slider.value = 2008;
    }

    self.timelineInterval = setInterval(function() {
      var year = parseInt(slider.value) + 1;
      if (year > 2026) {
        self._stopTimeline();
        var playBtn = document.getElementById('tl-play');
        if (playBtn) playBtn.innerHTML = '&#9654;';
        return;
      }
      slider.value = year;
      if (valueLabel) {
        valueLabel.textContent = year <= 2008 ? 'alle' : year;
      }
      if (App.yearMin !== undefined) {
        App.yearMin = year <= 2008 ? null : year;
      }
      App.applyFilters();
    }, 800);
  },

  _stopTimeline: function() {
    if (this.timelineInterval) {
      clearInterval(this.timelineInterval);
      this.timelineInterval = null;
    }
    this.timelinePlaying = false;
  },

  _setupResetButtons: function() {
    var resetAll = document.getElementById('reset-all');
    var indicatorReset = document.getElementById('indicator-reset');

    function doReset() {
      // Clear all active filter sets
      if (App.active) {
        if (App.active.discipline) App.active.discipline.clear();
        if (App.active.method) App.active.method.clear();
        if (App.active.country) App.active.country.clear();
      }
      // Reset search
      var searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.value = '';
      if (App.searchTerm !== undefined) App.searchTerm = '';

      // Reset year
      if (App.yearMin !== undefined) App.yearMin = null;
      var slider = document.getElementById('timeline-slider');
      if (slider) slider.value = 2008;
      var tlValue = document.getElementById('tl-value');
      if (tlValue) tlValue.textContent = 'alle';

      // Uncheck all checkboxes
      document.querySelectorAll('#filter-groups input[type="checkbox"]').forEach(function(cb) {
        cb.checked = false;
      });

      App.applyFilters();
    }

    if (resetAll) {
      var newReset = resetAll.cloneNode(true);
      resetAll.parentNode.replaceChild(newReset, resetAll);
      newReset.addEventListener('click', doReset);
    }

    if (indicatorReset) {
      var newInd = indicatorReset.cloneNode(true);
      indicatorReset.parentNode.replaceChild(newInd, indicatorReset);
      newInd.addEventListener('click', doReset);
    }
  },

  _updateStatsBar: function() {
    var el = document.getElementById('stats-text');
    if (!el) return;
    var filtered = App.filtered || App.data || [];
    var full = App.data || [];
    var totalPos = filtered.reduce(function(s, d) { return s + (d.totalPositions || 0); }, 0);

    if (filtered.length === full.length) {
      el.textContent = filtered.length + ' Institutionen · ' + totalPos + ' Stellen';
    } else {
      el.textContent = filtered.length + ' / ' + full.length + ' Institutionen · ' + totalPos + ' Stellen';
    }
  },

  _updateFilterIndicator: function() {
    var tags = document.getElementById('filter-tags');
    var indicator = document.getElementById('filter-indicator');
    if (!tags || !indicator) return;

    var parts = [];
    if (App.active) {
      if (App.active.discipline && App.active.discipline.size > 0) {
        parts.push(App.active.discipline.size + ' Disziplin' + (App.active.discipline.size > 1 ? 'en' : ''));
      }
      if (App.active.method && App.active.method.size > 0) {
        parts.push(App.active.method.size + ' Methode' + (App.active.method.size > 1 ? 'n' : ''));
      }
      if (App.active.country && App.active.country.size > 0) {
        parts.push(App.active.country.size + ' Land/Länder');
      }
    }
    if (App.searchTerm) {
      parts.push('«' + App.searchTerm + '»');
    }

    if (parts.length === 0) {
      indicator.style.display = 'none';
    } else {
      indicator.style.display = '';
      tags.textContent = parts.join(' · ');
    }
  },

  _makeDraggable: function(panel) {
    var header = panel.querySelector('.float-panel-header');
    if (!header) return;

    var self = this;
    var isDragging = false;
    var startX, startY, origLeft, origTop;

    header.addEventListener('mousedown', function(e) {
      // Don't drag when clicking buttons
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      var rect = panel.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;

      // Set position to fixed for dragging
      panel.style.position = 'fixed';
      panel.style.left = origLeft + 'px';
      panel.style.top = origTop + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      panel.removeAttribute('data-dock');

      header.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      panel.style.left = (origLeft + dx) + 'px';
      panel.style.top = (origTop + dy) + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (!isDragging) return;
      isDragging = false;
      header.style.cursor = '';
    });
  }
};


/* =============================================
   OVERVIEW MODE
   ============================================= */

const OverviewMode = {

  enter: function() {
    console.log('%c[Overview]%c Entering', 'color:#fbbf24;font-weight:bold', 'color:inherit');

    // Show all markers
    if (App.data && App.data.length) {
      App.updateMapData(App.filtered || App.data);
    }

    // Fly to overview position
    if (App.map) {
      App.map.flyTo({
        center: [10.5, 50.0],
        zoom: 5.5,
        pitch: 0,
        bearing: 0,
        duration: 1500,
        essential: true
      });
    }

    // Animate counters
    this._animateCounters();

    // Render HUD charts
    this._renderCountryBars();
    this._renderDisciplineChart();
    this._renderMiniTimeline();
  },

  exit: function() {
    console.log('%c[Overview]%c Exiting', 'color:#fbbf24;font-weight:bold', 'color:inherit');
    // Clean up SVGs
    ['hud-country-bars', 'hud-disc-chart', 'hud-area-chart'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
  },

  onFilterChanged: function(filtered, full) {
    this._updateCounters(filtered);
    this._renderCountryBars();
    this._renderDisciplineChart();
    this._renderMiniTimeline();
  },

  _animateCounters: function() {
    document.querySelectorAll('#hud-stats .hud-number').forEach(function(el) {
      var target = parseInt(el.dataset.target) || 0;
      animateCounter(el, target, 1500);
    });
  },

  _updateCounters: function(filtered) {
    if (!filtered) filtered = App.filtered || App.data || [];

    var nums = document.querySelectorAll('#hud-stats .hud-number');
    if (nums.length < 3) return;

    var totalInst = filtered.length;
    var totalPos = filtered.reduce(function(s, d) { return s + (d.totalPositions || 0); }, 0);
    var cities = new Set(filtered.map(function(d) { return d.city; })).size;

    // Update targets and animate
    var targets = [totalInst, totalPos, cities];
    nums.forEach(function(el, i) {
      if (i < targets.length) {
        el.dataset.target = targets[i];
        animateCounter(el, targets[i], 800);
      }
    });
  },

  _renderCountryBars: function() {
    var el = document.getElementById('hud-country-bars');
    if (!el) return;
    el.innerHTML = '';

    var data = App.filtered || App.data || [];
    if (data.length === 0) return;

    var COUNTRY_COLORS = { DE: '#818cf8', AT: '#6ee7b7', CH: '#fbbf24', LU: '#a78bfa' };
    var COUNTRY_NAMES = { DE: 'Deutschland', AT: 'Österreich', CH: 'Schweiz', LU: 'Luxemburg' };

    var counts = {};
    data.forEach(function(d) { counts[d.country] = (counts[d.country] || 0) + 1; });

    var entries = Object.entries(counts).sort(function(a, b) { return b[1] - a[1]; });
    if (entries.length === 0) return;

    var margin = { top: 4, right: 30, bottom: 4, left: 80 };
    var barH = 22;
    var width = Math.max(100, (el.clientWidth || 220) - margin.left - margin.right);
    var height = entries.length * barH;

    var svg = d3.select(el).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var maxVal = d3.max(entries, function(d) { return d[1]; }) || 1;
    var x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
    var y = d3.scaleBand().domain(entries.map(function(d) { return d[0]; })).range([0, height]).padding(0.3);

    svg.selectAll('rect')
      .data(entries)
      .join('rect')
      .attr('x', 0)
      .attr('y', function(d) { return y(d[0]); })
      .attr('width', function(d) { return x(d[1]); })
      .attr('height', y.bandwidth())
      .attr('fill', function(d) { return COUNTRY_COLORS[d[0]] || '#666'; })
      .attr('opacity', 0.8)
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        // Filter by this country
        if (App.active && App.active.country) {
          App.active.country.clear();
          App.active.country.add(d[0]);
          App.applyFilters();
        }
      });

    // Country labels
    svg.selectAll('.country-label')
      .data(entries)
      .join('text')
      .attr('x', -6)
      .attr('y', function(d) { return y(d[0]) + y.bandwidth() / 2; })
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central')
      .attr('fill', function(d) { return COUNTRY_COLORS[d[0]] || '#888'; })
      .attr('font-size', '0.65rem')
      .attr('font-weight', '500')
      .attr('font-family', 'Inter, sans-serif')
      .text(function(d) { return COUNTRY_NAMES[d[0]] || d[0]; });

    // Count labels
    svg.selectAll('.count-label')
      .data(entries)
      .join('text')
      .attr('x', function(d) { return x(d[1]) + 5; })
      .attr('y', function(d) { return y(d[0]) + y.bandwidth() / 2; })
      .attr('dominant-baseline', 'central')
      .attr('fill', 'var(--text-tertiary)')
      .attr('font-size', '0.6rem')
      .attr('font-family', 'Inter, sans-serif')
      .text(function(d) { return d[1]; });
  },

  _renderDisciplineChart: function() {
    var el = document.getElementById('hud-disc-chart');
    if (!el) return;
    el.innerHTML = '';

    var data = App.filtered || App.data || [];
    if (data.length === 0) return;

    var colorFn = DHdCharts.discColor || function(d) { return '#818cf8'; };

    // Count disciplines
    var counts = {};
    data.forEach(function(inst) {
      (inst.disciplines || []).forEach(function(d) {
        counts[d] = (counts[d] || 0) + 1;
      });
    });

    var entries = Object.entries(counts)
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, 6);

    if (entries.length === 0) return;

    var margin = { top: 4, right: 30, bottom: 4, left: 130 };
    var barH = 20;
    var width = Math.max(80, (el.clientWidth || 220) - margin.left - margin.right);
    var height = entries.length * barH;

    var svg = d3.select(el).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var maxVal = d3.max(entries, function(d) { return d[1]; }) || 1;
    var x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
    var y = d3.scaleBand().domain(entries.map(function(d) { return d[0]; })).range([0, height]).padding(0.3);

    svg.selectAll('rect')
      .data(entries)
      .join('rect')
      .attr('x', 0)
      .attr('y', function(d) { return y(d[0]); })
      .attr('width', function(d) { return x(d[1]); })
      .attr('height', y.bandwidth())
      .attr('fill', function(d) { return colorFn(d[0]); })
      .attr('opacity', 0.8)
      .attr('rx', 3);

    // Discipline labels
    svg.selectAll('.disc-label')
      .data(entries)
      .join('text')
      .attr('x', -6)
      .attr('y', function(d) { return y(d[0]) + y.bandwidth() / 2; })
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'central')
      .attr('fill', function(d) { return colorFn(d[0]); })
      .attr('font-size', '0.58rem')
      .attr('font-family', 'Inter, sans-serif')
      .text(function(d) { return d[0].length > 22 ? d[0].slice(0, 20) + '…' : d[0]; });

    // Count labels
    svg.selectAll('.count-label')
      .data(entries)
      .join('text')
      .attr('x', function(d) { return x(d[1]) + 5; })
      .attr('y', function(d) { return y(d[0]) + y.bandwidth() / 2; })
      .attr('dominant-baseline', 'central')
      .attr('fill', 'var(--text-tertiary)')
      .attr('font-size', '0.55rem')
      .attr('font-family', 'Inter, sans-serif')
      .text(function(d) { return d[1]; });
  },

  _renderMiniTimeline: function() {
    var data = App.filtered || App.data || [];
    renderMiniTimeline('hud-area-chart', data);
  }
};


/* =============================================
   MODE CONTROLLER
   ============================================= */

const ModeController = {
  current: 'narrative',

  switch: function(mode) {
    if (mode === this.current) return;

    console.log('%c[Mode]%c Switching: %s → %s', 'color:#f472b6;font-weight:bold', 'color:inherit', this.current, mode);

    // Deactivate current
    this.deactivate(this.current);

    // Update DOM: hide all mode layers
    document.body.dataset.mode = mode;
    document.querySelectorAll('.mode-layer').forEach(function(el) {
      el.hidden = true;
      el.classList.remove('active');
    });

    // Show target layer
    var target = document.getElementById('mode-' + mode);
    if (target) {
      target.hidden = false;
      requestAnimationFrame(function() { target.classList.add('active'); });
    }

    // Activate new mode
    this.activate(mode);

    // Update switcher buttons
    document.querySelectorAll('.mode-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    this.current = mode;
    Events.emit('mode:switched', mode);
  },

  activate: function(mode) {
    switch (mode) {
      case 'narrative': NarrativeMode.enter(); break;
      case 'explore':   ExploreMode.enter(); break;
      case 'overview':  OverviewMode.enter(); break;
    }
  },

  deactivate: function(mode) {
    switch (mode) {
      case 'narrative': NarrativeMode.exit(); break;
      case 'explore':   ExploreMode.exit(); break;
      case 'overview':  OverviewMode.exit(); break;
    }
  }
};


/* =============================================
   EVENT WIRING
   ============================================= */

// When filters change, update the active mode
Events.on('filter:changed', function(filtered, full) {
  switch (ModeController.current) {
    case 'explore':  ExploreMode.onFilterChanged(filtered, full); break;
    case 'overview': OverviewMode.onFilterChanged(filtered, full); break;
  }
});


/* =============================================
   KEYBOARD SHORTCUTS
   ============================================= */

document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === '1') ModeController.switch('narrative');
  if (e.key === '2') ModeController.switch('explore');
  if (e.key === '3') ModeController.switch('overview');
  if (e.key === 'Escape' && App.closePanel) App.closePanel();
});


/* =============================================
   BOOT — after App is ready
   ============================================= */

Events.on('app:ready', function() {
  console.log('%c[Modes]%c Booting mode system', 'color:#f472b6;font-weight:bold', 'color:inherit');

  // Setup mode switcher buttons
  document.querySelectorAll('.mode-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      ModeController.switch(btn.dataset.mode);
    });
  });

  // Start in Narrative mode
  NarrativeMode.enter();
});
