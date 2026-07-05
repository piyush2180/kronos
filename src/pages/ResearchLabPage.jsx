import React, { useState, useEffect } from 'react';
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
import { BenchmarkDataService } from '../services/benchmarkService';

export default function ResearchLabPage({ onBack }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [experiments, setExperiments] = useState([]);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), level: 'SYSTEM', message: 'Benchmark Workspace environment initialized.' },
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), level: 'SUCCESS', message: 'Connected to benchmark data service.' }
  ]);

  // Load experiments from BenchmarkDataService on initialization
  useEffect(() => {
    const loaded = BenchmarkDataService.getExperiments();
    setExperiments(loaded);
    if (loaded.length > 0) {
      setSelectedExperiment(loaded[0]);
    }
  }, []);

  const refreshExperiments = () => {
    const loaded = BenchmarkDataService.getExperiments();
    setExperiments(loaded);
    if (loaded.length > 0 && !selectedExperiment) {
      setSelectedExperiment(loaded[0]);
    }
  };

  const handleAddLog = (msg, level = 'INFO') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    let resolvedLevel = level;
    let cleanMsg = msg;
    const lower = msg.toLowerCase();
    
    if (lower.includes('success') || lower.includes('completed') || lower.includes('passed')) {
      resolvedLevel = 'SUCCESS';
    } else if (lower.includes('failed') || lower.includes('halted') || lower.includes('error')) {
      resolvedLevel = 'ERROR';
    } else if (lower.includes('initializing') || lower.includes('deleted') || lower.includes('environment')) {
      resolvedLevel = 'SYSTEM';
    }
    
    setConsoleLogs(prev => [...prev, { time, level: resolvedLevel, message: cleanMsg }]);
  };

  const handleInspect = (exp) => {
    setSelectedExperiment(exp);
    setActiveView('inspector');
  };

  const handleDelete = (id) => {
    const updated = BenchmarkDataService.deleteExperiment(id);
    setExperiments(updated);
    if (selectedExperiment?.id === id) {
      setSelectedExperiment(updated[0] || null);
    }
    handleAddLog(`Deleted experiment package ${id}`);
  };

  const handleImportJson = (jsonStr) => {
    try {
      const updated = BenchmarkDataService.importExperimentFromJson(jsonStr);
      setExperiments(updated);
      handleAddLog('Successfully imported benchmark summary JSON artifact package.');
    } catch (err) {
      handleAddLog(`Import Failed: ${err.message}`);
    }
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
