# adelzaalouk Blog Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a personal blog with multiple content types (entries, links, quotes, notes), tag-based organization with related tags, search, and comments.

**Architecture:** Astro 5.x static site using Content Layer API with glob loader. Pagefind for search, Giscus for comments. Black/red theme inspired by The Technomist.

**Tech Stack:** Astro 5.x, Content Layer API, Pagefind, Giscus, CSS custom properties, TypeScript

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

**Step 1: Initialize npm project**

Run: `npm init -y`

**Step 2: Install Astro and dependencies**

Run: `npm install astro @astrojs/sitemap astro-pagefind`
Run: `npm install -D pagefind typescript`

**Step 3: Create package.json scripts**

Edit `package.json` to have:
```json
{
  "name": "adelzaalouk-blog",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

**Step 4: Create astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://adelzaalouk.com',
  integrations: [
    sitemap(),
    pagefind(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
```

**Step 5: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Step 6: Create directory structure**

Run:
```bash
mkdir -p src/content src/content-data/entries src/content-data/links src/content-data/quotes src/content-data/notes
mkdir -p src/components src/layouts src/pages src/styles src/utils
mkdir -p public
```

**Step 7: Create pagefind.yml**

```yaml
site: dist
glob: "**/*.html"
exclude_selectors:
  - "nav"
  - "footer"
  - ".giscus"
```

**Step 8: Verify Astro runs**

Run: `npm run dev`
Expected: Astro dev server starts (will show warning about no pages yet)

**Step 9: Commit**

```bash
git add .
git commit -m "chore: initialize Astro project with dependencies"
```

---

## Task 2: Content Collection Schema

**Files:**
- Create: `src/content/config.ts`

**Step 1: Create content collection config**

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content-data" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    type: z.enum(['entry', 'link', 'quote', 'note']),
    draft: z.boolean().default(false),
    // Entry-specific
    summary: z.string().optional(),
    // Link-specific (blogmark)
    linkUrl: z.string().url().optional(),
    linkTitle: z.string().optional(),
    via: z.string().optional(),
    viaUrl: z.string().url().optional(),
    // Quote-specific
    source: z.string().optional(),
    sourceUrl: z.string().url().optional(),
  }),
});

export const collections = { posts };
```

**Step 2: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: add content collection schema for posts"
```

---

## Task 3: Sample Content

**Files:**
- Create: `src/content-data/entries/building-ai-apps.md`
- Create: `src/content-data/links/interesting-ai-article.md`
- Create: `src/content-data/quotes/alan-kay-future.md`
- Create: `src/content-data/notes/python-http-server.md`

**Step 1: Create sample entry**

`src/content-data/entries/building-ai-apps.md`:
```markdown
---
title: "Building AI Applications with Python"
date: 2026-01-20
tags: ["ai", "python", "llm"]
type: entry
summary: "A deep dive into building AI applications with modern Python tooling."
---

Building AI applications has become more accessible than ever. In this post, I'll share my experience working with large language models and the patterns that have emerged.

## Getting Started

The first step is choosing the right framework...

## Key Patterns

When building AI applications, consider:

1. **Prompt Engineering** - The art of crafting effective prompts
2. **Context Management** - Handling conversation history
3. **Error Handling** - Graceful degradation when APIs fail

## Conclusion

The future of AI development is bright, and Python remains the language of choice.
```

**Step 2: Create sample link (blogmark)**

`src/content-data/links/interesting-ai-article.md`:
```markdown
---
title: "The Future of AI Development"
date: 2026-01-19
tags: ["ai", "reading"]
type: link
linkUrl: "https://example.com/future-of-ai"
linkTitle: "The Future of AI Development"
via: "@simonw"
viaUrl: "https://twitter.com/simonw"
---

Simon shared this excellent article about where AI development is heading. The key insight is that we're moving from prompt engineering to system design.
```

**Step 3: Create sample quote**

`src/content-data/quotes/alan-kay-future.md`:
```markdown
---
title: "Inventing the Future"
date: 2026-01-18
tags: ["wisdom", "programming"]
type: quote
source: "Alan Kay"
sourceUrl: "https://en.wikipedia.org/wiki/Alan_Kay"
---

> The best way to predict the future is to invent it.

This quote has guided my approach to software development. Rather than waiting for the perfect tool, build what you need.
```

