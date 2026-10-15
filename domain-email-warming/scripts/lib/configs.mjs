// Shared fleet-config discovery. Layout: per-domain files under domains/
// plus apex configs (e.g. imecore.warmup.json) beside it. Every reader
// must walk the whole tree: flat reads silently drop whichever half sits
// elsewhere (live miss 2026-10-11: the monitor watched 88 of 91 domains).
import fs from "node:fs";
import path from "node:path";

export function warmupFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...warmupFiles(p));
    else if (e.name.endsWith(".warmup.json")) out.push(p);
  }
  return out.sort();
}
