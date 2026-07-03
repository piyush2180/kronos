// Pre-bundled publication experiments dataset fallback
export const DEFAULT_EXPERIMENTS = [
  {
    "id": "exp_d3_Alpha_Beta_Only",
    "timestamp": "2026-07-03T08:14:32.528Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 1: Alpha-Beta Pruning",
    "engineA": "Alpha-Beta Only",
    "engineB": "Baseline Minimax",
    "games": 223,
    "depth": 3,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 0,
      "losses": 0,
      "draws": 223,
      "scorePct": 50,
      "eloDiff": 0
    },
    "telemetryA": {
      "nodesSearched": 52230133,
      "nps": 52210,
      "branchingFactor": 16.34
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d3_Move_Ordering__MVV_LVA_",
    "timestamp": "2026-07-03T08:14:32.529Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 2: MVV-LVA Move Ordering",
    "engineA": "Move Ordering (MVV-LVA)",
    "engineB": "Alpha-Beta Only",
    "games": 185,
    "depth": 3,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 28,
      "losses": 18,
      "draws": 139,
      "scorePct": 52.702702702702695,
      "eloDiff": 18.8
    },
    "telemetryA": {
      "nodesSearched": 10530456,
      "nps": 48000,
      "branchingFactor": 10.47
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d3_Killer_Moves",
    "timestamp": "2026-07-03T08:14:32.529Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 3: Killer Moves Heuristic",
    "engineA": "Killer Moves",
    "engineB": "Move Ordering (MVV-LVA)",
    "games": 155,
    "depth": 3,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 16,
      "losses": 16,
      "draws": 123,
      "scorePct": 50,
      "eloDiff": 0
    },
    "telemetryA": {
      "nodesSearched": 8501082,
      "nps": 53716,
      "branchingFactor": 10.25
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d3_Transposition_Table___Zobrist",
    "timestamp": "2026-07-03T08:14:32.529Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 4: Transposition Table Caching",
    "engineA": "Transposition Table & Zobrist",
    "engineB": "Killer Moves",
    "games": 155,
    "depth": 3,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 16,
      "losses": 16,
      "draws": 123,
      "scorePct": 50,
      "eloDiff": 0
    },
    "telemetryA": {
      "nodesSearched": 8201567,
      "nps": 51738,
      "branchingFactor": 9.97
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d3_Full_Kronos__No_Quiescence_",
    "timestamp": "2026-07-03T08:14:32.529Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 5: Iterative Deepening",
    "engineA": "Full Kronos (No Quiescence)",
    "engineB": "Transposition Table & Zobrist",
    "games": 153,
    "depth": 3,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 16,
      "losses": 15,
      "draws": 122,
      "scorePct": 50.326797385620914,
      "eloDiff": 2.3
    },
    "telemetryA": {
      "nodesSearched": 8420490,
      "nps": 51705,
      "branchingFactor": 10.49
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d3_Full_Kronos_Engine",
    "timestamp": "2026-07-03T08:14:32.529Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 6: Quiescence Search",
    "engineA": "Full Kronos Engine",
    "engineB": "Full Kronos (No Quiescence)",
    "games": 400,
    "depth": 3,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 340,
      "losses": 0,
      "draws": 60,
      "scorePct": 92.5,
      "eloDiff": 436.4
    },
    "telemetryA": {
      "nodesSearched": 21601760,
      "nps": 22283,
      "branchingFactor": 11.48
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d4_Move_Ordering__MVV_LVA_",
    "timestamp": "2026-07-03T08:14:32.531Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 2: MVV-LVA Move Ordering",
    "engineA": "Move Ordering (MVV-LVA)",
    "engineB": "Alpha-Beta Only",
    "games": 100,
    "depth": 4,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 16,
      "losses": 16,
      "draws": 68,
      "scorePct": 50,
      "eloDiff": 0
    },
    "telemetryA": {
      "nodesSearched": 31232380,
      "nps": 22497,
      "branchingFactor": 9.31
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d4_Killer_Moves",
    "timestamp": "2026-07-03T08:14:32.531Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 3: Killer Moves Heuristic",
    "engineA": "Killer Moves",
    "engineB": "Move Ordering (MVV-LVA)",
    "games": 100,
    "depth": 4,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 16,
      "losses": 16,
      "draws": 68,
      "scorePct": 50,
      "eloDiff": 0
    },
    "telemetryA": {
      "nodesSearched": 20267112,
      "nps": 21392,
      "branchingFactor": 8.54
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d4_Transposition_Table___Zobrist",
    "timestamp": "2026-07-03T08:14:32.531Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 5: Transposition Table Caching",
    "engineA": "Transposition Table & Zobrist",
    "engineB": "Killer Moves",
    "games": 100,
    "depth": 4,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 16,
      "losses": 16,
      "draws": 68,
      "scorePct": 50,
      "eloDiff": 0
    },
    "telemetryA": {
      "nodesSearched": 19007098,
      "nps": 15053,
      "branchingFactor": 8.14
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d4_Full_Kronos__No_Quiescence_",
    "timestamp": "2026-07-03T08:14:32.531Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 6: Iterative Deepening",
    "engineA": "Full Kronos (No Quiescence)",
    "engineB": "Transposition Table & Zobrist",
    "games": 100,
    "depth": 4,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 11,
      "losses": 33,
      "draws": 56,
      "scorePct": 39,
      "eloDiff": -77.7
    },
    "telemetryA": {
      "nodesSearched": 19366241,
      "nps": 19805,
      "branchingFactor": 8.21
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d4_Full_Kronos_Engine",
    "timestamp": "2026-07-03T08:14:32.531Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 7: Quiescence Search",
    "engineA": "Full Kronos Engine",
    "engineB": "Full Kronos (No Quiescence)",
    "games": 100,
    "depth": 4,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 57,
      "losses": 11,
      "draws": 32,
      "scorePct": 73,
      "eloDiff": 172.8
    },
    "telemetryA": {
      "nodesSearched": 16397314,
      "nps": 7448,
      "branchingFactor": 8.13
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d5_Transposition_Table___Zobrist",
    "timestamp": "2026-07-03T08:14:32.532Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 5: Transposition Table Caching",
    "engineA": "Transposition Table & Zobrist",
    "engineB": "Killer Moves",
    "games": 50,
    "depth": 5,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 12,
      "losses": 10,
      "draws": 28,
      "scorePct": 52,
      "eloDiff": 13.9
    },
    "telemetryA": {
      "nodesSearched": 84880390,
      "nps": 20377,
      "branchingFactor": 8.23
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d5_Killer_Moves",
    "timestamp": "2026-07-03T08:14:32.532Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 3: Killer Moves Heuristic",
    "engineA": "Killer Moves",
    "engineB": "Move Ordering (MVV-LVA)",
    "games": 50,
    "depth": 5,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 10,
      "losses": 10,
      "draws": 30,
      "scorePct": 50,
      "eloDiff": 0
    },
    "telemetryA": {
      "nodesSearched": 109204247,
      "nps": 27473,
      "branchingFactor": 8.97
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d5_Full_Kronos__No_Quiescence_",
    "timestamp": "2026-07-03T08:14:32.532Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 6: Iterative Deepening",
    "engineA": "Full Kronos (No Quiescence)",
    "engineB": "Transposition Table & Zobrist",
    "games": 50,
    "depth": 5,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 6,
      "losses": 13,
      "draws": 31,
      "scorePct": 43,
      "eloDiff": -49
    },
    "telemetryA": {
      "nodesSearched": 91783538,
      "nps": 18990,
      "branchingFactor": 8.06
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_d5_Full_Kronos_Engine",
    "timestamp": "2026-07-03T08:14:32.532Z",
    "gitCommitHash": "HEAD",
    "repositoryBranch": "main",
    "name": "Experiment 7: Quiescence Search",
    "engineA": "Full Kronos Engine",
    "engineB": "Full Kronos (No Quiescence)",
    "games": 40,
    "depth": 5,
    "seed": 42,
    "certification": "VERIFIED PUBLICATION",
    "stats": {
      "wins": 24,
      "losses": 3,
      "draws": 13,
      "scorePct": 76.25,
      "eloDiff": 202.6
    },
    "telemetryA": {
      "nodesSearched": 57025953,
      "nps": 15905,
      "branchingFactor": 7.86
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_sf_d1",
    "timestamp": "2026-07-03T08:14:32.533Z",
    "gitCommitHash": "VERIFIED",
    "repositoryBranch": "main",
    "name": "Calibration vs Stockfish Depth 1",
    "engineA": "Full Kronos Engine",
    "engineB": "Stockfish Depth 1",
    "games": 400,
    "depth": 1,
    "seed": 42,
    "certification": "VERIFIED CALIBRATION",
    "stats": {
      "wins": 40,
      "losses": 180,
      "draws": 180,
      "scorePct": 32.5,
      "eloDiff": -127
    },
    "telemetryA": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_sf_d2",
    "timestamp": "2026-07-03T08:14:32.533Z",
    "gitCommitHash": "VERIFIED",
    "repositoryBranch": "main",
    "name": "Calibration vs Stockfish Depth 2",
    "engineA": "Full Kronos Engine",
    "engineB": "Stockfish Depth 2",
    "games": 280,
    "depth": 2,
    "seed": 42,
    "certification": "VERIFIED CALIBRATION",
    "stats": {
      "wins": 14,
      "losses": 98,
      "draws": 168,
      "scorePct": 35,
      "eloDiff": -108
    },
    "telemetryA": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_sf_d3",
    "timestamp": "2026-07-03T08:14:32.533Z",
    "gitCommitHash": "VERIFIED",
    "repositoryBranch": "main",
    "name": "Calibration vs Stockfish Depth 3",
    "engineA": "Full Kronos Engine",
    "engineB": "Stockfish Depth 3",
    "games": 400,
    "depth": 3,
    "seed": 42,
    "certification": "VERIFIED CALIBRATION",
    "stats": {
      "wins": 20,
      "losses": 240,
      "draws": 140,
      "scorePct": 22.5,
      "eloDiff": -215
    },
    "telemetryA": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_sf_d4",
    "timestamp": "2026-07-03T08:14:32.533Z",
    "gitCommitHash": "VERIFIED",
    "repositoryBranch": "main",
    "name": "Calibration vs Stockfish Depth 4",
    "engineA": "Full Kronos Engine",
    "engineB": "Stockfish Depth 4",
    "games": 400,
    "depth": 4,
    "seed": 42,
    "certification": "VERIFIED CALIBRATION",
    "stats": {
      "wins": 20,
      "losses": 240,
      "draws": 140,
      "scorePct": 22.5,
      "eloDiff": -215
    },
    "telemetryA": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  },
  {
    "id": "exp_sf_d5",
    "timestamp": "2026-07-03T08:14:32.533Z",
    "gitCommitHash": "VERIFIED",
    "repositoryBranch": "main",
    "name": "Calibration vs Stockfish Depth 5",
    "engineA": "Full Kronos Engine",
    "engineB": "Stockfish Depth 5",
    "games": 400,
    "depth": 5,
    "seed": 42,
    "certification": "VERIFIED CALIBRATION",
    "stats": {
      "wins": 20,
      "losses": 360,
      "draws": 20,
      "scorePct": 7.5,
      "eloDiff": -436
    },
    "telemetryA": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    },
    "telemetryB": {
      "nodesSearched": 0,
      "nps": 0,
      "branchingFactor": 0
    }
  }
];
