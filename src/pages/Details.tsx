import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/Api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addUseCaseToDraftThunk, createConsumptionThunk, fetchDraftThunk } from '../store/thunks';
import type { UseCase } from '../types';

interface DetailsProps {
  onAddLocal?: (item: UseCase) => void;
}

const Details: React.FC<DetailsProps> = ({ onAddLocal }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const draftInfo = useAppSelector((s) => s.consumptions.draftInfo);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const data = await api.getUseCaseById(id);
        setUseCase(data ?? null);
      } catch {
        setUseCase(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAdd = async () => {
    if (!useCase) return;
    if (user) {
      setAdding(true);
      let consumptionId: number | null | undefined = draftInfo?.consumption_id;
      if (consumptionId == null) {
        consumptionId = await createConsumptionThunk(user.id)(dispatch);
        if (consumptionId) await fetchDraftThunk(user.id)(dispatch);
      }
      if (consumptionId != null) {
        const ok = await addUseCaseToDraftThunk(
          consumptionId!,
          useCase.id,
          user.id
        )(dispatch);
        if (ok) navigate('/applications/draft');
      }
      setAdding(false);
    } else if (onAddLocal) {
      onAddLocal(useCase);
      navigate('/consumption');
    }
  };

  if (loading) return <div className="loading-text">Загрузка...</div>;
  if (!useCase) return <div className="empty-text">Сценарий не найден</div>;

  const fallbackImage = `https://picsum.photos/seed/${useCase.id}/800/400`;

  return (
    <div className="details-wrapper">
      <div className="details-card">
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
              <span className="details-consumption-val">{useCase.energyConsumption}</span>{' '}
              <span className="details-consumption-unit">мА</span>
            </p>
            {useCase.description && <p className="details-desc">{useCase.description}</p>}
          </div>
          <button
            onClick={handleAdd}
            className="btn btn-add-consumption"
            disabled={adding}
          >
            {adding ? 'Добавление...' : 'Добавить в заявку'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Details;
