/**
 * DHd Landscape — views.js
 * Simplified view controller. Three views: Overview, Map, Explorer.
 * Replaces modes.js (no more Narrative mode, no floating panels).
 */

/* =============================================
   1. ViewManager — switches between views
   ============================================= */
const ViewManager = {
    current: 'overview',

    switch(view) {
        // Hide all views
        document.querySelectorAll('.view-container').forEach(el => el.hidden = true);
        // Show target
        const target = document.getElementById('view-' + view);
        if (target) target.hidden = false;
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(t =>
            t.classList.toggle('active', t.dataset.view === view));
        // Activate view-specific logic
        if (view === 'map') {
            setTimeout(() => App.map.resize(), 50);
        }
        if (view === 'explorer') {
            ExplorerView.render();
        }
        if (view === 'overview') {
            OverviewView.render();
        }
        this.current = view;
    }
};

/* =============================================
   2. OverviewView — D3 summary charts
   ============================================= */
const OverviewView = {
    render() {
        const data = App.filtered || App.data;
        if (!data || data.length === 0) return;

        this.renderTaDiRAHDonut('overview-tadirah', data);
        this.renderDisciplinesBars('overview-disciplines', data);
        this.renderTimelineSparkline('overview-timeline', data);
        this.renderCountriesBars('overview-countries', data);
    },

    /**
     * Horizontal bars showing TaDiRAH category distribution across all institutions
     */
    renderTaDiRAHDonut(containerId, data) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';

        const TADIRAH_COLORS = DHdCharts.TADIRAH_COLORS;

        // Count methods across all institutions, categorized by TaDiRAH
        const counts = {};
        data.forEach(inst => {
            const methods = typeof inst.methods === 'string' ? JSON.parse(inst.methods) : (inst.methods || []);
            methods.forEach(m => {
                const label = typeof m === 'object' ? m.label : m;
                const uri = typeof m === 'object' ? (m.tadirahUri || '') : '';
                // Map to TaDiRAH category from URI or fallback
                let cat = 'Meta';
                Object.keys(TADIRAH_COLORS).forEach(c => {
                    if (uri.toLowerCase().includes(c.toLowerCase()) || label.toLowerCase().includes(c.toLowerCase())) {
                        cat = c;
                    }
                });
                counts[cat] = (counts[cat] || 0) + 1;
            });
        });

        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) return;

        const maxVal = d3.max(entries, d => d[1]) || 1;

        const margin = { top: 4, right: 40, bottom: 4, left: 100 };
        const barH = 24;
        const width = el.clientWidth - margin.left - margin.right;
        const height = entries.length * barH;

        const svg = d3.select(el).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
        const y = d3.scaleBand().domain(entries.map(d => d[0])).range([0, height]).padding(0.3);

        // Bars
        svg.selectAll('.bar')
            .data(entries)
            .join('rect')
            .attr('x', 0)
            .attr('y', d => y(d[0]))
            .attr('width', d => x(d[1]))
            .attr('height', y.bandwidth())
            .attr('fill', d => TADIRAH_COLORS[d[0]] || '#95A5A6')
            .attr('rx', 3)
            .attr('opacity', 0.85);

        // Labels
        svg.selectAll('.label')
            .data(entries)
            .join('text')
            .attr('x', -8)
            .attr('y', d => y(d[0]) + y.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#666666')
            .attr('font-size', '0.65rem')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d[0]);

        // Count labels
        svg.selectAll('.count')
            .data(entries)
            .join('text')
            .attr('x', d => x(d[1]) + 6)
            .attr('y', d => y(d[0]) + y.bandwidth() / 2)
            .attr('dominant-baseline', 'central')
            .attr('fill', '#666666')
            .attr('font-size', '0.6rem')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d[1]);
    },

    /**
     * Top 15 disciplines as horizontal bars
     */
    renderDisciplinesBars(containerId, data) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';

        // Count disciplines
        const counts = {};
        data.forEach(inst => {
            const discs = typeof inst.disciplines === 'string' ? JSON.parse(inst.disciplines) : (inst.disciplines || []);
            discs.forEach(d => { counts[d] = (counts[d] || 0) + 1; });
        });

        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15);
        if (entries.length === 0) return;

        const maxVal = d3.max(entries, d => d[1]) || 1;

        const margin = { top: 4, right: 40, bottom: 4, left: 160 };
        const barH = 22;
        const width = el.clientWidth - margin.left - margin.right;
        const height = entries.length * barH;

        const svg = d3.select(el).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
        const y = d3.scaleBand().domain(entries.map(d => d[0])).range([0, height]).padding(0.25);

        // Bars
        svg.selectAll('.bar')
            .data(entries)
            .join('rect')
            .attr('x', 0)
            .attr('y', d => y(d[0]))
            .attr('width', d => x(d[1]))
            .attr('height', y.bandwidth())
            .attr('fill', d => DHdCharts.discColor(d[0]))
            .attr('rx', 3)
            .attr('opacity', 0.85);

        // Labels
        svg.selectAll('.label')
            .data(entries)
            .join('text')
            .attr('x', -8)
            .attr('y', d => y(d[0]) + y.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#666666')
            .attr('font-size', '0.6rem')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d[0].length > 25 ? d[0].slice(0, 23) + '...' : d[0]);

        // Count labels
        svg.selectAll('.count')
            .data(entries)
            .join('text')
            .attr('x', d => x(d[1]) + 6)
            .attr('y', d => y(d[0]) + y.bandwidth() / 2)
            .attr('dominant-baseline', 'central')
            .attr('fill', '#666666')
            .attr('font-size', '0.55rem')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d[1]);
    },

    /**
     * Simple area chart showing positions per year (cumulative)
     */
    renderTimelineSparkline(containerId, data) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';

        const years = d3.range(2008, 2027);

        // Build cumulative position counts
        const yearCounts = {};
        years.forEach(y => { yearCounts[y] = 0; });

        data.forEach(inst => {
            const positions = typeof inst.positions === 'string' ? JSON.parse(inst.positions) : (inst.positions || []);
            positions.forEach(pos => {
                if (pos.year && pos.year >= 2008 && pos.year <= 2026) {
                    yearCounts[pos.year] = (yearCounts[pos.year] || 0) + 1;
                }
            });
        });

        // Cumulative
        const cumulative = [];
        let running = 0;
        years.forEach(y => {
            running += yearCounts[y];
            cumulative.push({ year: y, count: running });
        });

        const margin = { top: 10, right: 16, bottom: 26, left: 36 };
        const width = el.clientWidth - margin.left - margin.right;
        const height = Math.max(120, (el.clientHeight || 160) - margin.top - margin.bottom);

        const svg = d3.select(el).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([2008, 2026]).range([0, width]);
        const yMax = d3.max(cumulative, d => d.count) || 1;
        const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([height, 0]);

        // Area
        const area = d3.area()
            .x(d => x(d.year))
            .y0(height)
            .y1(d => yScale(d.count))
            .curve(d3.curveMonotoneX);

        // Line
        const line = d3.line()
            .x(d => x(d.year))
            .y(d => yScale(d.count))
            .curve(d3.curveMonotoneX);

        // Gradient
        const gradId = 'sparkline-grad-' + containerId;
        const defs = svg.append('defs');
        const grad = defs.append('linearGradient')
            .attr('id', gradId)
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#3498DB').attr('stop-opacity', 0.3);
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#3498DB').attr('stop-opacity', 0.02);

        svg.append('path')
            .datum(cumulative)
            .attr('d', area)
            .attr('fill', `url(#${gradId})`);

        svg.append('path')
            .datum(cumulative)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#3498DB')
            .attr('stroke-width', 2);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format('d')))
            .call(g => g.select('.domain').attr('stroke', '#E8E5DF'))
            .call(g => g.selectAll('.tick line').attr('stroke', '#E8E5DF'))
            .call(g => g.selectAll('.tick text').attr('fill', '#666666').attr('font-size', '0.6rem'));

        svg.append('g')
            .call(d3.axisLeft(yScale).ticks(4))
            .call(g => g.select('.domain').attr('stroke', '#E8E5DF'))
            .call(g => g.selectAll('.tick line').attr('stroke', '#E8E5DF'))
            .call(g => g.selectAll('.tick text').attr('fill', '#666666').attr('font-size', '0.6rem'));
    },

    /**
     * DE/AT/CH/LU bars
     */
    renderCountriesBars(containerId, data) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';

        const COUNTRY_COLORS = DHdCharts.COUNTRY_COLORS;

        // Count by country
        const counts = {};
        data.forEach(inst => {
            const c = inst.country || 'Other';
            counts[c] = (counts[c] || 0) + 1;
        });

        const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (entries.length === 0) return;

        const maxVal = d3.max(entries, d => d[1]) || 1;

        const margin = { top: 4, right: 40, bottom: 4, left: 40 };
        const barH = 28;
        const width = el.clientWidth - margin.left - margin.right;
        const height = entries.length * barH;

        const svg = d3.select(el).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
        const y = d3.scaleBand().domain(entries.map(d => d[0])).range([0, height]).padding(0.3);

        // Bars
        svg.selectAll('.bar')
            .data(entries)
            .join('rect')
            .attr('x', 0)
            .attr('y', d => y(d[0]))
            .attr('width', d => x(d[1]))
            .attr('height', y.bandwidth())
            .attr('fill', d => COUNTRY_COLORS[d[0]] || '#95A5A6')
            .attr('rx', 3)
            .attr('opacity', 0.85);

        // Labels
        svg.selectAll('.label')
            .data(entries)
            .join('text')
            .attr('x', -8)
            .attr('y', d => y(d[0]) + y.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#666666')
            .attr('font-size', '0.7rem')
            .attr('font-weight', '500')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d[0]);

        // Count labels
        svg.selectAll('.count')
            .data(entries)
            .join('text')
            .attr('x', d => x(d[1]) + 6)
            .attr('y', d => y(d[0]) + y.bandwidth() / 2)
            .attr('dominant-baseline', 'central')
            .attr('fill', '#666666')
            .attr('font-size', '0.65rem')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d[1]);
    }
};

