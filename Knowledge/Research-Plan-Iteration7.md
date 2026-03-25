---
type: research-plan
created: 2026-03-25
tags: [promptotyping, iteration-7, research-plan]
status: draft
---

# Forschungsplan — Iteration 7: Von Stellenkarte zu Forschungslandschaft

> Promptotyping-Phase: Exploration & Mapping → Destillation → Implementation

## Kritische Analyse des Status Quo

### Was das Tool jetzt ist
Eine **Stellenkarte** — 52 Institutionen, aggregiert aus Patrick Sahles Professuren-Liste, angereichert mit Metadaten aus 7 Quellen. Die Grundfrage "Wo gibt es DH?" wird beantwortet, aber die tieferen Forschungsfragen (Frage 2–6 aus Research.md) bleiben unterbelichtet.

### Was das Tool sein sollte
Eine **Forschungslandschaft** — die zeigt, wer an welchen Themen arbeitet, basierend auf tatsächlichem Forschungsoutput (Publikationen, Konferenzbeiträge), nicht nur auf institutionellen Stellenplänen.

### Die Lücke
| Dimension | Aktuell | Ziel |
|-----------|---------|------|
| Datengrundlage | Sahle-Professuren (130 Stellen) | Sahle + Zenodo-Abstracts (2.112) + OpenAlex-Pubs |
| Forschungsthemen | Aus Denominationen abgeleitet (AI-Heuristik) | Aus Abstracts extrahiert (empirisch belegbar) |
| Zeitliche Tiefe | Stellenbesetzungsjahr | Publikationsaktivität pro Jahr |
| Institutionsabdeckung | Nur Universitäten mit DH-Stellen | Auch Akademien, Bibliotheken, Forschungsinstitute mit DH-Output |
| Verknüpfungen | Keine | Thematische Ko-Autorschaft zwischen Institutionen |

## Forschungsfragen für Iteration 7

1. **Themenlandschaft**: Welche DH-Forschungsthemen dominieren im DACH-Raum? Wie verteilen sie sich geographisch?
2. **Methodenwandel**: Wie haben sich DH-Methoden über die Jahre verändert? (z.B. Aufstieg von GenAI/LLMs seit 2023)
3. **Kollaborationsnetzwerk**: Welche Institutionen publizieren gemeinsam? Gibt es thematische Cluster?
4. **Forschung vs. Lehre vs. Infrastruktur**: Wie korrelieren Zenodo-Output, DHCR-Kurse und CLARIN-Zentren?

## Verbesserungsplan (Promptotyping-Iterationen)

### Iteration 7.1: Zenodo-Daten vertiefen
**Ziel**: Vollständigere Themenextraktion aus Zenodo-Abstracts
- [ ] Zenodo-Keywords/Subjects extrahieren (aktuell nur Titel-Patterns)
- [ ] Zenodo-API: `description`-Feld (Abstract-Volltext) für bessere Themenextraktion
- [ ] Konferenzjahr als Dimension (DHd 2014–2026)
- [ ] Ressourcentyp (Vortrag, Poster, Panel, Workshop) als Metadatum

### Iteration 7.2: Ko-Autorschafts-Netzwerk
**Ziel**: Institutionelle Verbindungen aus Ko-Autorschaften ableiten
- [ ] Zenodo-Records mit mehreren Affiliationen → Kanten zwischen Institutionen
- [ ] Gewichtung: Häufigkeit der gemeinsamen Beiträge
- [ ] Visualisierung: Arc-Layer auf der Karte (Design.md: Konstellations-View)

### Iteration 7.3: Explorer-Verbesserungen
**Ziel**: Coordinated Views nach Shneiderman/Munzner/Sampo-Modell
- [ ] Alle Charts reagieren auf Filter (aktuell nur teilweise)
- [ ] Brushing: Klick auf Topic in Explorer → Karte filtert
- [ ] Neue Charts: Zenodo-Topics-Heatmap (Institution × Topic)
- [ ] Zeitverlauf der Themen (Stacked Area mit Topics statt nur Disziplinen)

### Iteration 7.4: LOD-Export vervollständigen
**Ziel**: 5-Star LOD nach Tim Berners-Lee
- [ ] JSON-LD `@graph` mit korrekten `@id`-URIs
- [ ] `schema:sameAs`-Links zu Wikidata, ROR, GND
- [ ] Zenodo-Topics als `schema:keywords` mit TaDiRAH-URIs
- [ ] Ko-Autorschafts-Kanten als `schema:colleague`-Relationen
- [ ] DCAT-Metadaten für den Datensatz selbst

## Theoretische Fundierung

### Shneiderman's Mantra in DHd Landscape
- **Overview**: Übersicht-View mit Stats, Topic-Bars, Timeline
- **Zoom & Filter**: Karte mit Sidebar-Filtern + Explorer-Charts
- **Details on Demand**: Detail-Panel mit Zenodo-Topics, Positionen, Links

### Sampo-Modell (Hyvönen 2023)
DHd Landscape implementiert zunehmend Sampo-Prinzipien:
1. ✅ Kollaborative Datenerstellung (7 Quellen)
2. ✅ Geteilte Ontologie-Infrastruktur (TaDiRAH, Schema.org)
3. ✅ Trennung Daten/UI (build-lod.js → JSON-LD → Frontend)
4. ⬜ Multiple Perspektiven (3 Views, aber noch nicht voll koordiniert)
5. ⬜ Standardisierter Filter-Analyse-Zyklus (Event-Bus vorhanden, aber unvollständig)
6. ⬜ Knowledge Discovery (noch keine thematischen Verbindungen)

### Scholar-Centered Design
Primäre Persona: DH-Forschende/r, die/der Kooperationspartner:innen sucht.
Sekundäre Persona: DH-Studierende, die Studienorte vergleichen.
Tertiäre Persona: Fördergeber, die DH-Schwerpunkte im DACH-Raum verstehen wollen.

## Verification Milestones

1. **VM7.1**: Zenodo-Topics für Graz zeigen "Digital Edition", "Semantic Web", "GenAI" ✅
2. **VM7.2**: Ko-Autorschafts-Kanten zwischen Graz, Wien, Köln sichtbar
3. **VM7.3**: Filter auf "Digital Edition" zeigt nur relevante Institutionen + Topics
4. **VM7.4**: JSON-LD validiert gegen Schema.org Structured Data Testing Tool

## Promptotyping-Reflexion

Diese Iteration markiert den Übergang von **Datensammlung** zu **Datenanalyse**. Die ersten 6 Iterationen haben einen soliden Datenkern aufgebaut. Jetzt geht es darum, die Daten sprechen zu lassen — nicht durch vorgegebene Kategorien (Sahle-Disziplinen), sondern durch empirischen Forschungsoutput (Zenodo-Abstracts).

Das ist der Kern von Promptotyping: **schnell materialisieren, dann kritisch bewerten, dann vertiefen**.
