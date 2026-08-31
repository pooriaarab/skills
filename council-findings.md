# 🧑‍⚖️ LLM Council findings

Independent per-lens reviews from council models. Treat as co-reviewer input: de-dupe, verify each claim against the code, discard false positives, and only fix confidently-real issues.

## GPT-5.6 (Codex) — correctness lens

taboola-ads/SKILL.md:99 — Instructing users to create an event-based rule for every measured event breaks URL-based conversions, which only emit the base pixel and therefore never match an event rule -> limit this instruction to event-mapped conversions and explicitly retain URL-based rules for page-visit conversions.

taboola-ads/SKILL.md:143 — Lowercasing without trimming before SHA-256 causes an address such as `" User@example.com "` to hash differently and silently fail user matching -> instruct users to trim surrounding whitespace and lowercase before hashing.

## Gemini 3 Pro (via OpenRouter) — performance lens

No findings.

## Kimi K3 — security lens

_moonshot HTTP 429, openrouter: timed out_

## Grok 4.5 — maintainability lens

_terminated_

## GPT-5.6 (scope) — scope lens

No findings.
