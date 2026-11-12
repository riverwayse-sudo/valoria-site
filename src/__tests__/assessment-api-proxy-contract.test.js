"use strict";

const fs = require("fs");
const path = require("path");

const config = fs.readFileSync(path.join(__dirname, "../../next.config.js"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "../../src/styles/globals.css"), "utf8");

describe("Assessment proxy and staging navigation contract", () => {
  const endpoints = [
    "taster-progress",
    "submit-taster",
    "assessment-progress",
    "submit-assessment",
    "link-assessment-to-taster",
    "generate-and-send-report",
  ];

  test.each(endpoints)("proxies nested %s requests to the Worker root", endpoint => {
    const expected = "{ source: '/valu/assessment/api/" + endpoint + "', destination: \`${origin}/api/" + endpoint + "\` }";
    expect(config).toContain(expected);
  });

  test("nested API rewrites are evaluated before the assessment asset catch-all", () => {
    const apiRule = config.indexOf("{ source: '/valu/assessment/api/taster-progress'");
    const assetCatchAll = config.indexOf("{ source: '/valu/assessment/:path*'");
    expect(apiRule).toBeGreaterThanOrEqual(0);
    expect(assetCatchAll).toBeGreaterThan(apiRule);
  });

  test("staging preview banner cannot intercept navigation or other controls", () => {
    expect(styles).toMatch(/\.staging-site-banner\s*\{[^}]*position:\s*relative[^}]*pointer-events:\s*none\s*!important[^}]*\}/s);
  });
});
