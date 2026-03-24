/**
 * DHd Landscape — D3.js Chart Module
 * Stacked Area, Horizontal Barchart, Discipline Heatmap
 */
const DHdCharts = (function() {
    'use strict';

    // --- State ---
    let container, fullData, mapRef, showPanelFn;
    let activeView = null;
    let filtered = [], full = [];

    // --- Discipline Color Palette (from Design.md) ---
    const DISC_COLORS = {
        'Digital Humanities': '#818cf8',
        'Computational Linguistics': '#7EB8DA',
        'Digital History': '#D4A574',
        'Data Science': '#82C9A5',
        'Computational Literary Studies': '#C490D1',
        'Digital Archaeology': '#E8B86D',
        'Digital Edition': '#F09B9B',
        'Digital Culture': '#a78bfa',
        'Media Studies': '#fbbf24',
        'Library Science': '#6ee7b7',
        'Information Science': '#90cdf4',
        'Digital Lexicography': '#f6ad55',
        'Machine Learning': '#fc8181',
        'AI': '#b794f4',
        'Digital Art History': '#feb2b2'
    };
    const fallbackColors = d3.scaleOrdinal(d3.schemeSet3);
    function discColor(d) { return DISC_COLORS[d] || fallbackColors(d); }

    const COUNTRY_COLORS = { DE: '#818cf8', AT: '#6ee7b7', CH: '#fbbf24', LU: '#a78bfa' };

    // --- Tooltip ---
    let tooltip;
    function initTooltip() {
        if (tooltip && document.body.contains(tooltip)) return;
        tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        document.body.appendChild(tooltip);
    }
    function showTooltip(html, event) {
        tooltip.innerHTML = html;
        tooltip.classList.add('visible');
        const x = event.clientX + 14;
        const y = event.clientY - 10;
        const r = tooltip.getBoundingClientRect();
        tooltip.style.left = Math.max(4, x + r.width > window.innerWidth ? event.clientX - r.width - 10 : x) + 'px';
        tooltip.style.top = Math.max(4, y + r.height > window.innerHeight ? event.clientY - r.height - 10 : y) + 'px';
    }
    function hideTooltip() { tooltip.classList.remove('visible'); }

    // --- Helper: mLabel ---
    function mLabel(m) { return typeof m === 'object' ? m.label : m; }

    // =====================
    // TIMELINE — Stacked Area Chart
    // =====================
    let timelineMode = 'discipline'; // or 'country'

    function showEmpty(wrap, msg) {
        wrap.innerHTML = `<div style="padding:40px 20px;color:#555;text-align:center;font-size:0.75rem">${msg || 'Keine Institutionen entsprechen den Filtern.'}</div>`;
    }

    function renderTimeline(filtered, full) {
        const wrap = container.querySelector('.chart-body');
        wrap.innerHTML = '';

        if (filtered.length === 0) { showEmpty(wrap); return; }

        const years = d3.range(2008, 2027);

        // Collect all positions from filtered institutions
        const allPositions = [];
        filtered.forEach(inst => {
            (inst.positions || []).forEach(pos => {
                allPositions.push({
                    year: pos.year,
                    discipline: (pos.disciplines?.[0]) || 'Other',
                    country: inst.country
                });
            });
        });

        let categories, colorFn, keyFn;
        if (timelineMode === 'country') {
            categories = [...new Set(filtered.map(d => d.country))].sort();
            colorFn = c => COUNTRY_COLORS[c] || '#666';
            keyFn = p => p.country;
        } else {
            // Top disciplines by frequency
            const dFreq = {};
            allPositions.forEach(p => { dFreq[p.discipline] = (dFreq[p.discipline] || 0) + 1; });
            categories = Object.entries(dFreq).sort((a,b) => b[1]-a[1]).slice(0, 8).map(d => d[0]);
            colorFn = discColor;
            keyFn = p => categories.includes(p.discipline) ? p.discipline : null;
        }

        // Build cumulative stacked data
        const yearData = years.map(y => {
            const row = { year: y };
            categories.forEach(c => { row[c] = 0; });
            return row;
        });

        allPositions.forEach(p => {
            const cat = keyFn(p);
            if (!cat) return;
            const yi = years.indexOf(p.year);
            if (yi < 0) return;
            // Cumulative: add to this year and all following
            for (let i = yi; i < yearData.length; i++) {
                yearData[i][cat] += 1;
            }
        });

        // D3 chart
        const margin = { top: 10, right: 20, bottom: 30, left: 40 };
        const width = wrap.clientWidth - margin.left - margin.right;
        const height = Math.max(200, wrap.clientHeight - margin.top - margin.bottom - 30);

        const svg = d3.select(wrap).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([2008, 2026]).range([0, width]);
        const stack = d3.stack().keys(categories).order(d3.stackOrderDescending);
        const series = stack(yearData);
        const yMax = d3.max(series, s => d3.max(s, d => d[1])) || 1;
        const y = d3.scaleLinear().domain([0, yMax]).nice().range([height, 0]);

        const area = d3.area()
            .x(d => x(d.data.year))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            .curve(d3.curveMonotoneX);

        // Areas
        svg.selectAll('.area')
            .data(series)
            .join('path')
            .attr('class', 'area')
            .attr('d', area)
            .attr('fill', d => colorFn(d.key))
            .attr('opacity', 0.75)
            .on('mouseenter', function(event, d) {
                d3.select(this).attr('opacity', 1);
            })
            .on('mouseleave', function() {
                d3.select(this).attr('opacity', 0.75);
                hideTooltip();
            });

        // Axes
        svg.append('g').attr('class', 'chart-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')));

        svg.append('g').attr('class', 'chart-axis')
            .call(d3.axisLeft(y).ticks(5));

        // Hover vertical line + tooltip
        const hoverLine = svg.append('line')
            .attr('y1', 0).attr('y2', height)
            .attr('stroke', 'rgba(255,255,255,0.15)').attr('stroke-width', 1)
            .style('display', 'none');

        const overlay = svg.append('rect')
            .attr('width', width).attr('height', height)
            .attr('fill', 'none').attr('pointer-events', 'all');

        overlay.on('mousemove', function(event) {
            const [mx] = d3.pointer(event);
            const yr = Math.round(x.invert(mx));
            if (yr < 2008 || yr > 2026) return;
            hoverLine.attr('x1', x(yr)).attr('x2', x(yr)).style('display', null);
            const row = yearData.find(d => d.year === yr);
            if (!row) return;
            let html = `<strong>${yr}</strong><br>`;
            const total = categories.reduce((s, c) => s + row[c], 0);
            categories.forEach(c => {
                if (row[c] > 0) {
                    html += `<span style="color:${colorFn(c)}">●</span> ${c}: ${row[c]}<br>`;
                }
            });
            html += `<span style="color:#888">Total: ${total}</span>`;
            showTooltip(html, event);
        });
        overlay.on('mouseleave', () => { hoverLine.style('display', 'none'); hideTooltip(); });

        // Legend below chart
        const legend = d3.select(wrap).append('div')
            .style('display', 'flex').style('flex-wrap', 'wrap').style('gap', '8px')
            .style('padding', '6px 0').style('font-size', '0.6rem');

        categories.forEach(c => {
            legend.append('span')
                .html(`<span style="color:${colorFn(c)}">●</span> ${c}`)
                .style('color', '#777');
        });
    }

    // =====================
    // BARCHART — Institutions by Position Count
    // =====================
    function renderBarchart(filtered, full) {
        const wrap = container.querySelector('.chart-body');
        wrap.innerHTML = '';

        if (filtered.length === 0) { showEmpty(wrap); return; }

        const sorted = [...filtered].sort((a, b) => b.totalPositions - a.totalPositions);

        const margin = { top: 6, right: 20, bottom: 10, left: 170 };
        const barH = 22;
        const width = wrap.clientWidth - margin.left - margin.right;
        const height = sorted.length * barH;

        const svg = d3.select(wrap).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, d3.max(sorted, d => d.totalPositions) || 1]).range([0, width]);
        const yScale = d3.scaleBand().domain(sorted.map(d => d.id)).range([0, height]).padding(0.25);

        // Stacked bars per discipline
        sorted.forEach(inst => {
            const discCounts = {};
            (inst.positions || []).forEach(pos => {
                (pos.disciplines || []).forEach(disc => {
                    discCounts[disc] = (discCounts[disc] || 0) + 1;
                });
            });
            // If no discipline detail, use totalPositions as "Digital Humanities"
            if (Object.keys(discCounts).length === 0) {
                discCounts['Digital Humanities'] = inst.totalPositions;
            }

            let xOff = 0;
            Object.entries(discCounts).sort((a,b) => b[1]-a[1]).forEach(([disc, count]) => {
                svg.append('rect')
                    .attr('x', x(xOff))
                    .attr('y', yScale(inst.id))
                    .attr('width', Math.max(0, x(xOff + count) - x(xOff)))
                    .attr('height', yScale.bandwidth())
                    .attr('fill', discColor(disc))
                    .attr('opacity', 0.8)
                    .attr('rx', 3)
                    .style('cursor', 'pointer')
                    .on('mouseenter', function(event) {
                        d3.select(this).attr('opacity', 1);
                        let html = `<strong>${inst.name}</strong><br>`;
                        html += `${inst.city}, ${inst.country} · seit ${inst.earliestYear}<br>`;
                        html += `<span style="color:#818cf8">${inst.totalPositions} Stellen</span>`;
                        if (inst.openPositions) html += ` · <span style="color:#fbbf24">${inst.openPositions} offen</span>`;
                        html += '<br>';
                        Object.entries(discCounts).sort((a,b) => b[1]-a[1]).forEach(([d, c]) => {
                            html += `<span style="color:${discColor(d)}">●</span> ${d}: ${c}<br>`;
                        });
                        showTooltip(html, event);
                    })
                    .on('mousemove', (event) => showTooltip(tooltip.innerHTML, event))
                    .on('mouseleave', function() {
                        d3.select(this).attr('opacity', 0.8);
                        hideTooltip();
                    })
                    .on('click', () => {
                        if (mapRef) mapRef.flyTo({ center: inst.coordinates, zoom: 8, duration: 600 });
                        if (showPanelFn) showPanelFn(inst);
                    });
                xOff += count;
            });
        });

        // Institution labels (y-axis)
        svg.selectAll('.bar-label')
            .data(sorted)
            .join('text')
            .attr('class', 'bar-label')
            .attr('x', -8)
            .attr('y', d => yScale(d.id) + yScale.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#777')
            .attr('font-size', '0.58rem')
            .attr('font-family', 'Inter, sans-serif')
            .style('cursor', 'pointer')
            .text(d => d.name.length > 28 ? d.name.slice(0, 26) + '…' : d.name)
            .on('click', (event, d) => {
                if (mapRef) mapRef.flyTo({ center: d.coordinates, zoom: 8, duration: 600 });
                if (showPanelFn) showPanelFn(d);
            });

        // Count labels at end of bars
        svg.selectAll('.count-label')
            .data(sorted)
            .join('text')
            .attr('class', 'count-label')
            .attr('x', d => x(d.totalPositions) + 6)
            .attr('y', d => yScale(d.id) + yScale.bandwidth() / 2)
            .attr('dominant-baseline', 'central')
            .attr('fill', '#555')
            .attr('font-size', '0.55rem')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d.totalPositions);

        // Top x-axis for reference
        svg.append('g').attr('class', 'chart-axis')
            .call(d3.axisTop(x).ticks(5));
    }

    // =====================
    // HEATMAP — Institutions × Disciplines
    // =====================
    let heatmapSort = 'frequency'; // or 'alpha'

    function renderHeatmap(filtered, full) {
        const wrap = container.querySelector('.chart-body');
        wrap.innerHTML = '';

        if (filtered.length === 0) { showEmpty(wrap); return; }

        // Build discipline list from filtered data
        const discFreq = {};
        filtered.forEach(inst => {
            (inst.disciplines || []).forEach(d => { discFreq[d] = (discFreq[d] || 0) + 1; });
        });
        let disciplines = Object.entries(discFreq);
        if (heatmapSort === 'alpha') {
            disciplines.sort((a, b) => a[0].localeCompare(b[0]));
        } else {
            disciplines.sort((a, b) => b[1] - a[1]);
        }
        disciplines = disciplines.map(d => d[0]);

        // Sort institutions
        let institutions;
        if (heatmapSort === 'alpha') {
            institutions = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        } else {
            institutions = [...filtered].sort((a, b) => b.totalPositions - a.totalPositions);
        }

        // Build matrix
        const matrix = [];
        let maxVal = 0;
        institutions.forEach(inst => {
            const discCounts = {};
            (inst.positions || []).forEach(pos => {
                (pos.disciplines || []).forEach(d => {
                    discCounts[d] = (discCounts[d] || 0) + 1;
                });
            });
            disciplines.forEach(disc => {
                const val = discCounts[disc] || 0;
                if (val > maxVal) maxVal = val;
                matrix.push({ inst, disc, val });
            });
        });

        const margin = { top: 100, right: 10, bottom: 10, left: 170 };
        const cellSize = Math.max(18, Math.min(28, (wrap.clientWidth - margin.left - margin.right) / disciplines.length));
        const width = disciplines.length * cellSize;
        const height = institutions.length * cellSize;

        const svg = d3.select(wrap).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand().domain(disciplines).range([0, width]).padding(0.08);
        const yScale = d3.scaleBand().domain(institutions.map(d => d.id)).range([0, height]).padding(0.08);
        const colorScale = d3.scaleSequential(t => d3.interpolateRgb('#1a1a2e', '#6366f1')(t)).domain([0, maxVal || 1]);

        // Cells
        svg.selectAll('.cell')
            .data(matrix)
            .join('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.disc))
            .attr('y', d => yScale(d.inst.id))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => d.val > 0 ? colorScale(d.val) : 'rgba(255,255,255,0.02)')
            .attr('rx', 2)
            .style('cursor', d => d.val > 0 ? 'pointer' : 'default')
            .on('mouseenter', function(event, d) {
                // Crosshair: highlight row + column
                svg.selectAll('.cell')
                    .attr('opacity', c => (c.inst.id === d.inst.id || c.disc === d.disc) ? 1 : 0.3);
                if (d.val > 0) {
                    showTooltip(`<strong>${d.inst.name}</strong><br><span style="color:${discColor(d.disc)}">${d.disc}</span>: ${d.val} position${d.val > 1 ? 'en' : ''}`, event);
                } else {
                    showTooltip(`<strong>${d.inst.name}</strong><br>${d.disc}: —`, event);
                }
            })
            .on('mousemove', (event) => showTooltip(tooltip.innerHTML, event))
            .on('mouseleave', () => {
                svg.selectAll('.cell').attr('opacity', 1);
                hideTooltip();
            })
            .on('click', (event, d) => {
                if (d.val > 0 && showPanelFn) showPanelFn(d.inst);
                if (d.val > 0 && mapRef) mapRef.flyTo({ center: d.inst.coordinates, zoom: 8, duration: 600 });
            });

        // Column labels (disciplines, rotated)
        svg.selectAll('.col-label')
            .data(disciplines)
            .join('text')
            .attr('class', 'col-label')
            .attr('x', d => xScale(d) + xScale.bandwidth() / 2)
            .attr('y', -6)
            .attr('transform', d => `rotate(-50, ${xScale(d) + xScale.bandwidth() / 2}, -6)`)
            .attr('text-anchor', 'start')
            .attr('fill', d => discColor(d))
            .attr('font-size', '0.55rem')
            .attr('font-family', 'Inter, sans-serif')
            .text(d => d.length > 22 ? d.slice(0, 20) + '…' : d);

        // Row labels (institutions)
        svg.selectAll('.row-label')
            .data(institutions)
            .join('text')
            .attr('class', 'row-label')
            .attr('x', -8)
            .attr('y', d => yScale(d.id) + yScale.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'central')
            .attr('fill', '#666')
            .attr('font-size', '0.55rem')
            .attr('font-family', 'Inter, sans-serif')
            .style('cursor', 'pointer')
            .text(d => d.name.length > 26 ? d.name.slice(0, 24) + '…' : d.name)
            .on('click', (event, d) => {
                if (mapRef) mapRef.flyTo({ center: d.coordinates, zoom: 8, duration: 600 });
                if (showPanelFn) showPanelFn(d);
            });
    }

    // =====================
    // Chart Header with toggles
    // =====================
    function setHeader(title, toggles) {
        const existing = container.querySelector('.chart-header');
        if (existing) existing.remove();

        const header = document.createElement('div');
        header.className = 'chart-header';
        header.innerHTML = `<span class="chart-title">${title}</span>`;

        if (toggles && toggles.length) {
            const group = document.createElement('div');
            group.style.display = 'flex';
            group.style.gap = '4px';
            toggles.forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'chart-toggle' + (t.active ? ' active' : '');
                btn.textContent = t.label;
                btn.onclick = () => {
                    group.querySelectorAll('.chart-toggle').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    t.action();
                };
                group.appendChild(btn);
            });
            header.appendChild(group);
        }

        container.insertBefore(header, container.firstChild);
    }

    // =====================
    // Public API
    // =====================
    function init(el, data, map, panelFn) {
        container = el;
        fullData = data;
        mapRef = map;
        showPanelFn = panelFn;
        // Ensure chart-body wrapper exists
        if (!container.querySelector('.chart-body')) {
            const body = document.createElement('div');
            body.className = 'chart-body';
            container.appendChild(body);
        }
        initTooltip();
        console.log('%c[Charts]%c Initialized', 'color:#f472b6;font-weight:bold', 'color:inherit');
    }

    function show(viewName, filteredData, fullData) {
        if (filteredData) filtered = filteredData;
        if (fullData) full = fullData;
        activeView = viewName;
        render();
    }

    function hide() {
        activeView = null;
        container.querySelector('.chart-body').innerHTML = '';
        const h = container.querySelector('.chart-header');
        if (h) h.remove();
    }

    function update(filteredData, fullData) {
        filtered = filteredData;
        full = fullData;
        if (activeView) render();
    }

    function render() {
        if (!activeView || !container) return;

        // Ensure chart-body exists
        if (!container.querySelector('.chart-body')) {
            const body = document.createElement('div');
            body.className = 'chart-body';
            container.appendChild(body);
        }

        switch (activeView) {
            case 'timeline':
                setHeader('Zeitliche Entwicklung der DH-Landschaft', [
                    { label: 'Disziplin', active: timelineMode === 'discipline', action: () => { timelineMode = 'discipline'; render(); } },
                    { label: 'Land', active: timelineMode === 'country', action: () => { timelineMode = 'country'; render(); } }
                ]);
                renderTimeline(filtered, full);
                break;
            case 'universities':
                setHeader('Institutionen nach Stellenanzahl', []);
                renderBarchart(filtered, full);
                break;
            case 'disciplines':
                setHeader('Disziplinen × Institutionen', [
                    { label: 'Häufigkeit', active: heatmapSort === 'frequency', action: () => { heatmapSort = 'frequency'; render(); } },
                    { label: 'A–Z', active: heatmapSort === 'alpha', action: () => { heatmapSort = 'alpha'; render(); } }
                ]);
                renderHeatmap(filtered, full);
                break;
        }
    }

    // Render a specific chart into any container element
    function renderTo(chartType, containerEl, filteredData, fullData) {
        const origContainer = container;
        const origBody = container ? container.querySelector('.chart-body') : null;

        // Temporarily point to the new container
        containerEl.innerHTML = '';
        const tempWrap = { querySelector: (sel) => sel === '.chart-body' ? containerEl : null };
        container = tempWrap;
        filtered = filteredData || filtered;
        full = fullData || full;

        switch (chartType) {
            case 'timeline': renderTimeline(filtered, full); break;
            case 'universities': case 'barchart': renderBarchart(filtered, full); break;
            case 'disciplines': case 'heatmap': renderHeatmap(filtered, full); break;
        }

        container = origContainer;
    }

    return { init, show, hide, update, renderTo, DISC_COLORS, COUNTRY_COLORS, discColor };
})();
