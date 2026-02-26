import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { dest_root } from '../target_config';

import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import Home from './pages/Home';
import Details from './pages/Details';
import Consumption from './pages/Consumption';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchDraftThunk } from './store/thunks';
import type { UseCase } from './types';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  const [localItems, setLocalItems] = React.useState<{ id: number; title: string; imageUrl?: string; energyConsumption: number; minutes: number }[]>([]);

  const addToLocalConsumption = (useCase: UseCase) => {
    setLocalItems((prev) => {
      const exists = prev.find((item) => item.id === useCase.id);
      if (exists) {
        return prev.map((item) =>
          item.id === useCase.id ? { ...item, minutes: item.minutes + 10 } : item
        );
      }
      return [...prev, { ...useCase, minutes: 0 }];
    });
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchDraftThunk(user.id));
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const isTauri = typeof window !== 'undefined' && !!(window as unknown as { __TAURI__?: unknown }).__TAURI__;
    if (!isTauri) return;
    invoke('tauri', { cmd: 'create' }).catch(() => {});
    return () => {
      invoke('tauri', { cmd: 'close' }).catch(() => {});
    };
  }, []);

  const updateLocalTime = (id: number, delta: number) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, minutes: Math.max(0, item.minutes + delta) } : item
      )
    );
  };
  const removeLocalItem = (id: number) => {
    setLocalItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <HashRouter basename={dest_root}>
      <div className="app-root">
        <LoadingOverlay />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/applications"
              element={isAuthenticated ? <Applications /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/applications/draft"
              element={isAuthenticated ? <ApplicationDetail /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/applications/:id"
              element={isAuthenticated ? <ApplicationDetail /> : <Navigate to="/login" replace />}
            />
            <Route path="/use-cases/:id" element={<Details onAddLocal={addToLocalConsumption} />} />
            <Route
              path="/consumption"
              element={
                <Consumption
                  items={localItems}
                  onUpdateTime={updateLocalTime}
                  onRemove={removeLocalItem}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
