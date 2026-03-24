# Journal

## 2026-03-24 — Project Kickoff

**Decision**: Start the DHd Landscape project — an interactive map of the DH research landscape in the DACH region.

**Scope**: DH centers and professorships, filterable by discipline, method, and type.

**Tech choices**:
- MapLibre GL JS via CDN (WebGL vector maps, no build step)
- Vanilla JS, static HTML — deployable to GitHub Pages without any tooling
- Data as JSON files in `Data/`

**Data source priority**: Patrick Sahle's DH professorship list as starting point.

**Dual purpose**: This repo also serves as a documented example of the Promptotyping method.

**Next steps**: Build first MapLibre prototype with sample data points (Graz, Berlin, Wuppertal), then systematically collect data from Sahle's list.
