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
        winPct: 0, drawPct: 0, lossPct: 0, scorePct: 0,
        eloDiff: 0, ciLowerPct: 0, ciUpperPct: 0, eloCiLower: 0, eloCiUpper: 0
      };
    }

    const w = wins / totalGames;
    const l = losses / totalGames;
    const d = draws / totalGames;
    const scorePctVal = w + 0.5 * d;

    // Clip score percentage slightly to avoid log(0) or log(infinity)
    const clippedPct = Math.min(Math.max(scorePctVal, 0.001), 0.999);
    const eloDiff = -400 * Math.log10(1 / clippedPct - 1);

    // True empirical variance for trinomial chess game outcomes
    const variance = w * Math.pow(1 - clippedPct, 2) + l * Math.pow(0 - clippedPct, 2) + d * Math.pow(0.5 - clippedPct, 2);
    const se = Math.sqrt(variance / totalGames);
    const ciRadius = 1.96 * se;

    const ciLowerPctVal = Math.max(0, clippedPct - ciRadius);
    const ciUpperPctVal = Math.min(1, clippedPct + ciRadius);

    const eloCiLower = -400 * Math.log10(1 / Math.min(Math.max(ciLowerPctVal, 0.001), 0.999) - 1);
    const eloCiUpper = -400 * Math.log10(1 / Math.min(Math.max(ciUpperPctVal, 0.001), 0.999) - 1);

    return {
      wins,
      losses,
      draws,
      totalGames,
      winPct: Number((w * 100).toFixed(2)),
      drawPct: Number((d * 100).toFixed(2)),
      lossPct: Number((l * 100).toFixed(2)),
      scorePct: Number((scorePctVal * 100).toFixed(2)),
      eloDiff: Number(eloDiff.toFixed(1)),
      ciLowerPct: Number((ciLowerPctVal * 100).toFixed(2)),
      ciUpperPct: Number((ciUpperPctVal * 100).toFixed(2)),
      eloCiLower: Number(eloCiLower.toFixed(1)),
      eloCiUpper: Number(eloCiUpper.toFixed(1)),
      eloClassification: BenchmarkStats.getEloClassification(eloDiff)
    };
  }

  static getEloClassification(eloDiff) {
    const absElo = Math.abs(eloDiff);
    if (absElo < 10) return 'negligible';
    if (absElo >= 10 && absElo < 30) return 'small';
    if (absElo >= 30 && absElo < 70) return 'moderate';
    return 'major';
  }
}
