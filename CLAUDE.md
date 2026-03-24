# DHd Landscape

An interactive map of the Digital Humanities research landscape in the German-speaking world (DACH). Explore institutions, professorships, and research areas.

- **Repository**: https://github.com/chpollin/dhd-landscape
- **GitHub Pages**: https://chpollin.github.io/dhd-landscape
- **Data Sources**: Sahle DH list, OpenAlex, Wikidata, Zenodo, CLARIN, DHCR, DBLP

## Current State (after Iteration 6)

- **52 institutions** aggregated from 130 DH professorships (2008–2026)
- **7 data sources**: Sahle + OpenAlex + Wikidata (806 universities, 51/52 matched) + Zenodo (2112 records, 50/52 matched) + CLARIN (23 centres, 5 matched) + DHCR (196 courses, 24 matched) + DBLP (500 records)
- **Light Mode design**: Warm off-white (#F5F3EF) background, dark gray text, card shadows
- **3 Views** (Map-as-Canvas architecture):
  - **Übersicht**: Start page with animated stats, key figures, entry point
  - **Karte**: Interactive map with TaDiRAH-colored markers, filters, detail panel
  - **Explorer**: D3.js chart panels — Timeline, Institutionen, Disziplinen
- View switcher: `[Übersicht | Karte | Explorer]`
- **TaDiRAH semantic colors**: 8 categories (Capture=Blue, Creation=Purple, Enrichment=Green, Analysis=Orange, Interpretation=Red, Storage=Slate, Dissemination=Teal, Meta=Gray)
- D3.js charts: Stacked Area, Horizontal Barchart, Discipline Heatmap
- Detail panel with stats, tags, positions, Wikidata/ROR links
- Design system: CSS Custom Properties, WCAG AA contrast, min 0.75rem fonts
- Knowledge vault: 5 documents aligned with Obsidian Research Vault conventions
- JSON-LD context: `Data/context.jsonld`
- No individual person names — institution-level profiles only

### Build Pipeline
```
node Data/build-institutions.js
```
Merges: dh-professorships.json + openalex-institutions.json + wikidata-overrides.json + tadirah-mapping.json + zenodo/clarin/dhcr/dblp data → institutions.json

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
- **Tiles**: CartoDB Light (Positron) (`basemaps.cartocdn.com/light_all`)
- **Fonts**: Google Fonts (Source Serif 4 + Inter), Open Sans via MapTiler glyph server
- **Deployment**: GitHub Pages from main branch (zero build step)

### File Structure
- `index.html` — HTML structure: Map + Chrome + 3 View containers + Detail panel
- `styles.css` — Design system (CSS Custom Properties, light mode, all component styles)
- `app.js` — Shared infrastructure (Map init, filters, panel, Event bus)
- `views.js` — ViewManager + Übersicht + Karte + Explorer views (replaces deprecated modes.js)
- `charts.js` — D3.js chart module (DHdCharts with renderTo for Explorer panels)
- `Data/context.jsonld` — JSON-LD context for Linked Open Data

## Data Model

Each institution has:
- `name`, `city`, `country`, `coordinates` [lng, lat]
- `totalPositions`, `earliestYear`, `founded`
- `disciplines[]` — Digital Humanities, Digital History, Computational Literary Studies, etc.
- `methods[]` — NLP, TEI/XML, GIS, Linked Data, etc.
- `positions[]` — Individual professorships (name, year, level, status)
- `tadirahProfile` — TaDiRAH category distribution (semantic research profile)
- `gndId` — GND identifier for the institution
- `zenodoRecordCount` — Number of Zenodo records linked to the institution
- `clarinCentre` — CLARIN centre status (if applicable)
- `dhCourses` — DH courses from DH Course Registry

JSON-LD context available at `Data/context.jsonld` (Schema.org + Wikidata + TaDiRAH + ROR).

## Conventions

- Data files in `Data/` as JSON
- Coordinates in [lng, lat] (GeoJSON/WGS 84)
- Knowledge documents have YAML frontmatter (type, created, tags, status)
- Knowledge documents use `[[wikilinks]]` to Obsidian vault concepts
- Commit messages in English
- No person names in public-facing data

## Design-Prinzipien (aus Iteration 4–6)

- **Light Mode**: Warm off-white (#F5F3EF) background, dark gray text, card shadows — no dark theme
- **Inhaltliche Dimensionen priorisieren**: Disziplinen, Methoden, TaDiRAH-Kategorien, Publikationen — keine besetzt/offen-Unterscheidung
- **Wissenschaftlich-sachlicher Ton**: Keine Marketing-Sprache, keine Metaphern ("Reise"), keine Superlative. Daten sprechen lassen.
- **TaDiRAH-Farbkodierung**: 8 Kategorien durchgängig (Capture=Blue, Creation=Purple, Enrichment=Green, Analysis=Orange, Interpretation=Red, Storage=Slate, Dissemination=Teal, Meta=Gray)
- **3 Views statt 3 Modes**: Übersicht (Start) | Karte (TaDiRAH-Marker) | Explorer (Charts)
- **Forschungsorientiert**: Tool soll Forschungsfragen beantworten ("Wer arbeitet an X?", "Welche Methoden dominieren?")
- **Linked Data**: JSON-LD context (`Data/context.jsonld`) mit Schema.org, Wikidata, TaDiRAH, ROR, GND