**Step 4: Create sample note**

`src/content-data/notes/python-http-server.md`:
```markdown
---
title: "TIL: Python's Built-in HTTP Server"
date: 2026-01-17
tags: ["til", "python"]
type: note
---

Just discovered you can use `python -m http.server` to quickly serve files from any directory. Super useful for testing static sites locally.

```bash
cd my-project
python -m http.server 8080
```

Now available at `http://localhost:8080`.
```

**Step 5: Commit**

```bash
git add src/content-data/
git commit -m "feat: add sample content for all post types"
```

---

## Task 4: Utility Functions

**Files:**
- Create: `src/utils/tags.ts`
- Create: `src/utils/posts.ts`
- Create: `src/utils/dates.ts`

**Step 1: Create tags utility**

`src/utils/tags.ts`:
```typescript
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
```

**Step 2: Create posts utility**

`src/utils/posts.ts`:
```typescript
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
```

**Step 3: Create dates utility**

`src/utils/dates.ts`:
```typescript
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

**Step 4: Commit**

```bash
git add src/utils/
git commit -m "feat: add utility functions for tags, posts, and dates"
```

---

## Task 5: Global Styles

**Files:**
- Create: `src/styles/global.css`

**Step 1: Create global CSS with black/red theme**

`src/styles/global.css`:
```css
:root {
  /* Technomist color palette */
  --bg-primary: #000000;
  --bg-secondary: #0f0f0f;
  --bg-tertiary: #1a1a1a;
  --bg-card: #111111;
  --accent: #FF3131;
  --accent-hover: #ff5252;
  --accent-muted: #cc2727;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-muted: #666666;
  --border: #2a2a2a;
  --border-hover: #3a3a3a;

  /* Typography */
  --font-heading: 'Lora', Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'SF Pro Display',
               'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', monospace;

  /* Spacing */
  --container-width: 800px;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
}

/* Light mode override */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #eeeeee;
  --bg-card: #fafafa;
  --text-primary: #111111;
  --text-secondary: #555555;
  --text-muted: #888888;
  --border: #dddddd;
  --border-hover: #cccccc;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-body);
  background: var(--bg-primary);
  color: var(--text-primary);
}

body {
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.3;
}

h1 { font-size: 2rem; margin-bottom: var(--spacing-md); }
h2 { font-size: 1.5rem; margin-bottom: var(--spacing-sm); margin-top: var(--spacing-lg); }
h3 { font-size: 1.25rem; margin-bottom: var(--spacing-sm); margin-top: var(--spacing-md); }

p {
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
}

/* Posts */
.post {
  border-bottom: 1px solid var(--border);
  padding: var(--spacing-lg) 0;
}

.post:last-child {
  border-bottom: none;
}

.post-title {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-sm);
}

.post-title a {
  color: var(--text-primary);
}

.post-title a:hover {
  color: var(--accent);
}

.post-meta {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.post-type {
  display: inline-block;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 3px;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  text-transform: uppercase;
  margin-right: var(--spacing-sm);
}

.post-summary {
  color: var(--text-secondary);
}

/* Tags */
.tag {
  display: inline-block;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-right: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.tag:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tags-list {
  margin-top: var(--spacing-sm);
}

/* Code */
pre {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow-x: auto;
  padding: var(--spacing-md);
  font-family: var(--font-mono);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

code {
  font-family: var(--font-mono);
  color: var(--accent);
}

pre code {
  color: var(--text-primary);
}

/* Blockquotes (for quotations) */
blockquote {
  border-left: 3px solid var(--accent);
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-md);
  color: var(--text-secondary);
  font-style: italic;
}

/* Search */
.search-input {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  width: 100%;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* Header */
.site-header {
  border-bottom: 1px solid var(--border);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-lg);
}

.site-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.site-title a {
  color: var(--text-primary);
}

.site-title a:hover {
  color: var(--accent);
}

.site-nav {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.site-nav a {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.site-nav a:hover {
  color: var(--accent);
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--border);
  padding: var(--spacing-lg) 0;
  margin-top: var(--spacing-xl);
  color: var(--text-muted);
  font-size: 0.875rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

/* Theme toggle */
.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.875rem;
}

.theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Related tags sidebar */
.related-tags {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.related-tags h3 {
  font-size: 0.875rem;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.related-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

/* Blogmark (link post) styling */
.blogmark-link {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-sm);
}

.blogmark-via {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Quote styling */
.quote-source {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: var(--spacing-sm);
}

/* Lists */
ul, ol {
  margin-bottom: var(--spacing-md);
  padding-left: var(--spacing-lg);
}

li {
  margin-bottom: var(--spacing-xs);
}

/* Page title */
.page-title {
  margin-bottom: var(--spacing-lg);
}

/* Prose content */
.prose {
  max-width: 65ch;
}

.prose img {
  max-width: 100%;
  height: auto;
}
```

**Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add global CSS with black/red theme"
```

---

## Task 6: Base Components

**Files:**
- Create: `src/components/BaseHead.astro`
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`

**Step 1: Create BaseHead component**

`src/components/BaseHead.astro`:
```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Personal blog of Adel Zaalouk' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="generator" content={Astro.generator} />

<link rel="canonical" href={canonicalURL} />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />

<title>{title} | adelzaalouk</title>
<meta name="description" content={description} />

<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:type" content="website" />

<link rel="alternate" type="application/atom+xml" title="adelzaalouk RSS" href="/atom.xml" />

<!-- Google Fonts for Lora -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap" rel="stylesheet" />
```

**Step 2: Create Header component**

`src/components/Header.astro`:
```astro
---
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/entries/', label: 'Entries' },
  { href: '/links/', label: 'Links' },
  { href: '/quotes/', label: 'Quotes' },
  { href: '/notes/', label: 'Notes' },
  { href: '/tags/', label: 'Tags' },
  { href: '/search/', label: 'Search' },
  { href: '/about/', label: 'About' },
];

const currentPath = Astro.url.pathname;
---

<header class="site-header">
  <div class="container">
    <div class="site-title">
      <a href="/">adelzaalouk</a>
    </div>
    <nav class="site-nav">
      {navItems.map(item => (
        <a href={item.href} class:list={[{ active: currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href)) }]}>
          {item.label}
        </a>
      ))}
    </nav>
  </div>
</header>

<style>
  .site-nav a.active {
    color: var(--accent);
  }
</style>
```

**Step 3: Create Footer component**

`src/components/Footer.astro`:
```astro
---
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <p>&copy; {year} Adel Zaalouk. All rights reserved.</p>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
        <span class="theme-toggle-dark">Light</span>
        <span class="theme-toggle-light">Dark</span>
      </button>
    </div>
  </div>
</footer>

<script>
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const darkSpan = toggle?.querySelector('.theme-toggle-dark') as HTMLElement;
    const lightSpan = toggle?.querySelector('.theme-toggle-light') as HTMLElement;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
    updateToggleText(theme);

    toggle?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateToggleText(next);
    });

    function updateToggleText(theme: string) {
      if (darkSpan && lightSpan) {
        darkSpan.style.display = theme === 'dark' ? 'inline' : 'none';
        lightSpan.style.display = theme === 'light' ? 'inline' : 'none';
      }
    }
  }

  initTheme();
  document.addEventListener('astro:after-swap', initTheme);
</script>

<style>
  .theme-toggle-light,
  .theme-toggle-dark {
    display: none;
  }
</style>
```

**Step 4: Commit**

```bash
git add src/components/BaseHead.astro src/components/Header.astro src/components/Footer.astro
git commit -m "feat: add base components (BaseHead, Header, Footer)"
```

---

## Task 7: Post Components

**Files:**
- Create: `src/components/PostCard.astro`
- Create: `src/components/TagList.astro`
- Create: `src/components/RelatedTags.astro`

**Step 1: Create PostCard component**

