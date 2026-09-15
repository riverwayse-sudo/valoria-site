// __tests__/01_scoring_engine.test.js
// Contract tests for the canonical VALU scoring engine.
"use strict";

const {
  computeWeightedIndex,
  getDesignation,
  getPathway,
  computeClusterScoresOnly,
} = require("../scoringEngine");

describe("computeWeightedIndex", () => {
  test("weights PRIME clusters correctly", () => {
    expect(computeWeightedIndex({ P: 100, R: 100, I: 100, M: 100, E: 100 })).toBe(100);
    expect(computeWeightedIndex({ P: 0, R: 0, I: 0, M: 0, E: 0 })).toBe(0);
  });
});

describe("computeClusterScoresOnly", () => {
  test("returns percentage scores for all five PRIME clusters", () => {
    expect(computeClusterScoresOnly({ P: 36, R: 48, I: 60, M: 36, E: 36 })).toEqual({ P: 100, R: 100, I: 100, M: 100, E: 100 });
  });
});

describe("getDesignation", () => {
  const cases = [
    [100, "Elite"],
    [90, "Elite"],
    [89, "Distinguished"],
    [75, "Distinguished"],
    [74, "Proficient"],
    [55, "Proficient"],
    [54, "Standard"],
    [35, "Standard"],
    [34, "Standard"],
    [0, "Standard"],
  ];

  test.each(cases)("score %i → %s", (score, expectedName) => {
    expect(getDesignation(score).name).toBe(expectedName);
  });

  test("official merit band boundaries are applied", () => {
    expect(getDesignation(90).name).toBe("Elite");
    expect(getDesignation(89).name).toBe("Distinguished");
    expect(getDesignation(75).name).toBe("Distinguished");
    expect(getDesignation(74).name).toBe("Proficient");
    expect(getDesignation(55).name).toBe("Proficient");
    expect(getDesignation(54).name).toBe("Standard");
  });

  test("returns object with min property", () => {
    const d = getDesignation(72);
    expect(d).toHaveProperty("min");
    expect(d).toHaveProperty("name");
  });
});
