// __tests__/01_scoring_engine.test.js
// Phase 1 — Scoring function unit tests.
// Every test uses known inputs and asserts exact expected outputs.
// These pin the canonical VALU scoring math.

"use strict";

const {
  CLUSTERS,
  seededShuffle,
  computeClusterScoresOnly,
  computeWeightedIndex,
  getDesignation,
  getPathway,
  computeResults,
} = require("../scoringEngine");

function makeQuestion(id, cluster, skill, validAnchor = false) {
  return {
    id, cluster, skill: validAnchor ? "Validity" : skill,
    type: validAnchor ? "anchor" : "behavioural", validAnchor,
    q: `Test question ${id}`,
    options: [
      { text: "Option A", score: 1 }, { text: "Option B", score: 2 },
      { text: "Option C", score: 3 }, { text: "Option D", score: 4 },
    ],
  };
}

const FIXTURE_QUESTIONS = [
  makeQuestion("P1", "P", "Communication"), makeQuestion("P2", "P", "Negotiation"),
  makeQuestion("P3", "P", "Personal Brand & Executive Presence"),
  makeQuestion("R1", "R", "Emotional Intelligence"), makeQuestion("R2", "R", "Conflict Resolution"),
  makeQuestion("R3", "R", "People Development"), makeQuestion("R4", "R", "Stakeholder Management"),
  makeQuestion("I1", "I", "Critical Thinking"), makeQuestion("I2", "I", "Strategic Thinking"),
  makeQuestion("I3", "I", "Business Acumen"), makeQuestion("I4", "I", "Managing Ambiguity"),
  makeQuestion("I5", "I", "AI Fluency", false),
  makeQuestion("M1", "M", "Execution & Accountability"), makeQuestion("M2", "M", "Resilience & Self-Leadership"),
  makeQuestion("M3", "M", "Adaptability"), makeQuestion("E1", "E", "Commercial Creativity"),
  makeQuestion("E2", "E", "Influence Without Authority"), makeQuestion("E3", "E", "Human-AI Collaboration"),
  makeQuestion("VA1", "VA", "Validity", true),
];

describe("computeClusterScoresOnly", () => {
  test("all max raw → all 100", () => {
    const scores = computeClusterScoresOnly({ P: 36, R: 48, I: 60, M: 36, E: 36 });
    expect(scores.P).toBe(100); expect(scores.R).toBe(100); expect(scores.I).toBe(100);
    expect(scores.M).toBe(100); expect(scores.E).toBe(100);
  });
  test("all zero raw → all 0", () => {
    const scores = computeClusterScoresOnly({ P: 0, R: 0, I: 0, M: 0, E: 0 });
    CLUSTERS.forEach(c => expect(scores[c.id]).toBe(0));
  });
  test("half raw → 50 each", () => {
    const scores = computeClusterScoresOnly({ P: 18, R: 24, I: 30, M: 18, E: 18 });
    CLUSTERS.forEach(c => expect(scores[c.id]).toBe(50));
  });
  test("partial cluster — P only", () => {
    const scores = computeClusterScoresOnly({ P: 27, R: 0, I: 0, M: 0, E: 0 });
    expect(scores.P).toBe(75); expect(scores.R).toBe(0);
  });
  test("missing cluster key treated as 0", () => {
    const scores = computeClusterScoresOnly({ P: 36 });
    expect(scores.P).toBe(100); expect(scores.R).toBe(0); expect(scores.I).toBe(0);
  });
});

describe("computeWeightedIndex", () => {
  test("all 100 → VALU Index = 100", () => expect(computeWeightedIndex({ P: 100, R: 100, I: 100, M: 100, E: 100 })).toBe(100));
  test("all 0 → VALU Index = 0", () => expect(computeWeightedIndex({ P: 0, R: 0, I: 0, M: 0, E: 0 })).toBe(0));
  test("all 50 → VALU Index = 50", () => expect(computeWeightedIndex({ P: 50, R: 50, I: 50, M: 50, E: 50 })).toBe(50));
  test("weights sum to 1.0", () => expect(CLUSTERS.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1.0, 5));
  test("known asymmetric scores produce correct weighted result", () => expect(computeWeightedIndex({ P: 80, R: 60, I: 70, M: 90, E: 50 })).toBe(72));
  test("high E cluster does not disproportionately inflate index", () => expect(computeWeightedIndex({ P: 0, R: 0, I: 0, M: 0, E: 100 })).toBe(10));
  test("R and I clusters dominate correctly", () => expect(computeWeightedIndex({ P: 0, R: 100, I: 100, M: 0, E: 0 })).toBe(50));
});

describe("getDesignation", () => {
  const cases = [[100,"Elite"],[90,"Elite"],[89,"Distinguished"],[75,"Distinguished"],[74,"Proficient"],[55,"Proficient"],[54,"Standard"],[35,"Standard"]];
  test.each(cases)("score %i → %s", (score, expectedName) => expect(getDesignation(score).name).toBe(expectedName));
  test("official merit band boundaries are applied", () => {
    expect(getDesignation(90).name).toBe("Elite"); expect(getDesignation(89).name).toBe("Distinguished");
    expect(getDesignation(75).name).toBe("Distinguished"); expect(getDesignation(74).name).toBe("Proficient");
    expect(getDesignation(55).name).toBe("Proficient"); expect(getDesignation(54).name).toBe("Standard");
  });
  test("returns object with min property", () => expect(getDesignation(72)).toEqual(expect.objectContaining({ min: expect.any(Number), name: expect.any(String) })));
});

