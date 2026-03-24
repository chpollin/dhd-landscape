# Data

## Data Sources

### 1. Patrick Sahle — DH Professorship List
- URL: https://dhd-blog.org/?p=11802 (to be verified)
- Content: List of DH-denominated professorships in the German-speaking world
- Format: Web page, needs extraction
- Status: To be collected

### 2. DHd-Verband
- Member institutions and working groups
- Conference proceedings (abstracts, topics)
- Status: To be explored

### 3. Institutional Websites
- Individual DH center websites
- Research profiles, project pages
- Status: Manual collection needed

### 4. Publication Databases
- OpenAlex, BASE, DBLP
- DH-related keywords and author affiliations
- Status: To be explored as enrichment source

## Data Model

```json
{
  "id": "unique-id",
  "name": "Name of center or professorship",
  "institution": "University / host institution",
  "city": "City name",
  "country": "AT | DE | CH",
  "coordinates": [longitude, latitude],
  "type": "center | professorship",
  "disciplines": ["Digital History", "Computational Literary Studies"],
  "methods": ["NLP", "Network Analysis", "GIS"],
  "url": "https://...",
  "people": ["Person Name"],
  "description": "Short description"
}
```

## Data Processing Workflow

1. **Collect** — Gather from sources (scrape, manual, API)
2. **Model** — Structure into JSON according to data model
3. **Geocode** — Add coordinates for each location
4. **Validate** — Cross-check, verify, fill gaps
5. **Publish** — Make available to the web visualization
