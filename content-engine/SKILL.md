---
name: content-engine
description: "Run an ongoing editorial engine for a small SaaS: find demand-led topics, choose problem-solution, comparison, or technical articles, set a sustainable cadence, review AI-assisted drafts, distribute published work, measure article-to-signup contribution, and stop weak channels. Use when the user asks 'what should we write next?', 'build a content calendar', 'start content marketing', 'grow with SEO content', 'which blog topics should we publish?', 'why are our articles not converting?', or 'should we keep blogging?'. Do not use for one-time technical SEO, answer-engine artifacts, or social queue operations; use `launch-seo`, `geo-aeo`, or `content-rabbit`."
---

# content-engine

The headline decision: build one demand-led editorial queue and improve it every cycle. A small product needs useful articles that connect a known problem to a real buying decision. It does not need a large blog.

This skill covers the ongoing editorial engine. `launch-seo` covers one-time technical search setup. `geo-aeo` covers answer-engine artifacts and page structure. `content-rabbit` covers an ongoing social publishing queue.

## 1. Pick topics from demand

Do not begin with a blank calendar. Begin with language that customers already use. Collect questions from sales calls, demos, support tickets, lost-deal notes, reviews, communities, and competitor comparisons.

Use Google Search Console for queries that already bring impressions or clicks. Use Google Keyword Planner for search estimates. Use Google Trends for related, rising, seasonal, and regional interest. Treat every source as evidence, not as an editorial order.

