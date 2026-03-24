# Promptotyping Journal

This journal documents both the development of the DHd Landscape project and the Promptotyping process itself — how AI-assisted prompting, iteration, and verification shape the research output.

---

## 2026-03-24 — Session 1: Ideation & First Prototype

### Promptotyping Context
- **Setting**: Conversation between researcher and Claude (Opus 4.6) in Claude Code
- **Knowledge sources used**: Researcher's domain knowledge (DH community, key figures, institutions), Obsidian Research Vault (curated second brain with stable cross-project knowledge)
- **Method**: Conversational ideation → structured planning → immediate prototyping

### Phase: Ideation
- **Prompt intent**: "I want to study DH labs in the DACH region and create an information visualization"
- **AI contribution**: Structured the idea into scope, data sources, tech options, and phases. Proposed MapLibre GL JS over Leaflet for aesthetic/animation capabilities.
- **Human decision**: Vanilla JS, no frameworks, no npm — must be deployable to GitHub Pages without build steps. Named the project "DHd Landscape" (targeting the DHd community directly).

### Phase: Project Setup (Promptotyping Structure)
- **Prompt intent**: "Create the project structure following the Promptotyping method"
- **Repo structure created**:
  - `Knowledge/` — Obsidian-style research vault (Design.md, Data.md, Research.md)
  - `Data/` — Datasets
  - `Feedback/` — For verification cycles
  - `Journal.md` — This file (dual-purpose: project + method documentation)
  - `CLAUDE.md` — AI context file
- **Methodological note**: Two knowledge layers identified:
  1. **Promptotyping Vault** (in-repo) — project-specific knowledge
  2. **Obsidian Research Vault** (external) — curated, stable, cross-project knowledge base (UI patterns, technologies, domain knowledge). Higher reliability than web search because human-curated.

### Phase: First Promptotyping-Interface
- **Prompt intent**: "Build the prototype"
- **Output**: `index.html` — a fully functional MapLibre GL JS map with:
  - 5 sample DH locations (Graz, Berlin, Wuppertal, Trier, Basel)
  - Dark academic aesthetic (desaturated OSM tiles, glow effects)
  - Filter buttons by type (center/professorship) and discipline
  - Click-to-inspect info cards with disciplines, methods, people
  - Fly-to animations on filter and click
- **Verification**: Researcher opened in browser, confirmed "schaut schon sehr gut aus" (looks very good)
- **Data model established**: JSON with id, name, institution, city, country, coordinates, type, disciplines, methods, url, people, description

---

## 2026-03-24 — Session 1 (continued): Data Collection & Interface Evolution

### Phase: Data Acquisition
- **Prompt intent**: "Collect Sahle's list and build the dataset"
- **Process**:
  1. AI searched for Patrick Sahle's DH professorship list (tried multiple URLs)
  2. Found active source at https://dhd-blog.org/?p=11018
  3. WebFetch extracted all 150 entries with metadata (year, city, level, denomination, person, status)
  4. AI geocoded all ~45 unique cities with coordinates
  5. AI enriched entries with discipline and method classifications based on denomination titles
- **Output**: `Data/dh-professorships.json` — ~120 entries with full metadata (some merged/unfilled entries excluded)
- **Data quality note**: Discipline/method classifications are AI-inferred from denomination titles and known context. These need human verification in feedback cycles.

### Phase: Second Promptotyping-Interface (Major Iteration)
- **Prompt intent**: "Continue — plan and execute"
- **Output**: Completely reworked `index.html`:
  - **Clustering**: MapLibre GL JS native clustering for dense areas (Köln, Berlin, Erlangen etc.)
  - **Multi-filter**: Discipline filters, method filters, country filters (DE/AT/CH/LU) — all with counts
  - **Timeline slider**: Filter by year range (2008–2026), shows growth of DH professorships
  - **Search**: Free-text search across person, city, institution, denomination
  - **Visual encoding**: Filled positions (purple) vs. open positions (amber), temporary positions with reduced opacity
  - **Cluster drill-down**: Click cluster → list of entries at that location
  - **Stats footer**: Live counts, legend, source attribution
- **Key design decisions**:
  - Filters use OR logic within a group (show all matching any selected discipline)
  - Cluster expands on click until zoom > 11, then shows list
  - Dark academic aesthetic preserved and refined

### Promptotyping Observations
- The transition from 5 sample points to ~120 real entries required fundamental UI changes (clustering, search, timeline)
- AI classification of disciplines/methods from denomination titles is a useful but imperfect heuristic — creates a testable hypothesis for the researcher to verify
- The data acquisition step (web fetch → structured JSON) demonstrates how Promptotyping bridges manual and automated data collection

---

## 2026-03-24 — Session 1 (cont.): Anonymization & Institution-Level Aggregation

### Phase: Design Decision — No Individual Names
- **Prompt intent**: "I don't want to name individual persons — how can we represent this elegantly?"
- **Human reasoning**: The map should show the landscape, not expose individuals. Use cases are: "Who researches Semantic Web?" → show institutions, not persons. "Where is DH taught?" → show institutional profiles.
- **AI contribution**: Proposed aggregation from individual professorships to institution-level profiles.
- **Output**:
  - `Data/build-institutions.js` — aggregation script (130 professorships → 52 institutions)
  - `Data/institutions.json` — institution profiles with discipline/method mix, position counts
  - Reworked `index.html`: marker size by position count, institution profile cards, no person names

### Phase: Map Tiles Fix
- Switched from OSM raster tiles (CORS issues locally) to CartoDB Dark tiles (`basemaps.cartocdn.com/dark_all`)
- Fixed font glyphs: switched from broken `demotiles.maplibre.org` to `fonts.openmaptiles.org` with Noto Sans

### Promptotyping Observations
- The anonymization decision changed the fundamental unit of analysis (person → institution)
- This is a good example of how Promptotyping surfaces design decisions through conversation — the researcher's ethical intuition ("I don't want to expose individuals") led to a better data model
- Three perspectives emerged: Research (topics), Teaching (curricula), Networking (find collaborators by topic)

### Ideas for Next Iteration
1. Linked Open Data: represent data as JSON-LD, link to Wikidata entities
2. Wikidata as additional data source for institutions
3. Sync Knowledge vault with Obsidian Research Vault for verification
4. Add DH centers (not just professorships)
5. Deploy to GitHub Pages
