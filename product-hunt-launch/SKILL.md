---
name: product-hunt-launch
description: "Use when preparing, scheduling, running, or reviewing a Product Hunt launch or relaunch; when a user mentions Product Hunt, PH launch, relaunch, launch draft, maker comment, launch-day runbook, Product Hunt assets, hunter/maker handles, or staggered launch cadence."
---

# Product Hunt Launch

Treat Product Hunt as a launch operations package, not a copy form. Ground every claim, create a review doc first, build assets from real product pixels, and keep the Product Hunt UI step human-gated.

## Current-Rules Gate

Before drafting or submitting, verify the current Product Hunt docs and help center. At minimum check:

- Launch guide and content checklist: `https://www.producthunt.com/launch/preparing-for-launch`
- Posting flow: `https://help.producthunt.com/en/articles/479557-how-to-post-a-product`
- Relaunch rules: `https://help.producthunt.com/en/articles/484934-can-i-relaunch-my-product`
- Draft vs schedule behavior: `https://help.producthunt.com/en/articles/9823193-where-did-launch-now-go`
- Promotion rules: `https://www.producthunt.com/launch/sharing-your-launch`

As of 2026-07, the constraints to enforce are:

| Area | Working rule |
| --- | --- |
| Account | A personal account posts; company accounts cannot hunt/post. Newly created accounts must complete onboarding first. |
| Relaunch | Same product/company/root domain generally needs a six-month gap plus a significant update; shorter relaunches require a relaunch request and may not be featured. |
| Staggering | A two-to-four-week cadence is usually social/content cadence, not repeated Product Hunt launches for the same product. Combine small releases. |
| Timing | 12:01am Pacific gives the full daily cycle only if the team can staff it. Schedule up to one month ahead. |
| Submission state | Prefer Create Draft for collaboration, then Schedule after approval. Do not assume a "Launch Now" button exists. |
| Promotion | Ask for feedback, comments, and shares. Do not ask for upvotes, reviews-for-rewards, or engagement manipulation. |
| Assets | Thumbnail 240x240 under 3MB. Gallery images 1270x760, at least two, under 3MB. YouTube videos need full non-private URLs. |

If the user's requested cadence conflicts with current Product Hunt policy, say so plainly and convert extra drops into social launch posts, email updates, blog/support content, or a relaunch-request plan.

## Workflow

### 1. Resolve Launch Target

Classify the request:

- **First launch:** prepare the core launch.
- **Relaunch:** find the previous Product Hunt page/date, then run the six-month/significant-update gate.
- **Staggered campaign:** make a calendar with frequent social beats and infrequent Product Hunt candidates.
- **Feature launch:** prove the feature is a substantially different use case or bundle it with a larger release.

Ask only for blockers that cannot be discovered: launch owner, maker accounts, approval owner, target date, and whether legal or brand review is required.

### 2. Gather Evidence

Build a claims ledger before writing copy:

| Claim | Source | Status |
| --- | --- | --- |
| Product name/URL | official site or repo | verified/open |
| Feature shipped | release notes, GitHub PRs, Linear cycle | verified/open |
| Pricing/availability | pricing page, support docs, app UI | verified/open |
| User proof | analytics, launch recap, comments, testimonials | verified/open |
| Limits | code, support article, pricing page | verified/open |

Sources to check:

- Product site and pricing page.
- Product Hunt current docs.
- Release notes/support docs.
- GitHub repo, tags, release branch, merged PRs, and README.
- Linear cycle/issues if available.
- Existing Product Hunt product page and competitor launches.

Do not write claims from memory. If a source conflicts with another source, put it in Open Questions rather than choosing silently.

### 3. Choose The Launch Theme

Pick one theme per Product Hunt launch. Score each candidate:

| Criterion | Good signal |
| --- | --- |
| New use case | The update helps a user do something materially new. |
| Product Hunt novelty | Early adopters can understand why this matters now. |
| Visual proof | The feature can be shown in screenshots/video. |
| Source backing | Release notes/PRs/support docs prove it shipped. |
| Launch eligibility | Relaunch gate passes or a request is justified. |

Reject thin themes: pure UI polish, pricing-only changes, minor bug fixes, or copy-only announcements. Turn those into social launch posts instead.

### 4. Create The Review Doc

The first deliverable is a collaboration doc titled:

`Product Hunt Launch - <Product> - <Theme> - <YYYY-MM-DD>`

Use Google Docs when collaboration outside Linear is expected; use Linear when the work should live with the product/release process. Use both when the user asks for both, but keep one source of truth and link the mirror.

**Google Docs path:** Probe the installed CLI before relying on syntax:

```bash
command -v gog
gog --help
gog docs --help
command -v gws
gws docs --help
```

If `gog`/`gws` supports Docs creation/update in this environment, create the doc from the rendered markdown and share the URL. If it does not, leave a markdown file and create a Linear doc, or use the Google Drive upload route only after confirming the CLI supports it. For multi-account Google setups, use `multi-account-cli` first; `gws` credentials are account-sensitive.

