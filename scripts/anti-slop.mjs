import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const run = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const sourceExtensions = new Set([".css", ".scss", ".sass", ".less", ".js", ".jsx", ".ts", ".tsx"]);
const tracked = run(["ls-files"]).split("\n").filter(Boolean);
const source = (list) => list.filter((file) => sourceExtensions.has(file.slice(file.lastIndexOf("."))));
let changed = source(tracked);

try {
  const event = process.env.GITHUB_EVENT_NAME;
  if (event === "pull_request") {
    const base = process.env.GITHUB_BASE_REF || "main";
    run(["fetch", "origin", base, "--depth=1"]);
    changed = source(run(["diff", "--name-only", `origin/${base}...HEAD`]).split("\n").filter(Boolean));
  } else if (event === "push" && process.env.GITHUB_EVENT_BEFORE) {
    changed = source(run(["diff", "--name-only", process.env.GITHUB_EVENT_BEFORE, "HEAD"]).split("\n").filter(Boolean));
  } else {
    const local = run(["diff", "--name-only", "HEAD"]);
    if (local) changed = source(local.split("\n").filter(Boolean));
  }
} catch {
  // If comparison refs are unavailable, inspect the tracked source tree.
}

const errors = [];
for (const file of changed) {
  let content;
  try { content = readFileSync(file, "utf8"); } catch { continue; }
  const lines = content.split("\n");
  const check = (pattern, rule, message) => lines.forEach((line, i) => {
    if (pattern.test(line)) errors.push(`${file}:${i + 1} — ${rule}: ${message}`);
  });

  check(/style\s*=\s*\{\s*\{/i, "INLINE_STYLE", "Use canonical component/token ownership; do not create one-off inline geometry or color.");
  check(/!important\b/i, "CASCADE_HACK", "Fix ownership or the cascade instead of using !important.");
  check(/console\.log\s*\(/i, "DEBUG_OUTPUT", "Remove debug logging from production source.");

  if (!/tokens|theme|design-system/i.test(file)) {
    check(/#[0-9a-fA-F]{6}\b/g, "RAW_COLOR", "Use canonical Valoria design tokens instead of page/component-local hex values.");
    check(/\b(?:teal|purple|violet|amber|coral)\b/i, "LEGACY_COLOR", "Do not reintroduce legacy PRIME/accent color systems.");
  }

  if (/\.(css|scss|sass|less)$/.test(file)) {
    check(/:nth-(?:child|of-type)\s*\(/i, "LAYOUT_PATCH", "Prefer component-owned layout primitives over positional CSS patches.");
  }
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
if (!pkg.scripts?.["anti-slop"]) errors.push("package.json — WORKFLOW_GAP: npm run anti-slop must remain the canonical local quality gate.");

console.log(`Anti-slop gate: inspecting ${changed.length} changed source file(s).`);
if (errors.length) {
  console.error("\nAnti-slop gate FAILED:");
  errors.forEach((item) => console.error(`  ✕ ${item}`));
  console.error("\nFix the underlying system, not the symptom. Do not bypass this gate.");
  process.exit(1);
}
console.log("Anti-slop gate PASSED.");