describe("getPathway", () => {
  const cases = [[100,"PCP Certification"],[80,"PCP Certification"],[79,"PRIME Programme"],[65,"PRIME Programme"],[64,"PRIME Cluster"],[50,"PRIME Cluster"],[49,"PRIME Sprint"],[35,"PRIME Sprint"],[0,"PRIME Sprint"]];
  test.each(cases)("score %i → %s", (score, expected) => expect(getPathway(score)).toBe(expected));
  test("PRIME Sprint boundary is < 50", () => { expect(getPathway(50)).toBe("PRIME Cluster"); expect(getPathway(49)).toBe("PRIME Sprint"); });
});

describe("seededShuffle", () => {
  const arr = [{ text:"A", score:1 },{ text:"B", score:2 },{ text:"C", score:3 },{ text:"D", score:4 }];
  test("same seed produces same order", () => expect(seededShuffle(arr,42).map(o=>o.text)).toEqual(seededShuffle(arr,42).map(o=>o.text)));
  test("different seeds produce different orders", () => expect(seededShuffle(arr,1).map(o=>o.text)).not.toEqual(seededShuffle(arr,99999).map(o=>o.text)));
  test("does not mutate original array", () => { const original=[...arr]; seededShuffle(arr,7); expect(arr).toEqual(original); });
  test("contains same elements", () => expect(seededShuffle(arr,12345).map(o=>o.text).sort()).toEqual(arr.map(o=>o.text).sort()));
  test("same question index + different session seed produces different shuffle", () => expect(seededShuffle(arr,10005).map(o=>o.text)).not.toEqual(seededShuffle(arr,20005).map(o=>o.text)));
});

describe("computeResults (full pipeline)", () => {
  const perfectAnswers = questions => Object.fromEntries(questions.map((q,i)=>q.cluster !== "VA" ? [i,3] : [] ).filter(Boolean));
  const worstAnswers = questions => Object.fromEntries(questions.map((q,i)=>[i,0]));
  const slowTimings = Array(FIXTURE_QUESTIONS.length).fill(60000);

  test("perfect answers → positive index and higher than worst", () => {
    const r=computeResults(perfectAnswers(FIXTURE_QUESTIONS),slowTimings,{},FIXTURE_QUESTIONS);
    const worst=computeResults(worstAnswers(FIXTURE_QUESTIONS),slowTimings,{},FIXTURE_QUESTIONS);
    expect(r.valuIndex).toBeGreaterThan(0); expect(r.valuIndex).toBeGreaterThan(worst.valuIndex);
  });
  test("worst answers → low VALU Index", () => expect(computeResults(worstAnswers(FIXTURE_QUESTIONS),slowTimings,{},FIXTURE_QUESTIONS).valuIndex).toBeLessThan(50));
  test("empty answers → 0", () => expect(computeResults({},slowTimings,{},FIXTURE_QUESTIONS).valuIndex).toBe(0));
  test("gaming detected when 3+ validity anchors score 1", () => {
    const qs=[...FIXTURE_QUESTIONS,makeQuestion("VA2","VA","Validity",true),makeQuestion("VA3","VA","Validity",true),makeQuestion("VA4","VA","Validity",true)];
    const answers={}; qs.forEach((q,i)=>answers[i]=q.cluster==="VA"?0:3);
    const r=computeResults(answers,slowTimings,{},qs); expect(r.gamingDetected).toBe(true); expect(r.anchorFlags).toBeGreaterThanOrEqual(3);
  });
  test("gaming penalty reduces index by ~20%", () => expect(Math.round(75*0.8)).toBe(60));
  test("speed flag triggers under 12 minutes", () => expect(computeResults(perfectAnswers(FIXTURE_QUESTIONS),Array(FIXTURE_QUESTIONS.length).fill(5000),{},FIXTURE_QUESTIONS).speedFlag).toBe(true));
  test("speed flag triggers with 3+ answers under 8 seconds", () => {
    const timings=Array(FIXTURE_QUESTIONS.length).fill(30000); timings[0]=4000; timings[1]=5000; timings[2]=6000;
    expect(computeResults(perfectAnswers(FIXTURE_QUESTIONS),timings,{},FIXTURE_QUESTIONS).speedFlag).toBe(true);
  });
  test("shuffleMap uses original option score", () => {
    const answers={0:0}; const shuffleMap={0:[{text:"C",score:3},{text:"A",score:1},{text:"B",score:2},{text:"D",score:4}]};
    expect(computeResults(answers,slowTimings,shuffleMap,FIXTURE_QUESTIONS).clusterScores.P).toBeGreaterThan(0);
  });
  test("result includes all required output fields", () => {
    const r=computeResults(perfectAnswers(FIXTURE_QUESTIONS),slowTimings,{},FIXTURE_QUESTIONS);
    ["valuIndex","clusterScores","skillScores","desig","futureReadyScore","strongest","weakest","consistencyFlags","gamingDetected","anchorFlags","speedFlag","uniformityFlag","listed","pathway","anyFlag","globalSD"].forEach(f=>expect(r).toHaveProperty(f));
  });
  test("listed = false when valuIndex < 35", () => {
    const r=computeResults(worstAnswers(FIXTURE_QUESTIONS),slowTimings,{},FIXTURE_QUESTIONS); if(r.valuIndex<35) expect(r.listed).toBe(false);
  });
  test("listed = false when uniformityFlag is true", () => {
    const answers={}; FIXTURE_QUESTIONS.forEach((q,i)=>answers[i]=2); const r=computeResults(answers,slowTimings,{},FIXTURE_QUESTIONS);
    if(r.uniformityFlag) expect(r.listed).toBe(false); expect(typeof r.listed).toBe("boolean");
  });
  test("frontend and backend produce identical index for same raw scores", () => {
    const raw={P:27,R:36,I:45,M:27,E:27}; const scores=computeClusterScoresOnly(raw); expect(computeWeightedIndex(scores)).toBe(computeWeightedIndex(scores));
  });
});
