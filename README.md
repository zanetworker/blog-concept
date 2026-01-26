# adelzaalouk Blog

A personal blog built with Astro 5.x featuring multiple content types, tag-based organization, full-text search, and a dark theme inspired by The Technomist.

## Features

- **Multiple Content Types** - Entries (long-form posts), Links (blogmarks), and Highlights (quotes & notes)
- **Tag System** - Tag-based organization with related tags sidebar 
- **Full-Text Search** - Static search powered by Pagefind
- **Comments** - GitHub Discussions integration via Giscus
- **Dark/Light Theme** - Black/red theme with toggle support
- **Table of Contents** - Collapsible TOC for long posts with scroll tracking
- **RSS Feed** - Atom feed for subscribers
- **Date-Based URLs** - Clean URLs like `/2026/Jan/20/post-slug/`

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | [Astro 5.x](https://astro.build) with Content Layer API |
| Search | [Pagefind](https://pagefind.app) via astro-pagefind |
| Comments | [Giscus](https://giscus.app) (GitHub Discussions) |
| Styling | CSS Custom Properties (no framework) |
| Syntax Highlighting | Shiki (github-dark theme) |
| Sitemap | @astrojs/sitemap |
| Language | TypeScript |

## Project Structure

```
src/
├── components/          # Astro components
│   ├── BaseHead.astro   # HTML head with meta tags
│   ├── Header.astro     # Site navigation
│   ├── Footer.astro     # Footer with theme toggle
│   ├── PostCard.astro   # Post preview card
│   ├── QuoteCard.astro  # Quote display card
│   ├── NoteCard.astro   # Note display card
│   ├── TableOfContents.astro  # Collapsible TOC
│   ├── TagList.astro    # Tag display
│   ├── RelatedTags.astro      # Related tags sidebar
│   ├── Search.astro     # Pagefind search UI
│   ├── Comments.astro   # Giscus integration
│   └── Recommended.astro      # Recommended posts sidebar
scripts/
└── extract-content.js   # Auto-extract quotes, notes, links from entries
├── content/
│   └── config.ts        # Content collection schema
├── content-data/        # Markdown content
│   ├── entries/         # Blog posts
│   ├── links/           # Blogmarks/links
│   ├── quotes/          # Quotations
│   └── notes/           # Short notes
├── layouts/
│   ├── Base.astro       # Base HTML layout
│   ├── Post.astro       # Single post layout
│   └── Listing.astro    # List page layout
├── pages/               # Route pages
│   ├── index.astro      # Homepage
│   ├── entries/         # Entries listing
│   ├── links/           # Links listing
│   ├── highlights/      # Quotes & notes listing
│   ├── tags/            # Tag pages
│   ├── search.astro     # Search page
│   ├── about.astro      # About page
│   └── [year]/[month]/[day]/[slug].astro  # Post pages
├── styles/
│   └── global.css       # Global styles and theme
└── utils/
    ├── posts.ts         # Post fetching utilities
    ├── tags.ts          # Tag utilities
    └── dates.ts         # Date formatting
```

## Content Schema

All content types use a unified schema with type-specific fields:

```typescript
{
  title: string;
  date: Date;
  updated?: Date;
  tags: string[];
  type: 'entry' | 'link' | 'quote' | 'note';
  draft?: boolean;
  summary?: string;           // For entries
  linkUrl?: string;           // For links
  linkTitle?: string;         // For links
  via?: string;               // For links (attribution)
  viaUrl?: string;            // For links
  source?: string;            // For quotes (author)
  sourceUrl?: string;         // For quotes (author link)
  sourceEntry?: string;       // For extracted content (source file)
  sourceEntryTitle?: string;  // For extracted content (source post title)
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/zanetworker/blog-concept.git
cd blog-concept

# Install dependencies
npm install
```

### Development

```bash
# Start dev server
npm run dev
```

The site will be available at `http://localhost:4321`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built site will be in the `dist/` directory.

## Creating Content

### Blog Entry

Create a file in `src/content-data/entries/`:

```markdown
---
title: "My Blog Post"
date: 2026-01-25
tags: ["topic", "another-topic"]
type: entry
summary: "A brief summary of the post"
---

Your content here...
```

### Link (Blogmark)

Create a file in `src/content-data/links/`:

```markdown
---
title: "Interesting Article"
date: 2026-01-25
tags: ["reading"]
type: link
linkUrl: "https://example.com/article"
linkTitle: "The Article Title"
via: "@someone"
viaUrl: "https://twitter.com/someone"
---

Your commentary on the link...
```

### Quote

Create a file in `src/content-data/quotes/`:

```markdown
---
title: "Famous Quote"
date: 2026-01-25
tags: ["wisdom"]
type: quote
source: "Author Name"
sourceUrl: "https://example.com/author"
---

> The quoted text here.

Your thoughts on the quote...
```

### Note

Create a file in `src/content-data/notes/`:

```markdown
---
title: "TIL: Something Cool"
date: 2026-01-25
tags: ["til"]
type: note
---

Short-form content here...
```

## Content Extraction

The blog includes an automatic content extraction system that detects quotes and notes from your blog entries and creates separate posts for them.

### How It Works

When you run `npm run build` (or `npm run extract`), the extraction script scans all entries for:

**Quotes** - Any blockquote in your content:
```markdown
> The best way to predict the future is to invent it.
— Alan Kay
```

Quotes with an attribution line (— Author) will show the author. Quotes without attribution are still extracted and link back to the source post.

**Notes** - Content marked with `[!note]` or `[!til]`:
```markdown
[!note] The pattern of "prompt chaining" breaks complex tasks into smaller steps.

[!til] You can use asyncio.gather() to run multiple API calls concurrently.
```

**Links** - Defined in frontmatter:
```markdown
---
links:
  - url: "https://example.com"
    title: "Article Title"
    via: "@author"
---
```

### Extracted Content

Extracted quotes and notes automatically:
- Appear on the `/highlights/` page
- Link back to their source post ("from: Post Title")
- Inherit tags from the source post
- Are tracked to avoid duplicates

### Running Extraction

```bash
# Run extraction manually
npm run extract

# Extraction runs automatically before build
npm run build
```

The extraction state is tracked in `.extracted-content.json` (gitignored).

## Configuration

### Site Settings

Edit `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://your-domain.com',
  // ...
});
```

### Giscus Comments

1. Set up Giscus at https://giscus.app
2. Update `src/components/Comments.astro` with your repo details:

```astro
<script
  data-repo="your-username/your-repo"
  data-repo-id="YOUR_REPO_ID"
  data-category="Comments"
  data-category-id="YOUR_CATEGORY_ID"
  ...
></script>
```

### Theme Colors

Edit CSS custom properties in `src/styles/global.css`:

```css
:root {
  --bg-primary: #000000;
  --accent: #FF3131;
  /* ... */
}
```

## Deployment

The site is optimized for static hosting. Recommended platforms:

- **Cloudflare Pages** - Connect your GitHub repo for automatic deployments
- **Vercel** - Zero-config Astro support
- **Netlify** - Automatic builds on push

Build command: `npm run build`
Output directory: `dist`

## License

MIT

## Acknowledgments

- Theme colors inspired by [The Technomist](https://thetechnomist.substack.com)
- Built with [Astro](https://astro.build)
