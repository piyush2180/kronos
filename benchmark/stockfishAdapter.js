import { UCIEngineAdapter } from './uciAdapter.js';

export class StockfishAdapter {
  constructor(binaryPath = 'stockfish', options = {}) {
    this.name = options.name || 'Stockfish';
    this.uci = new UCIEngineAdapter(binaryPath, options);
  }

  async init() {
    return await this.uci.init();
  }

  async go(params) {
    return await this.uci.go(params);
  }

  quit() {
    this.uci.quit();
  }
}
