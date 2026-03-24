# Design

## Vision

Eine kartenbasierte Informationsvisualisierung, die die DH-Forschungslandschaft im DACH-Raum explorierbar macht. Das Interface soll **ästhetisch, innovativ und intuitiv** sein — eine "akademische Galaxie" der Digital Humanities.

## Technologie

**MapLibre GL JS** via CDN — WebGL-basiertes Vektor-Rendering.
Optional: **deck.gl** via CDN für fortgeschrittene Visualisierungen (ArcLayer, HexagonLayer).
Keine Frameworks, kein npm, kein Build-Step.

## Kartenästhetik

### Basemap
CartoDB Dark Matter (`basemaps.cartocdn.com/dark_all`) — nativ dunkel, CORS-freundlich.

### Farbpalette (akademisch, distinkt)
- **Background**: `#0e0e0e` (near-black)
- **Primary Accent**: `#6FDFDF` (Teal/Cyan — digital, scholarly)
- **Secondary Accent**: `#E8A87C` (Warm Amber — Highlights, Selektion)
- **Disziplin-Farben** (muted, readable on dark):
  - Computational Linguistics: `#7EB8DA` (Steel Blue)
  - Cultural Heritage: `#D4A574` (Warm Sand)
  - Data Science: `#82C9A5` (Sage Green)
  - Text Mining: `#C490D1` (Soft Purple)
  - Spatial Humanities: `#E8B86D` (Gold)
  - Digital Editions: `#F09B9B` (Muted Coral)
- **Prinzip**: Sättigung reduzieren, Helligkeit erhöhen gegenüber Light-Mode (L*55-70 in OKLCH)

### Typografie
- **Headings**: Source Serif Pro oder IBM Plex Serif (Google Fonts)
- **Body/UI**: Inter oder DM Sans
- **Map Labels**: Sans-serif, 11-13px, letter-spacing +0.02em, mit Halo

## Interaktions-Konzepte

### Tier 1 — Core (erste Version)
1. **Animierte Puls-Marker** — Größe nach Positionsanzahl, dezentes Pulsieren
2. **Smooth Fly-To** beim Laden (Überblick → DACH-Region)
3. **Glassmorphism-Filter-Panel** — Disziplin/Methoden-Chips mit Farben
4. **Hover-Highlighting** mit `setFeatureState` — Koordiniertes Dimmen anderer Marker
5. **Institutions-Profil-Card** — Slide-in Panel rechts oder unten

### Tier 2 — Innovation (zweite Version)
6. **Konstellations-/Netzwerk-View** — deck.gl ArcLayer verbindet Institutionen mit geteilten Themen
7. **Heatmap-Underlay** — Forschungsdichte, blendet beim Zoomen aus
8. **Search-as-Filter** — Echtzeit-Highlighting auf der Karte

### Tier 3 — Storytelling (dritte Version)
9. **Guided Tour** — Chained `flyTo`-Animationen durch notable Standorte
10. **View-Morphing** — Zwischen geographischer und thematischer Ansicht wechseln
11. **Timeline-Animation** — Wachstum der DH-Landschaft seit 2008 animiert

## UI-Konzept

### Layout-Prinzipien
- **Karte = 85-100% Viewport** — Die Visualisierung IST das Interface
- **Transluzente Overlay-Panels** — `rgba(14,14,14,0.85)` + `backdrop-filter: blur(12px)`
- **Minimaler Chrome** — Keine schweren Rahmen, keine Schatten
- **Responsive** — Desktop + Mobile

### Filter-UX
- **Tag Cloud / Chip Filter** oben — aktive Filter leuchten in Disziplin-Farbe
- **Range Slider** unten — Timeline für temporale Filterung
- **Search** oben rechts — Freitextsuche filtert in Echtzeit
- **OR-Logik** innerhalb einer Filter-Gruppe

### Detail-Panel
Beim Klick auf Institution: Slide-in von rechts/unten mit:
- Institutionsname, Stadt, Land
- Statistik-Zeile (Positionen, Disziplinen, Methoden, seit wann)
- Disziplin-Tags (farbcodiert)
- Methoden-Tags
- Positions-Liste (ohne Personennamen)
- "Verbindungen zeigen"-Button (Tier 2)

## Promptotyping-Interfaces

Jede Web-Ansicht ist ein "Promptotyping-Interface" — ein verifizierbares Output, abgeleitet aus den Daten. Die Interfaces evolvieren iterativ:

1. **Karten-Interface** (aktiv) — Institutionen auf Karte mit Filtern
2. **Netzwerk-Interface** (geplant) — Thematische Verbindungen zwischen Institutionen
3. **Timeline-Interface** (geplant) — Wachstum der DH-Landschaft chronologisch
4. **Daten-Interface** (geplant) — JSON-LD Browser, LOD-Export

## Referenzprojekte

- **earth.nullschool.net** — Dark Theme, animierte Partikel, minimales UI
- **Flowmap.blue** — Origin-Destination-Flows, curved Connections, Dark Mode
- **The Pudding "Population Mountains"** — 3D-Extrusionen, Scroll-driven
- **Kepler.gl** — deck.gl Arcs, Hexagonal Aggregation, Dark Map
- **Observable Plot Gallery** — Scholarly Visual Language, Precision
