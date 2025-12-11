
import React, { useEffect, useState } from 'react';
import UseCaseCard from '../components/UseCaseCard';
import { api } from '../services/Api';
import { type UseCase } from '../types';

const Home: React.FC = () => {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async (query: string) => {
    setLoading(true);
    try {
      const data = await api.getUseCases(query);
      setUseCases(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search or just fetch on effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(search);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      {/* Search Bar */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Поиск сценария по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Grid */}
      <div className="cards-grid">
        {loading ? (
          <div className="loading-text">Загрузка...</div>
        ) : (
          useCases.length > 0 ? (
            useCases.map((useCase) => (
              <UseCaseCard key={useCase.id} useCase={useCase} />
            ))
          ) : (
            <div className="empty-text">
              Сценарии не найдены.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
