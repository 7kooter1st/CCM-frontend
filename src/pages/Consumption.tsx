
import React, { useState, useMemo } from 'react';
import { type ConsumptionItem } from '../types';

interface ConsumptionProps {
  items: ConsumptionItem[];
  onUpdateTime: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

const Consumption: React.FC<ConsumptionProps> = ({ items, onUpdateTime, onRemove }) => {
  // Local state for calculation inputs
  const [batteryCapacity, setBatteryCapacity] = useState<number>(5000);
  const [currentCharge, setCurrentCharge] = useState<number>(100);

  // Calculations
  const totalConsumptionMAh = useMemo(() => {
    // Current (mA) * Time (hours) = Capacity (mAh)
    // Formula: Sum( (mA * minutes) / 60 )
    return items.reduce((acc, item) => {
      const itemMah = (item.energyConsumption * item.minutes) / 60;
      return acc + itemMah;
    }, 0);
  }, [items]);

  const remainingChargeMAh = useMemo(() => {
    const currentCapacity = batteryCapacity * (currentCharge / 100);
    return Math.max(0, currentCapacity - totalConsumptionMAh);
  }, [batteryCapacity, currentCharge, totalConsumptionMAh]);

  const remainingPercentage = useMemo(() => {
    if (batteryCapacity === 0) return 0;
    return (remainingChargeMAh / batteryCapacity) * 100;
  }, [remainingChargeMAh, batteryCapacity]);

  return (
    <div className="consumption-container">
      <h2 className="consumption-header">
        Заявка на расчет потребления
      </h2>

      {/* List of Items */}
      <div className="consumption-items-list">
        {items.length === 0 ? (
          <div className="use-case-card" style={{ padding: '2rem', textAlign: 'center', color: '#d1d5db' }}>
            Не добавлено сценариев
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className="consumption-item"
            >
              {/* Image */}
              <img 
                src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200/200`} 
                alt={item.title} 
                className="item-thumbnail"
              />
              
              {/* Content */}
              <div className="item-details">
                <h3 className="item-title">{item.title}</h3>
                <p className="item-consumption">
                  Потребление: <span className="item-highlight">{item.energyConsumption} мА</span>
                </p>
                {/* Remove Button for UX improvement */}
                <button 
                  onClick={() => onRemove(item.id)}
                  className="btn-remove"
                >
                  Удалить
                </button>
              </div>

              {/* Controls */}
              <div className="item-controls">
                <span className="control-label">Время использования</span>
                <div className="control-group">
                    <button 
                        onClick={() => onUpdateTime(item.id, -10)}
                        className="btn-circle"
                        disabled={item.minutes <= 0}
                    >
                        -
                    </button>
                    <div className="control-display">
                        <span className="minutes-val">{item.minutes}</span>
                        <span className="minutes-label">минут</span>
                    </div>
                    <button 
                        onClick={() => onUpdateTime(item.id, 10)}
                        className="btn-circle"
                    >
                        +
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer / Calculation Area */}
      <div className="summary-container">
        <h3 className="summary-title">
            Результаты расчета
        </h3>
        
        <div className="summary-inputs">
            {/* Input Column 1 */}
            <div className="summary-input-group">
                <label>Емкость аккумулятора (мАч)</label>
                <input 
                    type="number" 
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                />
            </div>
             {/* Input Column 2 */}
             <div className="summary-input-group">
                <label>Текущий заряд (%)</label>
                <input 
                    type="number" 
                    value={currentCharge}
                    onChange={(e) => setCurrentCharge(Math.min(100, Math.max(0, Number(e.target.value))))}
                />
            </div>
        </div>

        <div className="results-panel">
            <div className="result-block">
                 <span className="result-label">Общее потребление</span>
                 <span className="result-value-large">{totalConsumptionMAh.toFixed(1)} мАч</span>
            </div>
            <div className="result-block bordered">
                 <span className="result-label">Остаток заряда</span>
                 <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span className={`result-value-huge ${remainingPercentage < 20 ? 'text-red' : 'text-green'}`}>
                        {remainingPercentage.toFixed(1)}%
                    </span>
                    <span className="result-sub">({remainingChargeMAh.toFixed(0)} мАч)</span>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Consumption;
