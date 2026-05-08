// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://danub-io.github.io',
  base: '/docs',
  integrations: [
    starlight({
      title: 'Documentação',
      customCss: ['./src/styles/theme.css', './src/styles/layout.css'],
      lastUpdated: true,
      sidebar: [
        { label: '🏠 Início', slug: 'index' },
        {
          label: '💻 CTech',
          collapsed: false,
          items: [
            { label: 'Visão Geral', slug: 'ctech/readme' },
            { label: 'Visão do Ecossistema', slug: 'ctech/visao-geral-ecossistema' },
            { label: 'Convenções', slug: 'ctech/convencoes' },
            { label: 'Postmortems (Template)', slug: 'ctech/postmortems' },
            { label: 'Schema do Banco', slug: 'ctech/schema-banco-consolidado' },
            { label: 'ADRs', slug: 'ctech/adrs' },
            {
              label: 'Frontend (ctech_fe)',
              collapsed: true,
              items: [
                { label: 'README', slug: 'ctech/ctech_fe/readme' },
                { label: 'Arquitetura', slug: 'ctech/ctech_fe/architecture' },
                { label: 'Camada de Dados', slug: 'ctech/ctech_fe/data_layer' },
                { label: 'Contribuindo', slug: 'ctech/ctech_fe/contributing' },
                { label: 'Changelog', slug: 'ctech/ctech_fe/changelog' },
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
                { label: 'Arquitetura', slug: 'ctech/ctech_be/architecture' },
                { label: 'API', slug: 'ctech/ctech_be/api' },
                { label: 'Contribuindo', slug: 'ctech/ctech_be/contributing' },
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
            { label: 'Arquitetura', slug: 'editora/architecture' },
            { label: 'API', slug: 'editora/api' },
            { label: 'Contribuindo', slug: 'editora/contributing' },
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
            { label: 'Arquitetura', slug: 'gospelreads/architecture' },
            { label: 'Contribuindo', slug: 'gospelreads/contributing' },
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
            { label: 'Arquitetura', slug: 'mbalite/architecture' },
            { label: 'Contribuindo', slug: 'mbalite/contributing' },
            { label: 'Changelog', slug: 'mbalite/changelog' },
            {
              label: 'Postmortems',
              collapsed: true,
              autogenerate: { directory: 'mbalite/postmortems' },
            },
          ],
        },
      ],
    }),
  ],
});
