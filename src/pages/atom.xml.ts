import type { APIRoute } from 'astro';
import { getAllPosts, getPostUrl } from '../utils/posts';
import { formatDateISO } from '../utils/dates';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPosts();
  const siteUrl = site?.toString() || 'https://adelzaalouk.com';

  const feedItems = posts.slice(0, 20).map(post => {
    const url = new URL(getPostUrl(post), siteUrl).toString();
    const date = formatDateISO(post.data.date);

    return `
    <entry>
      <title>${escapeXml(post.data.title)}</title>
      <link href="${url}" />
      <id>${url}</id>
      <updated>${date}T00:00:00Z</updated>
      <summary>${escapeXml(post.data.summary || '')}</summary>
      <category term="${post.data.type}" />
      ${post.data.tags.map(tag => `<category term="${escapeXml(tag)}" />`).join('\n      ')}
    </entry>`;
  }).join('\n');

  const latestDate = posts[0] ? formatDateISO(posts[0].data.date) : formatDateISO(new Date());

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>adelzaalouk</title>
  <subtitle>Personal blog of Adel Zaalouk</subtitle>
  <link href="${siteUrl}/atom.xml" rel="self" />
  <link href="${siteUrl}" />
  <id>${siteUrl}</id>
  <updated>${latestDate}T00:00:00Z</updated>
  <author>
    <name>Adel Zaalouk</name>
  </author>
  ${feedItems}
</feed>`;

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  });
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
