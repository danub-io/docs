// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://danub-io.github.io',
  base: '/docs',
  integrations: [
    starlight({
      title: 'Documentação',
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/danub-io/docs' }],
      customCss: ['./src/styles/globals.css'],
      sidebar: [
        { label: 'Início', slug: 'index' },
        {
          label: 'CTech',
          autogenerate: { directory: 'ctech' },
        },
        {
          label: 'Editora',
          autogenerate: { directory: 'editora' },
        },
        {
          label: 'GospelReads',
          autogenerate: { directory: 'gospelreads' },
        },
        {
          label: 'MBA Lite',
          autogenerate: { directory: 'mbalite' },
        },
      ],
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
