# Social proof and pop culture

## Research step

1. Write the deck's problem as one line. Search X, Bluesky, Mastodon, Hacker
   News, Reddit, blogs and talks for influencers, founders and researchers
   who complain about it.
2. Find a pop-culture match the room knows (a film, a show, a meme), ideally
   one an influencer already used, so it comes with a source.
3. Open every source. Copy the quote from the page, not from a snippet.
4. When a site blocks the fetcher, use a mirror that returns the original
   text. For X, the fxtwitter JSON API (`https://api.fxtwitter.com/<user>/status/<id>`)
   returns the text, date and counts. Link to the canonical URL.
5. Record each find in `social.md` with the fields below. Mark it VERIFIED
   only if you opened the source or a verbatim mirror in this session.
   Otherwise mark it UNVERIFIED and do not use it.
6. Rank the finds. Put the 6–8 best in a TOP list with a draft slide line.

```markdown
1. **Name: "short hook"** (VERIFIED)
   - Quote: "the exact words, with … for cuts"
   - Source: @handle on X, 2025-06-03. 4.37M followers. 231K views.
   - URL: https://x.com/handle/status/123
   - **Slide line:** "The line the deck would say."
```

## Rules

- Never invent a quote or paraphrase inside quote marks. Mark cuts with an
  ellipsis. Keep the speaker's meaning; a quote out of context is false.
- Copy each used quote into `SOURCES.md` as `Q<n>` with the URL, the date
  you opened it and the word VERIFIED. The quote card gets `data-src="Q<n>"`.
- A hard number goes in as `S<n>`, with the primary source, not a blog that
  repeats it.

## Quote card

The quote is the hero: 56–72 px, at most about 25 words. Under it go name,
handle and date at 32–36 px. A real avatar is fine; a fake screenshot of a
post is not. In the PPTX the quote stays native text.
