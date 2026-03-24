# Promptotyping — Methodenbeschreibung (Meta-Ebene)

## Was ist Promptotyping?

Promptotyping ist eine Methode zur iterativen Entwicklung digitaler Forschungsartefakte im Dialog zwischen Mensch und KI. Der Name verbindet "Prompt" (die Eingabe an ein KI-System) mit "Prototyping" (iteratives Entwerfen).

## Kernprinzipien

1. **Konversationelle Ideation** — Ideen entstehen im Dialog, nicht im Vakuum
2. **Sofortige Materialisierung** — Jede Idee wird unmittelbar in ein testbares Artefakt übersetzt
3. **Verifizierbare Outputs** — Jedes "Promptotyping-Interface" ist eine prüfbare Hypothese
4. **Transparente Dokumentation** — Der gesamte Prozess wird im Journal festgehalten
5. **Zwei Wissensebenen** — Projekt-Vault + kuratierte Wissensbasis (Obsidian)

## Struktur eines Promptotyping-Projekts

```
project-repo/
├── CLAUDE.md            # KI-Kontextdatei (Projektbeschreibung, Konventionen)
├── Journal.md           # Promptotyping-Journal (dual: Projekt + Methode)
├── Knowledge/           # Promptotyping-Vault (Obsidian-kompatibel)
│   ├── Design.md        # Visuelle Konzepte, UI, Ästhetik
│   ├── Data.md          # Datenquellen, Datenmodell, Verarbeitung
│   ├── Research.md      # Forschungsfragen, Related Work, Kontext
│   └── Promptotyping.md # Methoden-Dokumentation (dieses Dokument)
├── Data/                # Datensätze (JSON, CSV, JSON-LD)
├── Feedback/            # Verifikations-Zyklen, Feedback-Skripte
└── index.html           # Promptotyping-Interface (Web-Visualisierung)
```

## Zwei Wissensebenen

### 1. Promptotyping-Vault (im Repo)
- **Projektspezifisch**: Design, Daten, Forschungsfragen dieses Projekts
- **Entsteht im Projekt, lebt im Projekt**
- **Versioniert** mit dem Code (Git)

### 2. Obsidian Research Vault (extern)
- **Kuratiertes "zweites Hirn"**: Stabiles, projektübergreifendes Wissen
- UI-Patterns, Technologien, Methoden, Domain-Wissen, Institutionswissen
- **Höhere Verlässlichkeit als Web-Suche** — menschlich kuratiert
- **Teilbar zwischen Projekten**: Wissen über UIs, Technologien, Prozesse
- KI-Agenten können sich daraus bedienen

### Zusammenspiel
Der Promptotyping-Prozess speist sich aus beiden Quellen. Das Repo-Knowledge ist der lokale Kontext, der Obsidian-Vault die geteilte Wissensbasis. Im Idealfall fließen Erkenntnisse aus dem Projekt zurück in den Vault.

## Der Promptotyping-Zyklus

```
  Prompt → Interface → Verifikation → Feedback → Prompt → ...
     ↑                                              ↓
     └──── Knowledge-Vault (aktualisiert) ←─────────┘
```

1. **Prompt**: Forscher formuliert Absicht ("Ich will sehen, wer Semantic Web macht")
2. **AI-Beitrag**: KI strukturiert, recherchiert, implementiert
3. **Interface**: Testbares Web-Artefakt entsteht (Promptotyping-Interface)
4. **Verifikation**: Forscher prüft: Stimmt das? Fehlt etwas? Ist die Darstellung richtig?
5. **Feedback**: Korrekturen, neue Ideen, Richtungsänderungen
6. **Knowledge-Update**: Erkenntnisse fließen zurück in die Dokumentation

## Journal-Struktur

Jeder Session-Eintrag dokumentiert:
- **Promptotyping Context**: Setting, verwendete Wissensquellen, Methode
- **Phasen** mit:
  - **Prompt Intent**: Was wollte der Forscher?
  - **AI Contribution**: Was hat die KI beigetragen?
  - **Human Decision**: Welche Entscheidungen hat der Forscher getroffen?
  - **Verification**: Wurde das Output geprüft? Mit welchem Ergebnis?
- **Promptotyping Observations**: Meta-Beobachtungen über den Prozess selbst

## Git-Commit-Konventionen

- Commits dokumentieren den Promptotyping-Fortschritt
- Jeder Commit beschreibt **was** gebaut wurde und **warum** (nicht nur das Was)
- `Co-Authored-By: Claude` markiert KI-generierte Beiträge
- Commits spiegeln die Promptotyping-Phasen wider

## Dieses Projekt als Beispiel

**DHd Landscape** demonstriert Promptotyping anhand eines konkreten Forschungsprojekts:
- Ideation → Tech-Entscheidung → Prototyp → Datenerhebung → Refactoring → Verifikation
- Jede Phase ist im Journal dokumentiert
- Das Repo ist sowohl Produkt als auch methodisches Artefakt
