// valoria-site/src/__tests__/dollar-quote-integrity.test.js
//
// Companion to the platform's 28_dollar_quote_integrity.test.js. Two tracked
// migrations in this repository carried truncated dollar-quote delimiters:
// `do $` / `as $` where `do $$` / `as $$` was meant, closed by `$;` instead of
// `$$;`. The files are valid-looking text and every existing static check
// passed, because the defect is only visible to a SQL parser.
//
// PostgreSQL reports it as `syntax error at or near "$"`, so the migration can
// never apply to any database, clean or otherwise, and the trigger or function
// it defines silently never exists. One of the two is the canonical lead
// pipeline, so the lead capture it installs was missing wherever the file had
// not been applied by hand.
//
// The same defect was found in the platform's copy of
// 20260921121500_close_signup_profile_capability_listing_drift.sql, so both
// repositories guard it.

"use strict";

const fs = require("fs");
const path = require("path");

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "supabase", "migrations");

// Comments and string literals can contain a lone `$` legitimately.
function strip(sql) {
  return sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/'(?:[^']|'')*'/g, "''");
}

function migrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

describe("dollar-quote integrity", () => {
  const files = migrationFiles();

  test("the migrations directory is non-empty", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test("no migration contains a truncated dollar-quote delimiter", () => {
    const offenders = [];
    for (const file of files) {
      const sql = strip(fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8"));
      sql.split("\n").forEach((line, i) => {
        if (/(?:^|\s)\$[^$\w]?\s*$/.test(line) || /^\s*\$;\s*$/.test(line)) {
          offenders.push(`${file}:${i + 1}: ${line.trim()}`);
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
      for (const m of sql.matchAll(/\$([A-Za-z_]*)\$/g)) {
        counts.set(m[1], (counts.get(m[1]) || 0) + 1);
      }
      for (const [tag, n] of counts) {
        if (n % 2 !== 0) unbalanced.push(`${file}: $${tag}$ appears ${n} time(s)`);
      }
    }
    expect(unbalanced).toEqual([]);
  });
});
