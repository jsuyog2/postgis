---
layout: home

hero:
  name: "postgis"
  text: "PostGIS for Node.js"
  tagline: Lightweight, type-safe spatial queries — GeoJSON, MVT tiles, nearest neighbour, bounding boxes, and more.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/overview
    - theme: alt
      text: View on GitHub
      link: https://github.com/jsuyog2/postgis

features:
  - icon: 🗺️
    title: Full PostGIS Coverage
    details: bbox, centroid, GeoJSON, Geobuf, MVT tiles, nearest neighbour, intersections, coordinate transforms.
  - icon: 🔷
    title: TypeScript First
    details: Full type definitions out of the box — auto-complete, IntelliSense, and compile-time safety.
  - icon: 📦
    title: Dual ESM + CJS
    details: Tree-shakable ESM build and a CommonJS fallback — works with any bundler or runtime.
  - icon: ⚡
    title: Zero Runtime Dependencies
    details: Bring your own pg client. One peer dependency, nothing else.
  - icon: 🔌
    title: Bring Your Own Client
    details: Works with pg.Client, pg.Pool, or any object that exposes a compatible query() method.
  - icon: 🧪
    title: Fully Tested
    details: 50+ unit tests with mocked pg.Client — no database required to run the test suite.
---
