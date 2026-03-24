# Research

## Forschungsfragen

1. **Wo** wird Digital Humanities im DACH-Raum beforscht?
2. **Was** wird beforscht — welche Disziplinen und Methoden, und wo?
3. Gibt es **Cluster** bestimmter DH-Subdisziplinen?
4. Wie hat sich die DH-Landschaft **entwickelt** (zeitliche Dimension)?
5. Welche **Lücken** gibt es — unterrepräsentierte Regionen oder Disziplinen?
6. Wer könnte **Kooperationspartner** sein? ("Ich forsche zu Semantic Web — wo noch?")

## Drei Perspektiven

1. **Forschung** — Welche DH-Themen werden wo beforscht?
2. **Lehre** — Wo wird DH unterrichtet? Schwerpunkte der Curricula?
3. **Vernetzung** — Themenbasierte Verbindungen zwischen Institutionen

## Kontext

Die Digital Humanities im deutschsprachigen Raum sind seit den 2000ern stark gewachsen. Der DHd-Verband ist die zentrale Community-Organisation. Trotz dieses Wachstums gibt es keine interaktive, filterbare Übersicht, die zeigt: wer macht was wo.

## Related Work

### Datensammlungen
- **Patrick Sahle**: Professuren-Listen (statisch, nicht interaktiv) — https://dhd-blog.org/?p=11018
- **DH Course Registry** (DARIAH + CLARIN): https://dhcr.clarin-dariah.eu/ — DH-Programme an Institutionen
- **CLARIN Centre Registry**: https://centres.clarin.eu — Infrastruktur-Zentren

### Visualisierungen
- **Sahle Visualisierung**: https://dhd-blog.org/?p=21260
- **DARIAH-DE**: Infrastruktur-Karten (Fokus auf Infrastruktur, nicht Forschungsprofile)
- **centerNet**: International DH Centers (veraltet)

### Taxonomien
- **TaDiRAH**: Taxonomy of Digital Research Activities in the Humanities — https://vocabs.dariah.eu/tadirah/
  - Drei Facetten: Research Activities, Research Objects, Research Techniques
  - SKOS-Format, publiziert als LOD
  - Ideal für Methoden-Klassifikation
- **NeDiMAH Methods Ontology (NeMO)**: Granularer als TaDiRAH, OWL-Ontologie

### Identifikatoren
- **ROR** (Research Organization Registry): https://ror.org/ — Persistente IDs für Institutionen, CC0
- **GND**: Gemeinsame Normdatei — Autoritätsdatei für Institutionen
- **GeoNames**: https://sws.geonames.org/ — Stabile URIs für Orte

## Linked Open Data Modell

### Vokabular-Stack
1. **Schema.org** — Strukturelles Rückgrat (breiteste Interoperabilität)
2. **Wikidata URIs** — Für Entitäten (Länder, Städte, Disziplinen)
3. **TaDiRAH URIs** — DH-spezifische Methoden und Aktivitäten
4. **ROR** — Institutions-Identifikatoren
5. **GeoNames/Wikidata** — Geographische Entitäten

### Schema.org Types
- `ResearchOrganization` + `EducationalOrganization` (dual-typed)
- `knowsAbout` für Disziplinen/Methoden (akzeptiert URLs)
- `sameAs` für Wikidata, GND, VIAF, ROR
- `GeoCoordinates` für Standorte
- `parentOrganization` für Universität → Zentrum

### Best Practices (aus DH-Projekten)
- DARIAH/ACDH-CH: Schema.org + Wikidata + GND
- CLARIN: CMDI-Metadaten, konvertierbar zu RDF
- Linked Pasts: GeoJSON-LD für historische Ortsdaten
- ROR: CC0-Datenbank mit JSON-LD, Parent-Child-Relationen

### Architektur-Entscheidung
**Separierung**: JSON-LD für Semantik, GeoJSON für Kartendarstellung. Nicht mischen (GeoJSON-LD ist experimentell und schlecht unterstützt).

## Methodische Notiz: Promptotyping

Dieses Projekt ist gleichzeitig Forschungsoutput und Demonstration der **Promptotyping-Methode**. Der iterative Zyklus von Datenerhebung → Modellierung → Visualisierung → Verifikation wird transparent in diesem Repository dokumentiert.

Jedes "Promptotyping-Interface" (Web-Visualisierung) ist eine testbare Hypothese über die Daten — es kann verifiziert, korrigiert und verfeinert werden.
