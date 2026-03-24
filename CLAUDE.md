# DHd Landscape

An interactive map of the Digital Humanities research landscape in the German-speaking world (DACH). Explore institutions, professorships, and research areas.

- **Repository**: https://github.com/chpollin/dhd-landscape
- **GitHub Pages**: https://chpollin.github.io/dhd-landscape
- **Data Source**: Patrick Sahle's DH professorship list (https://dhd-blog.org/?p=11018)

## Current State

- **52 institutions** aggregated from 130 DH professorships (2008–2026)
- Interactive MapLibre GL JS map with discipline/method/country filters, timeline, search
- Knowledge vault with 5 documents aligned with Obsidian Research Vault conventions
- No individual person names shown — institution-level profiles only

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
- `Data/` — Datasets (JSON, scripts)
  - `dh-professorships.json` — Raw Sahle data (130 entries)
  - `institutions.json` — Aggregated profiles (52 institutions)
  - `build-institutions.js` — Aggregation script
- `Feedback/` — Verification cycles
- `Journal.md` — Project journal (content/decisions)
- `Journal-Promptotyping.md` — Promptotyping journal (method reflection)

### External Knowledge
- Obsidian Research Vault: `C:\Users\Chrisi\Documents\obsidian`
- Relevant areas: Digital Humanities/, Applied Generative AI/, Research Data and Open Science/

## Tech Stack

- **No frameworks** — Vanilla JS, static HTML/CSS
- **Map**: MapLibre GL JS via CDN
- **Charts**: D3.js via CDN (planned)
- **Tiles**: CartoDB Dark Matter (`basemaps.cartocdn.com/dark_all`)
- **Fonts**: Noto Sans via `fonts.openmaptiles.org`
- **Deployment**: GitHub Pages from main branch (zero build step)

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
