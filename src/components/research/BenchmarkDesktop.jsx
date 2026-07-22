import React from 'react';
import ResearchLayout from './ResearchLayout';
import DashboardView from './DashboardView';
import ResearchArchive from './ResearchArchive';
import OptimizationTimeline from './OptimizationTimeline';
import EngineCalibration from './EngineCalibration';
import SearchValidationSuite from './SearchValidationSuite';
import ArchitectureViewer from './ArchitectureViewer';
import BenchmarkRunnerView from './BenchmarkRunnerView';
import ExperimentInspector from './ExperimentInspector';
import ExperimentComparison from './ExperimentComparison';
import ReportViewer from './ReportViewer';

export default function BenchmarkDesktop({
  isAuthorized,
  setIsAuthorized,
  activeView,
  setActiveView,
  experiments,
  selectedExperiment,
  consoleLogs,
  setConsoleLogs,
  handleAddLog,
  handleInspect,
  handleDelete,
  handleImportJson,
  refreshExperiments,
  onBack,
}) {
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
          onImportJson={handleImportJson}
        />
      )}

      {activeView === 'timeline' && <OptimizationTimeline experiments={experiments} />}
      {activeView === 'calibration' && <EngineCalibration experiments={experiments} />}
      {activeView === 'validation' && <SearchValidationSuite onAddLog={handleAddLog} />}
      {activeView === 'architecture' && <ArchitectureViewer />}
      {activeView === 'runner' && (
        <BenchmarkRunnerView 
          onAddLog={handleAddLog} 
          onTournamentComplete={() => refreshExperiments()} 
        />
      )}
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
