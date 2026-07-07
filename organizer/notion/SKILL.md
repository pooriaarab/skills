---
name: notion-organizer
description: "Use when the user wants to organize, restructure, or clean up their Notion workspace. Triggers: 'organize my Notion', 'clean up Notion', 'restructure my workspace', 'my Notion is a mess', 'organize Notion pages'."
---

# Notion Organizer

Reorganize a chaotic Notion workspace into a clean hierarchy using the Notion MCP. Two-phase approach: top-level sections first, deep sub-pages and renames second. AI classifies untitled pages by reading their block content.

## Requirements

- Notion MCP server configured (`@notionhq/notion-mcp-server`) with an integration token that has access to the pages you want to reorganize
- The integration must be added to each top-level page (Notion → Page → `...` → Connections → add your integration). The MCP only sees pages explicitly shared with the integration.
- OpenAI or Anthropic API key (optional — only needed for untitled-page classification)

**Estimated time:** 15–60 min depending on page count
**Estimated cost:** ~$0.01–0.10 in AI API calls (gpt-4o-mini) for untitled page analysis. Notion API is free.

| Workspace Size | Runtime | AI Cost |
|----------------|---------|---------|
| ~50 pages | ~5 min | <$0.01 |
| ~300 pages | ~20 min | ~$0.02 |
| ~1000 pages | ~60 min | ~$0.05 |

---

## Step 1 — Ask the User These Questions First

Do not skip this. Wrong assumptions = wrong structure.

```
1. What is this workspace for? (one product/company, personal life, mixed?)
   → Knowing the primary context sets the top-level page names.

2. Which organization style do you prefer?
   a) PARA (Projects / Areas / Resources / Archive — Tiago Forte system)
   b) Flat topic sections (Work, Personal, Health, Finance, etc.)
   c) Mix: top-level by context (work/personal), PARA inside each
   d) GTD-style (Inbox, Next Actions, Waiting For, Someday/Maybe, Reference, Archive)

3. Which existing top-level pages should stay as-is?
   → List them — don't auto-move pages the user intentionally curated.

4. How should untitled / "Untitled" pages be handled?
   a) AI reads first few blocks and classifies + renames
   b) Move all to an _Inbox page for manual review
   c) Archive if empty (no real content blocks)

5. Are there databases (not pages) that should stay where they are?
   → Databases are special — don't move rows; treat the DB itself as one unit.

6. Naming style for new section pages?
   a) Title Case ("Marketing Strategy") — Notion default, Recommended
   b) lowercase ("marketing strategy")
   c) Emoji-prefixed ("🎯 Marketing")
```

---

## Step 2 — Map the Workspace Before Touching Anything

Use the Notion MCP `post-search` operation with an empty query to list every page and database the integration can see.

```jsonc
// post-search request
{
  "query": "",
  "page_size": 100,
  "filter": { "value": "page", "property": "object" }
}
```

Paginate with `start_cursor` until `has_more` is false. Then do the same with `filter.value = "database"`.

**For each top-level page**, call `get-block-children` to list immediate children. This builds your tree.

```python
# Pseudocode — adapt to the MCP tool surface
def map_workspace(notion):
    pages = []
    cursor = None
    while True:
        r = notion.search(query="", filter={"value": "page", "property": "object"},
                          start_cursor=cursor, page_size=100)
        pages.extend(r["results"])
        if not r.get("has_more"): break
        cursor = r["next_cursor"]

    # Identify top-level pages: parent.type == "workspace"
    # OR parent.type == "page_id" but the parent is not in the visible set (shared root)
    top_level = [p for p in pages if p["parent"]["type"] == "workspace"]

    tree = {}
    for p in top_level:
        tree[p["id"]] = {
            "title": page_title(p),
            "icon": p.get("icon"),
            "children": list_children(notion, p["id"]),
        }
    return tree

def page_title(p):
    # Workspace-parented pages: properties.title.title[0].plain_text
    # DB-row pages: the title-type property (varies by DB schema)
    title_prop = next((v for v in p["properties"].values() if v["type"] == "title"), None)
    if not title_prop or not title_prop["title"]: return "Untitled"
    return "".join(t["plain_text"] for t in title_prop["title"]) or "Untitled"
```

**Print a tree** of what's there. Show it to the user before proposing structure.

---

## Step 3 — Design the Folder Structure (with User)

Based on Step 1 answers, propose a structure before running anything. Examples below.

### PARA (recommended for personal workspaces)

```
📥 Inbox            unsorted, needs review
🚀 Projects         active outcomes with deadlines
   - launch-saas-v2
   - canada-pr-application
   - q2-fitness-program
🌱 Areas            ongoing responsibilities
   - health
   - finances
   - relationships
   - career
📚 Resources        topics of interest, reference material
   - design-systems
   - ai-research
   - reading-notes
🗄️ Archive          inactive, kept for reference
```

### Flat topic sections (work/product workspace)

