
import React from 'react';
import { Link } from 'react-router-dom';
import { type UseCase } from '../types';

interface UseCaseCardProps {
  useCase: UseCase;
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({ useCase }) => {
  const fallbackImage = `https://picsum.photos/seed/${useCase.id}/300/200`;

  return (
    <div className="use-case-card">
      <img 
        src={useCase.imageUrl || fallbackImage} 
        alt={useCase.title} 
        className="card-image"
      />
      <div className="card-content">
        <h3 className="card-title">{useCase.title}</h3>
        <p className="card-text">
             Потребление: {useCase.energyConsumption} мА
        </p>
        <Link 
          to={`/use-cases/${useCase.id}`}
          className="btn btn-outline"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
};

export default UseCaseCard;