`src/components/PostCard.astro`:
```astro
---
import type { CollectionEntry } from 'astro:content';
import { formatDate } from '../utils/dates';
import { getPostUrl } from '../utils/posts';
import TagList from './TagList.astro';

interface Props {
  post: CollectionEntry<'posts'>;
}

const { post } = Astro.props;
const { title, date, type, tags, summary, linkUrl, linkTitle, source, sourceUrl } = post.data;
const url = getPostUrl(post);
---

<article class="post">
  <div class="post-meta">
    <span class="post-type">{type}</span>
    <time datetime={date.toISOString()}>{formatDate(date)}</time>
  </div>

  {type === 'link' && linkUrl ? (
    <h2 class="blogmark-link">
      <a href={linkUrl} target="_blank" rel="noopener">{linkTitle || title}</a>
    </h2>
  ) : (
    <h2 class="post-title">
      <a href={url}>{title}</a>
    </h2>
  )}

  {type === 'quote' && (
    <p class="quote-source">
      — {sourceUrl ? <a href={sourceUrl}>{source}</a> : source}
    </p>
  )}

  {summary && <p class="post-summary">{summary}</p>}

  <TagList tags={tags} />
</article>
```

**Step 2: Create TagList component**

`src/components/TagList.astro`:
```astro
---
interface Props {
  tags: string[];
}

const { tags } = Astro.props;
---

{tags.length > 0 && (
  <div class="tags-list">
    {tags.map(tag => (
      <a href={`/tags/${tag}/`} class="tag">{tag}</a>
    ))}
  </div>
)}
```

**Step 3: Create RelatedTags component**

`src/components/RelatedTags.astro`:
```astro
---
interface Props {
  currentTag: string;
  relatedTags: Array<{ tag: string; count: number }>;
}

const { currentTag, relatedTags } = Astro.props;
---

{relatedTags.length > 0 && (
  <aside class="related-tags">
    <h3>Related to {currentTag}</h3>
    <div class="related-tags-list">
      {relatedTags.map(({ tag, count }) => (
        <a href={`/tags/${tag}/`} class="tag">{tag} ({count})</a>
      ))}
    </div>
  </aside>
)}
```

**Step 4: Commit**

```bash
git add src/components/PostCard.astro src/components/TagList.astro src/components/RelatedTags.astro
git commit -m "feat: add post display components"
```

---

## Task 8: Layout Components

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/layouts/Post.astro`

**Step 1: Create Base layout**

`src/layouts/Base.astro`:
```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead title={title} description={description} />
  </head>
  <body>
    <Header />
    <main class="container">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

**Step 2: Create Post layout**

`src/layouts/Post.astro`:
```astro
---
import type { CollectionEntry } from 'astro:content';
import Base from './Base.astro';
import TagList from '../components/TagList.astro';
import Comments from '../components/Comments.astro';
import { formatDate } from '../utils/dates';

interface Props {
  post: CollectionEntry<'posts'>;
}

const { post } = Astro.props;
const { title, date, updated, type, tags, source, sourceUrl, linkUrl, linkTitle, via, viaUrl } = post.data;
const { Content } = await post.render();
---

<Base title={title} description={post.data.summary}>
  <article class="post-full" data-pagefind-body>
    <header>
      <div class="post-meta">
        <span class="post-type">{type}</span>
        <time datetime={date.toISOString()}>{formatDate(date)}</time>
        {updated && (
          <span class="post-updated">
            (updated <time datetime={updated.toISOString()}>{formatDate(updated)}</time>)
          </span>
        )}
      </div>

      {type === 'link' && linkUrl ? (
        <>
          <h1 class="blogmark-link">
            <a href={linkUrl} target="_blank" rel="noopener">{linkTitle || title}</a>
          </h1>
          {via && (
            <p class="blogmark-via">
              via {viaUrl ? <a href={viaUrl}>{via}</a> : via}
            </p>
          )}
        </>
      ) : (
        <h1 class="page-title">{title}</h1>
      )}

      {type === 'quote' && source && (
        <p class="quote-source">
          — {sourceUrl ? <a href={sourceUrl}>{source}</a> : source}
        </p>
      )}
    </header>

    <div class="prose">
      <Content />
    </div>

    <TagList tags={tags} />
  </article>

  <Comments />
</Base>

<style>
  .post-full {
    padding: var(--spacing-lg) 0;
  }

  .post-updated {
    color: var(--text-muted);
    font-style: italic;
  }
</style>
```

