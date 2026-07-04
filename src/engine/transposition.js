// Transposition table — caches search results keyed by Zobrist hash.

export const TT_FLAGS = {
  EXACT: 0,
  ALPHA: 1, // Upper bound (evaluation <= value)
  BETA: 2   // Lower bound (evaluation >= value)
};

class TranspositionTable {
  constructor(maxSize = 500000) {
    this.table = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.writes = 0;
  }

  clear() {
    this.table = new Map();
    this.hits = 0;
    this.writes = 0;
  }

  /** Look up a cached position. */
  get(key) {
    const entry = this.table.get(key);
    if (entry) {
      this.hits++;
      return entry;
    }
    return null;
  }

  /** Store a position's evaluation. Evicts the oldest entry when full. */
  set(key, value, depth, flag, bestMove) {
    if (this.table.size >= this.maxSize) {
      const firstKey = this.table.keys().next().value;
      if (firstKey !== undefined) {
        this.table.delete(firstKey);
      }
    }

    this.table.set(key, {
      value,
      depth,
      flag,
      bestMove
    });
    this.writes++;
  }

  getMetrics() {
    return {
      size: this.table.size,
      hits: this.hits,
      writes: this.writes
    };
  }
}

export const tt = new TranspositionTable();
