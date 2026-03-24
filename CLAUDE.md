# DHd Landscape

An interactive map of the Digital Humanities research landscape in the German-speaking world (DACH). Explore institutions, professorships, and research areas.

- **Repository**: https://github.com/chpollin/dhd-landscape
- **GitHub Pages**: https://chpollin.github.io/dhd-landscape
- **Data Source**: Patrick Sahle's DH professorship list (https://dhd-blog.org/?p=11018)

## Current State (after Iteration 4)

- **52 institutions** aggregated from 130 DH professorships (2008–2026)
- **26 Wikidata-IDs**, **49 ROR-IDs**, **1906 DH publications** (OpenAlex)
- **Map-as-Canvas Architecture** — Map is always 100% viewport, three modes:
  - **Narrative Mode**: Scrollytelling with 7 stations (Intro → Köln → Berlin → Wien → Timeline → Explore-CTA). Map flies between stations, mini-visualizations in glassmorphic cards.
  - **Explore Mode**: Floating draggable D3 chart panels (Timeline, Barchart, Heatmap) over the map. Collapsible filter sidebar (320px). Stats bar.
  - **Overview Mode**: HUD dashboard with animated counters, country bars, discipline chart, mini timeline — all as floating widgets over the map.
- Mode switcher: `[≡ Story | ◎ Explore | ⊞ Overview]`, keyboard shortcuts 1/2/3
- D3.js charts: Stacked Area, Horizontal Barchart, Discipline Heatmap
- Detail panel (420px, right side) with stats, tags, positions, Wikidata/ROR links
- Marker colors: Indigo (#818cf8) = besetzt, Amber (#fbbf24) = offen (colorblind-safe)
- Design system: CSS Custom Properties, WCAG AA contrast, min 0.75rem fonts
- Knowledge vault: 5 documents aligned with Obsidian Research Vault conventions
- No individual person names — institution-level profiles only

### Build Pipeline
```
node Data/build-institutions.js
```
Merges: dh-professorships.json + openalex-institutions.json + wikidata-overrides.json + tadirah-mapping.json → institutions.json

## Promptotyping

This repository serves dual purpose:
1. **Product**: Interactive DH landscape visualization
2. **Case Study**: Documented example of the Promptotyping method

### Repo Structure
- `Knowledge/` — Promptotyping Vault (Obsidian-compatible)
  - `Data.md` — Data sources, data model, processing pipeline
  - `Design.md` — Visual concepts, interaction design, theory
  - `Research.md` — Research questions, LOD model, related work
  - `Requirements.md` — User stories and use cases
  - `Promptotyping.md` — Method description (meta-level)
- `Data/` — Datasets and scripts
  - `dh-professorships.json` — Raw Sahle data (130 entries)
  - `openalex-institutions.json` — OpenAlex API results (282 entries)
  - `wikidata-overrides.json` — Manual Wikidata/ROR corrections
  - `tadirah-mapping.json` — Method → TaDiRAH URI mapping
  - `institutions.json` — Built output (52 institution profiles)
  - `build-institutions.js` — Aggregation + enrichment script
  - `fetch-openalex.js` — OpenAlex API fetcher
- `Feedback/` — Verification cycles
- `Journal.md` — Project journal (content/decisions)
- `Journal-Promptotyping.md` — Promptotyping journal (method reflection)

### External Knowledge
- Obsidian Research Vault: `C:\Users\Chrisi\Documents\obsidian`
- Relevant areas: Digital Humanities/, Applied Generative AI/, Research Data and Open Science/

## Tech Stack

- **No frameworks** — Vanilla JS, static HTML/CSS
- **Map**: MapLibre GL JS via CDN
- **Charts**: D3.js v7 via CDN (`charts.js` — Stacked Area, Barchart, Heatmap)
- **Tiles**: CartoDB Dark Matter (`basemaps.cartocdn.com/dark_all`)
- **Fonts**: Google Fonts (Source Serif 4 + Inter), Open Sans via MapTiler glyph server
- **Deployment**: GitHub Pages from main branch (zero build step)

### File Structure
- `index.html` — HTML structure: Map + Chrome + 3 Mode containers + Detail panel
- `styles.css` — Design system (CSS Custom Properties, all component styles)
- `app.js` — Shared infrastructure (Map init, filters, panel, Event bus)
- `modes.js` — ModeController + NarrativeMode + ExploreMode + OverviewMode
- `charts.js` — D3.js chart module (DHdCharts with renderTo for floating panels)

## Data Model

Each institution has:
- `name`, `city`, `country`, `coordinates` [lng, lat]
- `totalPositions`, `openPositions`, `earliestYear`
- `disciplines[]` — Digital Humanities, Digital History, Computational Literary Studies, etc.
- `methods[]` — NLP, TEI/XML, GIS, Linked Data, etc.
- `positions[]` — Individual professorships (name, year, level, status)

Planned: JSON-LD with Schema.org + Wikidata + TaDiRAH + ROR identifiers.

## Conventions

- Data files in `Data/` as JSON
- Coordinates in [lng, lat] (GeoJSON/WGS 84)
- Knowledge documents have YAML frontmatter (type, created, tags, status)
- Knowledge documents use `[[wikilinks]]` to Obsidian vault concepts
- Commit messages in English
- No person names in public-facing data
