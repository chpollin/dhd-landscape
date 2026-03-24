---
type: design-document
created: 2026-03-24
tags: [information-visualization, maplibre, ui-design, scholar-centered-design]
status: draft
---

# Design

> Informiert durch [[Information Visualization]], [[Scholar-Centered Design]], [[GeoJSON]] im Obsidian Research Vault

## Vision

Eine interaktive Informationsvisualisierungsplattform, die die DH-Forschungslandschaft im DACH-Raum explorierbar macht. Nicht nur eine Karte — sondern **mehrere koordinierte Ansichten**, abgestimmt auf die Qualität und Art der Daten.

## Theoretische Grundlagen

### Shneiderman's Visual Information Seeking Mantra
> "Overview first, zoom and filter, then details-on-demand"

Angewendet: Karte als Overview → Filter nach Disziplin/Methode → Institutions-Detail-Panel

### Munzner's Nested Model
1. Domain Problem Characterization → Forschungsfragen (wer, was, wo in DH)
2. Data/Task Abstraction → Institutionsprofile, Aggregationen
3. Visual Encoding/Interaction Design → Kartenmarker, Filter, Panels
4. Algorithm Design → Clustering, Aggregation

### Scholar-Centered Design
Nutzer-Personas und domänenspezifische Workflows statt monolithischer Dashboards. Flexible Exploration priorisieren.

### Coordinated Views
Mehrere verknüpfte Visualisierungen, bei denen Interaktion in einer Ansicht alle anderen beeinflusst (vgl. M³GIM, WarSampo im Obsidian Vault).

## Visualisierungs-Konzepte

### 1. Map-as-Canvas (Iteration 4: implementiert)
Die Karte ist immer 100% Viewport — alles andere schwebt darüber. Drei Modi:
- **Narrative Mode**: Scrollytelling mit 7 Stationen, `IntersectionObserver` triggert `map.flyTo()`, Mini-Vizs in glassmorphischen Karten
- **Explore Mode**: Floating draggable D3-Chart-Panels, collapsible Filter-Sidebar (320px), Stats-Bar
- **Overview Mode**: HUD-Dashboard mit animierten Zählern, Country-Bars, Disziplin-Chart, Mini-Timeline

Mode-Wechsel via `body[data-mode]` + CSS Transitions. Shared: Map, Event-Bus, Filter, Detail-Panel.

### 2. D3.js Charts (Iteration 3+4: implementiert)
Drei Visualisierungen, in Explore Mode als Floating Panels über der Karte:
- **Stacked Area Chart**: Kumulatives DH-Wachstum 2008–2026, Toggle Disziplin/Land
- **Horizontaler Barchart**: Institutionen nach Stellenanzahl, Disziplin-Segmente
- **Disziplin-Matrix**: Institutionen × Disziplinen Heatmap mit Crosshair-Hover
- Coordinated Filtering: `applyFilters()` → Map + Charts gleichzeitig
- `DHdCharts.renderTo()` für Multi-Container-Support (Floating Panels + Mini-Vizs)
- Offen: Methoden-Radar (niedrigere Priorität)

### 3. Thematische Verbindungen (geplant, Tier 2)
- **Konstellations-View**: Institutionen mit geteilten Themen verbunden durch Arcs
- Nicht als klassische Netzwerkvisualisierung (schwierig lesbar), sondern als **thematische Nähe** auf der Karte
- deck.gl ArcLayer für elegante Verbindungen

### 4. Daten-Interface (geplant)
JSON-LD Browser, LOD-Export, SPARQL-artige Abfragen.

## Design-Entscheidung: Karte vs. andere Ansichten

Die Karte ist der Einstiegspunkt, aber **nicht die einzige Ansicht**. Manche Fragen beantworten andere Visualisierungen besser:

| Frage | Beste Visualisierung |
|-------|---------------------|
| Wo wird DH beforscht? | Karte |
| Wie viel DH gibt es pro Uni? | Barchart / Treemap |
| Wie hat sich DH entwickelt? | Timeline / Stacked Area |
| Welche Methoden dominieren? | Donut / Radar |
| Wer teilt mein Thema? | Gefilterte Karte + Liste |
| Welche Disziplinen wo? | Disziplin-Matrix |

**Prinzip**: Die Visualisierung muss zur Datenqualität passen. Wenn die Daten für eine Visualisierung nicht gut genug sind, lieber eine einfachere, ehrlichere Darstellung wählen.

## Technologie

- **MapLibre GL JS** via CDN — WebGL-basiertes Vektor-Rendering für Karte
- **D3.js** via CDN — Für Charts, Treemaps, Timelines (bewährt in M³GIM)
- Optional: **deck.gl** via CDN für ArcLayer
- Keine Frameworks, kein npm, kein Build-Step

## Kartenästhetik

### Basemap
CartoDB Dark Matter (`basemaps.cartocdn.com/dark_all`)

### Farbpalette
- **Primary Accent**: `#6FDFDF` (Teal/Cyan)
- **Secondary Accent**: `#E8A87C` (Warm Amber)
- **Disziplin-Farben** (muted, L*55-70 in OKLCH):
  - Computational Linguistics: `#7EB8DA`
  - Cultural Heritage: `#D4A574`
  - Data Science: `#82C9A5`
  - Text Mining: `#C490D1`
  - Spatial Humanities: `#E8B86D`
  - Digital Editions: `#F09B9B`

### Typografie
- Headings: Source Serif Pro / IBM Plex Serif
- Body/UI: Inter / DM Sans
- Map Labels: Sans-serif, 11-13px, letter-spacing +0.02em

## UI-Architektur

### Layout-Prinzipien
- **Visualisierung = 85-100% Viewport** — die Viz IST das Interface
- **Transluzente Overlay-Panels** — `backdrop-filter: blur(12px)`
- **Progressive Disclosure** — Information schrittweise aufdecken
- **Data-Ink Ratio** maximieren (Tufte)

### Interaktions-Tiers

**Tier 1 — Core**
1. Animierte Puls-Marker mit datengetriebener Größe
2. Smooth Fly-To beim Laden
3. Filter-Chips mit Farben
4. Hover-Highlighting mit koordiniertem Dimmen
5. Institutions-Profil-Panel

**Tier 2 — Innovation**
6. Konstellations-View (thematische Verbindungen)
7. Heatmap-Underlay für Forschungsdichte
8. Aggregations-Ansichten (Charts, Timeline)

**Tier 3 — Storytelling**
9. Guided Tour mit chained flyTo
10. View-Morphing (geographisch ↔ thematisch)
11. Timeline-Animation

## Referenzprojekte
- earth.nullschool.net — Dark Theme, animierte Partikel, minimales UI
- Flowmap.blue — Origin-Destination-Flows, curved Connections
- Kepler.gl — deck.gl Arcs, Hexagonal Aggregation
- Observable Plot Gallery — Scholarly Visual Language
- Atlas of Economic Complexity — Treemap-basierte Exploration (vgl. DEPCHA im Vault)
- WarSampo — 6 koordinierte Perspektiven auf einen Knowledge Graph

## Related

- [[Information Visualization]]
- [[Scholar-Centered Design]]
- [[Shneiderman Mantra in Practice]]
- [[Coordinated Views]]
- [[GeoJSON]]
