// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://danub-io.github.io',
  base: '/docs',
  integrations: [
    starlight({
      title: 'Documentação',
      lastUpdated: true,
      editLink: {
        baseUrl: 'https://github.com/danub-io/docs/edit/main',
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/danub-io/docs' }],
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
