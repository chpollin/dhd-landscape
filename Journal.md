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

### Stand Ende Session 1
- 52 Institutionen auf interaktiver Karte
- Filter: Disziplinen, Methoden, Länder, Timeline
- Knowledge-Vault: 5 Dokumente (Data, Design, Research, Requirements, Promptotyping)
- Repo: https://github.com/chpollin/dhd-landscape
