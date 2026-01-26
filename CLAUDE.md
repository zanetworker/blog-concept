# Blog Project Context

## Overview
Personal blog built with Astro, deployed on Netlify. Features entries (blog posts), highlights (quotes/notes extracted from entries), and curated links.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs content extraction first via prebuild)
- `npm run extract` - Extract quotes, notes, and links from entries

## Project Structure
```
src/
├── content-data/
│   ├── entries/      # Blog posts (markdown)
│   ├── quotes/       # Extracted quotes from entries
│   ├── notes/        # Extracted notes ([!note] blocks)
│   └── links/        # Curated links with attribution
├── components/       # Astro components
├── pages/            # Route pages
└── utils/            # Helper functions
```

## Content Extraction System
The `scripts/extract-content.js` script automatically extracts from entries:
- **Quotes**: Blockquotes with `— Author` attribution
- **Notes**: `[!note]` or `[!til]` blocks
- **Links**: From frontmatter `links:` array

Extracted content appears in the Highlights section of the site.

## Key Architectural Decisions
- Navigation order: Entries, Highlights, Links, About
- Highlights combines quotes and notes into one section
- Content extraction runs automatically during build (prebuild hook)
- Using Pagefind for client-side search

## Deployment
- Hosted on Netlify (auto-deploys from main branch)
- Config in `netlify.toml`
- Custom domain configured in Netlify dashboard

## Entry Frontmatter Format
```yaml
---
title: "Post Title"
date: 2026-01-20
tags: ["tag1", "tag2"]
type: entry
summary: "Brief description"
cover: "https://..."  # Optional cover image
quotes:
  - text: "Quote text"
    source: "Author"
    sourceUrl: "https://..."
links:
  - url: "https://..."
    title: "Link Title"
    via: "@handle"
---
```
