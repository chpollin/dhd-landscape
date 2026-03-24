---
type: research
created: 2026-03-24
tags: [digital-humanities, dach, linked-open-data, research-landscape]
status: draft
---

# Research

> Informiert durch [[Digital-Humanities MOC]], [[Linked Open Data]], [[CIDOC-CRM]], [[TaDiRAH]] im Obsidian Research Vault

## Forschungsfragen

1. **Wo** wird Digital Humanities im DACH-Raum beforscht?
2. **Was** wird beforscht — welche Disziplinen und Methoden, und wo?
3. Gibt es **Cluster** bestimmter DH-Subdisziplinen?
4. Wie hat sich die DH-Landschaft **entwickelt** (zeitliche Dimension)?
5. Welche **Lücken** gibt es — unterrepräsentierte Regionen oder Disziplinen?
6. Wer könnte **Kooperationspartner** sein? ("Ich forsche zu X — wo noch?")

## Drei Perspektiven

1. **Forschung** — Welche DH-Themen werden wo beforscht?
2. **Lehre** — Wo wird DH unterrichtet? Schwerpunkte der Curricula?
   - Datenquelle: DH Course Registry (DARIAH + CLARIN): https://dhcr.clarin-dariah.eu/
3. **Vernetzung** — Themenbasierte Verbindungen zwischen Institutionen

## Kontext

Die Digital Humanities im deutschsprachigen Raum sind seit den 2000ern stark gewachsen. Der DHd-Verband (https://digitalhumanities.de/) ist die zentrale Community-Organisation mit 17+ Arbeitsgruppen und jährlicher Konferenz (seit 2014).

Trotz dieses Wachstums gibt es keine interaktive, filterbare Übersicht, die zeigt: wer macht was wo. Die DH Course Registry (DARIAH/CLARIN) kommt dem am nächsten, ist aber auf Studiengänge fokussiert.

## Related Work

### Datensammlungen
- Patrick Sahle: Professuren-Listen — https://dhd-blog.org/?p=11018
- DH Course Registry (DARIAH + CLARIN): https://dhcr.clarin-dariah.eu/
- CLARIN Centre Registry: https://centres.clarin.eu
- OpenAlex Topic T12377: 137.000+ DH-Publikationen

### Taxonomien & Vokabulare
- **TaDiRAH**: Taxonomy of Digital Research Activities in the Humanities
  - URL: https://vocabs.dariah.eu/tadirah/
  - Format: SKOS (RDF/XML, Turtle, JSON-LD)
  - Drei Facetten: Research Activities, Research Objects, Research Techniques
  - URI-Pattern: `https://vocabs.dariah.eu/tadirah/encoding`
- **NeDiMAH Methods Ontology (NeMO)**: Granularer als TaDiRAH, OWL-Ontologie
- **CIDOC-CRM**: Cultural Heritage Ontologie (vgl. [[CIDOC-CRM]] im Vault)

### Identifikatoren
- **ROR**: https://ror.org/ — Persistente IDs, CC0, JSON-LD, Parent-Child
- **GND**: Gemeinsame Normdatei
- **GeoNames**: https://sws.geonames.org/ — Stabile Orts-URIs
- **VIAF**: Virtual International Authority File

## Linked Open Data Modell

### Vokabular-Stack
1. **Schema.org** — Strukturelles Rückgrat (`ResearchOrganization`, `EducationalOrganization`)
2. **Wikidata URIs** — Entitäten (Q-Items für Länder, Städte, Disziplinen)
3. **TaDiRAH URIs** — DH-spezifische Methoden und Aktivitäten
4. **ROR** — Persistente Institutions-IDs
5. **GeoNames / Wikidata** — Geographische Entitäten

### Schema.org Mapping
- `@type`: `ResearchOrganization` + `EducationalOrganization` (dual-typed)
- `knowsAbout`: Disziplinen/Methoden (akzeptiert URLs → Wikidata/TaDiRAH)
- `sameAs`: Wikidata, GND, VIAF, ROR
- `geo`: `GeoCoordinates` mit `latitude`/`longitude`
- `parentOrganization`: Universität → Zentrum
- `foundingDate`: Jahr der Einrichtung
- `numberOfEmployees`: `QuantitativeValue` für Positionen

### Architektur-Entscheidung
**Separierung**: JSON-LD für Semantik, GeoJSON für Kartendarstellung.
GeoJSON-LD ist experimentell und schlecht unterstützt (vgl. [[Linked Open Data]] im Vault: "Sustainability: SPARQL endpoints and data maintenance not secured after project end").

### Best Practices aus DH-Projekten
- **DARIAH/ACDH-CH**: Schema.org + Wikidata + GND, ARCHE Repository
- **CLARIN**: CMDI-Metadaten, konvertierbar zu RDF
- **Linked Pasts**: GeoJSON-LD für historische Ortsdaten
- **WarSampo**: 14M RDF Triples, 6 koordinierte Perspektiven
- **ResearchSpace** (British Museum): CIDOC-CRM Knowledge Graph

### Reconciliation (vgl. Obsidian Vault)
- **OpenRefine** als primäres Reconciliation-Tool
- Abgleich gegen GND, Wikidata, VIAF, GeoNames
- Tim Berners-Lee's Five-Star Model als Qualitätsziel

## Methodische Einbettung

Dieses Projekt ist gleichzeitig:
1. **Forschungsoutput**: Interaktive Kartierung der DH-Landschaft
2. **Promptotyping Case Study**: Dokumentiertes Beispiel der Methode (vgl. [[Promptotyping]])
3. **LOD-Beispiel**: Die Datengrundlage selbst als Linked Open Data publiziert

## Related

- [[Digital-Humanities MOC]]
- [[Linked Open Data]]
- [[CIDOC-CRM]]
- [[Information Visualization]]
- [[Promptotyping]]
- [[Scholar-Centered Design]]
