// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://danub-io.github.io',
  base: '/docs',
  integrations: [
    starlight({
      title: 'Documentation',
      customCss: ['./src/styles/theme.css', './src/styles/layout.css'],
      lastUpdated: true,
      sidebar: [
        { label: '🏠 Home', slug: 'index' },
        {
          label: '💻 CTech',
          collapsed: false,
          items: [
            { label: 'Overview', slug: 'ctech/readme' },
            { label: 'Ecosystem Overview', slug: 'ctech/ecosystem-overview' },
            { label: 'Conventions', slug: 'ctech/conventions' },
            { label: 'Postmortems (Template)', slug: 'ctech/postmortems' },
            { label: 'Database Schema', slug: 'ctech/database-schema' },
            { label: 'ADRs', slug: 'ctech/adrs' },
            {
              label: 'Frontend (ctech_fe)',
              collapsed: true,
              items: [
                { label: 'README', slug: 'ctech/ctech_fe/readme' },
                { label: 'Architecture', slug: 'ctech/ctech_fe/architecture' },
                { label: 'Data Layer', slug: 'ctech/ctech_fe/data_layer' },
                { label: 'Contributing', slug: 'ctech/ctech_fe/contributing' },
                { label: 'Changelog', slug: 'ctech/ctech_fe/changelog' },
                { label: 'Release Process', slug: 'ctech/ctech_fe/docs/deployment/release' },
                {
                  label: 'Postmortems',
                  collapsed: true,
                  autogenerate: { directory: 'ctech/ctech_fe/postmortems' },
                },
              ],
            },
            {
              label: 'Backend (ctech_be)',
              collapsed: true,
              items: [
                { label: 'README', slug: 'ctech/ctech_be/readme' },
                { label: 'Architecture', slug: 'ctech/ctech_be/architecture' },
                { label: 'API', slug: 'ctech/ctech_be/api' },
                { label: 'Contributing', slug: 'ctech/ctech_be/contributing' },
                { label: 'Changelog', slug: 'ctech/ctech_be/changelog' },
                {
                  label: 'Postmortems',
                  collapsed: true,
                  autogenerate: { directory: 'ctech/ctech_be/postmortems' },
                },
              ],
            },
          ],
        },
        {
          label: '📖 Editora',
          collapsed: false,
          items: [
            { label: 'README', slug: 'editora/readme' },
            { label: 'Architecture', slug: 'editora/architecture' },
            { label: 'API', slug: 'editora/api' },
            { label: 'Contributing', slug: 'editora/contributing' },
            { label: 'Changelog', slug: 'editora/changelog' },
            {
              label: 'Postmortems',
              collapsed: true,
              autogenerate: { directory: 'editora/postmortems' },
            },
          ],
        },
        {
          label: '✝️ GospelReads',
          collapsed: false,
          items: [
            { label: 'README', slug: 'gospelreads/readme' },
            { label: 'Architecture', slug: 'gospelreads/architecture' },
            { label: 'Contributing', slug: 'gospelreads/contributing' },
            { label: 'Changelog', slug: 'gospelreads/changelog' },
            {
              label: 'Postmortems',
              collapsed: true,
              autogenerate: { directory: 'gospelreads/postmortems' },
            },
          ],
        },
        {
          label: '🎓 MBA Lite',
          collapsed: false,
          items: [
            { label: 'README', slug: 'mbalite/readme' },
            { label: 'Architecture', slug: 'mbalite/architecture' },
            { label: 'Contributing', slug: 'mbalite/contributing' },
            { label: 'Changelog', slug: 'mbalite/changelog' },
            {
              label: 'Postmortems',
              collapsed: true,
              autogenerate: { directory: 'mbalite/postmortems' },
            },
          ],
        },
        {
          label: '⚡ TURBO CODE',
          collapsed: false,
          items: [
            { label: 'README', slug: 'turbo-code/index' },
            { label: 'Quickstart', slug: 'turbo-code/quickstart' },
            { label: 'Architecture', slug: 'turbo-code/architecture' },
            { label: 'Modes', slug: 'turbo-code/modes' },
            { label: 'Streaming', slug: 'turbo-code/streaming' },
            { label: 'Tools', slug: 'turbo-code/tools' },
            { label: 'Security', slug: 'turbo-code/security' },
            { label: 'Memory', slug: 'turbo-code/memory' },
            { label: 'Providers', slug: 'turbo-code/providers' },
            { label: 'Testing', slug: 'turbo-code/testing' },
            { label: 'Contributing', slug: 'turbo-code/contributing' },
            { label: 'Changelog', slug: 'turbo-code/changelog' },
            {
              label: 'Postmortems',
              collapsed: true,
              autogenerate: { directory: 'turbo-code/postmortems' },
            },
          ],
        },
      ],
    }),
  ],
});
