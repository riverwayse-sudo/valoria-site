// Guards PostgreSQL dollar-quote delimiters in the site's tracked migrations.
"use strict";

const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "supabase", "migrations");

function strip(sql) {
  return sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/'(?:[^']|'')*'/g, "''");
}

describe("dollar-quote integrity", () => {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(file => file.endsWith(".sql"));

  test("migration directory is non-empty", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test("no migration contains a truncated dollar-quote delimiter", () => {
    const offenders = [];
    for (const file of files) {
      const sql = strip(fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"));
      sql.split("\n").forEach((line, index) => {
        if (/(?:^|\s)\$[^$\w]?\s*$/.test(line) || /^\s*\$;\s*$/.test(line)) {
          offenders.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  test("every dollar-quote opener has a matching closer", () => {
    const unbalanced = [];
    for (const file of files) {
      const sql = strip(fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"));
      const counts = new Map();
      for (const match of sql.matchAll(/\$([A-Za-z_]*)\$/g)) {
        counts.set(match[1], (counts.get(match[1]) || 0) + 1);
      }
      for (const [tag, count] of counts) {
        if (count % 2 !== 0) unbalanced.push(`${file}: $${tag}$ appears ${count} time(s)`);
      }
    }
    expect(unbalanced).toEqual([]);
  });
});
