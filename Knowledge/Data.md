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
- **Matched**: 50/52 Institutionen (96%), **47 mit Themenprofile**
- **Neue Felder**: `zenodoRecordCount`, `zenodoTopics[]`, `zenodoYears{}`, `collaborators[]`
- **Topic-Extraktion**: 36 Regex-Patterns auf Titel → Forschungsthemen pro Institution
- **Ko-Autorschaftsnetzwerk**: 156 institutionelle Kooperationskanten (≥2 shared Papers)
- **Status**: Integriert (Iteration 6: Counts, Iteration 7: Topics + Netzwerk)

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

### Aktuell: LOD-Institutionsprofile (JSON-LD, nach Iteration 7)
```json
{
  "@id": "http://www.wikidata.org/entity/Q622683",
  "@type": "ResearchOrganization",
  "name": "Universität Graz",
  "city": "Graz",
  "country": "AT",
  "coordinates": [15.45, 47.08],
  "sameAs": ["http://www.wikidata.org/entity/Q622683", "https://ror.org/01faaaf77", "https://d-nb.info/gnd/2042894-7"],
  "totalPositions": 5,
  "earliestYear": 2015,
  "founded": 1585,
  "disciplines": ["Digital Humanities", "Digital Edition"],
  "methods": [{"label": "TEI/XML", "tadirahUri": "...", "tadirahCategory": "Enrichment"}],
  "positions": [...],
  "tadirahProfile": { "Creation": 3, "Enrichment": 2 },
  "zenodoTopics": [{"topic": "Digital Edition", "count": 8}, {"topic": "Generative AI", "count": 3}],
  "zenodoYears": {"2014": 7, "2022": 17, "2026": 13},
  "zenodoRecordCount": 115,
  "collaborators": [{"institution": "TU Berlin", "sharedPapers": 10, "sharedTopics": [...]}],
  "clarinCentre": {...},
  "dhCourses": [...]
}
```

### JSON-LD Export (Iteration 7)

Datei: `Data/institutions-ld.jsonld` (mit eingebettetem `@context`)

Vokabular-Stack:
1. **Schema.org** — `ResearchOrganization`, `knowsAbout`, `sameAs`, `colleague`, `keywords`
2. **Wikidata** — Entity-URIs als kanonische `@id`
3. **TaDiRAH** — DH-Methoden (`tadirah:encoding`, `tadirah:modeling`)
4. **ROR** — Persistente IDs als volle URIs
5. **GND** — Normdaten-URIs

---

## Data Processing Pipeline

1. **Collect** — Quellen anzapfen (API, Scraping, manuell)
2. **Model** — Strukturieren nach Datenmodell (JSON)
3. **Aggregate** — Einzelpositionen → Institutionsprofile (`build-lod.js`)
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
