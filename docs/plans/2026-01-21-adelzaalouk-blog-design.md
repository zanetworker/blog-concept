# adelzaalouk Blog - Design Document

**Date:** 2026-01-21
**Status:** Approved
**Author:** Claude (with user collaboration)

## Overview

A personal blog inspired by [Simon Willison's blog](https://simonwillison.net) with a black/red theme inspired by [The Technomist](https://thetechnomist.com). Built with Astro for long-term maintainability and zero-cost hosting.

## Goals

- Multiple content types (entries, links, quotes, notes)
- Tag-based content organization with related tags (Simon Willison style)
- Full-text search
- Comments system
- Dark/light theme toggle
- Fast, static site with minimal JavaScript
- Future-proof architecture (no refactoring needed for Astro 6)

## Tech Stack

| Component | Choice | Reasoning |
|-----------|--------|-----------|
| Framework | Astro 5.x (stable) | Content-focused, zero JS by default, v6-ready |
| Content | Content Layer API with `loader: glob()` | Modern syntax, not deprecated in v6 |
| Search | Pagefind + astro-pagefind | Static search, ~15kb, dev mode support |
| Comments | Giscus | GitHub Discussions, free, no ads |
| Hosting | Cloudflare Pages | Astro joined Cloudflare, first-class support |
| Styling | CSS with custom properties | Simple, no build step for styles |

## Project Structure

```
adelzaalouk-blog/
├── src/
│   ├── content/
│   │   └── config.ts              # Content collection schemas
│   ├── content-data/              # Markdown content files
│   │   ├── entries/               # Full blog posts
│   │   ├── links/                 # Blogmarks (link + commentary)
│   │   ├── quotes/                # Quotations
│   │   └── notes/                 # Short-form posts
│   ├── components/
│   │   ├── BaseHead.astro         # Common head elements
│   │   ├── Header.astro           # Site header + nav
│   │   ├── Footer.astro           # Site footer + theme toggle
│   │   ├── PostCard.astro         # Post preview card
│   │   ├── TagList.astro          # Tag display component
│   │   ├── RelatedTags.astro      # Related tags sidebar
│   │   ├── Search.astro           # Pagefind search component
│   │   └── Comments.astro         # Giscus wrapper
│   ├── layouts/
│   │   ├── Base.astro             # Base HTML layout
│   │   └── Post.astro             # Individual post layout
│   ├── pages/
│   │   ├── index.astro            # Homepage (all posts chronological)
│   │   ├── entries/index.astro    # Blog posts only
│   │   ├── links/index.astro      # Blogmarks only
│   │   ├── quotes/index.astro     # Quotations only
│   │   ├── notes/index.astro      # Notes only
│   │   ├── tags/index.astro       # All tags
│   │   ├── tags/[tag].astro       # Posts by tag + related tags
│   │   ├── [year]/[month]/[day]/[slug].astro  # Individual post
│   │   ├── search.astro           # Search page
│   │   ├── about.astro            # About page
│   │   └── atom.xml.ts            # RSS/Atom feed
│   ├── styles/
│   │   └── global.css             # Black/red theme
│   └── utils/
│       ├── tags.ts                # Related tags computation
│       ├── posts.ts               # Post querying helpers
│       └── dates.ts               # Date formatting
├── public/
│   └── favicon.ico
├── astro.config.mjs
├── pagefind.yml
├── package.json
└── tsconfig.json
```

## Content Schema

```typescript
// src/content/config.ts
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

## Content Examples

### Entry (Blog Post)
```markdown
---
title: "Building AI Applications with Python"
date: 2026-01-20
tags: ["ai", "python", "llm"]
type: entry
summary: "A deep dive into building AI applications..."
---

Your long-form content here...
```

### Link (Blogmark)
```markdown
---
title: "Interesting Article on AI"
date: 2026-01-20
tags: ["ai", "reading"]
type: link
linkUrl: "https://example.com/article"
linkTitle: "The Future of AI Development"
via: "@someone"
viaUrl: "https://twitter.com/someone"
---

My commentary on why this article is interesting...
```

### Quote
```markdown
---
title: ""
date: 2026-01-20
tags: ["wisdom", "programming"]
type: quote
source: "Alan Kay"
sourceUrl: "https://example.com/interview"
---

> The best way to predict the future is to invent it.

Context or commentary on this quote...
```

### Note
```markdown
---
title: ""
date: 2026-01-20
tags: ["til", "python"]
type: note
---

Just discovered you can use `python -m http.server` to quickly serve files...
```

## Related Tags Algorithm

```typescript
// src/utils/tags.ts
import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;

export function getRelatedTags(
  currentTag: string,
  allPosts: Post[],
  limit = 10
): Array<{ tag: string; count: number }> {
  // Get all posts with the current tag
  const postsWithTag = allPosts.filter(
    post => !post.data.draft && post.data.tags.includes(currentTag)
  );

  // Count co-occurring tags
  const tagCounts = new Map<string, number>();

  for (const post of postsWithTag) {
    for (const tag of post.data.tags) {
      if (tag !== currentTag) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  // Sort by count and return top N
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

## Theme (Black/Red - Technomist Inspired)

```css
/* src/styles/global.css */
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

.post-title {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-sm);
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

/* Code */
pre {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow-x: auto;
  padding: var(--spacing-md);
  font-family: var(--font-mono);
  font-size: 0.875rem;
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
```

## URL Structure

| Path | Description |
|------|-------------|
| `/` | Homepage - all posts chronologically |
| `/entries/` | Blog posts only |
| `/links/` | Blogmarks only |
| `/quotes/` | Quotations only |
| `/notes/` | Notes only |
| `/tags/` | All tags with counts |
| `/tags/[tag]/` | Posts with tag + related tags |
| `/2026/Jan/20/slug/` | Individual post (Simon's date format) |
| `/search/` | Search page |
| `/about/` | About page |
| `/atom.xml` | RSS/Atom feed |

## Dependencies

```json
{
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.0.0",
    "astro-pagefind": "^1.0.0"
  },
  "devDependencies": {
    "pagefind": "^1.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Configuration Files

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://adelzaalouk.com',
  integrations: [
    sitemap(),
    pagefind(), // Must be last
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
```

### pagefind.yml
```yaml
site: dist
glob: "**/*.html"
exclude_selectors:
  - "nav"
  - "footer"
  - ".giscus"
```

## Deployment

**Cloudflare Pages:**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Node version: 22.x

**Build script (package.json):**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

## Deferred Features (Future)

- Tag intersections (`/tags/a+b/`)
- Random post redirects (`/random/tag/`)
- Monthly newsletter
- Feed stats tracking
- Series support

## Migration Path to Astro 6

When Astro 6 is stable:
1. Update Node to 22+
2. Update astro package
3. No content collection changes needed (already using modern syntax)
4. Test and deploy

---

## Approval

- [x] Stack: Astro 5.x with Content Layer API
- [x] Search: Pagefind
- [x] Comments: Giscus
- [x] Hosting: Cloudflare Pages
- [x] Theme: Black/red (Technomist inspired)
- [x] Features: Tags + related tags (Simon style)
