# DHd Landscape

An interactive map of the Digital Humanities research landscape in the German-speaking world (DACH). Explore centers, professorships, and research areas.

- **Repository**: https://github.com/chpollin/dhd-landscape
- **GitHub Pages**: https://chpollin.github.io/dhd-landscape

## Project Goals

1. Map DH centers and professorships in the DACH region (Germany, Austria, Switzerland)
2. Provide filterable, interactive visualization by discipline, method, and institution type
3. Make the research landscape explorable and transparent

## Promptotyping

This repository follows the **Promptotyping method** — it serves as both the product and a documented example of the methodology. The repo structure reflects the Promptotyping workflow:

- `Knowledge/` — Obsidian-style research vault (Design.md, Data.md, Research.md)
- `Data/` — Collected and processed datasets (JSON/CSV)
- `Feedback/` — Feedback scripts and verification notes
- `Journal.md` — Project journal documenting decisions and progress

Promptotyping-Interfaces are the web-based visualizations derived from the data, verifiable against the source material.

## Tech Stack

- **No frameworks** — Vanilla JS, static HTML/CSS
- **Map**: MapLibre GL JS (via CDN)
- **Tiles**: Free vector tiles
- **Deployment**: GitHub Pages (zero build step)
- Everything runs from a single folder — no npm, no build tools

## Data Sources

- Patrick Sahle's DH professorship list
- DHd-Verband membership / conference data
- Institutional websites of DH centers
- Publication databases (OpenAlex, BASE)

## Data Model

Each entry represents a DH center or professorship with:
- Name, institution, city, coordinates
- Type (center / professorship)
- Disciplines (Digital History, Computational Literary Studies, etc.)
- Methods (NLP, Network Analysis, GIS, Linked Data, etc.)
- URL, contact info

## Conventions

- All data files in `Data/` as JSON
- Coordinates in [lng, lat] format (GeoJSON standard)
- German and English mixed: UI in English, content bilingual where needed
- Commit messages in English
