---
name: content-rabbit
description: Drive Content Rabbit (contentrabbitai.com) as an agent — sign up headless for a free API key, then create, schedule, publish, and retry social posts across Twitter/X, Instagram, LinkedIn, TikTok, Threads, Bluesky, Pinterest, and Facebook over MCP or REST. Also read analytics, manage teams and connected accounts, and generate post text, hashtags, and media. Use when an agent should post to social media, schedule a content queue, or manage a multi-platform publishing workflow with no human in the loop.
user-invocable: true
---

# Content Rabbit

Content Rabbit is an AI-powered social media management platform. An agent can
provision an account and drive the whole product — no dashboard, no human.

## 1. Get an API key (headless, free)

```bash
curl -s -X POST https://contentrabbitai.com/api/v1/agent/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

The response returns the API key **once** — store it. Add `"sandbox": true` to
mint a sandbox key: every mutating action returns a simulated success with no
real side effect (nothing posted or billed). Read actions work normally.

Auth for every call:

```
Authorization: Bearer <key>
```

## 2. Two ways to drive it

- **MCP (preferred):** `https://contentrabbitai.com/api/v1/mcp` (Streamable
  HTTP). Add it to any MCP client:
  ```bash
  claude mcp add --transport http content-rabbit \
    https://contentrabbitai.com/api/v1/mcp \
    --header "Authorization: Bearer $CONTENT_RABBIT_KEY"
  ```
  Tools: `posts_create`, `posts_schedule`, `posts_publish`, `posts_retry`,
  `posts_list`, `accounts_list`, `queue_*`, `analytics_get_*`, `generate_text`,
  `generate_hashtags`, and more.
- **REST:** base `https://contentrabbitai.com/api/public/v1`. Spec at
  `https://contentrabbitai.com/openapi.yaml`.

## 3. Discovery URLs

- Agent card (A2A): `https://contentrabbitai.com/.well-known/agent-card.json`
- Plugin manifest: `https://contentrabbitai.com/.well-known/ai-plugin.json`
- API catalog (RFC 9727): `https://contentrabbitai.com/.well-known/api-catalog`
- Auth guide: `https://contentrabbitai.com/auth.md`
- Operating guide: `https://contentrabbitai.com/agents.md`
- Site summary: `https://contentrabbitai.com/llms.txt`

## 4. Typical loop

1. Sign up → store the key.
2. `accounts_list` to see connected platforms.
3. `posts_create` (or `generate_text` first) → `posts_schedule` or
   `posts_publish`.
4. `analytics_get_posts` to read results; `posts_retry` on a failure.

## Payments

Credits top up over **x402** (HTTP 402, USDC on Base) at
`/api/v1/agent/topup` — an agent can pay with no card and no human. The free
tier covers basic use.

## Rules

- Use a sandbox key while testing a workflow; switch to a live key only when the
  post content and schedule are confirmed.
- Respect the `RateLimit-*` headers on responses; back off on a `429` per
  `Retry-After`.
- Never post without an explicit instruction and content to publish.
