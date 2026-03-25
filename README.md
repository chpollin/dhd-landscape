# DHd Landscape

**An interactive visualization of the Digital Humanities research landscape in the German-speaking world.**

[Live Demo: chpollin.github.io/dhd-landscape](https://chpollin.github.io/dhd-landscape/)

---

## What is this?

DHd Landscape visualizes **52 institutions** with DH research activities across Germany, Austria, and Switzerland. It integrates **7 data sources** into a Linked Open Data dataset and answers questions like:

- Where is Digital Humanities researched in the DACH region?
- What topics does an institution work on? (based on DHd conference publications)
- Who collaborates with whom? (co-authorship network from Zenodo)
- How has the DH landscape grown since 2008?
- Who could be a collaboration partner for my research topic?

No individual names are shown — the focus is on **institutional research profiles**.

## Features

### Three Views
- **Übersicht**: Start page with key figures, TaDiRAH distribution, disciplines, timeline, Zenodo research topics, data sources
- **Karte**: Interactive map with TaDiRAH-colored markers, filter sidebar, institution detail panel with Zenodo topics and collaboration partners
- **Explorer**: Five scrollable chart sections — Timeline, Institutions, Disciplines, Research Topics, Collaboration Network

### Research Topic Extraction
- **36 topic patterns** analyze 2,112 DHd conference abstracts from Zenodo
- **47/52 institutions** have empirically derived research topic profiles
- Topics include: Computational Literary Studies, NER, Annotation, Corpus Linguistics, Generative AI, Digital Edition, etc.

### Co-Authorship Network
- **156 institutional collaboration edges** (≥2 shared conference papers)
- Derived from Zenodo creator affiliations
- Shown in Explorer (Top-20 collaborations) and Detail Panel (per-institution partners)

### Interactive Map
- MapLibre GL JS with light academic aesthetic
- **TaDiRAH semantic color coding**: 8 research activity categories mapped to marker colors
- Filter by discipline, method, country, and time period (2008–2026)
- Free-text search across institutions, cities, and topics

### Linked Open Data
- **Wikidata URI as canonical identifier** for each institution
- `sameAs` links to ROR, GND
- JSON-LD export: `Data/institutions-ld.jsonld`
- Schema.org + Wikidata + TaDiRAH + ROR vocabulary stack

## Data Sources

| Source | Content | Coverage |
|--------|---------|----------|
| [Patrick Sahle's DH List](https://dhd-blog.org/?p=11018) | 130 DH positions in DACH (2008–2026) | 52 institutions |
| [OpenAlex](https://openalex.org/) | DH publication counts per institution | 40/52 matched |
| [Wikidata](https://www.wikidata.org/) | Institutional identifiers, founding year, GND | 51/52 matched |
| [Zenodo DHd Community](https://zenodo.org/communities/dhd/) | 2,112 conference records → topic profiles + network | 47/52 with topics |
| [CLARIN Centre Registry](https://centres.clarin.eu) | DH infrastructure centres | 5/52 matched |
| [DH Course Registry](https://dhcr.clarin-dariah.eu/) | DH study programs | 24/52 matched |
| [DBLP](https://dblp.org/) | Publication metadata | 500 records |

## Build Pipeline

```bash
node Data/build-lod.js
```

Merges all 7 sources → 4 outputs:
- `institutions-ld.jsonld` — JSON-LD with @context (LOD export)
- `institutions-ld.json` — Frontend dataset
- `institutions.json` — Backward compatibility
- `collaborations.json` — Co-authorship network

## Promptotyping

This project is built using the **Promptotyping method** — an iterative approach to developing research tools collaboratively with AI. The repository serves as both the product and a documented case study.

- `Knowledge/` — Research vault: Design, Data, Research, Requirements, Promptotyping, Research Plan
- `Journal.md` — Project decisions and progress (Iterations 1–7)
- `Journal-Promptotyping.md` — Methodological reflection (25+ observations)

Read more: [Knowledge/Promptotyping.md](Knowledge/Promptotyping.md)

## Tech Stack

- **MapLibre GL JS** via CDN — WebGL vector map rendering
- **D3.js v7** via CDN — Stacked Area, Barchart, Heatmap, Topic Bars, Network Bars
- **Vanilla JavaScript** — no frameworks, no build step
- **CartoDB Light (Positron)** tiles — warm, neutral basemap
- **GitHub Pages** — zero-config deployment
- **JSON-LD** for Linked Open Data

## Data Model

Each institution is a JSON-LD object with Wikidata URI as `@id`:

```json
{
  "@id": "http://www.wikidata.org/entity/Q622683",
  "@type": "ResearchOrganization",
  "name": "Universität Graz",
  "sameAs": ["https://ror.org/01faaaf77", "https://d-nb.info/gnd/2042894-7"],
  "disciplines": ["Digital Humanities", "Digital Edition"],
  "zenodoTopics": [{"topic": "Digital Edition", "count": 8}, {"topic": "Generative AI", "count": 3}],
  "collaborators": [{"institution": "TU Berlin", "sharedPapers": 10}],
  "tadirahProfile": {"Creation": 3, "Enrichment": 2}
}
```

## Contributing

Feedback, corrections, and additions are welcome:

- **Data corrections**: Open an [issue](https://github.com/chpollin/dhd-landscape/issues) or submit a PR
- **Missing institutions**: Suggest DH centers or programs not yet included
- **Feature ideas**: Describe your use case in an issue

## License

- **Data**: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Code**: [MIT](https://opensource.org/licenses/MIT)
- **Source data**: Patrick Sahle, [DHd-Blog](https://dhd-blog.org/?p=11018)

## Citation

> Christopher Pollin (2026). *DHd Landscape: An Interactive Visualization of Digital Humanities Research in the German-Speaking World.* https://github.com/chpollin/dhd-landscape

## Acknowledgments

- [Patrick Sahle](https://dhd-blog.org/?p=11018) for the DH professorship list
- [DHd-Verband](https://digitalhumanities.de/) and the Zenodo DHd Community
- Built with [MapLibre GL JS](https://maplibre.org/), [D3.js](https://d3js.org/), and [CartoDB Positron](https://carto.com/) basemaps
