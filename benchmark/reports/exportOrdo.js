import fs from 'fs';
import path from 'path';

export class OrdoExporter {
  /**
   * Generates Ordo execution helper scripts and formatted PGN files.
   * @param {string} pgnPath - Path to games.pgn
   * @param {string} outputDir - Directory to write Ordo runner files
   */
  static export(pgnPath, outputDir = 'benchmark/output') {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const absPgn = path.resolve(pgnPath);
    const scriptContent = `# Ordo Rating System Command Helper Script
# Ordo is an external chess rating tool for measuring engine Elo ratings accurately from PGN files.
# Download Ordo from: https://github.com/mcostalba/ordo or official distribution packages.

ordo -p "${absPgn}" -o "${path.join(outputDir, 'ordo_ratings.txt')}" --draw-graph -A "Kronos Baseline"

echo "Ordo execution complete. Ratings saved to ordo_ratings.txt."
`;

    const batScript = `@echo off
REM Ordo execution script for Windows
ordo -p "${absPgn}" -o "${path.join(outputDir, 'ordo_ratings.txt')}" --draw-graph -A "Kronos Baseline"
echo Ordo execution complete. Ratings saved to ordo_ratings.txt.
`;

    fs.writeFileSync(path.join(outputDir, 'run_ordo.sh'), scriptContent);
    fs.writeFileSync(path.join(outputDir, 'run_ordo.bat'), batScript);

    console.log(`Ordo helper scripts generated in: ${outputDir}`);
    console.log(`To run Ordo manually, execute: ordo -p "${absPgn}" -o "${path.join(outputDir, 'ordo_ratings.txt')}"`);
  }
}
