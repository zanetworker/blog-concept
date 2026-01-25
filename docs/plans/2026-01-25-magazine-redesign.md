# Magazine View Redesign

## Overview

Redesign the homepage magazine view to match a cleaner, borderless aesthetic inspired by Substack. Remove card backgrounds, add automatic image extraction from posts, and implement a three-section layout.

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  HERO POST (full-width)                             │
│  ┌──────────────────┬──────────────────────────────┐│
│  │ Title            │                              ││
│  │ Summary          │         IMAGE                ││
│  │ #tags            │      (gradient overlay)      ││
│  │ [READ MORE →]    │                              ││
│  └──────────────────┴──────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│  MOST POPULAR                            VIEW ALL → │
│  ┌───────────┬─────┐ ┌───────────┬─────┐ ...        │
│  │Title      │ img │ │Title      │ img │            │
│  │Date       │     │ │Date       │     │            │
│  └───────────┴─────┘ └───────────┴─────┘            │
├─────────────────────────────────────────────────────┤
│  LONG READS                                         │
│  ┌─────────────────────────────────┬───────────────┐│
│  │ Title                           │               ││
│  │ Summary text here...            │     IMAGE     ││
│  │ Date · #tags                    │               ││
│  └─────────────────────────────────┴───────────────┘│
└─────────────────────────────────────────────────────┘
```

## Image Extraction Logic

1. Check frontmatter `cover` field first
2. If not set, parse markdown content for first image (`![alt](path)` or `<img>`)
3. If no images found, return null (display without image)

Utility function: `getPostImage(post)` in `src/utils/posts.ts`

## Styling

### Colors & Backgrounds
- Cards: No background, no border (transparent)
- Page background: `#000000` (--bg-primary)
- Hero image: Gradient overlay from left (black → transparent)

### Typography

| Element | Size | Color |
|---------|------|-------|
| Hero title | 2.5rem | White |
| Hero summary | 1.1rem | --text-secondary |
| Row item title | 0.95rem | White |
| Row item date | 0.8rem | --text-muted |
| List item title | 1.25rem | White |
| List item summary | 0.95rem | --text-secondary |

### Thumbnails
- Row items: 80×80px square, border-radius 4px
- List items: 160×120px, border-radius 4px
- Object-fit: cover

### Hover States
- Title: color shifts to --accent (red)
- Image: subtle scale (1.02)

## Components

### New Components
- `PostHero.astro` - Full-width hero with text overlay on image
- `PostRowItem.astro` - Compact item for horizontal row
- `PostListItem.astro` - Larger list item for vertical section

### Removed Components
- `PostCardFeatured.astro` - Replaced by PostHero
- `PostCardGrid.astro` - Replaced by PostRowItem/PostListItem

### Modified Files
- `src/utils/posts.ts` - Add getPostImage() function
- `src/pages/index.astro` - New layout with 3 sections
- `src/styles/global.css` - Remove card background styles

## Post Distribution
- Hero: 1 post (most recent)
- Most Popular row: 4 posts
- Long Reads: remaining posts

## Section Headers
- "Most Popular" with "VIEW ALL →" link to /entries/
- "Long Reads" section title
