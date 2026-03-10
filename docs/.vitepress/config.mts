import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'postgis',
  description:
    'A lightweight, type-safe Node.js library for interacting with PostGIS-enabled PostgreSQL databases.',
  lang: 'en-US',
  base: '/postgis/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/postgis/favicon.svg' }],
    ['meta', { name: 'keywords', content: 'postgis, postgresql, geospatial, nodejs, gis, geojson, mvt, vector tiles' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'postgis — PostGIS for Node.js' }],
    ['meta', { property: 'og:description', content: 'Lightweight, type-safe PostGIS helper for Node.js' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'Changelog', link: '/changelog' },
      {
        text: 'v1.2.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'npm', link: 'https://www.npmjs.com/package/postgis' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Advanced Usage', link: '/guide/advanced' },
          { text: 'FAQ', link: '/guide/faq' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Publishing Guide', link: '/guide/publishing' },
        ],
      },
      {
        text: 'API Reference',
        items: [{ text: 'All Methods', link: '/api/overview' }],
      },
      { text: 'Changelog', link: '/changelog' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jsuyog2/postgis' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/postgis' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Suyog Dinesh Jadhav',
    },

    editLink: {
      pattern: 'https://github.com/jsuyog2/postgis/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    search: { provider: 'local' },
  },
});
