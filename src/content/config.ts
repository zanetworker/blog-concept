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
    cover: z.string().optional(), // Cover image path
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
