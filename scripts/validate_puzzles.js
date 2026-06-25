import fs from 'fs';
import path from 'path';
import { Chess } from 'chess.js';

const RAW_PATH = 'scripts/puzzles_raw.json';
const OUTPUT_DIR = 'public/puzzles';

function playUciMove(chess, uciStr) {
  try {
    const from = uciStr.substring(0, 2);
    const to = uciStr.substring(2, 4);
    const promotion = uciStr.length > 4 ? uciStr.substring(4, 5).toLowerCase() : undefined;
    return chess.move({ from, to, promotion });
  } catch (e) {
    return null;
  }
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function validateAndGroup() {
  if (!fs.existsSync(RAW_PATH)) {
    console.error(`Error: raw puzzles file not found at ${RAW_PATH}`);
    return;
  }

  const rawPuzzles = JSON.parse(fs.readFileSync(RAW_PATH, 'utf-8'));
  console.log(`Loaded ${rawPuzzles.length} raw puzzles. Validating solution lines...`);

  const RANGES = {
    '800_1000': [800, 999],
    '1000_1200': [1000, 1199],
    '1200_1400': [1200, 1399],
    '1400_1600': [1400, 1599],
    '1600_1800': [1600, 1799],
    '1800_plus': [1800, 9999]
  };

  const grouped = {
    '800_1000': [],
    '1000_1200': [],
    '1200_1400': [],
    '1400_1600': [],
    '1600_1800': [],
    '1800_plus': []
  };

  let validCount = 0;
  let invalidCount = 0;
  const themeCounts = {};

  rawPuzzles.forEach((puzzle) => {
    try {
      const chess = new Chess(puzzle.fen);

      // Play setup move
      const setupMove = puzzle.solution[0];
      const setupPlayed = playUciMove(chess, setupMove);
      if (!setupPlayed) {
        invalidCount++;
        return; // Discard invalid setup FEN/move
      }

      // Play through the solution
      let solutionValid = true;
      for (let i = 1; i < puzzle.solution.length; i++) {
        const move = puzzle.solution[i];
        const played = playUciMove(chess, move);
        if (!played) {
          solutionValid = false;
          break;
        }
      }

      if (!solutionValid) {
        invalidCount++;
        return; // Discard invalid solution line
      }

      // Generate a title, e.g. "Fork Tactic" or "Mate in 2"
      let title = 'Chess Puzzle';
      if (puzzle.themes.includes('mateIn1')) title = 'Mate in 1';
      else if (puzzle.themes.includes('mateIn2')) title = 'Mate in 2';
      else if (puzzle.themes.includes('mateIn3')) title = 'Mate in 3';
      else if (puzzle.themes.includes('fork')) title = 'Fork Attack';
      else if (puzzle.themes.includes('pin')) title = 'Tactical Pin';
      else if (puzzle.themes.includes('skewer')) title = 'Tactical Skewer';
      else if (puzzle.themes.includes('discoveredAttack')) title = 'Discovered Attack';
      else if (puzzle.themes.includes('endgame')) title = 'Endgame Strategy';
      else if (puzzle.themes.includes('opening')) title = 'Opening Trap';
      else if (puzzle.themes.length > 0) {
        // Fallback to first non-generic theme capitalized
        const filterThemes = puzzle.themes.filter(t => !['advantage', 'short', 'veryLong', 'long', 'master', 'superMaster'].includes(t));
        if (filterThemes.length > 0) {
          title = capitalize(filterThemes[0].replace(/([A-Z])/g, ' $1'));
        }
      }

      // Generate Hint (based on starting square of player's first move)
      // The player's first move is puzzle.solution[1] (since solution[0] is opponent setup)
      const playerFirstMove = puzzle.solution[1];
      const hintSquare = playerFirstMove ? playerFirstMove.substring(0, 2) : '';
      const hint = hintSquare ? `Try moving a piece starting on ${hintSquare}` : 'Look for forcing moves (checks, captures, threats).';

      // Clean themes list (filter out generic Lichess structural tags like short, long, veryLong)
      const cleanThemes = puzzle.themes.filter(t => !['short', 'long', 'veryLong', 'crushing', 'advantage'].includes(t)).map(t => capitalize(t.replace(/([A-Z])/g, ' $1')));

      // Format opening tag nicely
      let cleanOpening = '';
      if (puzzle.opening) {
        cleanOpening = puzzle.opening.replace(/_/g, ' ');
      }

      const verifiedPuzzle = {
        id: puzzle.id,
        fen: puzzle.fen,
        solution: puzzle.solution,
        rating: puzzle.rating,
        themes: cleanThemes,
        opening: cleanOpening,
        sideToMove: puzzle.sideToMove,
        title: title,
        hint: hint
      };

      // Assign to rating group
      let assigned = false;
      for (const [band, [low, high]] of Object.entries(RANGES)) {
        if (verifiedPuzzle.rating >= low && verifiedPuzzle.rating <= high) {
          grouped[band].push(verifiedPuzzle);
          assigned = true;
          break;
        }
      }

      if (assigned) {
        validCount++;
        // Track theme stats
        cleanThemes.forEach(t => {
          themeCounts[t] = (themeCounts[t] || 0) + 1;
        });
      }

    } catch (e) {
      invalidCount++;
    }
  });

  // Create directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write out files
  console.log('\n--- Writing Validated Rating Bucket Files ---');
  for (const [band, list] of Object.entries(grouped)) {
    const filename = `puzzles_${band}.json`;
    const dest = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(dest, JSON.stringify(list, null, 2), 'utf-8');
    console.log(`Saved ${list.length} verified puzzles to ${dest}`);
  }

  // Generate Summary Report
  console.log('\n================ IMPORT SUMMARY ================');
  console.log(`Total Puzzles Processed:  ${rawPuzzles.length}`);
  console.log(`Total Puzzles Validated:  ${validCount}`);
  console.log(`Total Puzzles Discarded:  ${invalidCount}`);
  console.log('\nRating Distribution:');
  for (const [band, list] of Object.entries(grouped)) {
    console.log(`  - Band ${band.replace('_', ' to ')}: ${list.length} puzzles`);
  }
  console.log('\nTop 15 Themes Distribution:');
  const sortedThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
  sortedThemes.slice(0, 15).forEach(([theme, count]) => {
    console.log(`  - ${theme}: ${count}`);
  });
  console.log('================================================\n');
}

validateAndGroup();
