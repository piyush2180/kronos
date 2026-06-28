import fs from 'fs';
import path from 'path';
import { ConfigurableKronosEngine } from './configurableEngine.js';
import { UCIEngineAdapter } from './uciAdapter.js';
import { StockfishAdapter } from './stockfishAdapter.js';

export class EngineFactory {
  /**
   * Loads an engine instance based on engine spec identifier or file path.
   * @param {string|object} spec - Config object, JSON file path, or UCI engine type
   */
  static createEngine(spec) {
    if (typeof spec === 'string') {
      if (spec === 'stockfish' || spec.startsWith('stockfish')) {
        return new StockfishAdapter('stockfish', { name: 'Stockfish' });
      }
      if (spec === 'berserk' || spec === 'ethereal' || spec === 'fairy-stockfish') {
        return new UCIEngineAdapter(spec, { name: spec });
      }
      // Assume JSON file path
      const fullPath = path.resolve(spec);
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const config = JSON.parse(raw);
        return new ConfigurableKronosEngine(config);
      }
      throw new Error(`Engine specification or configuration file not found: ${spec}`);
    }

    if (typeof spec === 'object') {
      if (spec.uciBinary) {
        return new UCIEngineAdapter(spec.uciBinary, spec.options || {});
      }
      return new ConfigurableKronosEngine(spec);
    }

    throw new Error('Invalid engine specification provided to EngineFactory');
  }
}
