import type { APIRoute } from 'astro';
import { getAllPosts, getPostUrl } from '../utils/posts';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://adelzaalouk.com';
  const posts = await getAllPosts();
  const entries = posts.filter(p => p.data.type === 'entry');

  const postList = entries.slice(0, 30).map(post => {
    const url = `${siteUrl}${getPostUrl(post)}`;
    return `- [${post.data.title}](${url}): ${post.data.summary || ''}`;
  }).join('\n');

  const content = `# adelzaalouk.com

> Personal blog of Adel Zaalouk — where business and tech speak the same language.

## About

This is the personal blog of Adel Zaalouk, covering topics at the intersection of technology, AI, product management, and cloud-native infrastructure. Posts range from deep technical content on Kubernetes, OpenShift, and AI/ML to business strategy and product thinking.

## Content Types

- **Entries**: Long-form blog posts and analyses
- **Highlights**: Extracted quotes and notes from entries
- **Links**: Curated links with commentary

## Recent Posts

${postList}

## Navigation

- [Home](${siteUrl}/)
- [Entries](${siteUrl}/entries/)
- [Highlights](${siteUrl}/highlights/)
- [Links](${siteUrl}/links/)
- [Tags](${siteUrl}/tags/)
- [About](${siteUrl}/about/)
- [RSS Feed](${siteUrl}/atom.xml)
- [Full LLM Context](${siteUrl}/llms-full.txt)
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
