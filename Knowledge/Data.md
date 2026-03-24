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

### Prio 3: DHd Zenodo Communities
- `zenodo.org/communities/dhd` — Konferenzmaterialien (2014–2026)
- `zenodo.org/communities/dhd-verbandsaktivitaeten` — AG-Berichte
- **Format**: REST API + OAI-PMH
- **Aufwand**: Niedrig | **Wert**: Hoch

### Prio 4: CLARIN Centre Registry
- **URL**: https://centres.clarin.eu
- ~20 DACH-Zentren (DE: ~14, AT: 3, CH: 2-3)
- **Aufwand**: Niedrig | **Wert**: Mittel

### Prio 5: DBLP — DHd Proceedings
- 1.429 DH-Publikationen, DHd 2014–2025
- SPARQL-Endpoint: sparql.dblp.org
- **Aufwand**: Niedrig-Mittel | **Wert**: Mittel

### Prio 6: Wikidata
- SPARQL: `?item wdt:P101 wd:Q5157565` (Digital Humanities)
- Lückenhaft, aber gut zum Verlinken/Anreichern
- **Aufwand**: Mittel | **Wert**: Mittel

### Prio 7: DH Course Registry
- **URL**: https://dhcr.clarin-dariah.eu/
- DH-Studiengänge an Institutionen (DARIAH + CLARIN)
- **Aufwand**: Niedrig | **Wert**: Mittel (Lehr-Perspektive)

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

### Aktuell: Institutionsprofile (JSON)
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
  "disciplines": ["Digital Humanities", "Digital Edition"],
  "methods": ["TEI/XML", "Linked Data"],
  "positions": [...]
}
```

### Geplant: JSON-LD (Linked Open Data)

Dreischichtiges Vokabular:
1. **Schema.org** — `ResearchOrganization`, `EducationalOrganization`, `knowsAbout`, `sameAs`
2. **Wikidata** — Q-Items für Disziplinen (`wd:Q1026532` = Digital Humanities)
3. **TaDiRAH** — DH-Methoden (`tadirah:encoding`, `tadirah:modeling`)
4. **ROR** — Persistente IDs (`https://ror.org/01faaaf77`)
5. **GeoNames** — Orts-URIs (`https://sws.geonames.org/2778067/` = Graz)

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
