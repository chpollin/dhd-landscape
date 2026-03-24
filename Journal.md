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
1. Aggregations-Views (D3.js Charts: Barchart, Timeline, Disziplin-Matrix)
2. Use Case "Digitale Editionen" als geführtes Szenario
3. Mehr Datenquellen (DH-Zentren, CLARIN, DH Course Registry)
4. JSON-LD Export
5. Konstellations-View (thematische Verbindungen)
