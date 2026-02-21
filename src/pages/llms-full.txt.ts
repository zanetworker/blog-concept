import type { APIRoute } from 'astro';
import { getAllPosts, getPostUrl } from '../utils/posts';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://adelzaalouk.com';
  const posts = await getAllPosts();
  const entries = posts.filter(p => p.data.type === 'entry');

  const postSections = entries.map(post => {
    const url = `${siteUrl}${getPostUrl(post)}`;
    const date = post.data.date.toISOString().split('T')[0];
    const tags = post.data.tags.length > 0 ? `Tags: ${post.data.tags.join(', ')}` : '';
    const summary = post.data.summary || '';

    return `## [${post.data.title}](${url})

Date: ${date}
${tags}
${summary}

${post.body || ''}
`;
  }).join('\n---\n\n');

  const content = `# adelzaalouk.com — Full Content

> Personal blog of Adel Zaalouk — where business and tech speak the same language.

This file contains the full content of all blog entries for LLM consumption.

---

${postSections}`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
