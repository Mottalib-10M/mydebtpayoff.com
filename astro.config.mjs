import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  trailingSlash: 'always',  site: 'https://debtpayoffplanner.com',
  integrations: [
    trustKit({ lang: 'en', siteUrl: 'https://debtpayoffplanner.com', siteName: 'Debt Payoff Planner', founded: '2026-06-27', about: '/about/', method: '/methodology/' }), react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