Keyword Planner reports average monthly searches for a keyword and close variants within the selected location, network, and date range. Its competition field describes advertisers, not organic ranking difficulty. Its volume is rounded and changes with seasonality. See [Keyword Planner metrics](https://support.google.com/google-ads/answer/3022575).

Google Trends reports relative interest, not absolute search volume. It can show related and rising searches. Low-volume terms can appear as zero or show noise. See [Google Trends data](https://support.google.com/trends/answer/4365533).

Search Console shows the queries and pages that already bring Google traffic. Use it to find language your site has earned, not to prove total market demand. See [Search Console performance data](https://support.google.com/webmasters/answer/7042828).

### Volume is not intent

Separate four intents before you choose a topic: **learn**, **solve**, **compare**, and **buy**. Learn seeks explanation. Solve seeks a working method. Compare evaluates products or approaches. Buy seeks pricing, an alternative, an integration, or a way to start.

The volume number answers, “How often might people search this phrase?” It does not answer, “Will this reader become a good customer?” Prefer a smaller topic with clear product fit over broad, vague interest. This is an operating rule, not a fixed conversion-rate claim.

For each candidate, record the query, reader, problem, intent, product connection, evidence you can add, and next action. Reject a topic when you cannot explain why your product has a credible right to answer it.

Use `demand evidence × product fit × buying intent × distinct evidence` as a decision score. Use low, medium, or high for each factor. Do not turn it into a forecast. Use it to make the queue order visible.

## 2. Use only three article shapes

Small products should write three shapes. Each shape has a different job.

### Problem-solution articles rank for a real problem

Use this shape when a reader knows the pain but may not know the product. Answer the problem first. Explain the cause. Show a method that works. State where the product helps and where it does not.

Use the reader's problem in the title. Put the direct answer below the heading. Add steps, examples, failure cases, and a relevant product path. Link to the product after the reader receives useful help. Do not make a disguised landing page.

### Comparison articles capture active shoppers

Use this shape when the reader compares products, approaches, or alternatives. State the choice clearly. Explain who should choose each option. Compare the dimensions that change the decision, such as workflow, limits, setup, export, price model, and support.

Use first-hand tests and dated sources for product claims. Show a fair result when the competitor is the better choice. Do not publish “best tools” lists without a buyer, use case, selection method, and evidence for each result.

### Deep technical articles earn links and credibility

Use this shape for original research, benchmarks, incident reviews, architecture decisions, or detailed implementation guides. Explain the question, method, data, limits, and result. Include code or reproducible steps when useful. Name the tradeoffs and link to primary sources.

Length is not evidence. If an article adds no experiment, implementation detail, or original analysis, use the problem-solution shape instead.

## 3. Choose cadence over volume

Set a cadence that one named owner can sustain through research, writing, review, publishing, and distribution. Do not copy a universal “publish N times per week” rule. The correct cadence depends on evidence quality and editorial time.

Keep one queue with a status, owner, target reader, intent, article shape, source list, product link, review date, and success measure. Publish the strongest ready article. Do not release a weak article to fill a calendar slot.

Organic search is an investment with a lag. Google says crawling and indexing take time and that it cannot predict or guarantee when a URL will be crawled or indexed. See [Google's crawling and indexing FAQ](https://developers.google.com/search/help/crawling-indexing-faq).

Set a review horizon measured in months, not launch-day results. Record the decision date before publication. Review early signals for learning, but do not declare the channel dead because a new page has no immediate traffic.

Use the lag to improve the asset. Add evidence, correct claims, strengthen internal links, answer new objections, and update the call to action. Do not change the date without a substantial content change.

Google warns that more pages do not make a site more useful or relevant. It also warns against producing many pages on many topics in the hope that some rank. See [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## 4. Write for answers and search

Use answer-first structure. State the answer in the first sentence. Follow with the reason, evidence, limits, and practical steps.

Make important claims easy to quote. Use a clear question or claim as the heading. Put one answer or claim in each short paragraph. Define terms before using them. Include dates, conditions, and source links. Use tables only when they clarify a real choice. Add an FAQ only when readers ask those questions.

A good article must work when a reader sees only its opening answer and one supporting section. It must remain useful when an answer engine cites one passage without your sales context.

Google's generative search guidance favours unique, useful, people-first content and says exact query matching is not required. It warns against making separate pages for every query variation. See [Google's generative AI search guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

Use `geo-aeo` when the work includes `llms.txt`, markdown mirrors, JSON-LD, WebMCP, entity pages, or free tools. Do not duplicate those setup instructions. Google says Search does not use `llms.txt` as a special ranking or visibility signal. Use that file only when another service needs it.

## 5. Use AI with a human owner

A model helps with research questions, query grouping, outlines, transcripts, and first drafts of mechanical sections. It can find outline gaps and propose reader objections.

Do not publish its output as editorial truth. Unedited output creates thin duplicate pages, confident wrong facts or product claims, and a flat voice that sounds like every competitor.

The human owner must own every material claim. The owner checks primary sources, adds first-hand experience, removes unsupported certainty, and approves the byline and call to action.

Google permits AI assistance when the result meets its quality and spam rules. It warns that generating many pages without added value can be scaled content abuse. See [Google's AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content).

Use an AI disclosure when it gives readers useful context. Do not use a label as a substitute for fact checking, authorship, or original evidence.

## 6. Distribute every useful article

Publishing is a storage action. Distribution is the work that puts an article in front of a relevant reader.

After publication, update relevant product, documentation, and older articles. Send a useful excerpt to the audience that raised the problem. Give sales and support a link with a clear use case. Share it where the discussion already exists, without dropping an irrelevant link.

Use `social-launch-post` for a one-off launch announcement. Use `content-rabbit` for an ongoing social queue. Neither tool decides whether the article is worth publishing or which audience needs it.

Treat distribution as part of the article brief. Name the first audience, message, channel, and owner. If no audience or channel exists, question the topic's production cost.

## 7. Measure signups, not pageviews

Use Search Console for search visibility. Review impressions, clicks, queries, pages, and click-through rate. Search Console can show high-impression, low-CTR opportunities and queries that led to a page. See [Search Console performance tasks](https://support.google.com/webmasters/answer/17010961).

Use `product-analytics` for business value. It owns event taxonomy, identity, activation, funnels, retention, and cohorts. Do not recreate its post-signup guidance here.

For each article, report organic impressions and clicks, qualified signups that touched the article, activated signups, paid conversion, assisted signups, production cost, update cost, next change, and review date.

Organic attribution is incomplete. A reader can discover an article in search, return through a bookmark, read several articles, and sign up elsewhere. Privacy controls, ad blockers, cross-device use, and direct visits hide more of the path.

Report direct and assisted contribution separately. Keep the article slug or content ID when the application can capture it. Add a self-reported source field when the decision matters. Treat attribution as evidence, not proof of cause.

Do not use average position as the main success metric. Google says impressions and clicks are more useful measures of Search success than position alone. See [Google's traffic-drop guidance](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops).

## 8. Stop when the channel does not learn or convert

Precommit the stop rule before the queue grows. Review the channel after the chosen horizon, not one article after one week.

Stop or pause a topic group when it had enough time and exposure, the audience and problem remain clear, improvements produced no meaningful response, the articles produce no qualified signup or useful sales assist, and no new evidence suggests another article will change the result.

Use the failure pattern to choose the next action:

- **No impressions:** check demand, index status, internal links, and `launch-seo` before writing more.
- **Impressions but few clicks:** fix query fit, title, opening answer, and snippet promise.
- **Clicks but no qualified signups:** fix audience fit, product connection, and the next action.
- **Signups but no activation:** inspect `product-analytics`; more content may not solve the product problem.

Update a strong article before creating a near-duplicate. Merge overlapping articles when they compete for the same reader. Archive an article when it cannot become accurate, useful, or commercially relevant.

## See also

- [`launch-seo`](../launch-seo/SKILL.md) covers sitemap, robots, metadata, indexing, and search-engine submission.
- [`geo-aeo`](../geo-aeo/SKILL.md) covers answer-engine artifacts and page structure.
- [`product-analytics`](../product-analytics/SKILL.md) covers post-signup measurement.
- [`social-launch-post`](../social-launch-post/SKILL.md) covers one-off launch announcements.
- [`content-rabbit`](../content-rabbit/SKILL.md) covers an ongoing social queue.

## Checklist

- [ ] Confirm this is ongoing editorial work, not SEO setup, AEO plumbing, or social scheduling.
- [ ] Gather customer language, Search Console queries, Keyword Planner data, and Trends evidence.
- [ ] Separate search volume from learn, solve, compare, and buy intent.
- [ ] Record the reader, problem, product fit, evidence, and next action.
- [ ] Choose problem-solution, comparison, or deep technical shape.
- [ ] Assign one owner and a sustainable cadence.
- [ ] Set a month-scale review horizon before publication.
- [ ] Put the direct answer first and make material claims quotable.
- [ ] Use `geo-aeo` for answer-engine artifacts and page structure.
- [ ] Use AI for assistance only; make a human owner verify every material claim.
- [ ] Plan distribution with the article; use the specialist queue when needed.
- [ ] Measure Search Console visibility and article-to-signup contribution.
- [ ] Separate direct, assisted, activated, and paid outcomes.
- [ ] Precommit kill criteria and pause channels that do not learn or convert.

## Related

- `community-organic` — the same work in other people's spaces rather than
  your own channel.
- `grow-a-product` — where this sits in the loop, and why organic comes before
  paid.
