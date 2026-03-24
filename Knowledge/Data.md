# Data

## Data Sources (Priority Ranking)

### 1. Patrick Sahle — DH Professorship List ✅ integriert
- **URL**: https://dhd-blog.org/?p=11018
- **Content**: 150 DH-denominierte Professuren im DACH-Raum (2008–2026)
- **Format**: HTML-Tabelle, von uns als JSON extrahiert
- **Status**: Integriert, aggregiert auf 52 Institutionen
- **Visualisierung der Liste**: https://dhd-blog.org/?p=21260

### 2. OpenAlex API ⭐ höchste Priorität
- **URL**: https://api.openalex.org
- **Content**: 137.206 DH-Publikationen weltweit, Topic `T12377` (Digital Humanities and Scholarship)
- **Deutschland**: 3.283 Works, **77 Institutionen** identifiziert
- **Österreich**: 519 Works
- **Schweiz**: 639 Works
- **Top DE-Institutionen**: Universität Trier (222), TIB Hannover (130), FH Potsdam (97)
- **Query-Pattern**: `/works?filter=topics.id:T12377,authorships.institutions.country_code:DE`
- **Format**: REST API, JSON, CC0
- **Aufwand**: Niedrig — API ist gut dokumentiert, erlaubt Gruppierung nach Institution
- **Wert**: Hoch — ergänzt Sahle-Liste um Forschungsoutput-Perspektive

### 3. DHd Zenodo Communities
- **URLs**:
  - `zenodo.org/communities/dhd` — Konferenzmaterialien
  - `zenodo.org/communities/dhd-verbandsaktivitaeten` — AG-Berichte
- **Content**: 12 Jahreskonferenzen (2014–2026), Books of Abstracts mit Autor-Institutions-Zuordnungen
- **Format**: REST API + OAI-PMH
- **Aufwand**: Niedrig
- **Wert**: Hoch — reichhaltige Autor-Institutions-Topic-Daten

### 4. CLARIN Centre Registry
- **URL**: https://centres.clarin.eu
- **Content**: ~20 DACH-Zentren mit Name, Typ (B/C/K), Zertifizierung, Stadt
- **Deutschland**: ~14 Zentren (BAS München, BBAW Berlin, Tübingen, GWDG Göttingen...)
- **Österreich**: 3 Zentren (ACDH-ARCHE Wien, DH-Graz, GermanAT)
- **Schweiz**: 2–3 Zentren
- **Aufwand**: Niedrig — strukturierte Registry
- **Wert**: Mittel — Infrastruktur-Dimension

### 5. DBLP — DHd Conference Proceedings
- **URL**: https://dblp.org
- **Content**: 1.429 DH-Publikationen, vollständige DHd-Proceedings (2014–2025)
- **Format**: API (XML, JSON, BibTeX, RDF), SPARQL-Endpoint
- **Aufwand**: Niedrig-Mittel
- **Wert**: Mittel — Autor-Institutions-Mappings aller DHd-Konferenzbeiträge

### 6. Wikidata
- **URL**: https://query.wikidata.org
- **Content**: Entities für Universitäten, Departments, Disziplinen
- **SPARQL-Konzept**: `?item wdt:P101 wd:Q5157565` (field of work: Digital Humanities)
- **Limitation**: Lückenhaft — viele DH-Departments noch nicht erfasst
- **Aufwand**: Mittel
- **Wert**: Mittel — gut zum Verlinken/Anreichern, weniger als Primärquelle

### 7. DHd-Verband
- **URL**: https://digitalhumanities.de/
- **Content**: 17+ Arbeitsgruppen, ~50 Projekte, Konferenzen
- **Kein öffentliches Mitgliederverzeichnis**
- **Aufwand**: Mittel (Scraping nötig)

### 8. NFDI-Konsortien
- **NFDI4Culture**: https://nfdi4culture.de — 100+ Partner
- **Text+**, **NFDI4Memory**, **NFDI4Objects**
- **Aufwand**: Mittel (HTML-Listen)

### 9. Studiengänge (BA/MA)
- **studycheck.de**: ~20 DH-Programme
- **Hochschulkompass**: Offizielle HRK-Datenbank
- **DHd AG Referenzcurriculum**: Autoritative Quelle für DH-Curricula
- **Aufwand**: Mittel

### 10. DARIAH-DE
- **URL**: https://de.dariah.eu
- **Content**: 16 Partnerinstitutionen, CC-BY-4.0
- **Aufwand**: Mittel

### Nicht empfohlen
- **centerNet**: International, schlecht filterbar, veraltet
- **CRIS/KDSF**: Kein zentrales Aggregat, jede Uni hat eigenes System

---

## Data Model

### Institutions (aggregiert)
```json
{
  "id": "uni-graz",
  "name": "Universität Graz",
  "city": "Graz",
  "country": "AT",
  "coordinates": [15.45, 47.08],
  "totalPositions": 5,
  "openPositions": 1,
  "earliestYear": 2015,
  "disciplines": ["Digital Humanities", "Digital Edition", ...],
  "methods": ["TEI/XML", "Linked Data", ...],
  "positions": [{ "name": "...", "year": 2024, "level": "TT", ... }]
}
```

### JSON-LD Modell (geplant)
Dreischichtiges Vokabular:
1. **Schema.org** — Strukturelles Rückgrat (`ResearchOrganization`, `EducationalOrganization`)
2. **Wikidata URIs** — Für Entitäten (Länder, Städte, Disziplinen)
3. **TaDiRAH** — DH-spezifische Taxonomie für Methoden/Aktivitäten (DARIAH)
4. **ROR** — Persistente Institutions-IDs (`https://ror.org/`)

Zusätzlich: `sameAs`-Links zu Wikidata, GND, VIAF, ROR.

Separate Dateien: JSON-LD für Semantik, GeoJSON für Kartendarstellung.

## Data Processing Workflow

1. **Collect** — Quellen anzapfen (API, Scraping, manuell)
2. **Model** — Strukturieren nach Datenmodell (JSON)
3. **Aggregate** — Einzelpositionen → Institutionsprofile (`build-institutions.js`)
4. **Geocode** — Koordinaten für jeden Standort
5. **Enrich** — Wikidata-IDs, ROR-IDs, TaDiRAH-Mappings
6. **Validate** — Menschliche Verifikation im Feedback-Zyklus
7. **Publish** — JSON + JSON-LD + GeoJSON für Web-Visualisierung
