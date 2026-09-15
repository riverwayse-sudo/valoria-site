  test("requires lockRecord.fingerprint to be present", () => {
    const fp   = computeFingerprint("Locked User", "Director");
    const lock = buildLockRecord(fp, new Date().toISOString());
    // lockRecord.fingerprint must exist for the "view previous" button to work
    expect(lock.fingerprint).toBeTruthy();
  });

  test("DB result used when lockRecord.fingerprint is available", () => {
    const fp   = computeFingerprint("Locked User", "Director");
    const lock = buildLockRecord(fp, new Date().toISOString());
    const profile = simulateDBResult({ valuIndex: 68 });
    // Simulates: onBegin({ previousProfile: profile })
    expect(profile.results.valuIndex).toBe(68);
    expect(profile.results.desig.name).toBe("Proficient");
  });

  test("view previous result has aiReport field (may be null)", () => {
    const profile = simulateDBResult();
    expect(profile).toHaveProperty("aiReport");
  });
