# DHd Landscape

An interactive map of the Digital Humanities research landscape in the German-speaking world (DACH). Explore institutions, research topics, and collaboration networks.

- **Repository**: https://github.com/chpollin/dhd-landscape
- **GitHub Pages**: https://chpollin.github.io/dhd-landscape
- **Data Sources**: Sahle DH list, OpenAlex, Wikidata, Zenodo, CLARIN, DHCR, DBLP

## Current State (after Iteration 7)

- **52 institutions** with LOD identifiers (Wikidata URI as canonical @id)
- **7 data sources** unified via LOD pipeline (`build-lod.js`):
  - Sahle (130 DH positions) + OpenAlex (282 institutions) + Wikidata (51/52 matched) + Zenodo (2112 records, **47 with topic profiles**) + CLARIN (5 centres) + DHCR (24 with courses) + DBLP (500 records)
- **Zenodo topic extraction**: 36 patterns analyze 2,112 DHd conference abstracts → per-institution research profiles
- **Co-authorship network**: 156 institutional collaboration edges (≥2 shared papers)
- **Light Mode design**: Warm off-white (#F5F3EF) background, dark gray text, card shadows
- **3 Views** (Map-as-Canvas architecture):
  - **Übersicht**: Stats, TaDiRAH bars, Disciplines, Timeline, Countries, Zenodo Topics, Datenquellen
  - **Karte**: Interactive map with TaDiRAH-colored markers, filters, detail panel with topics + collaborators
  - **Explorer**: 5 chart sections — Zeitverlauf, Institutionen, Disziplinen, Forschungsthemen, Kooperationsnetzwerk
- **TaDiRAH semantic colors**: 8 categories (Capture=Blue, Creation=Purple, Enrichment=Green, Analysis=Orange, Interpretation=Red, Storage=Slate, Dissemination=Teal, Meta=Gray)
- D3.js charts: Stacked Area, Horizontal Barchart, Discipline Heatmap, Topic Bars, Network Bars
- Detail panel with stats, tags, Zenodo topics, collaborators, positions, Wikidata/ROR/GND links
- Design system: CSS Custom Properties, WCAG AA contrast, min 0.75rem fonts
- Knowledge vault: 6 documents aligned with Obsidian Research Vault conventions
- No individual person names — institution-level profiles only

### Build Pipeline
```
node Data/build-lod.js
```
LOD pipeline: All 7 sources → 4 outputs:
- `institutions-ld.jsonld` — JSON-LD with @context (LOD export)
- `institutions-ld.json` — Frontend dataset
- `institutions.json` — Backward compatibility
- `collaborations.json` — Co-authorship network

Legacy: `build-institutions.js` (deprecated, superseded by build-lod.js)

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
  - `Research-Plan-Iteration7.md` — Current research plan + goals
- `Data/` — Datasets and scripts
  - `build-lod.js` — **Primary build script** (LOD pipeline, all 7 sources)
  - `build-institutions.js` — Legacy build script (deprecated)
  - `dh-professorships.json` — Raw Sahle data (130 entries)
  - `openalex-institutions.json` — OpenAlex API results (282 entries)
  - `wikidata-enrichment.json` — Wikidata SPARQL results (806 universities)
  - `wikidata-overrides.json` — Manual Wikidata/ROR corrections
  - `tadirah-mapping.json` — Method → TaDiRAH URI mapping (31 methods)
  - `zenodo-records.json` — DHd community Zenodo records (2112 entries)
  - `clarin-centres.json` — CLARIN centre registry (23 centres)
  - `dhcr-programmes.json` — DH Course Registry (196 courses)
  - `dblp-records.json` — DBLP publication records (500 entries)
  - `institutions.json` — Built output (52 institution profiles)
  - `institutions-ld.jsonld` — JSON-LD LOD export
  - `collaborations.json` — Co-authorship network (156 edges)
  - `context.jsonld` — JSON-LD context definition
  - `fetch-*.js` — API fetcher scripts (openalex, wikidata, zenodo, clarin, dhcr, dblp)
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
- `app.js` — Shared infrastructure (Map init, CONFIG, filters, panel rendering, Event bus)
- `views.js` — ViewManager + Übersicht + Karte + Explorer views + `renderHorizontalBars()` helper
- `charts.js` — D3.js chart module (DHdCharts IIFE with renderTo for Explorer panels)

## Data Model

Each institution has:
- `@id` — Canonical Wikidata URI (e.g., `http://www.wikidata.org/entity/Q622683`)
- `@type` — `ResearchOrganization`
- `name`, `city`, `country`, `coordinates` [lng, lat]
- `sameAs[]` — Links to Wikidata, ROR, GND URIs
- `totalPositions`, `earliestYear`, `founded`
- `disciplines[]` — Digital Humanities, Digital History, Computational Literary Studies, etc.
- `methods[]` — `{label, tadirahUri, tadirahCategory}` objects
- `positions[]` — Individual DH positions (name, year, level, status)
- `tadirahProfile` — TaDiRAH category distribution (semantic research profile)
- `zenodoTopics[]` — `{topic, count}` from DHd conference abstract analysis
- `zenodoYears{}` — Publication activity by year
- `zenodoRecordCount` — Total Zenodo records
- `collaborators[]` — `{institution, sharedPapers, sharedTopics}` from co-authorship network
- `wikidataId`, `rorId`, `gndId` — As full URIs
- `clarinCentre` — CLARIN centre status (if applicable)
- `dhCourses` — DH courses from DH Course Registry
- `dhPublicationCount`, `dblpPublicationCount` — Publication counts

JSON-LD export at `Data/institutions-ld.jsonld` using Schema.org, Wikidata, TaDiRAH, ROR, GND.

## Conventions

- Data files in `Data/` as JSON
- Coordinates in [lng, lat] (GeoJSON/WGS 84)
- Knowledge documents have YAML frontmatter (type, created, tags, status)
- Knowledge documents use `[[wikilinks]]` to Obsidian vault concepts
- Commit messages in English
- No person names in public-facing data
- "Stellen"/"Positionen" statt "Professuren" (DH-Forschung insgesamt, nicht nur Professuren)

## Design-Prinzipien (aus Iteration 4–7)

- **Light Mode**: Warm off-white (#F5F3EF) background, dark gray text, card shadows — no dark theme
- **Inhaltliche Dimensionen priorisieren**: Disziplinen, Methoden, TaDiRAH-Kategorien, Zenodo-Topics, Kooperationen
- **Wissenschaftlich-sachlicher Ton**: Keine Marketing-Sprache, keine Metaphern, keine Superlative. Daten sprechen lassen.
- **TaDiRAH-Farbkodierung**: 8 Kategorien durchgängig (Capture=Blue, Creation=Purple, Enrichment=Green, Analysis=Orange, Interpretation=Red, Storage=Slate, Dissemination=Teal, Meta=Gray)
- **3 Views**: Übersicht (Start + Stats) | Karte (TaDiRAH-Marker + Filter) | Explorer (5 Chart-Sektionen)
- **Forschungsorientiert**: Tool soll Forschungsfragen beantworten ("Wer arbeitet an X?", "Welche Methoden dominieren?", "Wer kollaboriert mit wem?")
- **LOD-First**: Wikidata-URI als @id, sameAs-Links, JSON-LD Export — Linked Data ist nicht Beiwerk, sondern Architektur
- **Empirisch statt heuristisch**: Forschungsthemen aus Zenodo-Abstracts extrahiert, nicht aus Denominationen abgeleitet
