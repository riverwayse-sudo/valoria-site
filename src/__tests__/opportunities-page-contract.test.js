"use strict";

const fs = require("fs");
const path = require("path");

const page = fs.readFileSync(path.join(__dirname, "../app/opportunities/page.jsx"), "utf8");

describe("Opportunity discovery empty and error states", () => {
  test("only a verified empty API response is described as no public opportunities", () => {
    expect(page).toContain("if (!Array.isArray(all.opportunities)) throw new Error('Opportunity data could not be verified.')");
    expect(page).toContain("data-opportunities-empty=\"true\"");
    expect(page).toContain("No public opportunities yet.");
  });

  test("API failures are not misrepresented as an empty opportunity market", () => {
    expect(page).toContain("data-opportunities-error=\"true\"");
    expect(page).toContain("Opportunities are temporarily unavailable.");
    expect(page).toContain("TRY AGAIN");
  });

  test("the buyer submission route remains discoverable", () => {
    expect(page).toContain('href="/opportunities/submit"');
    expect(page).toContain('data-opportunities-submit="true"');
    expect(page).toContain("POST AN OPPORTUNITY");
  });
});
