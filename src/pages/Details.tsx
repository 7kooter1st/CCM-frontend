
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/Api';
import { type UseCase } from '../types';

interface DetailsProps {
  onAdd: (item: UseCase) => void;
}

const Details: React.FC<DetailsProps> = ({ onAdd }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getUseCaseById(id).then((data) => {
        setUseCase(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAdd = () => {
    if (useCase) {
      onAdd(useCase);
      navigate('/consumption');
    }
  };

  if (loading) return <div className="loading-text">Загрузка...</div>;
  if (!useCase) return <div className="empty-text">Сценарий не найден</div>;

  const fallbackImage = `https://picsum.photos/seed/${useCase.id}/800/400`;

  return (
    <div className="details-wrapper">
      <div className="details-card">
        {/* Large Image */}
        <div className="details-hero-image-container">
            <img 
              src={useCase.imageUrl || fallbackImage} 
              alt={useCase.title} 
              className="details-hero-image"
            />
        </div>

        <div className="details-body">
          <h2 className="details-title">{useCase.title}</h2>
          
          <div className="details-info-box">
            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Расход энергии:</p>
            <p>
              <span className="details-consumption-val">{useCase.energyConsumption}</span> <span className="details-consumption-unit">мА</span>
            </p>
            {useCase.description && (
               <p className="details-desc">{useCase.description}</p>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="btn btn-add-consumption"
          >
            Добавить в заявку
          </button>
        </div>
      </div>
    </div>
  );
};

export default Details;