**Step 3: Commit**

```bash
git add src/layouts/Base.astro src/layouts/Post.astro
git commit -m "feat: add Base and Post layouts"
```

---

## Task 9: Search and Comments Components

**Files:**
- Create: `src/components/Search.astro`
- Create: `src/components/Comments.astro`

**Step 1: Create Search component**

`src/components/Search.astro`:
```astro
---
---

<div class="search-container" data-pagefind-ui>
  <input
    type="search"
    class="search-input"
    placeholder="Search posts..."
    id="search-input"
    aria-label="Search posts"
  />
  <div id="search-results" class="search-results"></div>
</div>

<script>
  async function initSearch() {
    const input = document.getElementById('search-input') as HTMLInputElement;
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    // @ts-ignore - Pagefind is loaded externally
    const pagefind = await import('/pagefind/pagefind.js');
    await pagefind.init();

    input.addEventListener('input', async (e) => {
      const query = (e.target as HTMLInputElement).value;
      if (!query) {
        results.innerHTML = '';
        return;
      }

      const search = await pagefind.search(query);
      const data = await Promise.all(search.results.slice(0, 10).map((r: any) => r.data()));

      results.innerHTML = data.map((item: any) => `
        <a href="${item.url}" class="search-result">
          <h3>${item.meta?.title || 'Untitled'}</h3>
          <p>${item.excerpt}</p>
        </a>
      `).join('');
    });
  }

  initSearch();
  document.addEventListener('astro:after-swap', initSearch);
</script>

<style>
  .search-container {
    max-width: 600px;
    margin: 0 auto;
  }

  .search-results {
    margin-top: var(--spacing-md);
  }

  .search-result {
    display: block;
    padding: var(--spacing-md);
    border: 1px solid var(--border);
    border-radius: 4px;
    margin-bottom: var(--spacing-sm);
    color: var(--text-primary);
  }

  .search-result:hover {
    border-color: var(--accent);
  }

  .search-result h3 {
    font-size: 1rem;
    margin-bottom: var(--spacing-xs);
  }

  .search-result p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }

  .search-result mark {
    background: var(--accent-muted);
    color: var(--text-primary);
  }
</style>
```

**Step 2: Create Comments component (Giscus)**

`src/components/Comments.astro`:
```astro
---
// Giscus comments component
// Configure at https://giscus.app/
---

<div class="giscus-container">
  <script
    src="https://giscus.app/client.js"
    data-repo="adelzaalouk/adelzaalouk-blog"
    data-repo-id=""
    data-category="Comments"
    data-category-id=""
    data-mapping="pathname"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="bottom"
    data-theme="dark"
    data-lang="en"
    crossorigin="anonymous"
    async
  ></script>
</div>

<style>
  .giscus-container {
    margin-top: var(--spacing-xl);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--border);
  }
</style>
```

**Step 3: Commit**

```bash
git add src/components/Search.astro src/components/Comments.astro
git commit -m "feat: add Search and Comments components"
```

---

## Task 10: Homepage and Post List Pages

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/pages/entries/index.astro`
- Create: `src/pages/links/index.astro`
- Create: `src/pages/quotes/index.astro`
- Create: `src/pages/notes/index.astro`

**Step 1: Create homepage**

`src/pages/index.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import PostCard from '../components/PostCard.astro';
import { getAllPosts } from '../utils/posts';

const posts = await getAllPosts();
---

<Base title="Home">
  <h1 class="page-title">Recent Posts</h1>
  <div class="posts-list">
    {posts.map(post => <PostCard post={post} />)}
  </div>
</Base>
```

**Step 2: Create entries list page**

`src/pages/entries/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { getPostsByType } from '../../utils/posts';

const posts = await getPostsByType('entry');
---

