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
          autogenerate: { directory: 'ctech' },
        },
        {
          label: '📖 Editora',
          autogenerate: { directory: 'editora' },
        },
        {
          label: '✝️ GospelReads',
          autogenerate: { directory: 'gospelreads' },
        },
        {
          label: '🎓 MBA Lite',
          autogenerate: { directory: 'mbalite' },
        },
      ],
    }),
  ],
});
