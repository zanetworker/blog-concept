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

// Extract quotes from any blockquote in markdown body
function extractQuotesFromBody(body, sourceFile) {
  const quotes = [];

  // Pattern 1: blockquote followed by attribution line (— Author)
  const quoteWithAttrPattern = /(?:^|\n)((?:>\s*(?:\[!quote\]\s*)?.+\n?)+)\n*(?:—|–|-{1,2})\s*([^\n\[]+?)(?:\n|$)/gm;

  // Pattern 2: any blockquote (without attribution)
  const anyBlockquotePattern = /(?:^|\n)((?:>\s*.+\n?)+)/gm;

  const processedTexts = new Set();

  // First, extract quotes WITH attribution
  let match;
  while ((match = quoteWithAttrPattern.exec(body)) !== null) {
    const quoteLines = match[1].split('\n')
      .map(line => line.replace(/^>\s*/, '').replace(/\[!quote\]\s*/i, '').trim())
      .filter(line => line.length > 0);

    const quoteText = cleanText(quoteLines.join(' '));
    const attribution = cleanText(match[2]);

    // Validate attribution
    const isValidAttribution =
      attribution.length > 2 &&
      attribution.length < 60 &&
      !attribution.match(/^http/i) &&
      !attribution.match(/^\d+$/) &&
      !attribution.match(/^[a-f0-9]{6,}$/i) &&
      !attribution.match(/\)$/) &&
      !attribution.match(/\]$/) &&
      !attribution.match(/^[^a-zA-Z]*$/) &&
      attribution.match(/^[A-Z]/) &&
      !attribution.match(/[<>{}|\\]/) &&
      !attribution.match(/\.(com|org|net|io)/i);

    if (quoteText.length > 20 && isValidAttribution) {
      quotes.push({
        text: quoteText,
        source: attribution,
        sourceFile
      });
      processedTexts.add(quoteText);
    }
  }

  // Then, extract any remaining blockquotes (without attribution)
  while ((match = anyBlockquotePattern.exec(body)) !== null) {
    const quoteLines = match[1].split('\n')
      .map(line => line.replace(/^>\s*/, '').replace(/\[!quote\]\s*/i, '').trim())
      .filter(line => line.length > 0);

    const quoteText = cleanText(quoteLines.join(' '));

    // Skip if already processed with attribution, too short, or looks like a note/tip
    if (processedTexts.has(quoteText)) continue;
    if (quoteText.length < 20) continue;
    if (quoteText.match(/^\[!(note|tip|warning|info|til)\]/i)) continue;

    quotes.push({
      text: quoteText,
      source: '', // No attribution
      sourceFile
    });
    processedTexts.add(quoteText);
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

// Extract inline markdown links from body
function extractLinksFromBody(body, sourceFile) {
  const links = [];
  const seenUrls = new Set();

  // Pattern: [title](url) - but not images ![alt](url)
  const linkPattern = /(?<!!)\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

  // Domains to skip (internal, images, substackcdn, etc.)
  const skipDomains = [
    'substackcdn.com',
    'substack-post-media.s3.amazonaws.com',
    'thetechnomist.com',  // Skip self-references
  ];

  // URL patterns to skip
  const skipPatterns = [
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i,  // Images
    /\/image\//i,  // Image paths
    /utm_source=/i,  // Tracking links
    /\?action=share/i,  // Share links
  ];

  let match;
  while ((match = linkPattern.exec(body)) !== null) {
    const title = match[1].trim();
    const url = match[2].trim();

    // Skip if already seen
    if (seenUrls.has(url)) continue;

    // Skip if matches skip patterns
    if (skipPatterns.some(pattern => pattern.test(url))) continue;

    // Skip if from skip domains
    try {
      const hostname = new URL(url).hostname;
      if (skipDomains.some(domain => hostname.includes(domain))) continue;
    } catch {
      continue; // Invalid URL
    }

    // Skip very short or generic titles
    if (title.length < 4) continue;

    // Skip generic single-word or very short titles
    const genericTitles = [
      'here', 'link', 'this', 'click', 'post', 'paper', 'book', 'article',
      'documentation', 'docs', 'wiki', 'source', 'code', 'yaml', 'json',
      'linkedin', 'twitter', 'github', 'google', 'slack', 'medium',
      'blog', 'website', 'site', 'page', 'read', 'more', 'see', 'view',
      'specification', 'spec', 'reference', 'guide', 'tutorial',
      'intelligent', 'autonomously', 'learning', 'knowledge', 'system',
      'state', 'firm', 'biome', 'cockpit', 'thermostat', 'newer'
    ];
    if (genericTitles.some(g => title.toLowerCase() === g)) continue;

    // Skip titles that are just formatting artifacts
    if (/^\*+/.test(title)) continue;  // Starts with asterisks
    if (/^\[/.test(title)) continue;   // Starts with bracket
    if (/^["']/.test(title)) continue; // Starts with quote

    seenUrls.add(url);
    links.push({
      url,
      title,
      via: '',
      viaUrl: '',
      sourceFile
    });
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
function createQuoteFile(quote, date, tags, sourceTitle) {
  const slug = slugify(quote.text.slice(0, 40));
  const filename = `${slug}.md`;
  const filepath = path.join(QUOTES_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  ⏭️  Quote exists: ${filename}`);
    return null;
  }

  const title = quote.source || 'Quote';
  const sourceLine = quote.source ? `\nsource: "${quote.source}"` : '';
  const sourceUrlLine = quote.sourceUrl ? `\nsourceUrl: "${quote.sourceUrl}"` : '';
  const sourceEntryLine = `\nsourceEntry: "${quote.sourceFile}"`;
  const sourceEntryTitleLine = sourceTitle ? `\nsourceEntryTitle: "${sourceTitle.replace(/"/g, '\\"')}"` : '';

  const content = `---
title: "${title}"
date: ${date}
tags: ${JSON.stringify(tags.length ? tags : ['wisdom'])}
type: quote${sourceLine}${sourceUrlLine}${sourceEntryLine}${sourceEntryTitleLine}
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
function createNoteFile(note, date, tags, sourceTitle) {
  const slug = slugify(note.text.slice(0, 40));
  const filename = `${slug}.md`;
  const filepath = path.join(NOTES_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`  ⏭️  Note exists: ${filename}`);
    return null;
  }

  const titlePrefix = note.type === 'til' ? 'TIL: ' : '';
  const noteTags = note.type === 'til' ? ['til', ...tags] : tags;
  const sourceEntryLine = `\nsourceEntry: "${note.sourceFile}"`;
  const sourceEntryTitleLine = sourceTitle ? `\nsourceEntryTitle: "${sourceTitle.replace(/"/g, '\\"')}"` : '';

  const content = `---
title: "${titlePrefix}${note.text.slice(0, 50).replace(/"/g, '\\"')}${note.text.length > 50 ? '...' : ''}"
date: ${date}
tags: ${JSON.stringify(noteTags.length ? noteTags : ['note'])}
type: note${sourceEntryLine}${sourceEntryTitleLine}
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
    const entryTitle = frontmatter.title || '';

    // === QUOTES ===
    const bodyQuotes = extractQuotesFromBody(body, entry);
    const fmQuotes = extractQuotesFromFrontmatter(frontmatter, entry);
    const quotes = [...bodyQuotes, ...fmQuotes];

    for (const quote of quotes) {
      const quoteId = `${entry}:${quote.text.slice(0, 50)}`;
      if (!log.quotes.includes(quoteId)) {
        console.log(`📜 Quote in ${entry}:`);
        console.log(`   "${quote.text.slice(0, 50)}..." — ${quote.source || '(no attribution)'}`);
        const created = createQuoteFile(quote, date, tags, entryTitle);
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
        const created = createNoteFile(note, date, tags, entryTitle);
        if (created) {
          log.notes.push(noteId);
          totalNotes++;
        }
      }
    }

    // === LINKS ===
    const fmLinks = extractLinksFromFrontmatter(frontmatter, entry);
    const bodyLinks = extractLinksFromBody(body, entry);
    const links = [...fmLinks, ...bodyLinks];
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
