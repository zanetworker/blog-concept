#!/usr/bin/env node

/**
 * Auto-extract quotes, links, and notes from blog entries
 *
 * QUOTES - Auto-detected patterns:
 *   > The best way to predict the future is to invent it.
 *   — Alan Kay
 *
 *   Or with explicit marker:
 *   > [!quote] Text here
 *   — Author
 *
 * NOTES - Detected with markers:
 *   [!note] This is a short insight or observation.
 *
 *   [!til] Today I learned that...
 *
 * LINKS - Frontmatter only:
 *   links:
 *     - url: "https://example.com"
 *       title: "Title"
 *       via: "@author"
 *
 * Run: npm run extract
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENTRIES_DIR = path.join(__dirname, '../src/content-data/entries');
const QUOTES_DIR = path.join(__dirname, '../src/content-data/quotes');
const LINKS_DIR = path.join(__dirname, '../src/content-data/links');
const NOTES_DIR = path.join(__dirname, '../src/content-data/notes');
const EXTRACTED_LOG = path.join(__dirname, '../.extracted-content.json');

// Ensure directories exist
[QUOTES_DIR, LINKS_DIR, NOTES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Load previously extracted content to avoid duplicates
function loadExtractedLog() {
  try {
    return JSON.parse(fs.readFileSync(EXTRACTED_LOG, 'utf-8'));
  } catch {
    return { quotes: [], links: [], notes: [] };
  }
}

function saveExtractedLog(log) {
  fs.writeFileSync(EXTRACTED_LOG, JSON.stringify(log, null, 2));
}

// Parse frontmatter from markdown
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatterStr = match[1];
  const body = match[2];

  let frontmatter = {};
  try {
    frontmatter = parseSimpleYaml(frontmatterStr);
  } catch (e) {
    console.warn('Failed to parse frontmatter:', e.message);
  }

  return { frontmatter, body };
}

// Simple YAML parser
function parseSimpleYaml(yamlStr) {
  const result = {};
  const lines = yamlStr.split('\n');
  let currentKey = null;
  let currentArray = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;

      if (currentKey && currentArray) {
        result[currentKey] = currentArray;
        currentArray = null;
      }

      if (value === '' || value === '[]') {
        currentKey = key;
        currentArray = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        const items = value.slice(1, -1).split(',').map(v =>
          v.trim().replace(/^["']|["']$/g, '')
        );
        result[key] = items;
      } else {
        result[key] = value.replace(/^["']|["']$/g, '');
      }
      continue;
    }

    const arrayItemMatch = line.match(/^\s+-\s+(.+)$/);
    if (arrayItemMatch && currentKey) {
      const itemContent = arrayItemMatch[1];

      if (itemContent.includes(':')) {
        const obj = {};
        const parts = itemContent.split(/\s+(?=\w+:)/);
        for (const part of parts) {
          const kv = part.match(/^(\w+):\s*["']?(.+?)["']?$/);
          if (kv) obj[kv[1]] = kv[2];
        }

        let j = i + 1;
        while (j < lines.length && lines[j].match(/^\s{4,}\w+:/)) {
          const contMatch = lines[j].match(/^\s+(\w+):\s*["']?(.+?)["']?$/);
          if (contMatch) obj[contMatch[1]] = contMatch[2];
          j++;
        }
        i = j - 1;

        if (!currentArray) currentArray = [];
        currentArray.push(obj);
      } else {
        if (!currentArray) currentArray = [];
        currentArray.push(itemContent.replace(/^["']|["']$/g, ''));
      }
    }
  }

  if (currentKey && currentArray) {
    result[currentKey] = currentArray;
  }

  return result;
}

// Clean text from markdown formatting
function cleanText(text) {
  return text
    .replace(/\*\*/g, '')      // Bold
    .replace(/\*/g, '')        // Italic
    .replace(/_/g, '')         // Underscores (italic)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links -> text only
    .replace(/`/g, '')         // Code
    .trim();
}

// Extract quotes with attribution from markdown body
function extractQuotesFromBody(body, sourceFile) {
  const quotes = [];

  // Pattern: blockquote (optionally with [!quote] marker) followed by attribution
  // > [!quote] Quote text here
  // — Author Name
  // OR
  // > Quote text here
  // — Author Name
  const quotePattern = /(?:^|\n)((?:>\s*(?:\[!quote\]\s*)?.+\n?)+)\n*(?:—|–|-{1,2})\s*([^\n\[]+?)(?:\n|$)/gm;

  let match;
  while ((match = quotePattern.exec(body)) !== null) {
    const quoteLines = match[1].split('\n')
      .map(line => line.replace(/^>\s*/, '').replace(/\[!quote\]\s*/i, '').trim())
      .filter(line => line.length > 0);

    const quoteText = cleanText(quoteLines.join(' '));
    const attribution = cleanText(match[2]);

    // Validate: reasonable quote length, clear human attribution
    // Reject if attribution looks like a URL, ID, code, or footnote
    const isValidAttribution =
      attribution.length > 2 &&
      attribution.length < 60 &&
      !attribution.match(/^http/i) &&           // Not a URL
      !attribution.match(/^\d+$/) &&            // Not just numbers
      !attribution.match(/^[a-f0-9]{6,}$/i) &&  // Not a hex ID
      !attribution.match(/\)$/) &&              // Doesn't end with )
      !attribution.match(/\]$/) &&              // Doesn't end with ]
      !attribution.match(/^[^a-zA-Z]*$/) &&     // Must contain letters
      attribution.match(/^[A-Z]/) &&            // Starts with capital letter
      !attribution.match(/[<>{}|\\]/) &&        // No code/special chars
      !attribution.match(/\.(com|org|net|io)/i); // Not a domain

    if (quoteText.length > 20 && isValidAttribution) {
      quotes.push({
        text: quoteText,
        source: attribution,
        sourceFile
      });
    }
  }

  return quotes;
}

// Extract notes with [!note] or [!til] markers
function extractNotesFromBody(body, sourceFile) {
  const notes = [];

  // Pattern: [!note] or [!til] followed by text (can be multiline until double newline)
  const notePattern = /\[!(note|til)\]\s*(.+?)(?=\n\n|\n\[!|\n#|$)/gis;

  let match;
  while ((match = notePattern.exec(body)) !== null) {
    const noteType = match[1].toLowerCase(); // 'note' or 'til'
    const noteText = cleanText(match[2].replace(/\n/g, ' '));

    if (noteText.length > 10 && noteText.length < 500) {
      notes.push({
        text: noteText,
        type: noteType,
        sourceFile
      });
    }
  }

  return notes;
}

// Extract quotes from frontmatter
function extractQuotesFromFrontmatter(frontmatter, sourceFile) {
  const quotes = [];

  if (frontmatter.quotes && Array.isArray(frontmatter.quotes)) {
    for (const quote of frontmatter.quotes) {
      if (typeof quote === 'object' && quote.text && quote.source) {
        quotes.push({
          text: quote.text,
          source: quote.source,
          sourceUrl: quote.sourceUrl || '',
          sourceFile
        });
      }
    }
  }

  return quotes;
}

// Extract links from frontmatter
function extractLinksFromFrontmatter(frontmatter, sourceFile) {
  const links = [];

  if (frontmatter.links && Array.isArray(frontmatter.links)) {
    for (const link of frontmatter.links) {
      if (typeof link === 'object' && link.url) {
        links.push({
          url: link.url,
          title: link.title || '',
          via: link.via || '',
          viaUrl: link.viaUrl || '',
          sourceFile
        });
      } else if (typeof link === 'string' && link.startsWith('http')) {
        links.push({ url: link, title: '', via: '', sourceFile });
      }
    }
  }

  return links;
}

// Generate slug from text
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

// Create quote file
function createQuoteFile(quote, date, tags) {
  const slug = slugify(quote.text.slice(0, 40));
  const filename = `${slug}.md`;
  const filepath = path.join(QUOTES_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  ⏭️  Quote exists: ${filename}`);
    return null;
  }

  const sourceUrlLine = quote.sourceUrl ? `\nsourceUrl: "${quote.sourceUrl}"` : '';

  const content = `---
title: "${quote.source}"
date: ${date}
tags: ${JSON.stringify(tags.length ? tags : ['wisdom'])}
type: quote
source: "${quote.source}"${sourceUrlLine}
---

> ${quote.text}

_Extracted from: ${quote.sourceFile}_
`;

  fs.writeFileSync(filepath, content);
  console.log(`  ✅ Created quote: ${filename}`);
  return filename;
}