/* =============================================
   3. MapView — Filter Sidebar
   ============================================= */
const MapView = {
    sidebarOpen: false,

    init() {
        // Build filter groups from data
        this.buildFilters();

        // Wire toggle button
        const filterToggle = document.getElementById('filter-toggle');
        if (filterToggle) {
            filterToggle.addEventListener('click', () => this.toggleSidebar());
        }

        const sidebarClose = document.getElementById('sidebar-close');
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => this.toggleSidebar());
        }

        const resetAll = document.getElementById('reset-all');
        if (resetAll) {
            resetAll.addEventListener('click', () => this.resetFilters());
        }

        // Wire sidebar search
        const sidebarSearch = document.getElementById('sidebar-search');
        if (sidebarSearch) {
            sidebarSearch.addEventListener('input', (e) => {
                App.searchTerm = e.target.value;
                App.applyFilters();
            });
        }

        // Wire timeline slider
        const slider = document.getElementById('timeline-slider');
        if (slider) {
            slider.addEventListener('input', () => {
                App.yearMin = parseInt(slider.value);
                const tlValue = document.getElementById('tl-value');
                if (tlValue) {
                    tlValue.textContent = App.yearMin === 2008 ? 'alle' : App.yearMin;
                }
                App.applyFilters();
            });
        }
    },

    buildFilters() {
        const groupsEl = document.getElementById('filter-groups');
        if (!groupsEl || !App.data || App.data.length === 0) return;
        groupsEl.innerHTML = '';

        // --- Count disciplines ---
        const discCounts = {};
        App.data.forEach(inst => {
            const discs = typeof inst.disciplines === 'string' ? JSON.parse(inst.disciplines) : (inst.disciplines || []);
            discs.forEach(d => { discCounts[d] = (discCounts[d] || 0) + 1; });
        });

        // --- Count methods (with TaDiRAH info) ---
        const methCounts = {};
        const methTaDiRAH = {}; // method label -> TaDiRAH category
        App.data.forEach(inst => {
            const meths = typeof inst.methods === 'string' ? JSON.parse(inst.methods) : (inst.methods || []);
            meths.forEach(m => {
                const label = typeof m === 'object' ? m.label : m;
                const uri = typeof m === 'object' ? (m.tadirahUri || '') : '';
                methCounts[label] = (methCounts[label] || 0) + 1;
                if (uri && !methTaDiRAH[label]) {
                    // Derive TaDiRAH category from URI
                    Object.keys(DHdCharts.TADIRAH_COLORS).forEach(cat => {
                        if (uri.toLowerCase().includes(cat.toLowerCase())) {
                            methTaDiRAH[label] = cat;
                        }
                    });
                }
            });
        });

        // --- Count countries ---
        const countryCounts = {};
        App.data.forEach(inst => {
            const c = inst.country || 'Other';
            countryCounts[c] = (countryCounts[c] || 0) + 1;
        });

        // --- Build filter group: Disziplinen (count >= 3) ---
        const discEntries = Object.entries(discCounts).filter(d => d[1] >= 3).sort((a, b) => b[1] - a[1]);
        if (discEntries.length > 0) {
            groupsEl.appendChild(this._buildGroup('Disziplinen', discEntries, 'disc', (name) => {
                return DHdCharts.discColor(name);
            }));
        }

        // --- Build filter group: Methoden (count >= 3) ---
        const methEntries = Object.entries(methCounts).filter(d => d[1] >= 3).sort((a, b) => b[1] - a[1]);
        if (methEntries.length > 0) {
            groupsEl.appendChild(this._buildGroup('Methoden', methEntries, 'meth', (name) => {
                const cat = methTaDiRAH[name] || 'Meta';
                return DHdCharts.TADIRAH_COLORS[cat] || '#95A5A6';
            }));
        }

        // --- Build filter group: Laender (all) ---
        const countryEntries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
        if (countryEntries.length > 0) {
            groupsEl.appendChild(this._buildGroup('Laender', countryEntries, 'country', (name) => {
                return DHdCharts.COUNTRY_COLORS[name] || '#95A5A6';
            }));
        }
    },

    /**
     * Build a single filter group element
     */
    _buildGroup(title, entries, filterKey, colorFn) {
        const group = document.createElement('div');
        group.className = 'filter-group';

        const titleEl = document.createElement('div');
        titleEl.className = 'filter-group-title';
        titleEl.textContent = title;
        group.appendChild(titleEl);

        entries.forEach(([name, count]) => {
            const item = document.createElement('div');
            item.className = 'filter-item';
            item.style.cursor = 'pointer';

            const dot = document.createElement('span');
            dot.className = 'filter-dot';
            dot.style.backgroundColor = colorFn(name);
            dot.style.display = 'inline-block';
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.marginRight = '8px';
            dot.style.flexShrink = '0';

            const label = document.createElement('span');
            label.className = 'filter-label';
            label.textContent = name;
            label.style.flex = '1';

            const badge = document.createElement('span');
            badge.className = 'filter-count';
            badge.textContent = count;

            item.appendChild(dot);
            item.appendChild(label);
            item.appendChild(badge);

            item.addEventListener('click', () => {
                const set = App.active[filterKey];
                if (!set) return;
                if (set.has(name)) {
                    set.delete(name);
                    item.classList.remove('active');
                } else {
                    set.add(name);
                    item.classList.add('active');
                }
                App.applyFilters();
            });

            group.appendChild(item);
        });

        return group;
    },

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        const sidebar = document.getElementById('filter-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open', this.sidebarOpen);
        }
    },

    resetFilters() {
        App.active.disc.clear();
        App.active.meth.clear();
        App.active.country.clear();
        App.searchTerm = '';
        App.yearMin = 2008;

        // Reset UI
        const sidebarSearch = document.getElementById('sidebar-search');
        if (sidebarSearch) sidebarSearch.value = '';

        const slider = document.getElementById('timeline-slider');
        if (slider) slider.value = '2008';

        const tlValue = document.getElementById('tl-value');
        if (tlValue) tlValue.textContent = 'alle';

        document.querySelectorAll('.filter-item.active').forEach(el => el.classList.remove('active'));

        App.applyFilters();
    }
};

