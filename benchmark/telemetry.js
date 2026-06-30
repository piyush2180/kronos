/**
 * Benchmark Research Telemetry Collector
 * Collects, aggregates, and calculates detailed search performance metrics.
 */
export class TelemetryCollector {
  constructor() {
    this.reset();
  }

  reset() {
    this.nodesSearched = 0;
    this.quiescenceNodes = 0;
    this.transpositionHits = 0;
    this.transpositionStores = 0;
    this.betaCutoffs = 0;
    this.alphaCutoffs = 0;
    this.firstMoveCutoffs = 0;
    this.totalMovesSearched = 0;
    this.searchTimeMs = 0;
    this.maxDepthReached = 0;
    this.totalDepthReached = 0;
    this.searchCalls = 0;
    this.branchingFactorSum = 0;
  }

  addSearchStats(stats, timeMs, maxDepth) {
    this.searchCalls++;
    const nodesThisCall = stats.nodesSearched || 0;
    this.nodesSearched += nodesThisCall;
    this.quiescenceNodes += stats.quiescenceNodes || 0;
    this.transpositionHits += stats.transpositionHits || 0;
    this.transpositionStores += stats.transpositionStores || 0;
    this.betaCutoffs += stats.betaCutoffs || 0;
    this.alphaCutoffs += stats.alphaCutoffs || 0;
    this.firstMoveCutoffs += stats.firstMoveCutoffs || 0;
    this.totalMovesSearched += stats.totalMovesSearched || 0;
    this.searchTimeMs += timeMs;
    this.totalDepthReached += maxDepth;
    if (maxDepth > this.maxDepthReached) {
      this.maxDepthReached = maxDepth;
    }

    if (nodesThisCall > 0 && maxDepth > 0) {
      this.branchingFactorSum += Math.pow(nodesThisCall, 1 / maxDepth);
    }
  }

  getSummary() {
    const timeSec = this.searchTimeMs / 1000 || 0.001;
    const nps = Math.round(this.nodesSearched / timeSec);
    const qPercentage = this.nodesSearched > 0 
      ? Number(((this.quiescenceNodes / this.nodesSearched) * 100).toFixed(2)) 
      : 0;
    
    const avgDepth = this.searchCalls > 0 
      ? Number((this.totalDepthReached / this.searchCalls).toFixed(2))
      : 0;
    
    const branchingFactor = this.searchCalls > 0
      ? Number((this.branchingFactorSum / this.searchCalls).toFixed(2))
      : 0;

    const avgMoveTimeMs = this.searchCalls > 0
      ? Number((this.searchTimeMs / this.searchCalls).toFixed(2))
      : 0;

    const moveOrderingEfficiency = this.betaCutoffs > 0
      ? Number(((this.firstMoveCutoffs / this.betaCutoffs) * 100).toFixed(2))
      : 0;

    const mem = process.memoryUsage();

    return {
      nodesSearched: this.nodesSearched,
      quiescenceNodes: this.quiescenceNodes,
      quiescencePercentage: qPercentage,
      transpositionHits: this.transpositionHits,
      transpositionStores: this.transpositionStores,
      betaCutoffs: this.betaCutoffs,
      alphaCutoffs: this.alphaCutoffs,
      firstMoveCutoffs: this.firstMoveCutoffs,
      moveOrderingEfficiency: moveOrderingEfficiency,
      searchTimeMs: this.searchTimeMs,
      avgMoveTimeMs: avgMoveTimeMs,
      nodesPerSecond: nps,
      maxDepthReached: this.maxDepthReached,
      avgDepthReached: avgDepth,
      branchingFactor: branchingFactor,
      memoryUsageMb: {
        rss: Number((mem.rss / 1024 / 1024).toFixed(2)),
        heapTotal: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
        heapUsed: Number((mem.heapUsed / 1024 / 1024).toFixed(2))
      }
    };
  }
}
