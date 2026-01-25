#!/usr/bin/env python3
"""
Migrate posts from a Substack newsletter to the blog-concept format.
Usage: python scripts/migrate_substack.py
"""

import os
import re
from datetime import datetime
from pathlib import Path

import html2text
from substack_api import Newsletter

# Configuration
SUBSTACK_URL = "https://thetechnomist.com"
OUTPUT_DIR = Path(__file__).parent.parent / "src" / "content-data" / "entries"

# html2text configuration
h2t = html2text.HTML2Text()
h2t.ignore_links = False
h2t.ignore_images = False
h2t.ignore_emphasis = False
h2t.body_width = 0  # Don't wrap lines
h2t.unicode_snob = True
h2t.ignore_tables = False


def slugify(title: str) -> str:
    """Convert a title to a URL-friendly slug."""
    # Remove special characters and convert to lowercase
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    # Replace whitespace with hyphens
    slug = re.sub(r"[-\s]+", "-", slug).strip("-")
    return slug


def clean_html_content(html: str) -> str:
    """Remove Substack-specific widgets and clean HTML before conversion."""
    # Remove subscription widgets
    html = re.sub(
        r'<div class="subscription-widget-wrap-editor".*?</div></div></div>',
        "",
        html,
        flags=re.DOTALL,
    )
    # Remove subscribe buttons
    html = re.sub(r'<div class="subscribe-widget.*?</div>', "", html, flags=re.DOTALL)
    # Remove share buttons
    html = re.sub(
        r'<div class="button-wrapper".*?</div></div>', "", html, flags=re.DOTALL
    )
    return html


def html_to_markdown(html: str) -> str:
    """Convert HTML content to Markdown."""
    cleaned_html = clean_html_content(html)
    markdown = h2t.handle(cleaned_html)
    # Clean up excessive newlines
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return markdown.strip()


def extract_tags_from_metadata(metadata: dict) -> list[str]:
    """Extract tags from Substack metadata."""
    tags = []
    # Try to extract from postTags if available
    if "postTags" in metadata and metadata["postTags"]:
        for tag in metadata["postTags"]:
            if isinstance(tag, dict) and "name" in tag:
                tags.append(tag["name"].lower())
            elif isinstance(tag, str):
                tags.append(tag.lower())
    return tags


def create_frontmatter(metadata: dict, slug: str) -> str:
    """Create YAML frontmatter for the blog post."""
    title = metadata.get("title", "Untitled").strip()
    # Escape quotes in title
    title = title.replace('"', '\\"')

    post_date = metadata.get("post_date", "")
    if post_date:
        # Parse ISO date and format as YYYY-MM-DD
        dt = datetime.fromisoformat(post_date.replace("Z", "+00:00"))
        date_str = dt.strftime("%Y-%m-%d")
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")

    subtitle = metadata.get("subtitle", "")
    if subtitle:
        subtitle = subtitle.strip().replace('"', '\\"')

    tags = extract_tags_from_metadata(metadata)
    tags_str = ", ".join(f'"{tag}"' for tag in tags) if tags else ""

    frontmatter = f'''---
title: "{title}"
date: {date_str}
tags: [{tags_str}]
type: entry'''

    if subtitle:
        frontmatter += f'\nsummary: "{subtitle}"'

    frontmatter += "\n---"
    return frontmatter


def migrate_posts():
    """Fetch all posts from Substack and save as markdown files."""
    print(f"Fetching posts from {SUBSTACK_URL}...")
    newsletter = Newsletter(SUBSTACK_URL)
    posts = newsletter.get_posts(limit=100)
    print(f"Found {len(posts)} posts")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    migrated = 0
    errors = []

    for i, post in enumerate(posts, 1):
        try:
            metadata = post.get_metadata()
            title = metadata.get("title", "Untitled")
            print(f"[{i}/{len(posts)}] Processing: {title}")

            # Get content
            content_html = post.get_content()
            content_md = html_to_markdown(content_html)

            # Generate slug and frontmatter
            slug = metadata.get("slug") or slugify(title)
            frontmatter = create_frontmatter(metadata, slug)

            # Combine frontmatter and content
            full_content = f"{frontmatter}\n\n{content_md}\n"

            # Save to file
            filename = f"{slug}.md"
            filepath = OUTPUT_DIR / filename

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(full_content)

            print(f"  ✓ Saved: {filename}")
            migrated += 1

        except Exception as e:
            error_msg = f"Error processing post {i}: {e}"
            print(f"  ✗ {error_msg}")
            errors.append(error_msg)

    print(f"\n{'=' * 50}")
    print(f"Migration complete!")
    print(f"  Migrated: {migrated}/{len(posts)} posts")
    print(f"  Output directory: {OUTPUT_DIR}")
    if errors:
        print(f"  Errors: {len(errors)}")
        for err in errors:
            print(f"    - {err}")


if __name__ == "__main__":
    migrate_posts()