<Base title="Entries">
  <h1 class="page-title">Entries</h1>
  <p>Long-form blog posts and articles.</p>
  <div class="posts-list">
    {posts.map(post => <PostCard post={post} />)}
  </div>
</Base>
```

**Step 3: Create links list page**

`src/pages/links/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { getPostsByType } from '../../utils/posts';

const posts = await getPostsByType('link');
---

<Base title="Links">
  <h1 class="page-title">Links</h1>
  <p>Interesting links with commentary.</p>
  <div class="posts-list">
    {posts.map(post => <PostCard post={post} />)}
  </div>
</Base>
```

**Step 4: Create quotes list page**

`src/pages/quotes/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { getPostsByType } from '../../utils/posts';

const posts = await getPostsByType('quote');
---

<Base title="Quotes">
  <h1 class="page-title">Quotes</h1>
  <p>Quotations that inspire or provoke thought.</p>
  <div class="posts-list">
    {posts.map(post => <PostCard post={post} />)}
  </div>
</Base>
```

**Step 5: Create notes list page**

`src/pages/notes/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import { getPostsByType } from '../../utils/posts';

const posts = await getPostsByType('note');
---

<Base title="Notes">
  <h1 class="page-title">Notes</h1>
  <p>Short-form posts and quick thoughts.</p>
  <div class="posts-list">
    {posts.map(post => <PostCard post={post} />)}
  </div>
</Base>
```

**Step 6: Commit**

```bash
git add src/pages/index.astro src/pages/entries/ src/pages/links/ src/pages/quotes/ src/pages/notes/
git commit -m "feat: add homepage and content type list pages"
```

---

## Task 11: Tags Pages

**Files:**
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag].astro`

**Step 1: Create tags index page**

`src/pages/tags/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import { getAllPosts } from '../../utils/posts';
import { getAllTags } from '../../utils/tags';

const posts = await getAllPosts();
const tagsMap = getAllTags(posts);
const tags = [...tagsMap.entries()].sort((a, b) => b[1] - a[1]);
---

<Base title="Tags">
  <h1 class="page-title">Tags</h1>
  <div class="all-tags">
    {tags.map(([tag, count]) => (
      <a href={`/tags/${tag}/`} class="tag">{tag} ({count})</a>
    ))}
  </div>
</Base>

<style>
  .all-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .all-tags .tag {
    font-size: 0.875rem;
    padding: var(--spacing-sm) var(--spacing-md);
  }
</style>
```

**Step 2: Create dynamic tag page**

`src/pages/tags/[tag].astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import PostCard from '../../components/PostCard.astro';
import RelatedTags from '../../components/RelatedTags.astro';
import { getAllPosts, getPostsByTag } from '../../utils/posts';
import { getRelatedTags, getAllTags } from '../../utils/tags';

export async function getStaticPaths() {
  const posts = await getAllPosts();
  const tags = getAllTags(posts);

  return [...tags.keys()].map(tag => ({
    params: { tag },
  }));
}

const { tag } = Astro.params;
const allPosts = await getAllPosts();
const posts = await getPostsByTag(tag!);
const relatedTags = getRelatedTags(tag!, allPosts);
---

<Base title={`Posts tagged "${tag}"`}>
  <h1 class="page-title">Tagged: {tag}</h1>
  <p>{posts.length} post{posts.length === 1 ? '' : 's'}</p>

  <RelatedTags currentTag={tag!} relatedTags={relatedTags} />

  <div class="posts-list">
    {posts.map(post => <PostCard post={post} />)}
  </div>
</Base>
```

**Step 3: Commit**

```bash
git add src/pages/tags/
git commit -m "feat: add tags index and dynamic tag pages with related tags"
```

---

## Task 12: Individual Post Pages

**Files:**
- Create: `src/pages/[year]/[month]/[day]/[slug].astro`

**Step 1: Create dynamic post page with date-based URL**

`src/pages/[year]/[month]/[day]/[slug].astro`:
```astro
---
import Post from '../../../../layouts/Post.astro';
import { getAllPosts } from '../../../../utils/posts';

export async function getStaticPaths() {
  const posts = await getAllPosts();

  return posts.map(post => {
    const date = post.data.date;
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate().toString();
    const slug = post.id.split('/').pop()?.replace('.md', '') || post.id;

    return {
      params: { year, month, day, slug },
      props: { post },
    };
  });
}

const { post } = Astro.props;
---

<Post post={post} />
```

