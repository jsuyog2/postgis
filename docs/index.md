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

---

<GsapReveal animation="fade-up" :delay="0.1">
<div class="custom-features">
  <div class="feature-card">
    <IconMap class="feature-icon" size="32" stroke-width="1.5" />
    <h3>Full PostGIS Coverage</h3>
    <p>bbox, centroid, GeoJSON, Geobuf, MVT tiles, nearest neighbour, intersections, coordinate transforms.</p>
  </div>
  <div class="feature-card">
    <IconLayers class="feature-icon" size="32" stroke-width="1.5" />
    <h3>TypeScript First</h3>
    <p>Full type definitions out of the box — auto-complete, IntelliSense, and compile-time safety.</p>
  </div>
  <div class="feature-card">
    <IconBox class="feature-icon" size="32" stroke-width="1.5" />
    <h3>Dual ESM + CJS</h3>
    <p>Tree-shakable ESM build and a CommonJS fallback — works with any bundler or runtime.</p>
  </div>
</div>
</GsapReveal>

<GsapReveal animation="fade-up" :delay="0.2">
<div class="custom-features">
  <div class="feature-card">
    <IconZap class="feature-icon" size="32" stroke-width="1.5" />
    <h3>Zero Runtime Dependencies</h3>
    <p>Bring your own pg client. One peer dependency, nothing else.</p>
  </div>
  <div class="feature-card">
    <IconPlug class="feature-icon" size="32" stroke-width="1.5" />
    <h3>Bring Your Own Client</h3>
    <p>Works with pg.Client, pg.Pool, or any object that exposes a compatible query() method.</p>
  </div>
  <div class="feature-card">
    <IconBeaker class="feature-icon" size="32" stroke-width="1.5" />
    <h3>Fully Tested</h3>
    <p>50+ unit tests with mocked pg.Client — no database required to run the test suite.</p>
  </div>
</div>
</GsapReveal>

<style>
.custom-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
  margin-bottom: 24px;
}
.feature-card {
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.dark .feature-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}
.feature-icon {
  margin-bottom: 16px;
  color: var(--vp-c-brand-1);
}
.feature-card h3 {
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: inherit;
  font-size: 16px;
}
.feature-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
</style>
