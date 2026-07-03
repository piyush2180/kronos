import fs from 'fs';
import path from 'path';
import { ConfigurableKronosEngine } from './configurableEngine.js';
import { UCIEngineAdapter } from './uciAdapter.js';
import { StockfishAdapter } from './stockfishAdapter.js';

export class EngineFactory {
  static cache = new Map();

  /**
   * Loads an engine instance based on engine spec identifier or file path.
   * @param {string|object} spec - Config object, JSON file path, or UCI engine type
   */
  static createEngine(spec) {
    const cacheKey = typeof spec === 'object' ? JSON.stringify(spec) : spec;
    if (EngineFactory.cache.has(cacheKey)) {
      const cached = EngineFactory.cache.get(cacheKey);
      if (cached.clearState) cached.clearState();
      return cached;
    }

    let engine;
    if (typeof spec === 'string') {
      if (spec === 'stockfish' || spec.startsWith('stockfish')) {
        engine = new StockfishAdapter('stockfish', { name: 'Stockfish' });
      } else if (spec === 'berserk' || spec === 'ethereal' || spec === 'fairy-stockfish') {
        engine = new UCIEngineAdapter(spec, { name: spec });
      } else {
        // Assume JSON file path
        const fullPath = path.resolve(spec);
        if (fs.existsSync(fullPath)) {
          const raw = fs.readFileSync(fullPath, 'utf8');
          const config = JSON.parse(raw);
          engine = new ConfigurableKronosEngine(config);
        } else {
          throw new Error(`Engine specification or configuration file not found: ${spec}`);
        }
      }
    } else if (typeof spec === 'object') {
      if (spec.uciBinary) {
        engine = new UCIEngineAdapter(spec.uciBinary, spec.options || {});
      } else {
        engine = new ConfigurableKronosEngine(spec);
      }
    } else {
      throw new Error('Invalid engine specification provided to EngineFactory');
    }

    EngineFactory.cache.set(cacheKey, engine);
    return engine;
  }
}
