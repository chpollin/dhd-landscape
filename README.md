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

- Interactive map (MapLibre GL JS) with dark academic aesthetic
- Filter by **discipline** (Digital Humanities, Digital History, Computational Literary Studies, ...)
- Filter by **method** (NLP, TEI/XML, GIS, Machine Learning, ...)
- Filter by **country** (Germany, Austria, Switzerland)
- **Timeline slider** (2008–2026) showing the growth of DH
- **Free-text search** across institutions, cities, and topics
- Institution profile cards with position counts, disciplines, methods
- Marker size encodes number of DH positions

## Data Sources

| Source | Content | Status |
|--------|---------|--------|
| [Patrick Sahle's DH Professorship List](https://dhd-blog.org/?p=11018) | 150 DH professorships in DACH (2008–2026) | Integrated |
| [OpenAlex](https://openalex.org/) | DH publication counts per institution | Planned |
| [CLARIN Centre Registry](https://centres.clarin.eu) | DH infrastructure centers | Planned |
| [DH Course Registry](https://dhcr.clarin-dariah.eu/) | DH study programs | Planned |
| [Wikidata](https://www.wikidata.org/) | Institutional identifiers, LOD linking | Planned |

## Promptotyping

This project is built using the **Promptotyping method** — an iterative approach to developing research tools collaboratively with AI. The repository serves as both the product and a documented case study of the methodology.

- `Knowledge/` — Research vault (Design, Data, Research, Requirements, Promptotyping)
- `Journal.md` — Project decisions and progress
- `Journal-Promptotyping.md` — Methodological reflection
- Each web visualization is a **Promptotyping-Interface** — a testable, verifiable output

Read more: [Knowledge/Promptotyping.md](Knowledge/Promptotyping.md)

## Tech Stack

- **MapLibre GL JS** via CDN — WebGL vector map rendering
- **Vanilla JavaScript** — no frameworks, no build step
- **CartoDB Dark Matter** tiles
- **GitHub Pages** — zero-config deployment
- Planned: **D3.js** for charts, **JSON-LD** for Linked Open Data

## Data Model

Each institution is represented as:

```json
{
  "name": "Universität Graz",
  "city": "Graz",
  "country": "AT",
  "coordinates": [15.45, 47.08],
  "totalPositions": 5,
  "disciplines": ["Digital Humanities", "Digital Edition", "Digital Archaeology"],
  "methods": ["TEI/XML", "Linked Data", "Data Modeling"],
  "earliestYear": 2015
}
```

Planned: JSON-LD export with [Schema.org](https://schema.org/), [Wikidata](https://www.wikidata.org/), [TaDiRAH](https://vocabs.dariah.eu/tadirah/), and [ROR](https://ror.org/) identifiers.

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
- Built with [MapLibre GL JS](https://maplibre.org/) and [CartoDB](https://carto.com/) basemaps
