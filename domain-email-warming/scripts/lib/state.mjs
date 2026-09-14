// The record of everything the program has sent.
//
// This file is the only thing standing between a re-run and a duplicate send,
// so writes are atomic and a damaged file is quarantined rather than trusted.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

function stateDir() {
  return join(process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"), "domain-email-warming");
}

export function statePath(program) {
  return join(stateDir(), `${program}.json`);
}

function empty(program, startDate) {
  return { program, startDate, sends: [] };
}

export async function loadState(program, startDate, path = statePath(program)) {
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return { ...empty(program, startDate), _path: path };
    throw err;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.sends)) throw new Error("sends is not an array");
    return { ...parsed, startDate: parsed.startDate ?? startDate, _path: path };
  } catch {
    // Keep the damaged file: it may still be readable by hand, and silently
    // discarding the only send history is how duplicate sends happen.
    const backup = `${path}.corrupt-${Date.now()}`;
    await rename(path, backup).catch(() => {});
    console.error(`warmctl: state file was unreadable, moved to ${backup} and started fresh`);
    return { ...empty(program, startDate), _path: path };
  }
}

export async function saveState(state) {
  const path = state._path ?? statePath(state.program);
  await mkdir(dirname(path), { recursive: true });
  const { _path, ...persist } = state;
  // Write then rename: a crash mid-write leaves the previous state intact
  // rather than a truncated file.
  const tmp = `${path}.tmp-${process.pid}`;
  await writeFile(tmp, `${JSON.stringify(persist, null, 2)}\n`, "utf8");
  await rename(tmp, path);
}

/** 1-based: on startDate itself this is day 1. UTC, so the day never rolls at the wrong hour. */
export function dayIndex(state, now = new Date()) {
  const start = Date.parse(`${state.startDate}T00:00:00Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(1, Math.floor((today - start) / 86400000) + 1);
}

export function sendsOnDay(state, day) {
  return state.sends.filter((s) => s.day === day);
}

export function recordSend(state, entry) {
  state.sends.push(entry);
  return entry;
}

export function findSendByMessageId(state, messageId) {
  return state.sends.find((s) => s.messageId === messageId) ?? null;
}
