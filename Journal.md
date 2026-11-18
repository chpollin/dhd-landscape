---
type: knowledge
created: 2026-03-24
tags: [project-journal, dhd-landscape]
status: draft
---

# Project Journal — DHd Landscape

Inhaltliche Entwicklung des Projekts: Entscheidungen, Fortschritt, Daten, Visualisierungen.

---

## Offen

Stand 18.11.2026, geschrieben als Übergabe. Dieser Abschnitt ist ohne den Sitzungsverlauf lesbar und wird bei jeder Übergabe als vollständige aktuelle Liste neu geschrieben.

### Richtung

Der Forscher hat am 18.11.2026 die Richtung gesetzt, im Wortlaut:

> „In der DHD-Landschaft müssen wir wirklich ein bisschen experimentell vorgehen und einfach mal ein bisschen Daten aggregieren und Skripte schreiben: dass wir im Repository Datenvisualisierungen machen und von diesen Visualisierungen besser verstehen, welche Daten wir haben, und dann eben das Wissen zurückbringen in das Repository."

Das ist Erkundung der Daten und noch kein Umbau der Anwendung. Über den Zuschnitt des Projekts ist nicht entschieden, die Erkundung soll die Fragen dazu erst entscheidbar machen.

### Erkundungsauftrag, nicht begonnen

Im Repository ist dazu noch nichts angelegt. Geplant und geprüft, aber nicht geschrieben, ist ein erster Durchgang mit einem Skript und drei Ansichten.

- Ein eigener Ordner `exploration/` mit Skripten, die die Daten unter `Data/` aggregieren und profilieren. Abgeleitete Daten liegen in `exploration/derived/`, die Quelldaten bleiben unverändert.
- Lokale HTML-Ansichten im Repository, jede zu einer Frage an die Daten. Vorgesehen sind zuerst die Beiträge je Jahr und Typ, die Zuordnung der Autorennennungen zu den 52 Institutionen mit der Liste der nicht zugeordneten Einrichtungen, und je Institution der Anteil der Treffer, die nur über eine Teilzeichenkette wie den Stadtnamen zustande kommen.
- Nach jeder Ansicht geht das Gelernte mit Beleg in `Knowledge/Data.md` und in dieses Journal, Befund und Deutung getrennt.
- Die Ansichten werden über einen lokalen Server gezeigt. Nach zwei oder drei Bildern wird angehalten, damit der Forscher sie ansieht.

Grenzen des Auftrags:

- `index.html`, `app.js`, `charts.js`, `views.js` und die Build-Pipeline bleiben unberührt, auch die drei Funktionsfehler werden in der Erkundung nicht repariert.
- `_config.yml` gehört der Sitzung, die die öffentliche Auslieferung bereinigt. `exploration/` muss dort in die Ausschlussregel, bevor der Ordner gepusht wird.
- Kein neuer Abruf bei Zenodo, OpenAlex oder einem anderen Dienst. Keine Personennamen in abgeleiteten Daten oder Bildern. Einige Affiliationen enthalten E-Mail-Adressen und werden deshalb nicht als Beschriftung ausgegeben.
- Bibliotheken werden lokal eingebunden, kein CDN. Die geplanten Ansichten kommen ohne Bibliothek aus (HTML und CSS).
- Es gilt der lockerere Standard des Forschers vom 23.05.2026 für dieses Repository, Commit-Disziplin bleibt.

Zwei Vorarbeiten sind festgehalten, damit sie nicht neu erarbeitet werden müssen. Die Portierung des Namensabgleichs aus `Data/build-lod.js` lässt sich daran prüfen, dass sie für alle 52 Institutionen den Wert `zenodoRecordCount` aus `Data/institutions.json` reproduziert. Die Namensmuster `NAME_MAPPINGS` in `build-lod.js` eignen sich als untere Grenze dafür, ob eine Affiliation die Institution tatsächlich nennt.

### Befunde der lesenden Analyse vom 18.11.2026

Geprüft an der Live-Seite und an den Daten per Code. Die Pipeline selbst wurde nicht ausgeführt.