**Step 2: Commit**

```bash
git add "src/pages/[year]/[month]/[day]/[slug].astro"
git commit -m "feat: add dynamic post pages with date-based URLs"
```

---

## Task 13: Static Pages

**Files:**
- Create: `src/pages/search.astro`
- Create: `src/pages/about.astro`

**Step 1: Create search page**

`src/pages/search.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import Search from '../components/Search.astro';
---

<Base title="Search">
  <h1 class="page-title">Search</h1>
  <Search />
</Base>
```

**Step 2: Create about page**

`src/pages/about.astro`:
```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="About">
  <article class="prose" data-pagefind-body>
    <h1>About</h1>

    <p>
      Hi, I'm Adel Zaalouk. I'm a software engineer who writes about
      AI, Python, and software development.
    </p>

    <h2>This Blog</h2>

    <p>
      This blog is inspired by <a href="https://simonwillison.net">Simon Willison's blog</a>,
      featuring multiple content types:
    </p>

    <ul>
      <li><strong>Entries</strong> - Long-form blog posts</li>
      <li><strong>Links</strong> - Interesting links with commentary</li>
      <li><strong>Quotes</strong> - Quotations that inspire</li>
      <li><strong>Notes</strong> - Short-form thoughts</li>
    </ul>

    <h2>Contact</h2>

    <p>
      Find me on <a href="https://github.com/adelzaalouk">GitHub</a>
      or <a href="https://twitter.com/adelzaalouk">Twitter</a>.
    </p>
  </article>
</Base>
```

**Step 3: Commit**

```bash
git add src/pages/search.astro src/pages/about.astro
git commit -m "feat: add search and about pages"
```

---

## Task 14: RSS/Atom Feed

**Files:**
- Create: `src/pages/atom.xml.ts`

**Step 1: Create Atom feed endpoint**

`src/pages/atom.xml.ts`:
```typescript
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
```

**Step 2: Commit**

```bash
git add src/pages/atom.xml.ts
git commit -m "feat: add Atom/RSS feed"
```

---

## Task 15: Favicon and Final Setup

**Files:**
- Create: `public/favicon.ico`

**Step 1: Create a simple favicon placeholder**

Run:
```bash
# Create a simple 1x1 pixel ICO placeholder
# In production, replace with actual favicon
echo -n "" > public/favicon.ico
```

Note: Replace with actual favicon file before deployment.

**Step 2: Verify build works**

Run: `npm run build`
Expected: Build completes successfully, dist/ folder created

**Step 3: Test preview**

Run: `npm run preview`
Expected: Site accessible at localhost, all pages render correctly

**Step 4: Final commit**

```bash
git add public/
git commit -m "chore: add favicon placeholder and finalize setup"
```

---

## Task 16: Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: No errors, dist/ folder with HTML files

**Step 2: Check all pages exist**

Run: `ls dist/`
Expected: index.html, entries/, links/, quotes/, notes/, tags/, search/, about/, atom.xml

**Step 3: Test dev server**

Run: `npm run dev`
Expected:
- Homepage shows all posts
- Navigation works
- Theme toggle works
- Individual post pages work
- Tags pages show related tags
- Search page loads (Pagefind may need build first)

**Step 4: Final verification commit**

```bash
git add -A
git commit -m "chore: complete blog implementation" --allow-empty
```

---

## Summary

This plan implements the adelzaalouk blog with:

1. **Astro 5.x** with Content Layer API (modern, v6-ready)
2. **4 content types**: entries, links, quotes, notes
3. **Tag system** with related tags (Simon Willison style)
4. **Pagefind search** for static full-text search
5. **Giscus comments** via GitHub Discussions
6. **Black/red theme** (Technomist inspired) with dark/light toggle
7. **Date-based URLs** (`/2026/Jan/20/slug/`)
8. **Atom/RSS feed**

Total: 16 tasks, ~45 files created.