**Linear path:** Create a standalone document under the relevant project/cycle/issue, then favorite it so it appears in the sidebar:

```graphql
mutation($input: DocumentCreateInput!) {
  documentCreate(input: $input) {
    success
    document { id title url }
  }
}
```

```graphql
mutation($input: FavoriteCreateInput!) {
  favoriteCreate(input: $input) {
    success
  }
}
```

Use `favoriteCreate(input:{documentId:"<DOC_ID>"})` after `documentCreate`. Gate writes: show the rendered doc and get human OK before creating or replacing shared docs.

### 5. Fill The Review Doc

Include these sections:

1. Launch decision: first launch/relaunch, eligibility, target date, Product Hunt source checks.
2. Product snapshot: URL, repo, pricing, audience, positioning, do-not-claim list.
3. Theme: why this update deserves Product Hunt, what changed, what proof exists.
4. Submission fields: name, tagline variants, description, tags, pricing, makers, shoutouts, first comment, video/demo URLs.
5. Assets: dimensions, source screenshots, generated/composited outputs, alt text, upload status.
6. Launch calendar: six weeks out, four weeks out, two weeks out, week of, launch day, post-launch.
7. Channel copy: internal Slack, email/newsletter, LinkedIn/X/Threads/Bluesky, blog/support, in-app banner.
8. Response bank: anticipated Product Hunt questions and approved answers.
9. Launch-day runbook: owner shifts, monitoring links, bug escalation, support contact, metrics.
10. Post-launch recap: results, comments, user requests, follow-up issues, PR/doc updates.
11. Open questions and approvals.

Use the review doc as the source of truth. The Product Hunt UI should receive copy from the approved doc, not from a chat draft.

### 6. Build Assets From Real Product Pixels

Use real UI first:

- Capture current app/product screens with `agent-browser`, Chrome DevTools, Playwright, or Peekaboo when a logged-in local browser is needed.
- Create a deterministic screenshot script when possible so assets can be regenerated after copy/UI tweaks.
- Use AI image generation for framing, background, mood boards, or image-to-image variations only after the core UI screenshot is real.
- Verify current OpenAI image docs/models before using model names. If the user asks for `gpt-image-2`, check that it exists in the official OpenAI docs or model list first; otherwise use the current supported image model.
- Composite exact logos, product UI, and text with HTML/CSS or design tooling. Do not rely on image models to spell copy, render exact product UI, or recreate brand marks.

Minimum asset set:

| Asset | Spec |
| --- | --- |
| Thumbnail | 240x240, under 3MB, first frame readable if GIF. |
| Gallery | 2-4 images, 1270x760, under 3MB, real UI visible. |
| Demo video | YouTube full URL, not private; optional but valuable for complex flows. |
| Social square | 1080x1080 for team posts. |
| Newsletter/blog banner | 1920x1080 if owned channels need it. |

For video, use `launch-video-generation`. For store-style or framed screenshots, use `app-screenshots`. For precise UI-like image generation, use `high-fidelity-ui-image-gen` but keep exact UI as real screenshots.

### 7. Submit With Browser Assistance

Use browser automation as assisted data entry, not as autonomous launch authority:

1. Open Product Hunt in an approved logged-in personal account.
2. If login/SSO/MFA is needed, hand control to the human.
3. Create Draft first unless the human explicitly approves scheduling.
4. Fill fields from the approved review doc.
5. Upload approved assets only.
6. Add makers by verified Product Hunt username.
7. Capture screenshots of the draft preview.
8. Stop for human review before Schedule.

Do not automate account creation, upvotes, comments, reviews, contests, or bulk outreach. Do not scrape people for unsolicited promotion.

### 8. Launch Day

Run from a live dashboard in the review doc:

- **Before 12:01 PT or chosen launch time:** confirm URL, assets, maker access, analytics, bug on-call, support inbox, Product Hunt page preview.
- **Morning:** announce in approved internal/external channels, ask for feedback/comments/shares, monitor Product Hunt comments and site errors.
- **Midday:** rotate comment response owner, update internal status, route bug reports into issues, share selected early feedback.
- **Evening:** respond to remaining comments, capture metrics, note feature requests, prepare day-two follow-up.
- **Post-launch:** summarize ranking, votes, comments, traffic, conversions, support load, top questions, and follow-up work.

If launch assets or docs live in a repo, keep the PR updated through launch day, rebase before PR creation, push with `--force-with-lease` after rebases, and monitor CI/review feedback per repository instructions.

## Common Mistakes

- Treating every release note as a Product Hunt relaunch candidate.
- Planning Product Hunt launches every two-to-four weeks for the same root domain.
- Reusing old submission limits without checking current docs.
- Asking for upvotes instead of feedback.
- Letting browser automation schedule or submit before human approval.
- Generating fake screenshots instead of capturing the real product.
- Forgetting maker usernames until submission day.
- Launching before the team can answer comments for the full day.
- Skipping a recap, so Product Hunt feedback never becomes product work.