```
📊 Analytics        dashboards, metrics, BigQuery exports
🎨 Decks            pitch, product reviews, growth strategy
🛠️ Engineering      specs, PRDs, RFCs, integrations
📣 Marketing        campaigns, content calendar, experiments
💰 Finance          invoices, forecasts, runway
🆘 Support          help articles, FAQ, runbooks
🧪 Testing          test plans, QA notes
👥 Team             onboarding, hiring, 1:1 templates
📥 Inbox            unsorted
🗄️ Archive          old projects, sunset features
```

### GTD-style

```
📥 Inbox
✅ Next Actions
⏳ Waiting For
🌙 Someday / Maybe
📚 Reference
🗄️ Archive
```

---

## Step 4 — Create Section Pages

Use `post-page` with `parent: { type: "workspace", workspace: true }` for top-level sections, or `parent: { page_id: "<root>" }` if working under an existing root page.

```jsonc
// post-page request
{
  "parent": { "type": "workspace", "workspace": true },
  "icon": { "type": "emoji", "emoji": "🚀" },
  "properties": {
    "title": { "title": [{ "type": "text", "text": { "content": "Projects" } }] }
  }
}
```

Save the returned `id` for each section — you'll use it as the destination for moves.

---

## Step 5 — Classify Untitled Pages with AI

Read the first few blocks of an untitled page, then classify into one of the section pages.

```python
def page_excerpt(notion, page_id, max_chars=2000):
    blocks = notion.blocks.children.list(block_id=page_id, page_size=20)["results"]
    text = []
    for b in blocks:
        t = b["type"]
        rich = b[t].get("rich_text", []) if isinstance(b.get(t), dict) else []
        text.append("".join(r["plain_text"] for r in rich))
        if sum(len(s) for s in text) >= max_chars: break
    return "\n".join(s for s in text if s).strip()[:max_chars]

def classify_with_openai(page_id, current_title, sections, notion, api_key):
    content = page_excerpt(notion, page_id)
    if not content:
        return "_inbox", current_title  # empty page → inbox

    prompt = f"""Classify this Notion page and suggest a short descriptive title.
Current title: "{current_title}"
Content excerpt: {content[:2000]}
Valid sections: {', '.join(sections)}
Reply JSON: {{"section": "<section>", "title": "<descriptive title, Title Case, max 60 chars>"}}"""
    # ... call OpenAI gpt-4o-mini, parse JSON, validate section is in valid sections
```

---

## Step 6 — Move Pages

Notion provides a dedicated `move-page` endpoint (preferred) or you can `patch-page` with a new `parent`.

```jsonc
// move-page request — preferred
// POST /v1/pages/{page_id}/move
{
  "parent": { "page_id": "<destination-section-id>" }
}
```

```jsonc
// Fallback: patch-page with new parent
// PATCH /v1/pages/{page_id}
{
  "parent": { "page_id": "<destination-section-id>" }
}
```

**Sleep ~150ms between moves** to stay under Notion's 3 req/sec rate limit.

```python
def move_page(notion, page_id, dest_id):
    notion.pages.move(page_id=page_id, parent={"page_id": dest_id})
    time.sleep(0.15)
```

**Constraints:**
- Cannot move a database row out of its database — only move the database itself.
- Cannot move a workspace-level page into a database; only into another page or to workspace root.
- Cannot move a page into one of its own descendants (will return 400).

---

## Step 7 — Rename Pages

```python
def rename_page(notion, page_id, new_title):
    # Find the title property name (usually "title" for workspace pages,
    # but could be "Name" or anything else for DB rows)
    page = notion.pages.retrieve(page_id=page_id)
    title_prop = next(k for k, v in page["properties"].items() if v["type"] == "title")
    notion.pages.update(
        page_id=page_id,
        properties={
            title_prop: {"title": [{"type": "text", "text": {"content": new_title}}]}
        },
    )
    time.sleep(0.15)
```

**Rename patterns to fix:**

| Pattern | Action |
|---------|--------|
| `Untitled` (no content) | Archive |
| `Untitled` (has content) | Classify with AI → descriptive Title Case |
| `Page` / `Page 1` / `New Page` | Same — classify with AI |
| `Copy of X` (no edits) | Archive duplicate |
| `https://...` (link as title) | Read OG title or page content → topic title |
| `# Markdown heading` | Strip the `#` |
| ALL CAPS | Convert to Title Case |
| `meeting notes 2024-01-15` | → `Meeting Notes — 2024-01-15` |
| `kebab-case-titles` | → `Kebab Case Titles` (Notion convention is Title Case) |

---

## Step 8 — Archive Empty Pages

Notion's "delete" via API actually archives (`archived: true`). It's reversible from Trash for 30 days.

**Empty test:** A page is empty if `get-block-children` returns 0 blocks, or only blocks of type `paragraph` whose `rich_text` is empty.

