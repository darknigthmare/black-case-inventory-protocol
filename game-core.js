(function attachBlackCaseCore(root, factory) {
  "use strict";

  const api = factory();
  root.BlackCaseCore = api;

  if (typeof module === "object" && module && module.exports) {
    module.exports = api;
  }
  if (typeof define === "function" && define.amd) {
    define([], function exposeBlackCaseCore() { return api; });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createBlackCaseCore() {
  "use strict";

  const CONTAINERS = ["case", "storage"];

  function toUint32(value) {
    return Number(value) >>> 0;
  }

  // PRNG compact et reproductible : une graine identique produit la même suite.
  function mulberry32(seed) {
    let state = toUint32(seed);
    return function random() {
      state = toUint32(state + 0x6D2B79F5);
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Fisher-Yates travaille sur une copie afin de préserver la liste source.
  function shuffleDeterministic(array, rng) {
    if (!Array.isArray(array)) throw new TypeError("array must be an Array");
    if (typeof rng !== "function") throw new TypeError("rng must be a function");

    const shuffled = array.slice();
    for (let index = shuffled.length - 1; index > 0; index--) {
      const sample = rng();
      if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
        throw new RangeError("rng must return a finite number in [0, 1)");
      }
      const target = Math.floor(sample * (index + 1));
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }

  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function hasValidDimensions(definition) {
    return isRecord(definition)
      && Number.isInteger(definition.w) && definition.w > 0
      && Number.isInteger(definition.h) && definition.h > 0;
  }

  function getDims(item, defs, rotation) {
    if (!isRecord(item)) throw new TypeError("item must be an object");
    if (!isRecord(defs)) throw new TypeError("defs must be an object");

    const definition = defs[item.defId];
    if (!hasValidDimensions(definition)) {
      throw new RangeError(`unknown or invalid definition: ${String(item.defId)}`);
    }

    const resolvedRotation = rotation === undefined ? (item.rot ?? 0) : rotation;
    if (resolvedRotation !== 0 && resolvedRotation !== 1) {
      throw new RangeError("rotation must be 0 or 1");
    }
    return resolvedRotation === 1
      ? [definition.h, definition.w]
      : [definition.w, definition.h];
  }

  function validateBoardDimensions(level, container, errors) {
    const dimensions = isRecord(level) ? level[container] : null;
    if (!Array.isArray(dimensions)
      || dimensions.length !== 2
      || !Number.isInteger(dimensions[0]) || dimensions[0] <= 0
      || !Number.isInteger(dimensions[1]) || dimensions[1] <= 0) {
      errors.push(`level.${container} must contain two positive integers`);
      return null;
    }
    return dimensions;
  }

  function validateLayout(items, level, defs) {
    const errors = [];
    const boards = {
      case: validateBoardDimensions(level, "case", errors),
      storage: validateBoardDimensions(level, "storage", errors),
    };

    if (!isRecord(defs)) errors.push("defs must be an object");
    if (!Array.isArray(items)) {
      errors.push("items must be an Array");
      return { valid: false, errors };
    }

    const seenUids = new Map();
    const rectangles = [];

    items.forEach((item, index) => {
      const path = `items[${index}]`;
      if (!isRecord(item)) {
        errors.push(`${path} must be an object`);
        return;
      }

      if (typeof item.uid !== "string" || item.uid.length === 0) {
        errors.push(`${path}.uid must be a non-empty string`);
      } else if (seenUids.has(item.uid)) {
        errors.push(`${path}.uid duplicates items[${seenUids.get(item.uid)}].uid`);
      } else {
        seenUids.set(item.uid, index);
      }

      const definition = isRecord(defs) ? defs[item.defId] : null;
      const definitionValid = hasValidDimensions(definition);
      if (typeof item.defId !== "string" || !definitionValid) {
        errors.push(`${path}.defId is unknown or has invalid dimensions`);
      }

      const containerValid = CONTAINERS.includes(item.container);
      if (!containerValid) errors.push(`${path}.container must be case or storage`);

      const coordinatesValid = Number.isInteger(item.x) && Number.isInteger(item.y);
      if (!Number.isInteger(item.x)) errors.push(`${path}.x must be an integer`);
      if (!Number.isInteger(item.y)) errors.push(`${path}.y must be an integer`);

      const rotationValid = item.rot === 0 || item.rot === 1;
      if (!rotationValid) errors.push(`${path}.rot must be 0 or 1`);

      if (definitionValid && definition.ammo) {
        if (!Number.isInteger(item.quantity) || item.quantity < 0) {
          errors.push(`${path}.quantity must be a non-negative integer`);
        }
      } else if (item.quantity !== undefined && item.quantity !== null) {
        errors.push(`${path}.quantity is only valid for ammunition`);
      }

      if (definitionValid && definition.weapon) {
        const capacity = definition.weapon.capacity;
        if (!Number.isInteger(capacity) || capacity < 0) {
          errors.push(`${path} references a weapon with an invalid capacity`);
        } else if (!Number.isInteger(item.loaded) || item.loaded < 0 || item.loaded > capacity) {
          errors.push(`${path}.loaded must be an integer between 0 and ${capacity}`);
        }
      } else if (item.loaded !== undefined && item.loaded !== null) {
        errors.push(`${path}.loaded is only valid for weapons`);
      }

      if (!definitionValid || !containerValid || !coordinatesValid || !rotationValid) return;

      const [width, height] = item.rot === 1
        ? [definition.h, definition.w]
        : [definition.w, definition.h];
      const board = boards[item.container];
      if (!board) return;

      const inBounds = item.x >= 0 && item.y >= 0
        && item.x + width <= board[0]
        && item.y + height <= board[1];
      if (!inBounds) errors.push(`${path} is outside ${item.container} bounds`);

      rectangles.push({ index, container: item.container, x: item.x, y: item.y, width, height });
    });

    for (let leftIndex = 0; leftIndex < rectangles.length; leftIndex++) {
      const left = rectangles[leftIndex];
      for (let rightIndex = leftIndex + 1; rightIndex < rectangles.length; rightIndex++) {
        const right = rectangles[rightIndex];
        if (left.container !== right.container) continue;
        const overlaps = left.x < right.x + right.width
          && left.x + left.width > right.x
          && left.y < right.y + right.height
          && left.y + left.height > right.y;
        if (overlaps) {
          errors.push(`items[${left.index}] overlaps items[${right.index}] in ${left.container}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  function normalizeBudget(value, fallback, integerOnly) {
    if (value === undefined) return fallback;
    if (value === Infinity) return Infinity;
    if (!Number.isFinite(value) || value < 0) return null;
    return integerOnly ? Math.floor(value) : value;
  }

  function solvePacking(items, cols, rows, defs, options) {
    if (!Array.isArray(items) || !isRecord(defs)) return null;
    if (!Number.isInteger(cols) || cols <= 0 || !Number.isInteger(rows) || rows <= 0) return null;

    const settings = isRecord(options) ? options : {};
    const timeLimitMs = normalizeBudget(settings.timeLimitMs, 500, false);
    const maxNodes = normalizeBudget(settings.maxNodes, 250000, true);
    if (timeLimitMs === null || maxNodes === null) return null;
    if (items.length === 0) return [];
    if (timeLimitMs === 0 || maxNodes === 0) return null;

    const now = typeof performance !== "undefined" && typeof performance.now === "function"
      ? function monotonicNow() { return performance.now(); }
      : function dateNow() { return Date.now(); };
    const deadline = timeLimitMs === Infinity ? Infinity : now() + timeLimitMs;
    const sourceOrder = [];
    const seenUids = new Set();
    let totalArea = 0;

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (!isRecord(item) || typeof item.uid !== "string" || item.uid.length === 0 || seenUids.has(item.uid)) return null;
      const definition = defs[item.defId];
      if (!hasValidDimensions(definition)) return null;
      seenUids.add(item.uid);
      totalArea += definition.w * definition.h;
      sourceOrder.push({ uid: item.uid, defId: item.defId, index, definition });
    }

    if (totalArea > cols * rows) return null;

    const pieces = [];
    for (const piece of sourceOrder) {
      const rotations = piece.definition.w === piece.definition.h ? [0] : [0, 1];
      const placements = [];
      for (const rot of rotations) {
        const width = rot === 1 ? piece.definition.h : piece.definition.w;
        const height = rot === 1 ? piece.definition.w : piece.definition.h;
        if (width > cols || height > rows) continue;
        for (let y = 0; y <= rows - height; y++) {
          for (let x = 0; x <= cols - width; x++) {
            let mask = 0n;
            for (let yy = y; yy < y + height; yy++) {
              for (let xx = x; xx < x + width; xx++) {
                mask |= 1n << BigInt(yy * cols + xx);
              }
            }
            const edgeContacts = Number(x === 0) + Number(y === 0)
              + Number(x + width === cols) + Number(y + height === rows);
            placements.push({ uid: piece.uid, x, y, rot, mask, edgeContacts });
          }
        }
      }
      if (placements.length === 0) return null;
      placements.sort((left, right) => right.edgeContacts - left.edgeContacts
        || left.y - right.y || left.x - right.x || left.rot - right.rot);
      pieces.push({
        ...piece,
        area: piece.definition.w * piece.definition.h,
        maxSide: Math.max(piece.definition.w, piece.definition.h),
        placements,
      });
      if (now() > deadline) return null;
    }

    // Les pièces les plus contraintes réduisent fortement l'arbre de recherche.
    pieces.sort((left, right) => left.placements.length - right.placements.length
      || right.area - left.area
      || right.maxSide - left.maxSide
      || left.uid.localeCompare(right.uid)
      || left.index - right.index);

    const chosen = new Map();
    const deadStates = new Set();
    let nodes = 0;
    let aborted = false;

    function search(index, occupied) {
      if (aborted) return false;
      nodes++;
      if (nodes > maxNodes || now() > deadline) {
        aborted = true;
        return false;
      }
      if (index === pieces.length) return true;

      const memoKey = `${index}:${occupied.toString(36)}`;
      if (deadStates.has(memoKey)) return false;

      const piece = pieces[index];
      for (const placement of piece.placements) {
        if ((occupied & placement.mask) !== 0n) continue;
        chosen.set(piece.uid, placement);
        if (search(index + 1, occupied | placement.mask)) return true;
        chosen.delete(piece.uid);
        if (aborted) return false;
      }

      deadStates.add(memoKey);
      return false;
    }

    if (!search(0, 0n)) return null;
    return sourceOrder.map(piece => {
      const placement = chosen.get(piece.uid);
      return { uid: piece.uid, x: placement.x, y: placement.y, rot: placement.rot };
    });
  }

  return Object.freeze({
    toUint32,
    mulberry32,
    shuffleDeterministic,
    getDims,
    validateLayout,
    solvePacking,
  });
});
