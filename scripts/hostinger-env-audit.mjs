#!/usr/bin/env node
/**
 * Read-only source audit. Prints environment variable names only, never values.
 *
 * Usage: node scripts/hostinger-env-audit.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["artifacts", "lib", "scripts"];
const ignored = new Set(["node_modules", "dist", ".git", "coverage"]);
const names = new Set();

async function walk(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (!/\.(c|m)?tsx?$|\.m?js$|\.json$|\.sh$/.test(entry.name)) continue;
    const content = await readFile(fullPath, "utf8");
    for (const match of content.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
      names.add(match[1]);
    }
    for (const match of content.matchAll(/env\.([A-Z][A-Z0-9_]+)/g)) {
      names.add(match[1]);
    }
  }
}

for (const root of roots) await walk(root);
console.log([...names].sort().join("\n"));