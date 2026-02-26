import React from 'react';
import { useAppSelector } from '../store/hooks';

const LoadingOverlay: React.FC = () => {
  const loading = useAppSelector((s) => s.ui.loading);
  if (!loading) return null;
  return (
    <div className="loading-overlay" aria-hidden="true">
      <div className="spinner" />
    </div>
  );
};

export default LoadingOverlay;