Drei Funktionsfehler seit Iteration 7, mit gemeinsamer Ursache. `build-lod.js` schreibt kein Feld `id` mehr, Karte und Diagramme suchen danach.

1. Ein Klick auf einen Kartenpunkt öffnet immer das Profil der Universität zu Köln (`app.js`, Klick-Handler, `App.data.find(p => p.id === fId)` mit beiden Seiten `undefined`).
2. Im Explorer liegen alle Balken der Institutionen auf einer Zeile, und die Disziplinen-Heatmap hat eine Zeile (`charts.js`, `scaleBand` über `d.id`). Auf der Live-Seite gemessen, je ein einziger y-Wert.
3. Das TaDiRAH-Diagramm der Übersicht zeigt nur „Meta 100" und „Analysis 39" (`views.js`, `renderTaDiRAHDonut` rät die Kategorie aus URI und Label und liest `tadirahCategory` nicht).

Fehler im Namensabgleich (`build-lod.js`, `normalizeName` und `fuzzyMatch`):

- „Technische Universität Berlin" wird zu „berlin" gekürzt und trifft jede Affiliation mit diesem Wort. Von 608 zugeordneten Autorennennungen nennen 22 die TU Berlin, die übrigen gehören vor allem zur Berlin-Brandenburgischen Akademie, zur FU, zur HU und zur Staatsbibliothek.
- Das Berliner Kooperationscluster (HU und TU 78, TU und FU 67) ist deshalb ein Artefakt. 25 der 156 Kanten und 346 von 855 Kantengewichten hängen an der TU Berlin.
- Wien, Potsdam und Leipzig sind in kleinerem Maß betroffen. TU Darmstadt und LMU München verlieren fast alle Treffer, weil die Kurzform nicht zur ausgeschriebenen Affiliation passt.
- 2.745 von 6.890 Autorennennungen treffen keine der 52 Institutionen, darunter Universität Hamburg, Österreichische Akademie der Wissenschaften, Herzog August Bibliothek, Akademie Mainz, Leibniz-Institut für Deutsche Sprache.
- FU, HU und TU Berlin teilen sich eine Wikidata- und eine ROR-Kennung, Universität und Hochschule Augsburg sowie Universität und FH Potsdam je eine ROR. Ursache ist der OpenAlex-Abgleich über die Stadt.
- Alle 52 Institutionen tragen `dblpPublicationCount` 500, weil die DBLP-Daten kein Institutionsfeld haben und der Abgleich mit leerer Zeichenkette immer trifft.

Weitere Abweichungen zwischen Dokumenten und Stand:

- Die Themen entstehen aus Wortmustern über Titel. `zenodo-records.json` enthält keine Abstracts und keine Schlagwörter.
- Die 52 Institutionen stammen allein aus der Stellenliste, die übrigen Quellen reichern sie nur an.
- `Requirements.md` führt alle User Stories als vollständig. Eine Abnahme durch eine Person ist nirgends festgehalten, `Feedback/` ist leer.
- 2016 hat im Zenodo-Bestand 5 Einträge, 2021 hat 63. Ob das den Tagungen entspricht, ist ungeprüft.

Öffentliche Auslieferung: Am 18.11.2026 lieferte die Pages-Seite neben `CLAUDE.md`, den Journalen und `Knowledge/` auch zwei Dateien aus, die Stellen-Rohdatei `Data/dh-professorships.json` mit Personennamen bei 116 von 130 Stellen und `Data/fetch-openalex.js` mit einer persönlichen E-Mail-Adresse. Beide Ausschlüsse sind inzwischen in `_config.yml` committet. Ein erneuter Abruf am späten Abend des 18.11.2026 lieferte für beide Dateien und für das Journal den Status 404. Im Repository selbst sind beide Dateien weiterhin öffentlich.

### Sechs Fragen zum Zuschnitt, unentschieden

Sie liegen beim Forscher und werden nicht erneut gestellt, bevor die Erkundung Material dazu geliefert hat. Die Empfehlung der Analyse steht jeweils dabei.

