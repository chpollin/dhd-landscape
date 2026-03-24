---
type: specification
created: 2026-03-24
tags: [promptotyping, methodology, context-engineering]
status: draft
---

# Promptotyping — Methodenbeschreibung

> Abgleich mit [[Promptotyping]] im Obsidian Research Vault (Applied Generative AI/Promptotyping.md)

## Kernprinzip

**"Documents as Source of Truth, Code as Disposable Artifact."**

Promptotyping ist eine iterative Context-Engineering-Arbeitstechnik, die Prompt Engineering mit nutzerzentriertem Design verbindet, um Forschungsartefakte (Interfaces, Tools, Workflows) kollaborativ mit Frontier-LLMs zu entwickeln.

## Vier Phasen

### 1. Preparation (Vorbereitung)
Alle Quellmaterialien sammeln (Forschungsdaten, Standards, Domänenwissen) **bevor** technische Entscheidungen fallen.

### 2. Exploration & Mapping
Systematisches Erkunden der Schnittstelle zwischen Rohdaten und Forschungskontext.

### 3. Destillation
Context Compression — maximale Information, minimale Tokens. Produziert **Promptotyping-Dokumente**.

### 4. Implementation
Iterative Entwicklung mit LLMs, validiert durch **Critical Expert-in-the-Loop**.

## Promptotyping-Dokumente (7 Typen)

| Dokument | Kategorie | Funktion |
|----------|-----------|----------|
| README.md / CLAUDE.md | Knowledge | Projektkontext, Forschungsfragen |
| DATA.md | Knowledge | Datenmodelle, Beispieldaten, Query-Logik |
| REQUIREMENTS.md | Knowledge | User Stories, Anforderungen |
| DESIGN.md | Knowledge/Action | Design-Entscheidungen, Agent Socialization |
| JOURNAL.md | Process | Prozessdokumentation, Entscheidungen, Dead Ends |
| INSTRUCTIONS.md | Action | Implementierungsschritte |
| RULES.md | Action | Globale Entwicklungsprinzipien |

### Mapping auf dieses Projekt

| Promptotyping-Typ | DHd Landscape Pendant |
|---|---|
| README.md | CLAUDE.md |
| DATA.md | Knowledge/Data.md |
| REQUIREMENTS.md | (noch nicht angelegt) |
| DESIGN.md | Knowledge/Design.md |
| JOURNAL.md | Journal.md |
| INSTRUCTIONS.md | (nicht nötig — direkte Umsetzung) |
| RULES.md | (in CLAUDE.md integriert) |

## Zwei Wissensebenen

### 1. Promptotyping-Vault (im Repo)
- **Projektspezifisch**: Design, Daten, Forschungsfragen dieses Projekts
- Entsteht im Projekt, lebt im Projekt, versioniert mit Git

### 2. Obsidian Research Vault (extern)
- **Kuratiertes "zweites Hirn"**: Stabiles, projektübergreifendes Wissen
- Pfad: `C:\Users\Chrisi\Documents\obsidian`
- Relevante Bereiche: Digital Humanities/, Applied Generative AI/, Research Data and Open Science/
- **Höhere Verlässlichkeit als Web-Suche** — menschlich kuratiert
- KI-Agenten können sich daraus bedienen

### Zusammenspiel
Der Promptotyping-Prozess speist sich aus beiden Quellen. Erkenntnisse aus dem Projekt fließen zurück in den Vault.

## Promptotyping-Zyklus

```
  Prompt → Interface → Verifikation → Feedback → Prompt → ...
     ↑                                              ↓
     └──── Knowledge-Vault (aktualisiert) ←─────────┘
```

## Schlüsselkonzepte (aus Obsidian Vault)

- **Critical Expert-in-the-Loop**: Qualitätssicherung durch Domänenexpertise, AI Literacy und metakognitive Wachsamkeit
- **Agent Socialization**: DESIGN.md als Agentenkonfiguration, parametrisiert Verhalten und Entscheidungsmuster
- **Verification Milestones**: Definierte Checkpoints, an denen Domänenexpertise systematisch angewendet wird
- **Promptotyping-Interfaces**: Browser-basierte Validierungstools, die Zwischenergebnisse sichtbar und korrigierbar machen
- **Asymmetric Amplification**: LLMs verstärken, automatisieren nicht
- **Epistemic Infrastructure**: Integriertes System aus Verification Milestones, Interfaces, Dokumenten, Versionskontrolle

## Dieses Projekt als Case Study

**DHd Landscape** demonstriert Promptotyping als "Data Exploration" Case Study (vgl. corresp-explorer, herdata, m3gim im Obsidian Vault):
- Ideation → Datenerhebung → Modellierung → Visualisierung → Verifikation
- Jede Phase im Journal dokumentiert
- Das Repo ist sowohl Produkt als auch methodisches Artefakt

## Related

- [[Context Engineering]]
- [[Vibe Coding]] (Kontrast: intuitive vs. strukturierte Entwicklung)
- [[Scholar-Centered Design]]
- [[Information Visualization]]
- [[Asymmetric Amplification]]