// Create link file
function createLinkFile(link, date, tags) {
  const title = link.title || new URL(link.url).hostname;
  const slug = slugify(title);
  const filename = `${slug}.md`;
  const filepath = path.join(LINKS_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  ⏭️  Link exists: ${filename}`);
    return null;
  }

  const viaSection = link.via ? `\nvia: "${link.via}"` : '';
  const viaUrlSection = link.viaUrl ? `\nviaUrl: "${link.viaUrl}"` : '';

  const content = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
tags: ${JSON.stringify(tags.length ? tags : ['reading'])}
type: link
linkUrl: "${link.url}"
linkTitle: "${title.replace(/"/g, '\\"')}"${viaSection}${viaUrlSection}
---

_Extracted from: ${link.sourceFile}_
`;

  fs.writeFileSync(filepath, content);
  console.log(`  ✅ Created link: ${filename}`);
  return filename;
}

// Create note file
function createNoteFile(note, date, tags) {
  const slug = slugify(note.text.slice(0, 40));
  const filename = `${slug}.md`;
  const filepath = path.join(NOTES_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  ⏭️  Note exists: ${filename}`);
    return null;
  }

  const titlePrefix = note.type === 'til' ? 'TIL: ' : '';
  const noteTags = note.type === 'til' ? ['til', ...tags] : tags;

  const content = `---
title: "${titlePrefix}${note.text.slice(0, 50).replace(/"/g, '\\"')}${note.text.length > 50 ? '...' : ''}"
date: ${date}
tags: ${JSON.stringify(noteTags.length ? noteTags : ['note'])}
type: note
---

${note.text}

_Extracted from: ${note.sourceFile}_
`;

  fs.writeFileSync(filepath, content);
  console.log(`  ✅ Created note: ${filename}`);
  return filename;
}

// Main extraction function
async function extract() {
  console.log('🔍 Scanning entries for quotes, links, and notes...\n');

  const log = loadExtractedLog();
  if (!log.notes) log.notes = []; // Migrate old logs

  const entries = fs.readdirSync(ENTRIES_DIR).filter(f => f.endsWith('.md'));

  let totalQuotes = 0;
  let totalLinks = 0;
  let totalNotes = 0;

  for (const entry of entries) {
    const filepath = path.join(ENTRIES_DIR, entry);
    const content = fs.readFileSync(filepath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    const date = frontmatter.date || new Date().toISOString().split('T')[0];
    const tags = frontmatter.tags || [];

    // === QUOTES ===
    const bodyQuotes = extractQuotesFromBody(body, entry);
    const fmQuotes = extractQuotesFromFrontmatter(frontmatter, entry);
    const quotes = [...bodyQuotes, ...fmQuotes];

    for (const quote of quotes) {
      const quoteId = `${entry}:${quote.text.slice(0, 50)}`;
      if (!log.quotes.includes(quoteId)) {
        console.log(`📜 Quote in ${entry}:`);
        console.log(`   "${quote.text.slice(0, 50)}..." — ${quote.source}`);
        const created = createQuoteFile(quote, date, tags);
        if (created) {
          log.quotes.push(quoteId);
          totalQuotes++;
        }
      }
    }

    // === NOTES ===
    const notes = extractNotesFromBody(body, entry);
    for (const note of notes) {
      const noteId = `${entry}:${note.text.slice(0, 50)}`;
      if (!log.notes.includes(noteId)) {
        console.log(`📝 ${note.type.toUpperCase()} in ${entry}:`);
        console.log(`   "${note.text.slice(0, 60)}..."`);
        const created = createNoteFile(note, date, tags);
        if (created) {
          log.notes.push(noteId);
          totalNotes++;
        }
      }
    }

    // === LINKS ===
    const links = extractLinksFromFrontmatter(frontmatter, entry);
    for (const link of links) {
      const linkId = `${entry}:${link.url}`;
      if (!log.links.includes(linkId)) {
        console.log(`🔗 Link in ${entry}:`);
        console.log(`   ${link.title || link.url}`);
        const created = createLinkFile(link, date, tags);
        if (created) {
          log.links.push(linkId);
          totalLinks++;
        }
      }
    }
  }

  saveExtractedLog(log);

  console.log(`\n✨ Extraction complete!`);
  console.log(`   📜 Quotes: ${totalQuotes}`);
  console.log(`   📝 Notes: ${totalNotes}`);
  console.log(`   🔗 Links: ${totalLinks}`);

  if (totalQuotes + totalNotes + totalLinks === 0) {
    console.log(`\n💡 Patterns to trigger extraction:\n`);
    console.log(`   QUOTES (attribution line):`);
    console.log(`   > The future is already here.`);
    console.log(`   — William Gibson\n`);
    console.log(`   NOTES (marker):`);
    console.log(`   [!note] Short insight or observation here.\n`);
    console.log(`   [!til] Today I learned something interesting.\n`);
    console.log(`   LINKS (frontmatter):`);
    console.log(`   links:`);
    console.log(`     - url: "https://example.com"`);
    console.log(`       title: "Article Title"`);
  }
}

extract().catch(console.error);
