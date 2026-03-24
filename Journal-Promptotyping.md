---
type: knowledge
created: 2026-03-24
tags: [promptotyping, methodology, meta-reflection]
status: draft
---

# Promptotyping Journal — DHd Landscape

Meta-Ebene: Reflexion über die Anwendung der Promptotyping-Methode in diesem Projekt.

---

## 2026-03-24 — Session 1: Beobachtungen

### Setting
- Forscher + Claude (Opus 4.6) in Claude Code
- Wissensquellen: Domänenwissen (DH-Community), Obsidian Research Vault
- Methode: Konversationelle Ideation → strukturierte Planung → sofortige Prototypisierung

### Beobachtung 1: Konversation als Strukturierungswerkzeug
Die initiale Projektidee ("DH-Labs anschauen, Informationsvisualisierung machen") war bewusst vage. Durch den Dialog entstand die Struktur: Scope (Zentren + Professuren), Datenquellen (Sahle), Technologie (MapLibre), Name (DHd Landscape). Die KI strukturierte, der Forscher entschied.

### Beobachtung 2: Sofortige Materialisierung
Vom ersten Prompt bis zum funktionierenden Prototyp vergingen Minuten. Das sofort sichtbare Artefakt (Karte mit 5 Punkten) ermöglichte qualitatives Feedback ("schaut schon sehr gut aus"), das abstrakte Diskussion nicht liefern kann.

### Beobachtung 3: Datenqualität als testbare Hypothese
Die AI-Klassifikation von Disziplinen/Methoden aus Denominationstiteln ist eine Heuristik. Das Promptotyping-Interface macht diese Hypothese sichtbar und prüfbar — der Forscher kann jeden Eintrag verifizieren.

### Beobachtung 4: Ethische Intuition als Design-Treiber
Die Entscheidung "keine Personennamen" kam nicht aus einer Anforderungsanalyse, sondern aus der ethischen Intuition des Forschers. Das Gespräch surfacte diese Intuition und führte zu einem besseren Datenmodell (Institution statt Person als Analyseeinheit).

### Beobachtung 5: Skalierung verändert das Interface
Der Übergang von 5 Beispielpunkten zu 130 realen Einträgen erforderte fundamentale UI-Änderungen (Clustering, Suche, Timeline). Das zeigt: Promptotyping-Interfaces müssen sich mit den Daten mit-entwickeln.

### Beobachtung 6: Zwei Wissensebenen in der Praxis
Der Obsidian Research Vault lieferte stabile Konzepte (Shneiderman, TaDiRAH, Scholar-Centered Design, LOD-Prinzipien), die das Projekt-Vault bereicherten. Die Web-Recherche ergänzte mit aktuellen Quellen (OpenAlex API, CLARIN Registry). Beide Ebenen zusammen sind mächtiger als jede einzelne.

### Beobachtung 7: Journal-Trennung als methodische Entscheidung
Ein einzelnes Journal für Projekt und Methode vermischt zwei Zielgruppen: Wer den Projektfortschritt nachvollziehen will, muss durch Methodenreflexionen scrollen und umgekehrt. Die Trennung in zwei Journale respektiert diese unterschiedlichen Leseperspektiven.

### Offene Fragen
- Was ist das Kernprinzip von Promptotyping? ("Documents as Source of Truth" wurde verworfen — was tritt an seine Stelle?)
- Wie systematisch sollten Verification Milestones definiert werden?
- Wie dokumentiert man die Rolle des Obsidian Vaults als "zweites Hirn" methodisch sauber?

---

## Abschluss Iteration 1 — Reflexion

### Was diese Iteration gezeigt hat

**Promptotyping-Iterationen** haben eine natürliche Struktur:
1. Daten sammeln → Modellieren → Visualisieren → **Verifizieren** → Lernen
2. Das Lernen fließt zurück in die Knowledge-Dokumente
3. Die nächste Iteration baut auf den Erkenntnissen auf

Die erste Iteration hat ein funktionierendes Promptotyping-Interface erzeugt (Karte mit 52 Institutionen). Durch die Verifikation (Screenshot + kritische Bewertung) sind 9 konkrete Verbesserungspunkte identifiziert worden. Diese fließen als Input in Iteration 2.

### Beobachtung 8: Iteration als Erkenntnisquelle
Man muss das Interface sehen um zu wissen, was nicht funktioniert. Abstrakte Planung hätte die 9 Probleme nicht aufgedeckt — erst die materielle Konfrontation mit dem Artefakt macht sie sichtbar. Das ist der Kern von Promptotyping: **schnell materialisieren, dann kritisch bewerten**.

### Beobachtung 9: Technische Hürden als Zeitfresser
Drei Glyph-Server-Wechsel (demotiles → openmaptiles → openfreemap → MapTiler) haben unnötig Zeit gekostet. Erkenntnis: Bei externen Abhängigkeiten sofort testen, nicht mehrfach wechseln. MapTiler mit API-Key ist die robuste Lösung.

