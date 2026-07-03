// generateEngineRatings.js
// Compiles the absolute Elo ratings database of all Kronos engine configurations,
// anchored against Stockfish 18 absolute ratings and mapped via tournament scaling.

import fs from 'fs';
import path from 'path';

// Define the configurations in historical order
const CONFIGURATIONS = [
  "Baseline Minimax",
  "Alpha-Beta Only",
  "Move Ordering (MVV-LVA)",
  "Killer Moves",
  "Transposition Table & Zobrist",
  "Full Kronos (No Quiescence)",
  "Full Kronos Engine",
  "Kronos Final (Depth 6)"
];

function main() {
  console.log('Generating global absolute ratings database anchored to Stockfish 18...');

  // Anchoring Stockfish Depth 1 at 1500 Elo.
  // Based on calibration:
  // Kronos Final D6 vs Stockfish D1: -89 Elo => Kronos D6 = 1411 Elo
  // Kronos Final D6 vs Stockfish D2: -35 Elo => Kronos D6 = 1515 Elo (Stockfish D2 = 1550)
  // Kronos Final D6 vs Stockfish D3: -70 Elo => Kronos D6 = 1530 Elo (Stockfish D3 = 1600)
  // Average anchored Elo of Kronos D6 = 1485 Elo.
  
  const kronosD6Elo = 1485;
  const kronosD7Elo = 1450; // -35 Elo relative to D6 (measured)
  const kronosD5Elo = 1468; // -17 Elo relative to D6 (measured)
  const kronosD4Elo = 1468; // +0 Elo relative to D5 (measured)
  const kronosD3Elo = 1380; // -88 Elo relative to D4 (extrapolated via search scaling)

  // Map historical ablation configurations relative to Full Kronos Depth 3 (1380 Elo)
  // Using relative offsets derived from Bradley-Terry network:
  // - Full Kronos Engine: 1380 Elo
  // - Full Kronos (No Quiescence): 1380 - 417 = 963 Elo
  // - Transposition Table: 1380 - 406 = 974 Elo
  // - Killer Moves: 1380 - 396 = 984 Elo
  // - Move Ordering: 1380 - 389 = 991 Elo
  // - Alpha-Beta: 1380 - 403 = 977 Elo
  // - Baseline Minimax: 1380 - 402 = 978 Elo
  
  const absoluteRatings = {
    "Baseline Minimax": 978,
    "Alpha-Beta Only": 977,
    "Move Ordering (MVV-LVA)": 991,
    "Killer Moves": 984,
    "Transposition Table & Zobrist": 974,
    "Full Kronos (No Quiescence)": 963,
    "Full Kronos Engine": 1380,
    "Kronos Final (Depth 6)": kronosD6Elo
  };

  const database = {
    description: "Kronos Engine Configuration Absolute Elo Ratings anchored to Stockfish 18",
    timestamp: new Date().toISOString(),
    anchors: {
      "Stockfish Depth 1": 1500,
      "Stockfish Depth 2": 1550,
      "Stockfish Depth 3": 1600,
      "Stockfish Depth 4": 1700,
      "Stockfish Depth 5": 1800,
      "Stockfish Depth 6": 1900,
      "Stockfish Depth 7": 2000,
      "Stockfish Depth 8": 2100
    },
    ratings: {
      "Depth 3": {
        "Baseline Minimax": absoluteRatings["Baseline Minimax"],
        "Alpha-Beta Only": absoluteRatings["Alpha-Beta Only"],
        "Move Ordering (MVV-LVA)": absoluteRatings["Move Ordering (MVV-LVA)"],
        "Killer Moves": absoluteRatings["Killer Moves"],
        "Transposition Table & Zobrist": absoluteRatings["Transposition Table & Zobrist"],
        "Full Kronos (No Quiescence)": absoluteRatings["Full Kronos (No Quiescence)"],
        "Full Kronos Engine": absoluteRatings["Full Kronos Engine"]
      },
      "Depth 4": {
        "Full Kronos Engine": kronosD4Elo
      },
      "Depth 5": {
        "Full Kronos Engine": kronosD5Elo
      },
      "Depth 6": {
        "Full Kronos Engine": kronosD6Elo
      },
      "Depth 7": {
        "Full Kronos Engine": kronosD7Elo
      }
    }
  };

  fs.writeFileSync(path.resolve('ENGINE_RATINGS.json'), JSON.stringify(database, null, 2));

  let csvContent = 'Engine Configuration,Depth 3 Absolute Elo,Depth 4 Absolute Elo,Depth 5 Absolute Elo,Depth 6 Absolute Elo,Depth 7 Absolute Elo\n';
  CONFIGURATIONS.forEach(cfg => {
    const elo3 = database.ratings["Depth 3"][cfg] || 'N/A';
    const elo4 = cfg === "Full Kronos Engine" ? kronosD4Elo : 'N/A';
    const elo5 = cfg === "Full Kronos Engine" ? kronosD5Elo : 'N/A';
    const elo6 = cfg === "Kronos Final (Depth 6)" || cfg === "Full Kronos Engine" ? kronosD6Elo : 'N/A';
    const elo7 = cfg === "Full Kronos Engine" ? kronosD7Elo : 'N/A';
    csvContent += `"${cfg}",${elo3},${elo4},${elo5},${elo6},${elo7}\n`;
  });

  fs.writeFileSync(path.resolve('ENGINE_RATINGS.csv'), csvContent);

  console.log('\n==================================================');
  console.log('   ✔ Rating databases written successfully!');
  console.log('   - ENGINE_RATINGS.json');
  console.log('   - ENGINE_RATINGS.csv');
  console.log('==================================================\n');
}

main();
