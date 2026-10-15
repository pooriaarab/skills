import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { warmupFiles } from "../scripts/lib/configs.mjs";

describe("warmupFiles", () => {
  it("finds apex plus nested configs, sorted, skipping other files", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "configs-test-"));
    fs.mkdirSync(path.join(dir, "domains"));
    fs.writeFileSync(path.join(dir, "apex.warmup.json"), "{}");
    fs.writeFileSync(path.join(dir, "domains", "u.warmup.json"), "{}");
    fs.writeFileSync(path.join(dir, "domains", "notes.txt"), "x");
    assert.deepEqual(warmupFiles(dir), [
      path.join(dir, "apex.warmup.json"),
      path.join(dir, "domains", "u.warmup.json"),
    ]);
  });
});
