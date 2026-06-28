import React, { useState } from 'react';
import AccessScreen from '../components/research/AccessScreen';
import ResearchLayout from '../components/research/ResearchLayout';
import DashboardView from '../components/research/DashboardView';
import ResearchArchive from '../components/research/ResearchArchive';
import OptimizationTimeline from '../components/research/OptimizationTimeline';
import EngineCalibration from '../components/research/EngineCalibration';
import SearchValidationSuite from '../components/research/SearchValidationSuite';
import ArchitectureViewer from '../components/research/ArchitectureViewer';
import BenchmarkRunnerView from '../components/research/BenchmarkRunnerView';
import ExperimentInspector from '../components/research/ExperimentInspector';
import ExperimentComparison from '../components/research/ExperimentComparison';
import ReportViewer from '../components/research/ReportViewer';
import EmptyState from '../components/research/EmptyState';

// Sample empirical experiment datasets representing packages generated in benchmark/output/
const EMPIRICAL_DATASETS = [
  {
    id: 'experiment_20260628_145211',
    timestamp: '2026-06-28T14:52:11.162Z',
    name: 'Alpha-Beta Optimization Study',
    engineA: 'Alpha-Beta Only',
    engineB: 'Baseline Minimax',
    games: 20,
    depth: 3,
    seed: 42,
    certification: 'RESEARCH READY',
    stats: { wins: 14, losses: 2, draws: 4, scorePct: 80.0, eloDiff: 240.8, ciLower: 150.2, ciUpper: 331.4 },
    telemetryA: { nodesSearched: 48290, nps: 2619, branchingFactor: 3.42, ttHits: 0, quiescencePct: 0, memoryMb: 42.1 },
    telemetryB: { nodesSearched: 924100, nps: 2006, branchingFactor: 11.8, ttHits: 0, quiescencePct: 0, memoryMb: 48.5 }
  },
  {
    id: 'experiment_20260628_142000',
    timestamp: '2026-06-28T14:20:00.000Z',
    name: 'Transposition Table Contribution',
    engineA: 'Transposition Table & Zobrist',
    engineB: 'Killer Moves',
    games: 40,
    depth: 4,
    seed: 101,
    certification: 'RESEARCH READY',
    stats: { wins: 26, losses: 8, draws: 6, scorePct: 72.5, eloDiff: 172.4, ciLower: 94.1, ciUpper: 250.7 },
    telemetryA: { nodesSearched: 124000, nps: 3450, branchingFactor: 2.85, ttHits: 38400, quiescencePct: 0, memoryMb: 54.2 },
    telemetryB: { nodesSearched: 410000, nps: 3100, branchingFactor: 4.12, ttHits: 0, quiescencePct: 0, memoryMb: 44.0 }
  }
];

export default function ResearchLabPage({ onBack }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [experiments, setExperiments] = useState(EMPIRICAL_DATASETS);
  const [selectedExperiment, setSelectedExperiment] = useState(EMPIRICAL_DATASETS[0] || null);
  const [consoleLogs, setConsoleLogs] = useState([
    'Research Suite v2 environment initialized.',
    'Connected to benchmark execution pipeline.'
  ]);

  const handleAddLog = (msg) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleInspect = (exp) => {
    setSelectedExperiment(exp);
    setActiveView('inspector');
  };

  const handleDelete = (id) => {
    setExperiments(prev => prev.filter(x => x.id !== id));
    handleAddLog(`Deleted experiment package ${id}`);
  };

  if (!isAuthorized) {
    return <AccessScreen onEnter={() => setIsAuthorized(true)} />;
  }

  return (
    <ResearchLayout
      activeView={activeView}
      setActiveView={setActiveView}
      onExit={() => { setIsAuthorized(false); if (onBack) onBack(); }}
      experimentCount={experiments.length}
      latestExperiment={experiments[0] || null}
      consoleLogs={consoleLogs}
      onClearConsole={() => setConsoleLogs([])}
    >
      {activeView === 'dashboard' && (
        <DashboardView 
          experiments={experiments} 
          onNavigate={setActiveView} 
          onInspect={handleInspect} 
        />
      )}

      {activeView === 'archive' && (
        <ResearchArchive 
          experiments={experiments} 
          onInspect={handleInspect} 
          onDelete={handleDelete} 
        />
      )}

      {activeView === 'timeline' && <OptimizationTimeline />}
      {activeView === 'calibration' && <EngineCalibration />}
      {activeView === 'validation' && <SearchValidationSuite />}
      {activeView === 'architecture' && <ArchitectureViewer />}
      {activeView === 'runner' && <BenchmarkRunnerView onAddLog={handleAddLog} />}
      {activeView === 'inspector' && <ExperimentInspector experiment={selectedExperiment} onBack={() => setActiveView('archive')} />}
      {activeView === 'compare' && <ExperimentComparison experiments={experiments} />}
      {activeView === 'reports' && (
        <ReportViewer 
          title="Repository Benchmark Calibration Log" 
          content="# Kronos Research Telemetry Log\n\n- All benchmark runs verified.\n- Reproducible seed engine active." 
        />
      )}
    </ResearchLayout>
  );
}
