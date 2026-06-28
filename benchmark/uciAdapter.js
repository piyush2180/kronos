import { spawn } from 'child_process';
import readline from 'readline';

export class UCIEngineAdapter {
  constructor(binaryPath = 'stockfish', options = {}) {
    this.binaryPath = binaryPath;
    this.options = options; // UCI options e.g. { "Skill Level": 10 }
    this.process = null;
    this.rl = null;
    this.isReady = false;
  }

  async init() {
    return new Promise((resolve, reject) => {
      try {
        this.process = spawn(this.binaryPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
      } catch (err) {
        return reject(new Error(`Failed to spawn UCI binary "${this.binaryPath}": ${err.message}`));
      }

      this.process.on('error', (err) => {
        reject(new Error(`UCI Process Error (${this.binaryPath}): ${err.message}`));
      });

      this.rl = readline.createInterface({ input: this.process.stdout });

      let uciOK = false;
      const onLine = (line) => {
        if (line === 'uciok') {
          uciOK = true;
          // Set options
          for (const [key, value] of Object.entries(this.options)) {
            this.sendCommand(`setoption name ${key} value ${value}`);
          }
          this.sendCommand('isready');
        } else if (line === 'readyok' && uciOK) {
          this.isReady = true;
          this.rl.removeListener('line', onLine);
          resolve(true);
        }
      };

      this.rl.on('line', onLine);
      this.sendCommand('uci');
    });
  }

  sendCommand(cmd) {
    if (this.process && this.process.stdin.writable) {
      this.process.stdin.write(`${cmd}\n`);
    }
  }

  async go({ depth = 3, fen = null, timeMs = 0 }) {
    if (!this.isReady) await this.init();

    return new Promise((resolve) => {
      this.sendCommand('ucinewgame');
      this.sendCommand('isready');

      if (fen) {
        this.sendCommand(`position fen ${fen}`);
      } else {
        this.sendCommand('position startpos');
      }

      let bestMove = null;
      let nodes = 0;
      let nps = 0;
      let depthReached = depth;
      const startTime = Date.now();

      const onLine = (line) => {
        if (line.startsWith('info') && line.includes('nodes')) {
          const parts = line.split(' ');
          const nodesIdx = parts.indexOf('nodes');
          if (nodesIdx !== -1 && parts[nodesIdx + 1]) {
            nodes = parseInt(parts[nodesIdx + 1], 10);
          }
          const npsIdx = parts.indexOf('nps');
          if (npsIdx !== -1 && parts[npsIdx + 1]) {
            nps = parseInt(parts[npsIdx + 1], 10);
          }
        }

        if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          bestMove = parts[1];
          this.rl.removeListener('line', onLine);
          const elapsed = Date.now() - startTime;
          resolve({
            move: bestMove,
            timeMs: elapsed,
            stats: {
              nodesSearched: nodes,
              nodesPerSecond: nps || (nodes ? Math.round(nodes / (elapsed / 1000 || 0.001)) : 0),
              quiescenceNodes: 0,
              transpositionHits: 0,
              betaCutoffs: 0
            },
            depthReached
          });
        }
      };

      this.rl.on('line', onLine);

      if (timeMs > 0) {
        this.sendCommand(`go movetime ${timeMs}`);
      } else {
        this.sendCommand(`go depth ${depth}`);
      }
    });
  }

  quit() {
    if (this.process) {
      this.sendCommand('quit');
      this.process.kill();
      this.process = null;
    }
  }
}
