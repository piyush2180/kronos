import { DEFAULT_EXPERIMENTS } from './defaultExperiments';

const STORAGE_KEY_EXPERIMENTS = 'kronos_research_experiments_v2';
const STORAGE_KEY_CALIBRATIONS = 'kronos_research_calibrations_v2';

export const BenchmarkDataService = {
  // Retrieve all stored experiment datasets
  getExperiments() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY_EXPERIMENTS);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.error('Failed to load stored benchmark experiments:', e);
    }
    return DEFAULT_EXPERIMENTS || [];
  },

  // Save a new benchmark dataset record
  saveExperiment(exp) {
    const experiments = this.getExperiments();
    const normalized = {
      id: exp.id || `experiment_${Date.now()}`,
      timestamp: exp.timestamp || new Date().toISOString(),
      gitCommitHash: exp.gitCommitHash || 'HEAD',
      repositoryBranch: exp.repositoryBranch || 'main',
      name: exp.name || `${exp.engineA} vs ${exp.engineB}`,
      engineA: exp.engineA || 'Engine A',
      engineB: exp.engineB || 'Engine B',
      games: exp.games || exp.stats?.totalGames || 20,
      depth: exp.depth || 3,
      seed: exp.seed || 42,
      certification: exp.certification || 'RESEARCH READY',
      stats: exp.stats || { wins: 0, losses: 0, draws: 0, scorePct: 50, eloDiff: 0 },
      telemetryA: exp.telemetryA || { nodesSearched: 0, nps: 0, branchingFactor: 0 },
      telemetryB: exp.telemetryB || { nodesSearched: 0, nps: 0, branchingFactor: 0 }
    };

    const updated = [normalized, ...experiments.filter(x => x.id !== normalized.id)];
    localStorage.setItem(STORAGE_KEY_EXPERIMENTS, JSON.stringify(updated));
    return updated;
  },

  // Delete an experiment package by ID
  deleteExperiment(id) {
    const experiments = this.getExperiments().filter(x => x.id !== id);
    localStorage.setItem(STORAGE_KEY_EXPERIMENTS, JSON.stringify(experiments));
    return experiments;
  },

  // Import experiment summary JSON file
  importExperimentFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const exp = {
        id: parsed.metadata?.benchmarkTimestamp ? `exp_${Date.parse(parsed.metadata.benchmarkTimestamp)}` : `import_${Date.now()}`,
        timestamp: parsed.metadata?.benchmarkTimestamp || new Date().toISOString(),
        gitCommitHash: parsed.metadata?.gitCommitHash || 'Imported',
        repositoryBranch: parsed.metadata?.repositoryBranch || 'main',
        name: `${parsed.engineA || 'Engine A'} vs ${parsed.engineB || 'Engine B'} Benchmark`,
        engineA: parsed.engineA || 'Engine A',
        engineB: parsed.engineB || 'Engine B',
        games: parsed.stats?.totalGames || parsed.settings?.gamesPlayed || 0,
        depth: parsed.settings?.depth || 3,
        seed: parsed.settings?.seed || 42,
        certification: parsed.certificationStatus || 'IMPORTED',
        stats: parsed.stats || { wins: 0, losses: 0, draws: 0, scorePct: 50, eloDiff: 0 },
        telemetryA: parsed.telemetryA || {},
        telemetryB: parsed.telemetryB || {}
      };
      return this.saveExperiment(exp);
    } catch (e) {
      throw new Error(`Invalid benchmark summary JSON format: ${e.message}`);
    }
  },

  // Export summary JSON for download
  exportExperimentAsJson(exp) {
    return JSON.stringify(exp, null, 2);
  },

  // Get Stockfish calibration status for difficulty levels
  getCalibrations() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CALIBRATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load calibration data:', e);
    }

    // Default levels (uncalibrated / pending until actual matches are run or imported)
    return [
      { id: 'beginner', title: 'Beginner', targetDepth: 'Depth 1', calibratedElo: null, scorePct: null, desc: 'Introductory level for novice players.' },
      { id: 'casual', title: 'Casual', targetDepth: 'Depth 2', calibratedElo: null, scorePct: null, desc: 'Casual recreational level with basic tactical awareness.' },
      { id: 'club', title: 'Club', targetDepth: 'Depth 3', calibratedElo: null, scorePct: null, desc: 'Intermediate club player strength with solid piece coordination.' },
      { id: 'advanced', title: 'Advanced', targetDepth: 'Depth 4', calibratedElo: null, scorePct: null, desc: 'Advanced level featuring deep tactical calculation.' },
      { id: 'expert', title: 'Expert', targetDepth: 'Depth 5', calibratedElo: null, scorePct: null, desc: 'Candidate master level solving complex positional struggles.' }
    ];
  },

  // Save updated calibration metrics
  saveCalibrations(calibrations) {
    localStorage.setItem(STORAGE_KEY_CALIBRATIONS, JSON.stringify(calibrations));
    return calibrations;
  }
};
