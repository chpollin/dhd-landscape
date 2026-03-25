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

### 1. Map-as-Canvas (Iteration 4–7: implementiert)
Die Karte ist immer 100% Viewport — alles andere schwebt darüber. Drei Views:
- **Übersicht**: Stats, TaDiRAH-Bars, Disziplinen, Timeline, Länder, Zenodo-Topics, Datenquellen
- **Karte**: Interaktive Karte mit TaDiRAH-farbkodierten Markern, Filtern, Detail-Panel (mit Zenodo-Topics + Kooperationspartner)
- **Explorer**: 5 Chart-Sektionen (scrollbar, keine Tabs) — Zeitverlauf, Institutionen, Disziplinen, Forschungsthemen, Kooperationsnetzwerk

View-Wechsel via `ViewManager.switch()`. Shared: Map, Event-Bus, Filter, Detail-Panel.

### 2. D3.js Charts (Iteration 3–7: implementiert)
Fünf Sektionen im Explorer-View (alle untereinander, scrollbar):
- **Stacked Area Chart**: Kumulatives DH-Wachstum 2008–2026, Toggle Disziplin/Land
- **Horizontaler Barchart**: Institutionen nach Stellenanzahl, Disziplin-Segmente
- **Disziplin-Heatmap**: Institutionen × Disziplinen Matrix mit Crosshair-Hover
- **Forschungsthemen**: Top-25 Zenodo-Topics als Horizontal-Bars
- **Kooperationsnetzwerk**: Top-20 institutionelle Kollaborationen als Horizontal-Bars
- Shared Helper: `renderHorizontalBars()` für D3 Bar-Charts in Übersicht + Explorer
- `DHdCharts.renderTo()` für Timeline, Barchart, Heatmap

### 3. Kooperationsnetzwerk (Iteration 7: implementiert)
- **156 institutionelle Kooperationskanten** aus Zenodo-Ko-Autorschaften
- Dargestellt als sortierte Liste in Explorer + Kooperationspartner im Detail-Panel
- Stärkstes Cluster: Berlin (HU ↔ TU: 78, TU ↔ FU: 67)
- Offen: Arc-Layer auf der Karte (deck.gl) für visuelle Verbindungen

### 4. Daten-Interface (teilweise implementiert)
- ✅ JSON-LD Export: `Data/institutions-ld.jsonld` mit @context
- Offen: LOD-Browser, SPARQL-artige Abfragen

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
CartoDB Light / Positron (`basemaps.cartocdn.com/light_all`)

### Farbpalette (Light Mode — Iteration 6)
- **Hintergrund**: `#F5F3EF` (warm off-white)
- **Text**: Dunkles Grau (WCAG AA konform)
- **Karten**: Card Shadows (kein Glassmorphismus)
- **TaDiRAH-Farbsystem** (8 Kategorien):
  - Capture: Blue
  - Creation: Purple
  - Enrichment: Green
  - Analysis: Orange
  - Interpretation: Red
  - Storage: Slate
  - Dissemination: Teal
  - Meta-Activities: Gray

> **Entfernt (Iteration 6)**: Dark Theme (`#1a1a1f`), Glassmorphismus (`backdrop-filter: blur()`), besetzt/offen-Farbkodierung (Indigo/Amber)

### Typografie
- Headings: Source Serif 4
- Body/UI: Inter
- Map Labels: Sans-serif, 11-13px, letter-spacing +0.02em

## UI-Architektur

### Layout-Prinzipien
- **Visualisierung = 85-100% Viewport** — die Viz IST das Interface
- **Card Shadows** statt transluzenter Overlays — klare Abgrenzung auf hellem Grund
- **Progressive Disclosure** — Information schrittweise aufdecken
- **Data-Ink Ratio** maximieren (Tufte)
- **Wissenschaftlich-sachlicher Ton** — keine Marketing-Sprache, keine Superlative

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
