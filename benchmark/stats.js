/**
 * Statistics Engine for Chess Engine Benchmarks
 * Calculates score percentage, pairwise Elo differences, and 95% confidence intervals.
 */
export class BenchmarkStats {
  static calculate(wins, losses, draws) {
    const totalGames = wins + losses + draws;
    if (totalGames === 0) {
      return {
        wins: 0, losses: 0, draws: 0, totalGames: 0,
        scorePct: 0, eloDiff: 0, ciLower: 0, ciUpper: 0, eloCiLower: 0, eloCiUpper: 0
      };
    }

    const score = wins + 0.5 * draws;
    const scorePct = score / totalGames;

    // Clip score percentage slightly to avoid log(0) or log(infinity)
    const clippedPct = Math.min(Math.max(scorePct, 0.001), 0.999);
    const eloDiff = -400 * Math.log10(1 / clippedPct - 1);

    // Standard Error of proportion
    const se = Math.sqrt((clippedPct * (1 - clippedPct)) / totalGames);
    const ciRadius = 1.96 * se;

    const ciLowerPct = Math.max(0, clippedPct - ciRadius);
    const ciUpperPct = Math.min(1, clippedPct + ciRadius);

    const eloCiLower = -400 * Math.log10(1 / Math.min(Math.max(ciLowerPct, 0.001), 0.999) - 1);
    const eloCiUpper = -400 * Math.log10(1 / Math.min(Math.max(ciUpperPct, 0.001), 0.999) - 1);

    return {
      wins,
      losses,
      draws,
      totalGames,
      scorePct: Number((scorePct * 100).toFixed(2)),
      eloDiff: Number(eloDiff.toFixed(1)),
      ciLowerPct: Number((ciLowerPct * 100).toFixed(2)),
      ciUpperPct: Number((ciUpperPct * 100).toFixed(2)),
      eloCiLower: Number(eloCiLower.toFixed(1)),
      eloCiUpper: Number(eloCiUpper.toFixed(1))
    };
  }
}
