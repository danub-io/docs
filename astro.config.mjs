// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://danub-io.github.io',
  base: '/docs',
  integrations: [
    starlight({
      title: 'Quikly',
      customCss: ['./src/styles/theme.css', './src/styles/layout.css'],
      lastUpdated: true,
      sidebar: [
        { label: '🏠 Home', slug: 'index' },
        {
          label: '💻 Lupinho',
          collapsed: false,
          items: [
            { label: 'Overview', slug: 'lupinho/readme' },
            { label: 'Ecosystem Overview', slug: 'lupinho/ecosystem-overview' },
            { label: 'Conventions', slug: 'lupinho/conventions' },
            { label: 'Postmortems (Template)', slug: 'lupinho/postmortems' },
            { label: 'Database Schema', slug: 'lupinho/database-schema' },
            { label: 'ADRs', slug: 'lupinho/adrs' },
            {
              label: 'Frontend (lupinho_fe)',
              collapsed: true,
              items: [
                { label: 'README', slug: 'lupinho/lupinho_fe/readme' },
                { label: 'Architecture', slug: 'lupinho/lupinho_fe/architecture' },
                { label: 'Data Layer', slug: 'lupinho/lupinho_fe/data_layer' },
                { label: 'Contributing', slug: 'lupinho/lupinho_fe/contributing' },
                { label: 'Changelog', slug: 'lupinho/lupinho_fe/changelog' },
                { label: 'Release Process', slug: 'lupinho/lupinho_fe/docs/deployment/release' },
                {
                  label: 'Postmortems',
                  collapsed: true,
                  autogenerate: { directory: 'lupinho/lupinho_fe/postmortems' },
                },
              ],
            },
            {
              label: 'Backend (lupinho_be)',
              collapsed: true,
              items: [
                { label: 'README', slug: 'lupinho/lupinho_be/readme' },
                { label: 'Architecture', slug: 'lupinho/lupinho_be/architecture' },
                { label: 'API', slug: 'lupinho/lupinho_be/api' },
                { label: 'Contributing', slug: 'lupinho/lupinho_be/contributing' },
                { label: 'Changelog', slug: 'lupinho/lupinho_be/changelog' },
                {
                  label: 'Postmortems',
                  collapsed: true,
                  autogenerate: { directory: 'lupinho/lupinho_be/postmortems' },
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
          label: '🤖 Turbo CLI',
          collapsed: false,
          items: [
            { label: 'Overview', slug: 'turbo' },
            { label: 'README', slug: 'turbo/readme' },
            { label: 'Architecture', slug: 'turbo/architecture' },
            { label: 'Contributing', slug: 'turbo/contributing' },
            { label: 'Changelog', slug: 'turbo/changelog' },
            {
              label: 'Postmortems',
              collapsed: true,
              autogenerate: { directory: 'turbo/postmortems' },
            },
          ],
        },
      ],
    }),
  ],
});
