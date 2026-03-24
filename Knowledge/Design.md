# Design

## Vision

A map-based information visualization platform that makes the DH research landscape in the DACH region explorable. The interface should be **aesthetic, innovative, and intuitive**.

## Map Technology

**MapLibre GL JS** — WebGL-based vector map rendering via CDN.

Advantages over Leaflet:
- Full control over map styling (custom dark/light themes)
- Smooth fly-to animations between locations
- Dynamic animated clustering
- 3D perspective tilt possible
- Heatmap layers for research density
- High performance with many data points

## UI Concept

- Clean, minimal interface — the map is the hero
- Filter panel (sidebar or top bar) for disciplines, methods, institution types
- Click on a marker → detail card with info, links, related entries
- Smooth transitions when filters change (fly-to, fade, cluster/uncluster)
- Responsive: works on desktop and mobile

## Visual Language

- Muted, academic color palette
- Color-coding by discipline or method
- Cluster circles that show composition (mini pie charts or stacked colors)
- Subtle animations — nothing flashy, everything purposeful

## Promptotyping-Interfaces

Each web view is a "Promptotyping-Interface" — a verifiable output derived from the underlying data. The interfaces evolve iteratively through feedback cycles.
