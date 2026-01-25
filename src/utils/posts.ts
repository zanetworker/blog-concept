import { getCollection, type CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;
type PostType = 'entry' | 'link' | 'quote' | 'note';

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPostsByType(type: PostType): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter(post => post.data.type === type);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter(post => post.data.tags.includes(tag));
}

export function getPostUrl(post: Post): string {
  const date = post.data.date;
  const year = date.getFullYear();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const slug = post.id.split('/').pop()?.replace('.md', '') || post.id;
  return `/${year}/${month}/${day}/${slug}/`;
}

/**
 * Get the image for a post.
 * Priority: 1) frontmatter cover, 2) first image in content, 3) null
 */
export function getPostImage(post: Post): string | null {
  // 1. Check frontmatter cover
  if (post.data.cover) {
    return post.data.cover;
  }

  // 2. Parse content for first image
  const content = post.body || '';

  // Match markdown image: ![alt](path)
  const mdImageMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  if (mdImageMatch) {
    const imagePath = mdImageMatch[1];
    // Handle relative paths for posts in subdirectories
    if (imagePath.startsWith('./')) {
      const postDir = post.id.includes('/') ? post.id.split('/').slice(0, -1).join('/') : '';
      if (postDir) {
        return `/content-images/${postDir}/${imagePath.slice(2)}`;
      }
    }
    return imagePath;
  }

  // Match HTML img: <img src="path">
  const htmlImageMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (htmlImageMatch) {
    return htmlImageMatch[1];
  }

  // 3. No image found
  return null;
}
