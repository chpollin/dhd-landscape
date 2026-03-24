---
type: knowledge
created: 2026-03-24
tags: [project-journal, dhd-landscape]
status: draft
---

# Project Journal — DHd Landscape

Inhaltliche Entwicklung des Projekts: Entscheidungen, Fortschritt, Daten, Visualisierungen.

---

## 2026-03-24 — Projektstart

### Ideation
- Idee: Interaktive Karte der DH-Forschungslandschaft im DACH-Raum
- Scope: DH-Zentren und Professuren, filterbar nach Disziplin, Methode, Typ
- Zielgruppe: DHd-Community, Forschende, Studierende, Fördergeber

### Tech-Entscheidungen
- MapLibre GL JS via CDN (WebGL, Vektor-Rendering)
- Vanilla JS, kein Framework, kein npm — GitHub Pages deployable
- CartoDB Dark Tiles als Basemap
- Daten als JSON in `Data/`

### Datenerhebung: Sahle-Liste
- Quelle: Patrick Sahles DH-Professuren-Liste (https://dhd-blog.org/?p=11018)
- 150 Einträge extrahiert, ~130 verwendbar, auf 52 Institutionen aggregiert
- Disziplinen und Methoden AI-klassifiziert aus Denominationen — **Verifikation nötig**

### Design-Entscheidung: Keine Personennamen
- Karte zeigt Institutionsprofile, nicht Einzelpersonen
- Begründung: Ethik + bessere Antwort auf die Kernfrage "Wo wird was beforscht?"
- Einheit der Analyse: Institution mit DH-Profil (Disziplinen, Methoden, Positionsanzahl)

### Karten-Fixes
- OSM Tiles → CartoDB Dark (CORS-Problem)
- demotiles.maplibre.org Fonts → fonts.openmaptiles.org / Noto Sans

### Knowledge-Vault & Obsidian-Abgleich
- Knowledge-Dokumente mit Obsidian Research Vault abgeglichen
- YAML Frontmatter und [[wikilinks]] nach Obsidian-Konventionen
- Neue Dokumente: Requirements.md (User Stories), Promptotyping.md
- Theoretische Grundlagen integriert: Shneiderman, Munzner, Scholar-Centered Design, TaDiRAH

### Use Case definiert: Digitale Editionen
- Leit-Szenario: Wie haben sich digitale Editionen im DACH-Raum entwickelt?
- 6 User Stories formuliert (US-1 bis US-6)
- IDE als konkretes Beispiel für generischen Use Case

### Datenquellen-Recherche
- 10 Quellen identifiziert und priorisiert
- OpenAlex API als Top-Neuentdeckung (77 DE-Institutionen)
- JSON-LD Modell designed: Schema.org + Wikidata + TaDiRAH + ROR

### OpenAlex-Integration
- 282 DH-Institutionen via OpenAlex API geholt (Topic T12377)
- 40/52 Sahle-Institutionen mit OpenAlex gematched
- Angereichert: ROR-IDs (40), Wikidata-IDs (17), DH-Publikationszahlen (1906 total)
- TaDiRAH-Mapping: 30 Methoden auf DARIAH-Vokabular-URIs gemappt

### Karten-Fixes (fortlaufend)
- Glyph-Server: demotiles → openmaptiles → openfreemap → **MapTiler** (final funktionierend)
- Font: Noto Sans → Americana → **Open Sans Regular**
- Konsolen-Logging hinzugefügt (Data-Stats, Map-Load, Filter-State)

---

## Abschluss Promptotyping-Iteration 1

### Was funktioniert
- 52 Institutionen auf Karte mit Filtern (Disziplin, Methode, Land, Timeline, Suche)
- Institutions-Profile mit Positionslisten (ohne Personennamen)
- Marker-Größe nach Positionsanzahl
- Konsolen-Logging für Debugging
- GitHub Pages live: https://chpollin.github.io/dhd-landscape/

### Was nicht gut funktioniert (Erkenntnisse für Iteration 2)
1. Filter-Bereich nimmt zu viel Platz ein — drückt Karte nach unten
2. Keine visuelle Hierarchie bei Filtern (Discipline/Method/Country sehen gleich aus)
3. Punkte alle gleiche Farbe — keine Differenzierung nach Typ oder Status
4. Zahlen in kleinen Kreisen schwer lesbar
5. Stats und Timeline visuell zu schwach
6. Kein Hover-Effekt, kein Fly-To beim Laden
7. Keine Legende, kein "Reset Filters"
8. OpenAlex-Publikationszahlen nicht sichtbar im UI
9. Keine Aggregations-Views (Charts, Timelines) — nur Karte

### Stand nach Iteration 1
- 52 Institutionen, 130 Professuren, 282 OpenAlex-Einträge
- Knowledge-Vault: 5 Dokumente (Data, Design, Research, Requirements, Promptotyping)
- 2 Journale (Projekt + Promptotyping)

---

## Promptotyping-Iteration 2: UI-Redesign & Datenbereinigung

### Verifikation von Iteration 1 (Screenshot-Analyse)
Systematische Analyse des Screenshots ergab 10 konkrete Probleme in 2 Kategorien:
- **UI**: Filter zu groß, keine Hierarchie, keine Legende, kein Hover, kein Reset
- **Daten**: AI-Klassifikation ungenau ("Architecture" bei TU Darmstadt), Berlin-Überlappung, Wikidata-Lücken

### Fixes implementiert
1. **Filter**: Reduziert auf Top-6 Disziplinen + Top-6 Methoden, stärkere Separatoren
2. **Slide-in Panel** von rechts (ersetzt Bottom-Left Card)
3. **DH-Publikationszahlen** sichtbar im Panel (aus OpenAlex)
4. **Wikidata/ROR Links** im Panel
5. **Hover-Effekt** via `setFeatureState` (hellerer Rand bei Mouseover)
6. **Fly-To Animation** beim Laden (Zoom 3.5 → 5.5)
7. **Legende** unten rechts (Farbcodierung + Größenskala)
8. **Reset-Button** (erscheint bei aktiven Filtern)
9. **Google Fonts**: Source Serif 4 (Headings) + Inter (Body)
10. **Stats** nach links verschoben, besser lesbar
11. **Berlin/Köln/Augsburg/Potsdam**: Offset für co-located Institutionen
12. **"Architecture"** → "Digital Archaeology" korrigiert (TU Darmstadt)
13. **Wikidata-Overrides**: 9 zusätzliche IDs manuell ergänzt (Köln, Bamberg, Bielefeld, LMU etc.)

### Stand nach Iteration 2
- 52 Institutionen, 26 mit Wikidata-IDs, 49 mit ROR-IDs
- Live: https://chpollin.github.io/dhd-landscape/
- Repo: https://github.com/chpollin/dhd-landscape

### Offene Punkte für Iteration 3
1. ~~Aggregations-Views (D3.js Charts: Barchart, Timeline, Disziplin-Matrix)~~ ✅
2. Use Case "Digitale Editionen" als geführtes Szenario
3. Mehr Datenquellen (DH-Zentren, CLARIN, DH Course Registry)
4. JSON-LD Export
5. Konstellations-View (thematische Verbindungen)

---

## Promptotyping-Iteration 3: Aggregation Views & Timeline Animation

### Architektur-Entscheidungen
- **D3.js v7** via CDN für alle Visualisierungen
- **Separate `charts.js`** Datei statt alles in index.html (Wartbarkeit bei ~540 Zeilen index.html)
- **`DHdCharts` globales Modul** mit `init()`, `update()`, `show()`, `hide()` API
- **Tab-Navigation** unter der Filter-Leiste: Karte | Timeline | Institutionen | Disziplinen
- **Split-Layout**: Map 45% oben, Chart-Panel 55% unten (statt Tabs die Karte ersetzen)
- **Coordinated Views**: `applyFilters()` aktualisiert Map UND aktiven Chart gleichzeitig
- **Konsistente Disziplin-Farbpalette** über alle Charts (15 Named Colors + d3.schemeSet3 Fallback)

### Implementierte Charts

#### 1. Stacked Area Chart (Timeline)
- Kumulatives Wachstum der DH-Landschaft 2008–2026
- `d3.stack()` + `d3.area()` mit `curveMonotoneX`
- Toggle: nach Disziplin (Top-8) oder nach Land (DE/AT/CH/LU)
- Hover: vertikale Linie + Tooltip mit Jahres-Breakdown
- Legende unterhalb des Charts
- Reagiert auf alle Filter

#### 2. Horizontaler Barchart (Institutionen)
- Alle gefilterten Institutionen, sortiert nach Stellenanzahl
- Stacked Segments nach Disziplin-Farben
- Klick → Map fly-to + Detail-Panel öffnen
- Institutionsnamen als Y-Achse (bis 28 Zeichen, dann Ellipsis)
- Scrollbar bei vielen Institutionen

#### 3. Disziplin-Heatmap (Matrix)
- Zeilen = Institutionen, Spalten = Disziplinen
- Zellen-Intensität = Anzahl Positionen in Disziplin
- Farbskala: `#1a1a2e` → `#6366f1` (dunkel-indigo Gradient)
- Crosshair-Hover (ganze Zeile + Spalte hervorgehoben)
- Toggle: Sortierung nach Häufigkeit oder A–Z
- Klick → Map fly-to + Detail-Panel

### Timeline-Animation
- Play/Pause-Button neben Timeline-Slider (Unicode ▶/⏸)
- `setInterval(800ms)` pro Jahr, auto-stopp bei 2026
- Reset auf 2008 wenn am Ende Play gedrückt wird

### Bug-Fixes nach Code-Audit
- Script-Loading-Order: `charts.js` vor Hauptscript laden (sonst undefined bei frühem Tab-Klick)
- Null-Checks: `inst.disciplines || []`, `pos.disciplines?.[0]`
- Empty-State: "Keine Institutionen entsprechen den Filtern" bei 0 Ergebnissen
- Tooltip: Duplikat-Prävention bei `initTooltip()`, Boundary-Clamping

### Stand nach Iteration 3
- 52 Institutionen mit 4 Views: Karte + 3 D3-Charts
- Tab-Navigation + Split-Layout + Coordinated Filtering
- Timeline-Animation mit Play/Pause
- Live: https://chpollin.github.io/dhd-landscape/

### Offene Punkte für Iteration 4
1. ~~Landing-Sektion~~ → Map-as-Canvas mit Narrative Mode ✅
2. ~~UI-Redesign~~ → 3-Mode-Architektur + neues Design-System ✅
3. Use Case "Digitale Editionen" als geführtes Szenario
4. Konstellations-View (thematische Verbindungen via deck.gl ArcLayer)
5. Mehr Datenquellen (CLARIN, DH Course Registry, DBLP)
6. JSON-LD Export

---

## Promptotyping-Iteration 4: Map-as-Canvas — Drei Modi, eine Karte

### Zentrale Design-Entscheidung: Karte als Canvas

Statt einer separaten Landing-Page oder einem Split-Layout wurde ein innovativer Ansatz gewählt: **Die Karte IST das gesamte Interface.** Sie bleibt immer 100% Viewport (position: fixed), und drei Modi wechseln, was über der Karte schwebt.

Hintergrund: Kritische UI-Analyse nach Iteration 3 zeigte, dass die Karte als Startseite überfordert (25+ Buttons, kein Onboarding). Der User wollte keine konventionelle Landing-Page, sondern etwas Innovatives — alles sollte in und auf der Karte passieren.

### Architektur

**3 Modi:**
1. **Narrative** — Scrollytelling auf der Karte: 7 Stationen (Intro → Pioniere → Köln → Berlin → Österreich → Timeline → Explore-CTA), glassmorphische Karten in linker Spalte, `IntersectionObserver` triggert `map.flyTo()` und Mini-Visualisierungen
2. **Explore** — Freie Exploration: Floating draggable D3-Chart-Panels über der Karte, collapsible Filter-Sidebar (320px), Panel-Toggle-Buttons, Stats-Bar
3. **Overview** — HUD-Dashboard: Animierte Zähler (52 Institutionen, 130 Professuren etc.), Country-Bars, Disziplin-Chart, Mini-Area-Chart als schwebende Widgets

**Shared Infrastructure:** Map-Instanz, Event-Bus, Filter-Logik, Detail-Panel, Suche, Farbpaletten — alles mode-übergreifend.

### Code-Architektur (Refactoring)

Aufspaltung von einer monolithischen `index.html` in 5 Dateien:
- `index.html` — Nur HTML-Struktur (263 Zeilen)
- `styles.css` — Design-System mit CSS Custom Properties (478 Zeilen)
- `app.js` — Shared Infrastructure: Map, Filter, Panel, Event-Bus (449 Zeilen)
- `modes.js` — ModeController + 3 Mode-Implementierungen (741 Zeilen)
- `charts.js` — D3-Charts mit `renderTo()` für Floating Panels (548 Zeilen)

### Design-System

- **Hintergrund**: `#1a1a1f` (wärmer als vorheriges `#0a0a0f`)
- **Text**: `#f0f0f2` (primary), `#a1a1a8` (secondary, WCAG AA 6.3:1)
- **Marker**: Indigo `#818cf8` (besetzt), Amber `#fbbf24` (offen) — Farbton-Wechsel statt nur Helligkeitsunterschied → colorblind-safe
- **Minimum Font**: 0.75rem (12px) — vorher teilweise 0.55rem (8.8px)
- **Glassmorphismus**: `backdrop-filter: blur(24px)` mit `rgba(26,26,31,0.85)`
- **Typografie**: Source Serif 4 (Titel) + Inter (UI), Scale von 0.75rem bis 3rem

### Narrative Stationen (Scrollytelling)

| Station | Map-State | Filter | Mini-Viz |
|---------|----------|--------|----------|
| Intro | zoom 5.5, DACH-Überblick | alle | Animierte Zähler |
| Pioniere | zoom 6.0 | ≤2012 | Mini-Timeline |
| Köln | zoom 12 | city=Köln | Disziplin-Donut |
| Berlin | zoom 11 | city=Berlin | Vergleichs-Balken |
| Österreich | zoom 7 | country=AT | Summary-Cards |
| Timeline | zoom 5.5 | alle | Stacked Area Chart |
| Explore-CTA | zoom 5.5 | alle | CTA-Button |

### Kritische Analyse

**Was funktioniert:**
- Narrative Mode gibt neuen Nutzern einen geführten Einstieg
- Mode-Switcher ist kompakt und klar
- Detail-Panel (420px) hat deutlich mehr Breathing Room
- Marker-Farben Indigo/Amber sind klar unterscheidbar
- Karte bleibt immer im Kontext — kein Kontext-Verlust beim View-Wechsel

**Was noch nicht optimal ist:**
- Farbschema insgesamt zu dunkel/monoton — DHd-Community ist bunt, innovativ, offen
- Farbkodierung hat noch keine tiefe Semantik (Disziplin→Farbe nur in Charts, nicht auf Karte)
- Nur 2 von 10 geplanten Datenquellen integriert (Sahle + OpenAlex)
- Mini-Vizs in Narrative-Stationen können poliert werden

### Stand nach Iteration 4
- 5 Dateien statt 2 (bessere Wartbarkeit)
- 3 Modi: Narrative, Explore, Overview
- Neues Design-System mit CSS Custom Properties
- WCAG AA Kontraste, min 0.75rem Fonts
- Live: https://chpollin.github.io/dhd-landscape/

### Offene Punkte für Iteration 5
1. ~~**Farbschema**: Buntere, semantisch kodierte Farben~~ → TaDiRAH-Farbsystem ✅
2. ~~**Datenquellen**: CLARIN, Wikidata, DH Course Registry, DBLP~~ ✅
3. ~~**Narrative-Polish**~~ → Narrative Mode entfernt, durch Übersicht-View ersetzt ✅
4. Use Case "Digitale Editionen"
5. ~~JSON-LD Export~~ → `Data/context.jsonld` erstellt ✅
6. Konstellations-View

---

## Promptotyping-Iteration 5+6: Light Mode Redesign + Data Enrichment

### Zentrale Design-Entscheidung: Light Mode

User-Feedback nach Iteration 4: "Zu dunkel, zu monoton — die DHd-Community ist bunt, innovativ, offen." Die Analyse zeigte, dass der Dark-Mode-Ansatz mit Glassmorphismus zwar technisch elegant, aber für ein wissenschaftliches Forschungstool unpassend war. Entscheidung: **Kompletter Wechsel zu Light Mode.**

- **Hintergrund**: Warm off-white `#F5F3EF` (statt `#1a1a1f`)
- **Text**: Dunkles Grau (statt helles Grau auf Dunkel)
- **Karten**: Card Shadows statt Glassmorphismus (`backdrop-filter: blur()` entfernt)
- **Basemap**: CartoDB Light/Positron (statt Dark Matter)
- **Ton**: Wissenschaftlich-sachlich, keine Marketing-Sprache

### Architektur-Pivot: 3 Views statt 3 Modes

Die Narrative/Explore/Overview-Trias aus Iteration 4 wurde grundlegend überarbeitet:

| Alt (Iteration 4) | Neu (Iteration 6) | Begründung |
|--------------------|--------------------|----|
| Narrative Mode (Scrollytelling) | **Übersicht** (Startseite mit Stats) | Scrollytelling zu komplex, Startseite mit Kernzahlen effektiver |
| Explore Mode (Floating Panels) | **Karte** (TaDiRAH-Marker + Filter) | Floating draggable Panels → feste Kartenansicht mit Farbkodierung |
| Overview Mode (HUD-Dashboard) | **Explorer** (Timeline/Institutionen/Disziplinen) | Dashboard-Widgets → dedizierte Chart-Ansichten |

- `modes.js` ist deprecated, ersetzt durch `views.js`
- Kein Mode-Switcher mehr, sondern View-Navigation: `[Übersicht | Karte | Explorer]`

### TaDiRAH als semantisches Farbsystem

Die Farbkodierung der Karte basiert jetzt durchgängig auf dem TaDiRAH-Vokabular (8 Kategorien):

| TaDiRAH-Kategorie | Farbe | Hex |
|---|---|---|
| Capture | Blue | — |
| Creation | Purple | — |
| Enrichment | Green | — |
| Analysis | Orange | — |
| Interpretation | Red | — |
| Storage | Slate | — |
| Dissemination | Teal | — |
| Meta-Activities | Gray | — |

Die besetzt/offen-Unterscheidung (Indigo/Amber) wurde entfernt — Stellenstatus ist keine inhaltliche Dimension. Stattdessen repräsentiert die Markerfarbe das TaDiRAH-Profil der Institution.

### 5 neue Datenquellen integriert

| Quelle | Abgerufen | Matched | Neue Felder |
|--------|-----------|---------|-------------|
| **Wikidata** | 806 DACH-Universitäten | 51/52 (98%) | `gndId`, `founded`, Wikidata-IDs |
| **Zenodo** (DHd Community) | 2112 Records | 50/52 (96%) | `zenodoRecordCount` |
| **CLARIN Centre Registry** | 23 Zentren | 5/52 (10%) | `clarinCentre` |
| **DH Course Registry** | 196 Kurse | 24/52 (46%) | `dhCourses` |
| **DBLP** | 500 Records | — | Publikationsmetadaten |

Zusammen mit Sahle und OpenAlex sind nun **7 Datenquellen** integriert.

### JSON-LD Context

`Data/context.jsonld` erstellt mit Vokabular-Mappings:
- Schema.org (ResearchOrganization, EducationalOrganization)
- Wikidata (Q-Items)
- TaDiRAH (DARIAH-Vokabular-URIs)
- ROR (persistente Institutions-IDs)
- GND (Normdaten)

### Entfernte Features
- **Narrative Mode / Scrollytelling**: Zu komplex, lenkt von Daten ab
- **Dark Theme**: Komplett ersetzt durch Light Mode
- **Glassmorphismus**: Ersetzt durch Card Shadows
- **besetzt/offen-Farbkodierung**: Ersetzt durch TaDiRAH-Farben
- **modes.js**: Deprecated, ersetzt durch views.js

### Stand nach Iteration 6
- 52 Institutionen, 7 Datenquellen, 3 Views
- Light Mode mit TaDiRAH-Farbsystem
- JSON-LD Context erstellt
- 5 Dateien: index.html, styles.css, app.js, views.js, charts.js
- Live: https://chpollin.github.io/dhd-landscape/

### Offene Punkte für Iteration 7
1. Use Case "Digitale Editionen" als geführtes Szenario
2. Konstellations-View (thematische Verbindungen)
3. JSON-LD vollständiger Export (nicht nur Context)
4. DBLP-Matching verfeinern
5. Responsive Design / Mobile-Optimierung
6. Accessibility-Audit (Screenreader, Keyboard-Navigation)
