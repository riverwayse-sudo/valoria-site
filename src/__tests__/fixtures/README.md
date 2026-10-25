# Scoring parity fixtures

These fixtures pin the site's VALU scoring to the canonical platform contract.

- `scoring-fixture-bank.json` — a small question bank shaped like the canonical
  58-question bank: five scored clusters (P/R/I/M/E) plus validity anchors
  (cluster `VA`, excluded from scoring) and two `futureReady` items.
- `../scoring-parity-vectors.json` — golden result objects produced by the
  **canonical** platform engine
  (`valoria-platform/valoria-final/src/scoringEngine.js`) over the fixture bank
  and a set of deterministic answer/timing sets.

`scoring-parity.test.js` replays each vector through
`src/scoringEngine.js` and asserts every returned field is identical.

## Regenerating

Run the canonical engine over the same bank and answer sets, and replace
`scoring-parity-vectors.json` with its output. Do not hand-edit the vectors.

Any diff means the site scoring has drifted from the platform contract again —
fix `src/valuV4Contract.js` / `src/scoringEngine.js` to match the platform, not
the fixture.
