/**
 * Wald's Sequential Probability Ratio Test (SPRT)
 * Used in modern chess engine testing to stop tournaments as soon as statistical evidence is conclusive.
 */
export class SPRTTest {
  constructor(alpha = 0.05, beta = 0.05, elo0 = 0, elo1 = 10) {
    this.alpha = alpha;
    this.beta = beta;
    this.elo0 = elo0;
    this.elo1 = elo1;

    // Convert Elo bounds to expected score probabilities
    this.p0 = 1 / (1 + Math.pow(10, -elo0 / 400));
    this.p1 = 1 / (1 + Math.pow(10, -elo1 / 400));

    // Wald's stopping boundaries
    this.lowerBound = Math.log(beta / (1 - alpha));
    this.upperBound = Math.log((1 - beta) / alpha);
  }

  /**
   * Calculates current Log-Likelihood Ratio (LLR) given win, loss, draw counts.
   */
  calculateLLR(wins, losses, draws) {
    const total = wins + losses + draws;
    if (total === 0) return { llr: 0, status: 'CONTINUE' };

    const w = wins / total;
    const l = losses / total;
    const d = draws / total;

    // Empirical variance of game pair / single outcomes
    const s = w + 0.5 * d;
    const varS = w * Math.pow(1 - s, 2) + l * Math.pow(0 - s, 2) + d * Math.pow(0.5 - s, 2);

    if (varS === 0) return { llr: 0, status: 'CONTINUE' };

    // Standard LLR approximation for trinomial/chess outcomes
    const deltaP = this.p1 - this.p0;
    const llr = (total * deltaP * (s - (this.p0 + this.p1) / 2)) / varS;

    let status = 'CONTINUE';
    if (llr >= this.upperBound) status = 'ACCEPTED';
    else if (llr <= this.lowerBound) status = 'REJECTED';

    return {
      llr: Number(llr.toFixed(3)),
      lowerBound: Number(this.lowerBound.toFixed(3)),
      upperBound: Number(this.upperBound.toFixed(3)),
      status
    };
  }
}