```python
def is_empty(notion, page_id):
    children = notion.blocks.children.list(block_id=page_id, page_size=10)["results"]
    if not children: return True
    for b in children:
        t = b["type"]
        if t in ("child_page", "child_database", "image", "video", "file", "pdf",
                 "embed", "bookmark", "code", "table", "column_list", "toggle"):
            return False
        rich = b.get(t, {}).get("rich_text", [])
        if rich and any(r.get("plain_text", "").strip() for r in rich):
            return False
    return True

def archive_page(notion, page_id):
    notion.pages.update(page_id=page_id, archived=True)
    time.sleep(0.15)
```

**Never archive without checking content first.** Untitled pages often hide real notes.

---

## Phase 2 — Deep Sub-Pages and Renames

After Phase 1 settles, go deeper inside each section. Examples:

1. **🚀 Projects/** → one sub-page per active project; archive completed ones to `🗄️ Archive/`
2. **🌱 Areas/** → split into `health/`, `finances/`, `career/`, etc.
3. **📚 Resources/** → group by topic (`design-systems/`, `ai-research/`, `reading-notes/`)
4. **🗄️ Archive/** → split by year (`2024/`, `2025/`, `2026/`)
5. **📊 Analytics/** (work) → `dashboards/`, `bigquery-exports/`, `weekly-reports/`
6. **📣 Marketing/** (work) → `campaigns/`, `content/`, `experiments/`, `social/`

**Common Phase 2 fixes:**
- Pages titled with timestamps only → keep, group inside a dated sub-page
- Daily journal entries scattered at root → consolidate into `journal/2026/05/`
- Meeting notes scattered → consolidate into `meetings/<person>/` or `meetings/<project>/`
- Recipe / link dumps → consolidate into a single Notion database with tags

---

## Personal vs Work Workspace Structure

Personal and work workspaces need very different schemes. Ask the user which type before proposing structure.

- **Work / product:** the flat topic sections in Step 3.
- **Personal:** PARA (Step 3).
- **Mixed (single workspace for life + side projects):** top level `🏢 Work`, `🏠 Personal`, `🚀 Projects`, `🗄️ Archive`; inside each, mini-PARA.

---

## Notion-Specific Gotchas and Learnings

| Problem | Fix |
|---------|-----|
| `post-search` returns nothing | Integration isn't shared with any pages. Tell the user to add it via Page → `...` → Connections. |
| Page exists but search misses it | Search is eventually consistent (lags ~30s after creation). Re-run after a pause. |
| `move-page` returns 400 "validation_error" | Destination is a database, or destination is descendant of source. Move databases differently. |
| Title property name varies | DB rows use the schema's title property (often `Name`); workspace pages use `title`. Detect by `type == "title"`. |
| `archived` flag missing on retrieved page | Already in trash. Filter these out of your map. |
| Block children pagination | `get-block-children` caps at 100; paginate with `start_cursor`. Long pages have hundreds of blocks. |
| Database rows look like pages in search | They are pages. Filter by `parent.type == "database_id"` to skip them — don't try to move them out. |
| Synced blocks / embeds | Don't recurse into them; they reference other pages. |
| Rate limit (3 req/sec) | Sleep 0.15–0.25s between writes. Bursting causes 429 with `Retry-After` header — back off and retry. |
| Page icons get lost on move | They don't, but check before/after — Notion has rare bugs here. |
| "Untitled" pages with rich content | Always read first 10 blocks before deciding. AI classify rather than archive. |
| Cycles | Notion prevents A→B→A parent cycles, but a buggy script can still loop on retries. Keep a `visited` set. |
| Workspace-level moves | Only Workspace Owners can move pages to/from workspace root. Plus/Free plan members may get 403. |
| Permission inheritance | Moving a page changes who can see it. Warn the user before moving private pages into shared sections. |

---

## Cost and Time Summary

**One-time setup:** ~5 min (configure MCP, share integration with root pages)
**Phase 1 script:** ~5–20 min runtime depending on workspace size
**Phase 2 script:** ~5–15 min runtime
**Manual review of `📥 Inbox`:** 5–15 min (you decide, not automated)

**API costs (OpenAI gpt-4o-mini):**
~$0.0004 per untitled page classified. A workspace with 50 untitled pages costs ~$0.02.

**No cost for:** Notion API (within free quotas — 3 req/sec is the only real limit).

---

## Safety Rules

- **Never archive a page without reading its blocks first.** Empty title ≠ empty page.
- **Never bulk-move without a dry run.** Print the move plan (source → destination) and ask the user to confirm before executing.
- **Don't touch shared / team-owned pages** unless the user explicitly says to. Permissions inheritance can leak access.
- **Back up first** for large workspaces: Settings → Settings & members → Settings → Export all workspace content (Markdown & CSV). Takes 5 min, saves you from regret.
- **Stop on first 403/permission error** and report to the user — don't keep hammering the API.
