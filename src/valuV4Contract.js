// valuV4Contract.js — VALU v4 canonical contract (CommonJS mirror of
// valoria-platform/src/valuV4Contract.js).
//
// Governed by Valoria Institute Brand Guidelines VI-BG-2026-001.
//
// This module is the site-side mirror of the contract that owns the canonical
// cluster weights, merit bands, marketplace score threshold and pathway bands.
// It previously lived inline inside scoringEngine.js, which is how the site's
// copy drifted from the platform's VALU v4 contract (see scoringEngine.js
// header). Keeping the constants in their own module makes the drift visible in
// one place and lets a test assert parity against the platform values.

"use strict";

const VALU_VERSION = 4;
const MAX_SCORE = 100;
const MARKETPLACE_SCORE_THRESHOLD = 35;

const CLUSTERS = Object.freeze([
  Object.freeze({ id: "P", name: "Presence", weight: 0.20, maxRaw: 36 }),
  Object.freeze({ id: "R", name: "Relationships", weight: 0.25, maxRaw: 48 }),
  Object.freeze({ id: "I", name: "Intelligence", weight: 0.25, maxRaw: 60 }),
  Object.freeze({ id: "M", name: "Mastery", weight: 0.20, maxRaw: 36 }),
  Object.freeze({ id: "E", name: "Enterprise", weight: 0.10, maxRaw: 36 }),
]);

// Merit bands are score-based credentials. They are never paid subscription tiers.
const DESIGNATIONS = Object.freeze([
  Object.freeze({ min: 90, name: "Elite", stars: "✦✦✦", color: "#C9A84C", bg: "#C9A84C" }),
  Object.freeze({ min: 75, name: "Distinguished", stars: "✦✦", color: "#C9A84C", bg: "#1A1A2E" }),
  Object.freeze({ min: 55, name: "Proficient", stars: "✦", color: "#2E2E4A", bg: "#EDE8DC" }),
  Object.freeze({ min: 35, name: "Standard", stars: "", color: "#2E2E4A", bg: "#F7F4EE" }),
]);

// Development pathways are separate from merit credentials.
const PATHWAYS = Object.freeze([
  Object.freeze({ min: 75, name: "Advanced Development Pathway" }),
  Object.freeze({ min: 55, name: "Cluster Development Pathway" }),
  Object.freeze({ min: 35, name: "Foundation Development Pathway" }),
  Object.freeze({ min: 0, name: "Assessment Follow-up Pathway" }),
]);

function getDesignation(score) {
  return DESIGNATIONS.find(d => score >= d.min) || DESIGNATIONS[DESIGNATIONS.length - 1];
}

function getPathway(score) {
  return (PATHWAYS.find(p => score >= p.min) || PATHWAYS[PATHWAYS.length - 1]).name;
}

function isMarketplaceScoreEligible(score) {
  return Number.isFinite(score) && score >= MARKETPLACE_SCORE_THRESHOLD;
}

function assertCanonicalWeights() {
  const total = CLUSTERS.reduce((sum, cluster) => sum + cluster.weight, 0);
  if (Math.abs(total - 1) > Number.EPSILON) {
    throw new Error(`Invalid VALU v${VALU_VERSION} cluster weights: expected 1, got ${total}`);
  }
}

assertCanonicalWeights();

module.exports = {
  VALU_VERSION,
  MAX_SCORE,
  MARKETPLACE_SCORE_THRESHOLD,
  CLUSTERS,
  DESIGNATIONS,
  PATHWAYS,
  getDesignation,
  getPathway,
  isMarketplaceScoreEligible,
  assertCanonicalWeights,
};
