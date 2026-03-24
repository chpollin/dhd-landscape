---
type: knowledge
created: 2026-03-24
tags: [data-sources, data-modeling, json-ld, linked-open-data]
status: draft
---

# Data

> Informiert durch [[Linked Open Data]], [[GeoJSON]], [[CIDOC-CRM]] im Obsidian Research Vault

## Datenquellen (Priorität)

### Prio 1: Patrick Sahle — DH Professorship List ✅
- **URL**: https://dhd-blog.org/?p=11018
- **Content**: 150 DH-Professuren im DACH-Raum (2008–2026)
- **Status**: Integriert, aggregiert auf 52 Institutionen
- **Visualisierung**: https://dhd-blog.org/?p=21260

### Prio 2: OpenAlex API ⭐
- **URL**: https://api.openalex.org
- **Topic**: `T12377` (Digital Humanities and Scholarship) — 137.206 Works
- **DE**: 3.283 Works, 77 Institutionen | **AT**: 519 | **CH**: 639
- **Query**: `/works?filter=topics.id:T12377,authorships.institutions.country_code:DE`
- **Format**: REST API, JSON, CC0
- **Aufwand**: Niedrig | **Wert**: Hoch

### Prio 3: Wikidata ✅
- SPARQL: `?item wdt:P101 wd:Q5157565` (Digital Humanities)
- **Abgerufen**: 806 DACH-Universitäten
- **Matched**: 51/52 Institutionen (98%)
- **Neue Felder**: `gndId`, `founded`, verbesserte Wikidata-IDs
- **Status**: Integriert (Iteration 6)

### Prio 4: DHd Zenodo Communities ✅
- `zenodo.org/communities/dhd` — Konferenzmaterialien (2014–2026)
- **Abgerufen**: 2112 Records
- **Matched**: 50/52 Institutionen (96%)
- **Neue Felder**: `zenodoRecordCount`
- **Status**: Integriert (Iteration 6)

### Prio 5: CLARIN Centre Registry ✅
- **URL**: https://centres.clarin.eu
- **Abgerufen**: 23 Zentren
- **Matched**: 5/52 Institutionen (10%)
- **Neue Felder**: `clarinCentre`
- **Status**: Integriert (Iteration 6)

### Prio 6: DH Course Registry ✅
- **URL**: https://dhcr.clarin-dariah.eu/
- **Abgerufen**: 196 Kurse
- **Matched**: 24/52 Institutionen (46%)
- **Neue Felder**: `dhCourses`
- **Status**: Integriert (Iteration 6)

### Prio 7: DBLP — DHd Proceedings ✅
- **Abgerufen**: 500 DH-Records
- SPARQL-Endpoint: sparql.dblp.org
- **Status**: Integriert (Iteration 6)

### Prio 8: DHd-Verband
- **URL**: https://digitalhumanities.de/
- 17+ AGs, ~50 Projekte, kein Mitgliederverzeichnis
- **Aufwand**: Mittel

### Prio 9: NFDI-Konsortien
- NFDI4Culture (100+ Partner), Text+, NFDI4Memory, NFDI4Objects

### Prio 10: Studiengänge
- studycheck.de (~20 Programme), Hochschulkompass, DHd AG Referenzcurriculum

### Nicht empfohlen
- centerNet (veraltet), CRIS/KDSF (kein zentrales Aggregat)

---

## Datenmodell

### Aktuell: Institutionsprofile (JSON, nach Iteration 6)
```json
{
  "id": "uni-graz",
  "name": "Universität Graz",
  "city": "Graz",
  "country": "AT",
  "coordinates": [15.45, 47.08],
  "totalPositions": 5,
  "earliestYear": 2015,
  "founded": 1585,
  "disciplines": ["Digital Humanities", "Digital Edition"],
  "methods": ["TEI/XML", "Linked Data"],
  "positions": [...],
  "tadirahProfile": { "Creation": 3, "Enrichment": 2 },
  "gndId": "...",
  "zenodoRecordCount": 12,
  "clarinCentre": true,
  "dhCourses": [...]
}
```

> **Entfernt (Iteration 6)**: `openPositions` — besetzt/offen-Unterscheidung ist keine inhaltliche Dimension

### JSON-LD Context (Iteration 6: erstellt)

Datei: `Data/context.jsonld`

Dreischichtiges Vokabular:
1. **Schema.org** — `ResearchOrganization`, `EducationalOrganization`, `knowsAbout`, `sameAs`
2. **Wikidata** — Q-Items für Disziplinen (`wd:Q1026532` = Digital Humanities)
3. **TaDiRAH** — DH-Methoden (`tadirah:encoding`, `tadirah:modeling`)
4. **ROR** — Persistente IDs (`https://ror.org/01faaaf77`)
5. **GND** — Normdaten-IDs (`https://d-nb.info/gnd/...`)
6. **GeoNames** — Orts-URIs (`https://sws.geonames.org/2778067/` = Graz)

### Reconciliation-Workflow (vgl. Obsidian: [[Linked Open Data]])
- **OpenRefine** für Abgleich gegen GND, Wikidata, VIAF
- Five-Star LOD als Qualitätsziel
- `sameAs`-Links zu mindestens Wikidata + ROR pro Institution

---

## Data Processing Pipeline

1. **Collect** — Quellen anzapfen (API, Scraping, manuell)
2. **Model** — Strukturieren nach Datenmodell (JSON)
3. **Aggregate** — Einzelpositionen → Institutionsprofile (`build-institutions.js`)
4. **Geocode** — Koordinaten (WGS 84, [lng, lat] — vgl. [[GeoJSON]] im Vault)
5. **Reconcile** — Wikidata-IDs, ROR-IDs, GND via OpenRefine
6. **Enrich** — TaDiRAH-Mappings für Methoden
7. **Validate** — Verification Milestone: Forscher prüft Datenqualität
8. **Transform** — JSON → JSON-LD (semantisch) + GeoJSON (Karte) — separate Dateien
9. **Publish** — GitHub Pages, LOD-Endpoint

## Related

- [[Linked Open Data]]
- [[GeoJSON]]
- [[CIDOC-CRM]]
