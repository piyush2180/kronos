import React, { useState, useEffect } from 'react';
import LearnDesktop from './learn/LearnDesktop';
import LearnMobile from './learn/LearnMobile';

export default function Learn() {
  const [activeSection, setActiveSection] = useState('chess-fundamentals');
  const [inspectedSourceFile, setInspectedSourceFile] = useState('src/engine/minimax.js');

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectSource = (filePath) => {
    setInspectedSourceFile(filePath);
  };

  const navigateToResearch = (view) => {
    window.location.hash = `#/research?view=${view}`;
  };

  const props = {
    activeSection,
    setActiveSection,
    inspectedSourceFile,
    handleSelectSource,
    navigateToResearch,
  };

  if (isMobile) {
    return <LearnMobile {...props} />;
  }

  return <LearnDesktop {...props} />;
}
