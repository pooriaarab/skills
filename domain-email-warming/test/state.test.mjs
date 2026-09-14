import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { dayIndex, loadState, recordSend, saveState, sendsOnDay } from "../scripts/lib/state.mjs";

const tmp = () => mkdtemp(join(tmpdir(), "warm-state-"));

describe("loadState", () => {
  it("returns an empty state when the file does not exist", async () => {
    const s = await loadState("p", "2026-09-14", join(await tmp(), "p.json"));
    assert.deepEqual(s.sends, []);
    assert.equal(s.startDate, "2026-09-14");
  });

  it("quarantines a corrupt file instead of throwing or discarding it", async () => {
    // The state file is the only record of what has already been sent, so
    // silently starting over is how the same message goes out twice.
    const dir = await tmp();
    const path = join(dir, "p.json");
    await writeFile(path, "{not json");
    const s = await loadState("p", "2026-09-14", path);
    assert.deepEqual(s.sends, []);
    const left = await readdir(dir);
    assert.ok(left.some((f) => f.includes(".corrupt-")), `expected a .corrupt- backup, saw ${left}`);
  });

  it("treats a file whose sends is not an array as corrupt", async () => {
    const dir = await tmp();
    const path = join(dir, "p.json");
    await writeFile(path, JSON.stringify({ program: "p", sends: "nope" }));
    const s = await loadState("p", "2026-09-14", path);
    assert.deepEqual(s.sends, []);
  });
});

describe("saveState", () => {
  it("round-trips through a real file", async () => {
    const path = join(await tmp(), "p.json");
    const s = await loadState("p", "2026-09-14", path);
    recordSend(s, { id: "1", day: 1, to: "a@b.c", accepted: true });
    await saveState(s);
    const again = await loadState("p", "2026-09-14", path);
    assert.equal(again.sends.length, 1);
    assert.equal(again.sends[0].to, "a@b.c");
  });

  it("does not persist the internal path field", async () => {
    const path = join(await tmp(), "p.json");
    const s = await loadState("p", "2026-09-14", path);
    await saveState(s);
    assert.equal(JSON.parse(await readFile(path, "utf8"))._path, undefined);
  });

  it("leaves no temp file behind", async () => {
    const dir = await tmp();
    const s = await loadState("p", "2026-09-14", join(dir, "p.json"));
    await saveState(s);
    assert.deepEqual((await readdir(dir)).filter((f) => f.includes(".tmp-")), []);
  });
});

describe("dayIndex", () => {
  const s = { startDate: "2026-09-14" };

  it("is 1 on the start date itself", () => {
    assert.equal(dayIndex(s, new Date("2026-09-14T00:00:00Z")), 1);
  });

  it("is still 1 late on the start date in UTC", () => {
    assert.equal(dayIndex(s, new Date("2026-09-14T23:59:59Z")), 1);
  });

  it("rolls to 2 at UTC midnight, not local midnight", () => {
    assert.equal(dayIndex(s, new Date("2026-09-15T00:00:01Z")), 2);
  });

  it("never returns less than 1 for a date before the start", () => {
    assert.equal(dayIndex(s, new Date("2026-09-01T00:00:00Z")), 1);
  });
});

describe("sendsOnDay", () => {
  it("selects only the requested day", () => {
    const s = { sends: [{ day: 1 }, { day: 2 }, { day: 1 }] };
    assert.equal(sendsOnDay(s, 1).length, 2);
  });
});
