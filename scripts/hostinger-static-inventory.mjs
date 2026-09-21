#!/usr/bin/env node
/**
 * Read-only production asset inventory.
 *
 * Usage:
 *   node scripts/hostinger-static-inventory.mjs
 *   node scripts/hostinger-static-inventory.mjs artifacts/rgg-website/dist
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "artifacts/rgg-website/dist");
const rows = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else {
      const file = await stat(fullPath);
      rows.push({
        path: path.relative(process.cwd(), fullPath),
        bytes: file.size,
      });
    }
  }
}

try {
  await walk(root);
} catch (error) {
  console.error(`Cannot inventory ${root}: ${error.message}`);
  process.exitCode = 1;
}

if (rows.length > 0) {
  rows.sort((a, b) => b.bytes - a.bytes);
  const total = rows.reduce((sum, row) => sum + row.bytes, 0);
  console.log(`Root: ${root}`);
  console.log(`Files: ${rows.length}`);
  console.log(`Total: ${(total / 1024 / 1024).toFixed(2)} MiB`);
  console.log("\nLargest files:");
  for (const row of rows.slice(0, 30)) {
    console.log(`${String(row.bytes).padStart(12)} ${row.path}`);
  }
}