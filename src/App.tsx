
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Details from './pages/Details';
import Consumption from './pages/Consumption';
import { type ConsumptionItem, type UseCase } from './types';

// The App component holds the state instead of Context/Redux as per requirements
const App: React.FC = () => {
  // State for the "Consumption" page (The Cart)
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>([]);

  // Add an item to consumption
  const addToConsumption = (useCase: UseCase) => {
    setConsumptionItems((prev) => {
      // Check if already exists to avoid duplicates
      const exists = prev.find((item) => item.id === useCase.id);
      if (exists) {
        // If exists, just increase minutes by 10 as default action
        return prev.map(item => 
          item.id === useCase.id ? { ...item, minutes: item.minutes + 10 } : item
        );
      }
      // Add new item with default 0 minutes (user must add time)
      return [...prev, { ...useCase, minutes: 0 }];
    });
  };

  // Update minutes for a specific item
  const updateTime = (id: number, delta: number) => {
    setConsumptionItems((prev) => 
      prev.map((item) => {
        if (item.id === id) {
          const newMinutes = Math.max(0, item.minutes + delta);
          return { ...item, minutes: newMinutes };
        }
        return item;
      })
    );
  };

  // Remove item completely
  const removeItem = (id: number) => {
    setConsumptionItems((prev) => prev.filter(item => item.id !== id));
  };

  return (
    <HashRouter>
      <div className="app-root">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Home />} 
            />
            <Route 
              path="/use-cases/:id" 
              element={<Details onAdd={addToConsumption} />} 
            />
            <Route 
              path="/consumption" 
              element={
                <Consumption 
                  items={consumptionItems} 
                  onUpdateTime={updateTime}
                  onRemove={removeItem}
                />
              } 
            />
            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
