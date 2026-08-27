---
name: name-a-product
description: "Find a product name that is available, memorable and legally clear — without burning a week. Company-conflict check FIRST, domain check second (the inversion that matters), RDAP bulk sweeps for speed, Cloudflare domain-check for price, plus the empirical map of which naming lanes are already exhausted on .com and .ai. Use before cloudflare-domain-launch, when renaming a product, or whenever a name search keeps returning candidates that get rejected. Empirical, from a ~100,000-check session that rejected 25+ lanes."
---

# name-a-product

Finding a name is a search problem with a counter-intuitive order. Get the order
wrong and you burn days generating candidates that were dead before you checked.

## The one rule that matters

**Check for competing COMPANIES before you check domains.**

Domain availability tells you almost nothing. Funded competitors in your category
sit on `try<name>.ai`, `<name>ai.com` and `get<name>.com` — the exact variants a
domain sweep hands you as "available alternatives". You will happily register a
domain inside someone else's brand.

Real example: `popcorn` looked wide open on `.com` variants. It is the name of a
**funded AI-agents company** (`trypopcorn.ai`, $500K seed) *and* a second one
(`thepopcorn.net`). Six rounds of domain work were wasted before anyone searched
the company name. Same session: `dumpling` → DumplingAI, `pop` → teampop.com
("Pop", custom AI agents), `granola` → AI notetaker, `bagel` → AI company,
`sumac` → nonprofit case-management software, `deputy` → HR SaaS.

Order of operations:

1. Candidate word
2. **Company search** — `"<name>" <your category> startup company` and check the
   bare `.com`/`.ai` for a live site (`curl` the title tag)
3. Connotation check (below)
4. Domain sweep
5. Trademark clearance by an attorney before spending on brand assets

## Availability checking — two tools, two jobs

**RDAP for bulk (free, no auth, ~60/sec).** 404 = unregistered, 200 = taken.

```bash
check() {
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 \
    "https://rdap.verisign.com/com/v1/domain/${1}.com")
  [ "$code" = "404" ] && echo "FREE $1"
}
export -f check
xargs -P 8 -I{} bash -c 'check {}' < wordlist.txt
```

Caveat: RDAP has a **small false-positive rate under load** — one confirmed case
(`mossley.com`, registered since 2012, returned 404). Use it as a pre-filter only.

**Cloudflare `domain-check` for the truth + price.** Max 20 domains/request.

```bash
curl -s -X POST \
 "https://api.cloudflare.com/client/v4/accounts/$ACC/registrar/domain-check" \
 -H "Authorization: Bearer $TOK" -H 'Content-Type: application/json' \
 -d '{"domains":["a.com","b.ai"]}'
```

Returns `registrable`, `tier` (`standard` vs `premium` — this is the price signal;
a "free" premium `.com` can cost thousands) and `pricing.registration_cost`.
Works for any TLD Cloudflare sells, including `.ai` ($80/yr) — not just `.com`.

Token needs `Account > Domain Registrar > Read`. The `cloudflare-api` MCP needs
OAuth and cannot be authorized in a non-interactive session; use an API token.

Always CF-verify finalists. Never trust an RDAP-only result for a name you're
about to build on.

## Lanes that are already exhausted (don't re-run these)

Verified across ~100,000 checks. On `.com` at register price, **zero** usable
results in any of these:

| Lane | Result |
|---|---|
| Real English words, 4–11 letters | 100% taken, every length |
| Root + real suffix (`-ery`, `-ry`) | good ones taken (`stewardry`, `makery`, `roostery`) |
| Random melodic coinage (10k sample) | 69% free — all unpronounceable mush |
| Latin/Greek plurals | `vivaria`, `scriptoria`, `armaria`, `tabularia` all taken |
| Phonetic respellings (Lyft/Flickr style) | `hyve`, `krew`, `kamp`, `teem`, `flok` — 0 of 50 free |
| Dahl-style nonsense (`pockle`, `wimble`) | good ones taken; survivors unreadable |
| `get`/`use`/`try` + good word | 24 free of 1,085, all junk (`getmallet`, `trychum`) |
| `agent<word>` | 100% taken |
| Kid compounds (`treehouse`, `beehive`) | taken |
| `-ify` / `-ly` (Spotify/Bitly pattern) | `nestify`, `rootify`, `nestly`, `rootly` all taken |
| Words containing `ai` | most-mined namespace in `.com`; 4-letter `ai*` names 70/70 taken |
| Non-English simple words (JP/FA/FI/EL) | 0 of 111 free |
| Famous ancient names | `kairos`, `argo`, `hestia`, `agora`, `simurgh`, `asha` all taken |
| Simple words on `.ai` | 2 of 392 free — `.ai` is *more* exhausted than `.com` |

