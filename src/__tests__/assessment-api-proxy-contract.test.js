"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "../..");
const config = fs.readFileSync(path.join(root, "next.config.js"), "utf8");
const proxyRoute = fs.readFileSync(path.join(root, "src/app/valu/assessment/[[...path]]/route.js"), "utf8");
const proxy = fs.readFileSync(path.join(root, "src/lib/assessment-proxy.js"), "utf8");
const workerConfig = fs.readFileSync(path.join(root, "wrangler.jsonc"), "utf8");

describe("Assessment service-binding proxy contract", () => {
  test("nested assessment routes are not intercepted by external Next rewrites", () => {
    expect(config).not.toContain("source: '/valu/assessment/api/");
    expect(config).not.toContain("source: '/valu/assessment/:path*'");
    expect(proxyRoute).toContain("export const POST = proxyAssessment");
  });

  test("assessment proxy maps nested API paths to the Worker API root", () => {
    expect(proxy).toContain("if (suffix === 'api' || suffix.startsWith('api/')) return `/${suffix}`");
    expect(proxy).toContain("service = getCloudflareContext().env.VALU_ASSESSMENT");
    expect(proxy).toContain("service.fetch(upstreamRequest)");
  });

  test("staging and production have explicit assessment service bindings", () => {
    expect(workerConfig).toContain('"binding": "VALU_ASSESSMENT"');
    expect(workerConfig).toContain('"service": "valoria-assessment"');
    expect(workerConfig).toContain('"service": "valoria-staging-assessment"');
  });
});