1. Soll das Projekt die DHd-Konferenzbeiträge zur Grundlage nehmen und die Stellenliste zur Nebenschicht machen? Empfehlung ja.
2. Dürfen Institutionen ohne DH-Professur aufgenommen werden, etwa Akademien, Bibliotheken und die Universität Hamburg? Empfehlung ja.
3. Soll die Seite bis zur Reparatur als ungeprüfter Stand gekennzeichnet werden und das Kooperationsnetzwerk solange verschwinden? Empfehlung ja.
4. Soll die Stellen-Rohdatei mit Personennamen aus dem Repository-Stand heraus? Empfehlung ja für den künftigen Stand, nein für ein Umschreiben der Historie.
5. Soll die Themenzuordnung zunächst ohne LLM bleiben, also Schlagwörter und Muster über Abstracts? Empfehlung ja.
6. Soll die TaDiRAH-Farbkodierung aus den Denominationen aufgegeben werden? Empfehlung ja.

Offen ist außerdem die Rechtefrage. Die README weist alle Daten als CC BY 4.0 aus, die Nachnutzungsbedingungen der Stellenliste, des Kursregisters und von CLARIN sind ungeprüft. Eine Lizenzdatei fehlt.

### Erster Schritt der nächsten Sitzung

1. `git fetch` und `git status`, dann prüfen, ob `exploration/` in der Ausschlussregel von `_config.yml` steht. Wenn nicht, die zuständige Sitzung oder den Forscher darum bitten und bis dahin nur lokal committen.
2. Das Erkundungsskript in `exploration/` schreiben, mit der oben genannten Prüfung gegen `zenodoRecordCount`, und die abgeleiteten Daten erzeugen.
3. Die drei Ansichten bauen, im Browser ansehen, über einen lokalen Server zeigen und anhalten.

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
1. ~~Use Case "Digitale Editionen" als geführtes Szenario~~ → Zenodo-Topics zeigen "Digital Edition" empirisch
2. ~~Konstellations-View (thematische Verbindungen)~~ → Ko-Autorschaftsnetzwerk implementiert ✅
3. ~~JSON-LD vollständiger Export (nicht nur Context)~~ → build-lod.js erzeugt institutions-ld.jsonld ✅
4. DBLP-Matching verfeinern
5. Responsive Design / Mobile-Optimierung
6. Accessibility-Audit (Screenreader, Keyboard-Navigation)

---

## Promptotyping-Iteration 7: Von Stellenkarte zu Forschungslandschaft

### Zentrale Architektur-Entscheidung: LOD-First Pipeline

Grundlegender Paradigmenwechsel: Statt Sahle-Professuren als alleinige Datengrundlage → **alle 7 Quellen gleichwertig** in einem LOD-Datensatz zusammengeführt. `build-lod.js` ersetzt `build-institutions.js`.

Wichtige Erkenntnis: Die Sprache im Interface fokussierte zu stark auf "Professuren" — aber das Tool bildet DH-Forschung insgesamt ab. Professuren sind eine Datenquelle, nicht das Ganze. Terminologie durchgängig korrigiert: "Professuren" → "Stellen"/"Positionen".

### Refactoring (Codequalität)

Sauberes Refactoring der gesamten Codebasis:
- `modes.js` gelöscht (1.448 Zeilen deprecated Code)
- TaDiRAH-Farben konsolidiert (Single Source of Truth)
- `renderHorizontalBars()` Helper extrahiert (3 Duplikate → 1 Funktion)
- `App.showPanel()` in 10 fokussierte Sub-Funktionen aufgeteilt
- Magic Numbers in `CONFIG` Objekt extrahiert
- CSS-Duplikate bereinigt, Inline-Styles nach CSS verschoben
- `charts.js renderTo()` Hack durch saubere Parameter-API ersetzt
- ARIA-Labels auf interaktive Elemente
- CSS-Klassen-Mismatches zwischen JS und CSS korrigiert (5 Stellen)

### Zenodo-Themenprofile (Phase 1)

