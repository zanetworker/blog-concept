import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || 'https://adelzaalouk.com';

  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${siteUrl}sitemap-index.xml

# AI/LLM context files
# llms.txt: ${siteUrl}llms.txt
# llms-full.txt: ${siteUrl}llms-full.txt
`;

  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
