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
