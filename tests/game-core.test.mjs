import test from "node:test";
import assert from "node:assert/strict";

await import("../game-core.js");

const core = globalThis.BlackCaseCore;

const DEFS = Object.freeze({
  dot: Object.freeze({ w: 1, h: 1 }),
  bar: Object.freeze({ w: 3, h: 1 }),
  block: Object.freeze({ w: 2, h: 2 }),
  ammo: Object.freeze({ w: 1, h: 1, ammo: Object.freeze({ ammoType: "test" }) }),
  weapon: Object.freeze({ w: 2, h: 1, weapon: Object.freeze({ ammoType: "test", capacity: 6 }) }),
});

function item(uid, defId, overrides = {}) {
  return { uid, defId, container: "case", x: 0, y: 0, rot: 0, ...overrides };
}

function layoutFromPlacements(items, placements) {
  const byUid = new Map(placements.map(placement => [placement.uid, placement]));
  return items.map(entry => ({ ...entry, container: "case", ...byUid.get(entry.uid) }));
}

test("expose l'API classique attendue", () => {
  assert.deepEqual(Object.keys(core).sort(), [
    "getDims", "mulberry32", "shuffleDeterministic", "solvePacking", "toUint32", "validateLayout",
  ]);
  assert.equal(core.toUint32(-1), 0xffffffff);
  assert.equal(core.toUint32(0x100000000), 0);
});

test("mulberry32 et Fisher-Yates sont déterministes et ne mutent pas la source", () => {
  const first = Array.from({ length: 8 }, () => core.mulberry32(7)());
  assert.equal(new Set(first).size, 1, "chaque générateur recréé doit commencer par la même valeur");

  const rngA = core.mulberry32(123456);
  const rngB = core.mulberry32(123456);
  assert.deepEqual(Array.from({ length: 12 }, rngA), Array.from({ length: 12 }, rngB));

  const source = ["a", "b", "c", "d", "e", "f"];
  const shuffledA = core.shuffleDeterministic(source, core.mulberry32(99));
  const shuffledB = core.shuffleDeterministic(source, core.mulberry32(99));
  assert.deepEqual(shuffledA, shuffledB);
  assert.deepEqual([...shuffledA].sort(), [...source].sort());
  assert.deepEqual(source, ["a", "b", "c", "d", "e", "f"]);
  assert.notStrictEqual(shuffledA, source);
});

test("getDims applique une rotation à 90 degrés", () => {
  assert.deepEqual(core.getDims({ defId: "bar", rot: 0 }, DEFS), [3, 1]);
  assert.deepEqual(core.getDims({ defId: "bar", rot: 0 }, DEFS, 1), [1, 3]);
  assert.throws(() => core.getDims({ defId: "missing", rot: 0 }, DEFS), /definition/);
  assert.throws(() => core.getDims({ defId: "bar", rot: 2 }, DEFS), /rotation/);
});

test("validateLayout accepte les bords exacts et les objets qui se touchent", () => {
  const items = [
    item("bar-a", "bar", { x: 0, y: 0 }),
    item("bar-b", "bar", { x: 0, y: 1 }),
    item("stored", "block", { container: "storage", x: 2, y: 1 }),
  ];
  const result = core.validateLayout(items, { case: [3, 2], storage: [4, 3] }, DEFS);
  assert.deepEqual(result, { valid: true, errors: [] });
});

test("validateLayout détecte limites, collisions et identifiants invalides", () => {
  const items = [
    item("same", "block", { x: 0, y: 0 }),
    item("same", "block", { x: 1, y: 1 }),
    item("outside", "bar", { x: 2, y: 3 }),
    item("fraction", "dot", { x: 0.5, y: 0 }),
    item("rotation", "dot", { x: 3, y: 0, rot: 2 }),
    item("container", "dot", { container: "void" }),
    item("unknown", "missing"),
  ];
  const result = core.validateLayout(items, { case: [4, 4], storage: [4, 4] }, DEFS);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("duplicates")));
  assert.ok(result.errors.some(error => error.includes("overlaps")));
  assert.ok(result.errors.some(error => error.includes("outside case bounds")));
  assert.ok(result.errors.some(error => error.includes(".x must be an integer")));
  assert.ok(result.errors.some(error => error.includes(".rot must be 0 or 1")));
  assert.ok(result.errors.some(error => error.includes(".container")));
  assert.ok(result.errors.some(error => error.includes(".defId")));
});

