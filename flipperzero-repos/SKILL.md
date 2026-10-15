---
name: flipperzero-repos
description: "Catalog of 435 open-source Flipper Zero GitHub repos (firmware, apps, NFC/RFID, Sub-GHz, BadUSB, Wi-Fi/BLE add-ons, defensive tools, aggregators), with install mechanics and authorization guidance. Use when choosing custom firmware, finding an app for a category, or deciding whether a repo is safe to flash."
---

# flipperzero-repos

A dulled-down map of the Flipper Zero open-source ecosystem. The full list is
in [`references/catalog.generated.md`](references/catalog.generated.md):
435 unique repos, pulled via `gh search repos` across 9 Flipper topics and 14
keyword queries, deduped and sorted by stars, auto-sorted into categories by a
keyword match on name + description. Categories are a starting point, not a
verdict — read a repo before you install it.

## Install mechanics

Four ways an app or firmware ends up on the device, from least to most risk:

1. **Official app catalog** (Mobile app, or `lab.flipper.net`). Apps here went
   through Flipper's own review. Safest default for a specific function.
2. **Custom firmware** (Unleashed, Momentum, Xtreme — see catalog's "Core
   firmware" section). Bundles a wider app set and removes some regional
   radio limits. Flash with qFlipper; keep the stock-firmware `.tgz` so you
   can revert.
3. **`ufbt` build from source.** `ufbt` (see "Build tools & SDKs") compiles a
   `.fap` from a repo's source on your machine, for a specific firmware
   version. Read the source first — a `.fap` runs with the same access the
   firmware grants any app.
4. **Manual `.fap` copy to `/ext/apps/<Category>/`.** No review step at all.
   Only do this from a repo you've read, not a random download link.

Back up `/int` with `qFlipper-cli backup <file>` before flashing unfamiliar
firmware — it holds your settings and saved keys, and a bad flash can wipe it.

## Authorization boundary

Every category below is dual-use: the same app reads your own access badge or
someone else's, jams your own garage remote's frequency or a neighbor's. This
skill, and any agent using it, only helps with:

- a device, card, fob, or network **you own**, or
- a target you have **explicit written authorization** to test (a pentest
  engagement, a CTF, a bug bounty).

If neither applies, say so before asking for install help — a skill can't
verify authorization, only name the line.

## Categories, roughly ranked by how often the "own device" line gets crossed

Low risk — almost always your own hardware:

- **NFC / RFID** — copying your own access badge, library card, or reading a
  transit card (see `metroflip` in the catalog) is normal use. Note: these
  apps read electronic chips, not metal key bittings — "copying a mechanical
  key" needs an optical/photogrammetry tool, not NFC/RFID.
- **Infrared** — universal remotes. No real misuse path.
- **Defensive / counter-surveillance** — built to protect you (NFC skimmer
  and AirTag detection, ALPR-camera spotting). Running one is never the risky
  part.
- **Sub-GHz: capturing your own remote** (garage, gate, car fob) to replay it
  yourself. Fixed-code brute-force and jamming tools sit in the same category
  but turn the risk up fast: brute-forcing a fob you don't own is unauthorized
  access, and jamming is usually illegal outright, regardless of who owns the
  target.

Needs a stated target before going further:

- **Wi-Fi / Bluetooth / ESP32** (Marauder, Ghost ESP, deauth, evil portal) —
  fine against your own AP; deauthing or portal-phishing a network you don't
  control is unauthorized access almost everywhere.
- **BadUSB** — the payload runs with the keyboard permissions of whatever
  computer it's plugged into. Testing it against your own machine is normal
  security hygiene. Many public payload packs are written to exfiltrate
  credentials or Wi-Fi passwords from a victim machine — don't deploy a
  payload you haven't read, and never point one at a machine that isn't
  yours or an engagement's.

## What's deliberately left out

Games and general productivity apps (authenticators, wallets, barcode tools)
are in the catalog for completeness but aren't summarized here — they carry
no authorization question, just personal preference.