**2.112 DHd-Konferenzbeiträge** werden jetzt inhaltlich ausgewertet:
- 36 Topic-Patterns extrahieren Themen aus Titeln
- 47/52 Institutionen haben Zenodo-Themenprofile
- Top-Themen: Computational Literary Studies (135), NER (95), Annotation (85)

### Ko-Autorschaftsnetzwerk (Phase 2)

Aus den Zenodo-Affiliationen werden **institutionelle Kooperationen** abgeleitet:
- 315 Kanten insgesamt, 156 mit ≥2 gemeinsamen Beiträgen
- Stärkstes Cluster: Berlin (HU ↔ TU: 78, TU ↔ FU: 67)
- Graz: 10 Papers mit TU Berlin + Wien, Themen GenAI + Computational Literary Studies

### LOD-Datensatz (Phase 3)

`build-lod.js` erzeugt 3 Outputs:
- `institutions-ld.jsonld` — JSON-LD mit @context, @id, @type, sameAs (LOD-Export)
- `institutions-ld.json` — Frontend-Datensatz
- `institutions.json` — Backward-Kompatibilität

Jede Institution hat jetzt:
- Wikidata-URI als kanonischer `@id`
- `sameAs`-Links zu ROR, GND
- `zenodoTopics[]` — empirische Themenprofile
- `zenodoYears{}` — Publikationsaktivität pro Jahr
- `collaborators[]` — Ko-Autorschafts-Partner mit shared Topics

### Explorer: Alle Charts auf einer Seite

Tab-Navigation entfernt → 5 Sektionen untereinander (scrollbar):
1. Zeitverlauf (Stacked Area)
2. Institutionen (Horizontal Barchart)
3. Disziplinen (Heatmap)
4. Forschungsthemen (Zenodo Topics)
5. Kooperationsnetzwerk (Top-20 Kollaborationen)

### Stand nach Iteration 7
- 52 Institutionen, 7 Datenquellen + LOD-Pipeline
- 47 Zenodo-Themenprofile, 156 Kooperationskanten
- 5 Explorer-Sektionen, Zenodo-Topics + Kooperationen im Detail-Panel
- JSON-LD Export mit Wikidata-URIs
- Forschungsplan: Knowledge/Research-Plan-Iteration7.md

### Offene Punkte für Iteration 8
1. Karten-Overlay: Kooperations-Arcs als MapLibre-Layer (deck.gl ArcLayer)
2. Brushing: Klick auf Topic in Explorer → Karte filtert
3. Zenodo-API erweitern: Keywords + Abstract-Volltext für bessere Themenextraktion
4. DBLP-Matching über Autor-Affiliationen statt Venue-Matching
5. Responsive Design / Mobile
6. SPARQL-Endpoint oder LOD-Browser für JSON-LD

---

## 2026-11-18 — Lesende Analyse und Übergabe

- Auslöser: Auftrag, das Projekt durchzuplanen, danach die Richtungsangabe des Forschers zur experimentellen Erkundung der Daten, am selben Abend der Auftrag, alle Sitzungen kontrolliert zu beenden.
- Gefunden: drei Funktionsfehler seit Iteration 7, der Fehler im Namensabgleich mit seinem Berliner Artefakt, doppelte Kennungen, der konstante DBLP-Wert. Einzelheiten stehen unter „Offen".
- Entschieden: nichts zum Zuschnitt. Die Erkundung ist beauftragt und nicht begonnen.
- Geändert: nur dieses Journal. Anwendung, Pipeline, Daten und `_config.yml` sind unberührt, ein Ordner `exploration/` existiert noch nicht.
- Beleg: Messung an der Live-Seite am 18.11.2026 (kein Feld `id` in 52 Datensätzen, ein y-Wert für alle Balken und alle Heatmap-Zellen), Datenprofil per Code über `Data/zenodo-records.json`, `Data/institutions.json` und `Data/collaborations.json`. Die Profilskripte lagen im Scratchpad der Sitzung und sind nicht versioniert, die Erkundung schreibt sie neu.
- Nicht ausgeführt: die Build-Pipeline, die Dichteprüfung für Oberflächen (Playwright war nicht auffindbar), ein Test der Filter und der mobilen Ansicht.
