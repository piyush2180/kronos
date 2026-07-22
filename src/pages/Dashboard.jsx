import React, { useState, useEffect } from 'react';
import DashboardDesktop from '../components/dashboard/DashboardDesktop';
import DashboardMobile from '../components/dashboard/DashboardMobile';

export default function Dashboard({ username, navigate }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <DashboardMobile username={username} navigate={navigate} />;
  }

  return <DashboardDesktop username={username} navigate={navigate} />;
}