### Beobachtung 10: Daten-Enrichment als Promptotyping-Stärke
Die OpenAlex-Integration (282 Institutionen, Wikidata/ROR-IDs automatisch) zeigt wie Promptotyping Datenerhebung beschleunigt: ein Script geschrieben, sofort ausgeführt, 40/52 Matches. Ohne Promptotyping wäre das manuelle Recherche über Tage.

---

## Iteration 2 — Reflexion

### Beobachtung 11: Screenshot-Analyse als Verification Milestone
Die systematische Analyse des Screenshots (10 konkrete Probleme identifiziert) zeigt den Wert von visueller Verifikation. Abstrakte Code-Review hätte die meisten Probleme nicht aufgedeckt — die Konfrontation mit dem materiellen Artefakt ist unersetzlich.

### Beobachtung 12: Daten-Qualität sichtbar durch Interface
Die falsche Klassifikation "Architecture" bei TU Darmstadt wäre in der JSON-Datei nicht aufgefallen. Erst das UI machte den Fehler sichtbar. Das bestätigt: **Promptotyping-Interfaces sind Instrumente zur Datenvalidierung**, nicht nur Darstellung.

### Beobachtung 13: Override-Pattern für Datenqualität
Die Wikidata-Overrides-Datei (`wikidata-overrides.json`) zeigt ein nützliches Pattern: automatisierte Datenerhebung (OpenAlex) + manuelle Korrekturen in separater Datei. Build-Script merged beides. Das respektiert sowohl die Skalierbarkeit der Automatisierung als auch die Präzision manueller Kuratierung.

### Beobachtung 14: Co-Location als Visualisierungsproblem
Berlin hat 3 Unis auf denselben Koordinaten — ein Datenproblem, das erst im UI sichtbar wird. Die Offset-Lösung ist ein Hack, kein echtes Clustering. In Iteration 3 könnte ein Mini-Cluster oder eine andere visuelle Lösung besser sein.

---

## Iteration 3 — Reflexion

### Beobachtung 15: Charts als zweite Erkenntnisschicht
Die D3-Aggregationsviews (Stacked Area, Barchart, Heatmap) zeigen Muster, die auf der Karte unsichtbar sind: die Konzentration auf wenige Disziplinen, der Wachstumsknick ab 2020, die Dominanz von Köln. **Verschiedene Visualisierungen beantworten verschiedene Fragen** — ein zentraler Insight für die weitere Entwicklung.

### Beobachtung 16: Code-Audit als Qualitätssicherung
Der systematische Code-Audit nach der Charts-Implementierung deckte 16 Probleme auf (davon 2 kritisch: Script-Loading-Order, Null-Checks). Erkenntnis: **Nach jeder Promptotyping-Iteration ist ein Audit nötig**, auch wenn der Code "funktioniert". Bugs im Edge-Case-Verhalten sind nicht sichtbar.

### Beobachtung 17: Split-Layout als Kompromiss
Das Split-Layout (Map 45% / Chart 55%) war ein funktionaler Kompromiss, der aber die Karte zu stark einschränkte. Die kritische Analyse nach Iteration 3 zeigte: Tabs und Filter-Buttons sahen identisch aus, die visuelle Hierarchie fehlte. Das führte direkt zum Map-as-Canvas-Ansatz in Iteration 4.

---

## Iteration 4 — Reflexion

### Beobachtung 18: Innovation durch Iteration, nicht durch Planung
Der Map-as-Canvas-Ansatz (3 Modi auf einer Karte) entstand nicht aus theoretischer Planung, sondern aus der kritischen Konfrontation mit dem bestehenden Interface. Erst die Screenshot-Analyse ("zu viele Buttons, kein Onboarding, Tabs=Filter") führte zur Frage "Was wenn die Karte ALLES ist?" — und dann zur Entscheidung, alle drei Ansätze (Narrative, Explore, Overview) zu bauen, um zu lernen was am besten passt.

### Beobachtung 19: Promptotyping als Methodenvalidierung
Die Entscheidung, alle drei Modi zu implementieren statt einen auszuwählen, ist **typisch Promptotyping**: Materialisieren statt spezifizieren. Die Kosten des Bauens sind gering (dank AI-gestützter Implementierung), der Erkenntnisgewinn durch tatsächliches Ausprobieren ist hoch.

### Beobachtung 20: Architektur-Refactoring als Enabling
Die Aufspaltung von einer 675-Zeilen index.html in 5 Dateien (index.html + styles.css + app.js + modes.js + charts.js) war keine Verschönerung, sondern **Voraussetzung für Innovation**. Erst die saubere Trennung (Map-Init, Filter-Logik, Mode-Switching, Charts) ermöglichte die 3-Modi-Architektur. Erkenntnis: Technische Schulden blockieren konzeptuelle Weiterentwicklung.

### Beobachtung 21: Design-Feedback als Forschungsfrage
Das User-Feedback "zu dunkel, zu monoton — DHd ist bunt, innovativ, offen" zeigt, dass Farbgestaltung in DH-Tools nicht nur ästhetisch, sondern **identitätsstiftend** ist. Die Frage "Welches Farbschema repräsentiert die DHd-Community?" ist eine Forschungsfrage, keine Design-Entscheidung. Das öffnet die Tür zu semantischer Farbkodierung (Disziplin→Farbe→Identität).