**Conclusion to state up front to any stakeholder:** a simple, one-word,
kid-pronounceable `.com` does not exist at register price, in any language. The
words they want are six-figure aftermarket. Say this in round one, not round ten.

## Lanes that actually produce results

- **Two simple words fused.** Facebook, Netflix, YouTube, Dropbox, Snapchat,
  Airbnb, TikTok are all this. At 6–8 characters the seam disappears.
- **Suffix, not second word.** `-ley`, `-mere`, `-wick`, `-ham`, `-ton`, `-bury`
  are English place-name suffixes, not words — `Mossley` reads as one word the way
  `Ashley` does. Big, under-registered space.
- **Affix + short brand.** The domain carries `try`/`use`/`hire`/`-hq`/`-team`;
  the brand is the short word alone. Note `get`/`use`/`try` are largely exhausted;
  `hire`, `run`, `let`, `-pod`, `-team`, `-hq`, `-ops` are open.
- **Lower-search-volume synonyms.** If the word you want is a high-volume common
  noun, SEO is unwinnable. Pick the rarer sibling: `provolone` over `pepperoni`,
  `romesco` over `pesto`.

## Connotation checklist — run before falling in love

A name can be available, memorable, and still wrong:

- **Villain coding** — `Vizier` (Jafar), `Praetorian` (assassinated emperors)
- **Failure coding** — `Icarus` (flies too close and falls), `Sisyphus`
- **Dishonesty coding** — `Fudge` ("fudge the numbers") in anything touching data
- **Subordinate coding** — `Satrap` reads as "puppet ruler"
- **Slurs and regional meanings** — `Cracker` (US slur); check every market
- **"Plain/boring" coding** — `Vanilla`
- **Regional legibility** — `Bullpen` is invisible outside North America

## Register: the "trying too hard" axis

Two failure modes, opposite directions, same cause:

- **Too epic** — `Edict`, `Phalanx`, `Gordian`, `Emissary`. Announces itself.
- **Too twee** — `Seedmere`, `Brambleburrow`, `Moondell`. Also announces itself.

What the category actually does is **modest**: Notion, Linear, Ramp, Stripe, Loom,
Clay, Cursor, Slack. A small idea, a line, a slope, dirt, the blinking thing. The
product supplies the meaning; the name holds a slot. If a stakeholder says "too
general" *and* "trying too hard," they want **specific and casual** — a real thing
with a picture attached (`Bullpen`, `Legwork`, `Nightdesk`), not an abstract noun.

## Metaphor dividend

Prefer a name that hands you a product vocabulary for free. `Popcorn` gives you
kernel (idle agent) → pop (activate) → batch (parallel run) → kettle (dashboard).
That is worth more than a marginally better sound, and most agencies charge for it.

## Handles, in the same pass

```bash
curl -s -o /dev/null -w '%{http_code}' https://api.github.com/users/<name>   # 404 = free
curl -s -o /dev/null -w '%{http_code}' https://registry.npmjs.org/<name>    # 404 = free
```

X blocks bots — verify by hand. Grab GitHub org and npm scope immediately; they
are free and they go fast.

## Registration

See **`cloudflare-domain-launch`** for the buy + deploy path. Two warnings that
belong here too:

- `POST /accounts/{acc}/registrar/registrations {"domain_name":"x.com"}`
  **executes immediately.** There is no dry-run and no confirmation step — a
  minimal body with only `domain_name` completes the purchase and charges the
  account. Do not send it as a schema probe.
- Registration is a **real financial transaction**. Surface the exact domain and
  price, get explicit human confirmation, then call it once.

## Related skills

- `cloudflare-domain-launch` — buy the domain, deploy the site, DNS/cert gotchas
- `saas-brand-system` / `vibebrand` — generate the brand system once the name lands
- `verify-branding` — check the name is applied consistently
- `ship-a-product` — the wider launch sequence
