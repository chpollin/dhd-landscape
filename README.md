# DHd Landscape

**An interactive map of the Digital Humanities research landscape in the German-speaking world.**

🔗 **[Live Demo: chpollin.github.io/dhd-landscape](https://chpollin.github.io/dhd-landscape/)**

---

## What is this?

DHd Landscape visualizes **52 institutions** with DH professorships across Germany, Austria, and Switzerland — filterable by discipline, method, country, and time period. It answers questions like:

- Where is Digital Humanities researched in the DACH region?
- Which institutions focus on Digital Editions, Computational Linguistics, or Digital Archaeology?
- How has the DH landscape grown since 2008?
- Who could be a collaboration partner for my research topic?

No individual names are shown — the focus is on **institutional profiles**.

## Features

### Three Views (Map-as-Canvas)
The map is always the canvas. Three views provide different perspectives:

- **Übersicht**: Start page with animated stats, key figures, and entry point into the landscape
- **Karte**: Interactive map with TaDiRAH-colored markers, filters, and institution detail panel
- **Explorer**: D3.js chart panels — Timeline, Institutionen, Disziplinen

### Interactive Map
- MapLibre GL JS with light academic aesthetic (warm off-white background)
- **TaDiRAH semantic color coding**: 8 research activity categories mapped to marker colors
- Filter by **discipline**, **method**, **country**, and **time period** (2008–2026)
- **Free-text search** across institutions, cities, and topics
- Institution profile panel with stats, disciplines, methods, Wikidata/ROR links

### D3.js Visualizations
- **Stacked Area Chart**: DH landscape growth since 2008 (by discipline or country)
- **Horizontal Barchart**: Institutions ranked by position count, color-coded by discipline
- **Discipline Heatmap**: Institutions x Disciplines matrix with crosshair hover
- **Coordinated filtering**: All views update simultaneously
- Click any chart element to fly to the institution on the map

### Data Enrichment
- 7 data sources integrated with automatic matching
- TaDiRAH research profiles per institution
- Zenodo publication records, CLARIN centre status, DH course listings

## Data Sources

| Source | Content | Status |
|--------|---------|--------|
| [Patrick Sahle's DH Professorship List](https://dhd-blog.org/?p=11018) | 150 DH professorships in DACH (2008–2026) | Integrated |
| [OpenAlex](https://openalex.org/) | DH publication counts per institution | Integrated |
| [Wikidata](https://www.wikidata.org/) | 806 DACH universities, 51/52 matched — institutional identifiers, LOD linking | Integrated |
| [Zenodo](https://zenodo.org/) | 2112 DHd community records, 50/52 matched — conference publications | Integrated |
| [CLARIN Centre Registry](https://centres.clarin.eu) | 23 centres, 5/52 matched — DH infrastructure | Integrated |
| [DH Course Registry](https://dhcr.clarin-dariah.eu/) | 196 courses, 24/52 matched — DH study programs | Integrated |
| [DBLP](https://dblp.org/) | 500 DH records — publication metadata | Integrated |

## Promptotyping

This project is built using the **Promptotyping method** — an iterative approach to developing research tools collaboratively with AI. The repository serves as both the product and a documented case study of the methodology.

- `Knowledge/` — Research vault (Design, Data, Research, Requirements, Promptotyping)
- `Journal.md` — Project decisions and progress
- `Journal-Promptotyping.md` — Methodological reflection
- Each web visualization is a **Promptotyping-Interface** — a testable, verifiable output

Read more: [Knowledge/Promptotyping.md](Knowledge/Promptotyping.md)

## Tech Stack

- **MapLibre GL JS** via CDN — WebGL vector map rendering
- **D3.js v7** via CDN — Stacked Area Chart, Barchart, Heatmap
- **Vanilla JavaScript** — no frameworks, no build step
- **CartoDB Light (Positron)** tiles — warm, neutral basemap
- **GitHub Pages** — zero-config deployment
- **JSON-LD** context for Linked Open Data (`Data/context.jsonld`)

## Data Model

Each institution is represented as:

```json
{
  "name": "Universität Graz",
  "city": "Graz",
  "country": "AT",
  "coordinates": [15.45, 47.08],
  "totalPositions": 5,
  "founded": 1585,
  "disciplines": ["Digital Humanities", "Digital Edition", "Digital Archaeology"],
  "methods": ["TEI/XML", "Linked Data", "Data Modeling"],
  "earliestYear": 2015,
  "tadirahProfile": { "Creation": 3, "Enrichment": 2 },
  "gndId": "...",
  "zenodoRecordCount": 12,
  "clarinCentre": true,
  "dhCourses": [...]
}
```

JSON-LD context available at `Data/context.jsonld` using [Schema.org](https://schema.org/), [Wikidata](https://www.wikidata.org/), [TaDiRAH](https://vocabs.dariah.eu/tadirah/), and [ROR](https://ror.org/) identifiers.

## Contributing

Feedback, corrections, and additions are welcome:

- **Data corrections**: Open an [issue](https://github.com/chpollin/dhd-landscape/issues) or submit a PR editing `Data/dh-professorships.json`
- **Missing institutions**: Suggest DH centers or programs not yet included
- **Feature ideas**: Describe your use case in an issue

## License

- **Data**: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Code**: [MIT](https://opensource.org/licenses/MIT)
- **Source data**: Patrick Sahle, [DHd-Blog](https://dhd-blog.org/?p=11018)

## Citation

> Christopher Pollin (2026). *DHd Landscape: An Interactive Map of Digital Humanities Research in the German-Speaking World.* https://github.com/chpollin/dhd-landscape

## Acknowledgments

- [Patrick Sahle](https://dhd-blog.org/?p=11018) for the DH professorship list
- [DHd-Verband](https://digitalhumanities.de/) — Digital Humanities im deutschsprachigen Raum
- Built with [MapLibre GL JS](https://maplibre.org/) and [CartoDB Positron](https://carto.com/) basemaps
