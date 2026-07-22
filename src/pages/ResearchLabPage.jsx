import React, { useState, useEffect } from 'react';
import AccessScreen from '../components/research/AccessScreen';
import BenchmarkDesktop from '../components/research/BenchmarkDesktop';
import BenchmarkMobile from '../components/research/BenchmarkMobile';
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

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const props = {
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
  };

  if (isMobile) {
    return <BenchmarkMobile {...props} />;
  }

  return <BenchmarkDesktop {...props} />;
}
