#!/usr/bin/env node
// Tokenless coverage ratchet — no external service, no tokens.
// Reads the coverage-summary.json the test run already produced, compares total
// line coverage to a baseline committed in the repo (.coverage-baseline.json).
//
//   node coverage-gate.mjs check   # PR: warn (advisory) or fail (--strict) if coverage dropped
//   node coverage-gate.mjs update  # main: raise the baseline when coverage improved
//
// Pass --strict to make `check` exit 1 on a drop (the ratchet's "error" phase).
// Warn-first default: `check` only warns, so it never blocks a PR until you opt in.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const MODE = process.argv[2] === "update" ? "update" : "check";
const STRICT = process.argv.includes("--strict");
const BASELINE = ".coverage-baseline.json";
const EPS = 0.01;

// vitest/jest json-summary lives here by default; accept a few common spots.
const CANDIDATES = [
  "coverage/coverage-summary.json",
  "coverage/coverage-final.json",
  "apps/web/coverage/coverage-summary.json",
  "packages/website/coverage/coverage-summary.json",
];

function findSummary() {
  for (const p of CANDIDATES) if (existsSync(p)) return p;
  return null;
}

function pctFrom(file) {
  const j = JSON.parse(readFileSync(file, "utf8"));
  // json-summary shape: { total: { lines: { pct } } }
  if (j.total?.lines?.pct != null) return Number(j.total.lines.pct);
  return null;
}

const file = findSummary();
if (!file) {
  console.log("coverage-gate: no coverage-summary.json found — skipping (tests may not emit coverage).");
  process.exit(0);
}
const pct = pctFrom(file);
if (pct == null) {
  console.log(`coverage-gate: could not read total line % from ${file} — skipping.`);
  process.exit(0);
}

const baseline = existsSync(BASELINE) ? Number(JSON.parse(readFileSync(BASELINE, "utf8")).lines) : null;

if (MODE === "update") {
  if (baseline == null || pct > baseline + EPS) {
    writeFileSync(BASELINE, JSON.stringify({ lines: pct }, null, 2) + "\n");
    console.log(`coverage-gate: baseline ${baseline ?? "∅"} → ${pct}%`);
  } else {
    console.log(`coverage-gate: coverage ${pct}% ≤ baseline ${baseline}% — baseline unchanged.`);
  }
  process.exit(0);
}

// check
if (baseline == null) {
  console.log(`coverage-gate: no baseline yet (coverage ${pct}%). It will be set on the next merge to main.`);
  process.exit(0);
}
if (pct + EPS < baseline) {
  const msg = `coverage-gate: coverage DROPPED ${baseline}% → ${pct}% (−${(baseline - pct).toFixed(2)}pp).`;
  if (STRICT) { console.error(msg + " Failing (strict)."); process.exit(1); }
  console.log("##[warning]" + msg + " (advisory — add --strict to block)");
  process.exit(0);
}
console.log(`coverage-gate: coverage ${pct}% ≥ baseline ${baseline}% — OK.`);
process.exit(0);
