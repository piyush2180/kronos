/**
 * Mulberry32 Seeded Pseudo-Random Number Generator
 * Ensures deterministic reproducibility across benchmark runs.
 */
export class PRNG {
  constructor(seed = 42) {
    this.seed = seed >>> 0;
    this.initialSeed = this.seed;
  }

  /**
   * Returns a pseudo-random floating point number in [0, 1)
   */
  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in [min, max]
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Randomly shuffles an array in place deterministically
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