/* =============================================
   4. ExplorerView — Sub-nav + charts
   ============================================= */
const ExplorerView = {
    activeChart: 'timeline',

    init() {
        document.querySelectorAll('.explorer-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.explorer-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeChart = tab.dataset.chart;
                this.render();
            });
        });
    },

    render() {
        const container = document.getElementById('explorer-chart');
        if (!container) return;
        container.innerHTML = '';

        const filtered = App.filtered || App.data;
        const full = App.data;

        switch (this.activeChart) {
            case 'timeline':
                DHdCharts.renderTo('timeline', container, filtered, full);
                break;
            case 'institutions':
                DHdCharts.renderTo('barchart', container, filtered, full);
                break;
            case 'disciplines':
                DHdCharts.renderTo('heatmap', container, filtered, full);
                break;
        }
    }
};

/* =============================================
   5. Boot — wire everything on app:ready
   ============================================= */
Events.on('app:ready', () => {
    console.log('%c[Views]%c Booting view system', 'color:#3498DB;font-weight:bold', 'color:inherit');

    // Wire nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => ViewManager.switch(tab.dataset.view));
    });

    // Wire search in nav
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            App.searchTerm = e.target.value;
            App.applyFilters();
        });
    }

    // Init views
    MapView.init();
    ExplorerView.init();
    OverviewView.render();

    // Listen for filter changes
    Events.on('filter:changed', () => {
        if (ViewManager.current === 'explorer') ExplorerView.render();
        if (ViewManager.current === 'overview') OverviewView.render();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === 'Escape') App.closePanel();
    });

    // Default view
    ViewManager.switch('overview');
});
