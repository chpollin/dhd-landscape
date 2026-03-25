---
type: knowledge
created: 2026-03-24
tags: [user-stories, requirements, use-cases, digital-edition]
status: draft
---

# Requirements

> Promptotyping-Dokument: REQUIREMENTS.md (vgl. [[Promptotyping]])

## Haupt-Use-Case: Digitale Editionen im DACH-Raum

### Szenario
Eine Forscherin möchte verstehen, wie sich **digitale Editionen** als DH-Praxis im deutschsprachigen Raum entwickelt haben. Sie will nachvollziehen:
- Wo wurde/wird an digitalen Editionen gearbeitet?
- Wie hat sich das Feld zeitlich entwickelt? (Pioniere → Mainstreaming)
- Welche Institutionen waren Vorreiter, welche sind später dazugekommen?
- Welche verwandten Methoden (TEI/XML, Linked Data, NLP) sind mit digitalen Editionen verknüpft?
- Gibt es regionale Cluster? (z.B. Graz, Köln, Trier als frühe Zentren)

### Konkretes Beispiel: Geschichte des IDE
Das Institut für Dokumentologie und Editorik (IDE) als Fallbeispiel — wie hat sich eine DH-Institution über die Jahre entwickelt, wo waren die Akteure, wie hat sich die Praxis verbreitet?

Dieses Beispiel steht stellvertretend für den generischen Use Case: **Die Entwicklungsgeschichte einer DH-Praxis oder Institution über Zeit und Raum nachvollziehen.**

---

## User Stories

### US-1: Thematische Exploration
> Als DH-Forscherin möchte ich **nach einem Thema filtern** (z.B. "Digital Edition"), um zu sehen, **welche Institutionen** daran arbeiten und **wo** sie sind.

**Akzeptanzkriterien:**
- Filter "Digital Edition" aktivieren → Karte zeigt nur relevante Institutionen
- Institutions-Card zeigt Disziplinen, Methoden, Positionen
- Anzahl der Ergebnisse wird angezeigt

### US-2: Zeitliche Entwicklung
> Als DH-Forscher möchte ich die **zeitliche Entwicklung** eines Themas sehen, um zu verstehen, **wann und wo** es aufgekommen ist.

**Akzeptanzkriterien:**
- Timeline-Slider von 2008 bis 2026
- Beim Verschieben erscheinen/verschwinden Institutionen auf der Karte
- Optional: Animierter "Play"-Modus, der die Entwicklung automatisch abspielt
- Aggregations-View: Stacked Area Chart zeigt Wachstum pro Disziplin über Zeit

### US-3: Kooperationspartner finden
> Als Forscher in Graz (Semantic Web) möchte ich sehen, **wer sonst noch** im DACH-Raum zu Semantic Web / Linked Data arbeitet.

**Akzeptanzkriterien:**
- Methoden-Filter "Linked Data" oder "Semantic Web" → verwandte Institutionen leuchten auf
- Entfernung/Nähe visuell erkennbar
- Optional: Konstellations-View zeigt thematische Verbindungen

### US-4: Institutionsprofil verstehen
> Als Studieninteressierte möchte ich das **DH-Profil einer Universität** sehen — welche Schwerpunkte, wie viele Positionen, seit wann.

**Akzeptanzkriterien:**
- Klick auf Institution → Detail-Panel mit Profil
- Disziplinen und Methoden als Tags
- Positionsliste (ohne Personennamen)
- Link zur Institutions-Website

### US-5: Landschafts-Überblick
> Als Fördergeber möchte ich einen **Gesamtüberblick** über die DH-Landschaft — wo sind die Cluster, wo die Lücken?

**Akzeptanzkriterien:**
- Heatmap oder Cluster-View zeigt Forschungsdichte
- Länderfilter (DE/AT/CH)
- Aggregations-Ansicht: Barchart der Positionen pro Bundesland/Region

### US-6: Entwicklungsgeschichte einer Praxis
> Als DH-Historiker möchte ich nachvollziehen, wie sich eine bestimmte **DH-Praxis** (z.B. digitale Editionen, Text Mining, Archaeoinformatik) über Zeit und Raum im DACH-Raum entwickelt hat.

**Akzeptanzkriterien:**
- Disziplin/Methode auswählen → Timeline zeigt chronologische Entwicklung
- Karte animiert: Punkte erscheinen in der Reihenfolge ihrer Gründung
- Optional: Narrative Beschreibung der Entwicklung neben der Visualisierung

---

## Priorisierung

| User Story | Priorität | Status | Abhängigkeit |
|------------|-----------|--------|-------------|
| US-1 Thematische Exploration | Hoch | ✅ Vollständig (Karte-View + TaDiRAH-Filter) | — |
| US-4 Institutionsprofil | Hoch | ✅ Vollständig (7 Datenquellen, TaDiRAH-Profil) | — |
| US-2 Zeitliche Entwicklung | Hoch | ✅ Vollständig (Explorer: Timeline + Stacked Area) | — |
| US-5 Landschafts-Überblick | Mittel | ✅ Vollständig (Übersicht-View + Barchart + Heatmap) | — |
| US-3 Kooperationspartner | Mittel | ✅ Vollständig (Iteration 7: Zenodo-Ko-Autorschaftsnetzwerk, 156 Kanten, Collaborators im Panel) | — |
| US-6 Entwicklungsgeschichte | Mittel | ✅ Vollständig (Explorer: Timeline + Area Chart) | — |
| US-7 Geführter Einstieg | Niedrig | ❌ Deferred — Übersicht-View als vereinfachter Ersatz | — |

## Iteration 7: Forschungslandschaft statt Stellenkarte

Die 3-View-Architektur adressiert alle User Stories:
- **Übersicht** adressiert US-5 (Landschafts-Überblick) — Stats, TaDiRAH, Disziplinen, Timeline, Zenodo-Topics
- **Karte** adressiert US-1 (thematische Exploration), US-3 (Kooperationspartner), US-4 (Institutionsprofil) — TaDiRAH-Marker, Detail-Panel mit Zenodo-Topics + Kooperationspartner
- **Explorer** adressiert US-2 (zeitliche Entwicklung), US-3 (Kooperationen), US-6 (Entwicklungsgeschichte) — 5 Chart-Sektionen inkl. Forschungsthemen + Kooperationsnetzwerk

## Related

- [[Promptotyping]] — REQUIREMENTS.md als Promptotyping-Dokument
- [[Scholar-Centered Design]]
- [[Information Visualization]]