test("validateLayout contrôle quantités et chargement des armes", () => {
  const valid = [
    item("ammo-ok", "ammo", { quantity: 0 }),
    item("weapon-ok", "weapon", { x: 1, loaded: 6 }),
  ];
  assert.equal(core.validateLayout(valid, { case: [4, 2], storage: [4, 2] }, DEFS).valid, true);

  const invalid = [
    item("ammo-bad", "ammo", { quantity: -1 }),
    item("weapon-bad", "weapon", { x: 1, loaded: 7 }),
    item("plain-bad", "dot", { x: 3, quantity: 2, loaded: 1 }),
  ];
  const result = core.validateLayout(invalid, { case: [4, 2], storage: [4, 2] }, DEFS);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes("quantity must")));
  assert.ok(result.errors.some(error => error.includes("loaded must")));
  assert.ok(result.errors.some(error => error.includes("quantity is only")));
  assert.ok(result.errors.some(error => error.includes("loaded is only")));
});

test("solvePacking utilise les rotations et renvoie un layout valide", () => {
  const items = [{ uid: "bar", defId: "bar" }, { uid: "dot", defId: "dot" }];
  const placements = core.solvePacking(items, 2, 3, DEFS, { timeLimitMs: 1000, maxNodes: 10000 });
  assert.ok(placements);
  assert.equal(placements.find(entry => entry.uid === "bar").rot, 1);

  const layout = layoutFromPlacements(items, placements);
  assert.equal(core.validateLayout(layout, { case: [2, 3], storage: [2, 3] }, DEFS).valid, true);
});

test("solvePacking distingue aire insuffisante et géométrie impossible", () => {
  const tooLarge = [0, 1].map(index => ({ uid: `large-${index}`, defId: "block" }));
  assert.equal(core.solvePacking(tooLarge, 3, 2, DEFS), null);

  const geometric = [0, 1, 2].map(index => ({ uid: `square-${index}`, defId: "block" }));
  assert.equal(core.solvePacking(geometric, 3, 4, DEFS, { timeLimitMs: 1000, maxNodes: 100000 }), null);
  assert.equal(core.solvePacking([{ uid: "dot", defId: "dot" }], 2, 2, DEFS, { maxNodes: 1 }), null);
});

test("solvePacking est déterministe et ne mute ni objets ni définitions", () => {
  const items = [
    { uid: "b", defId: "block", metadata: { preserved: true } },
    { uid: "a", defId: "bar" },
    { uid: "c", defId: "dot" },
  ];
  const itemsBefore = structuredClone(items);
  const defsBefore = structuredClone(DEFS);
  const options = { timeLimitMs: 1000, maxNodes: 100000 };
  const first = core.solvePacking(items, 4, 3, DEFS, options);
  const second = core.solvePacking(items, 4, 3, DEFS, options);
  assert.deepEqual(first, second);
  assert.deepEqual(items, itemsBefore);
  assert.deepEqual(DEFS, defsBefore);
});

test("fuzz déterministe : les ensembles construits comme packables restent valides", () => {
  const rng = core.mulberry32(0xB1ACCA5E);

  for (let iteration = 0; iteration < 30; iteration++) {
    const cols = 3 + Math.floor(rng() * 4);
    const rows = 3 + Math.floor(rng() * 4);
    const occupied = Array.from({ length: rows }, () => Array(cols).fill(false));
    const defs = {};
    const items = [];

    for (let candidate = 0; candidate < 7; candidate++) {
      const width = 1 + Math.floor(rng() * Math.min(3, cols));
      const height = 1 + Math.floor(rng() * Math.min(3, rows));
      const spots = [];
      for (let y = 0; y <= rows - height; y++) {
        for (let x = 0; x <= cols - width; x++) {
          let free = true;
          for (let yy = y; yy < y + height && free; yy++) {
            for (let xx = x; xx < x + width; xx++) if (occupied[yy][xx]) free = false;
          }
          if (free) spots.push([x, y]);
        }
      }
      if (!spots.length) continue;
      const [x, y] = spots[Math.floor(rng() * spots.length)];
      for (let yy = y; yy < y + height; yy++) {
        for (let xx = x; xx < x + width; xx++) occupied[yy][xx] = true;
      }
      const uid = `fuzz-${iteration}-${candidate}`;
      defs[uid] = { w: width, h: height };
      items.push({ uid, defId: uid });
    }

    const shuffled = core.shuffleDeterministic(items, rng);
    const snapshot = structuredClone(shuffled);
    const placements = core.solvePacking(shuffled, cols, rows, defs, { timeLimitMs: 1000, maxNodes: 200000 });
    assert.ok(placements, `itération ${iteration} annoncée packable`);
    assert.deepEqual(shuffled, snapshot);
    const layout = layoutFromPlacements(shuffled, placements);
    const validation = core.validateLayout(layout, { case: [cols, rows], storage: [cols, rows] }, defs);
    assert.equal(validation.valid, true, validation.errors.join("; "));
  }
});
