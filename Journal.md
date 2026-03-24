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

### Next Steps (planned)
1. Collect real data: Patrick Sahle's DH professorship list as primary source
2. Expand to all known DH centers in DACH
3. Add more filter dimensions (methods, countries)
4. Clustering for dense areas
5. Custom map styling
