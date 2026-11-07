"use strict";

const fs = require("fs");
const path = require("path");

const dashboard = fs.readFileSync(
  path.join(__dirname, "../app/dashboard/page.jsx"),
  "utf8"
);

describe("authenticated staging dashboard continuation", () => {
  test("preview mode does not bypass authentication state loading", () => {
    const stateIndex = dashboard.indexOf("const [user, setUser] = useState(null)");
    const previewIndex = dashboard.indexOf("if (previewMode && !user) return <DashboardExperiencePreview />");
    expect(stateIndex).toBeGreaterThan(-1);
    expect(previewIndex).toBeGreaterThan(stateIndex);
    expect(dashboard).toContain("if (!previewMode) window.location.href = '/login'");
  });

  test("authenticated users with a completed taster reach the full-assessment handover", () => {
    expect(dashboard).toContain("if (!profile && assessmentAccess?.can_continue) return <DashboardAssessmentHandover standalone />");
    expect(dashboard).toContain("Your taster is complete. Begin your full assessment");
    expect(dashboard).toContain("START / CONTINUE YOUR FULL ASSESSMENT");
  });

  test("anonymous staging visitors retain the illustrative dashboard", () => {
    expect(dashboard).toContain("if (previewMode && !user) return <DashboardExperiencePreview />");
  });
});
