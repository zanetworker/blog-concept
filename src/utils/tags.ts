import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;

export function getRelatedTags(
  currentTag: string,
  allPosts: Post[],
  limit = 10
): Array<{ tag: string; count: number }> {
  const postsWithTag = allPosts.filter(
    post => !post.data.draft && post.data.tags.includes(currentTag)
  );

  const tagCounts = new Map<string, number>();
  for (const post of postsWithTag) {
    for (const tag of post.data.tags) {
      if (tag !== currentTag) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

export function getAllTags(allPosts: Post[]): Map<string, number> {
  const tags = new Map<string, number>();
  for (const post of allPosts) {
    if (post.data.draft) continue;
    for (const tag of post.data.tags) {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    }
  }
  return tags;
}
