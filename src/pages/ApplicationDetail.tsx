import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchConsumptionThunk,
  fetchDraftThunk,
  removeUseCaseFromDraftThunk,
  changeDurationThunk,
  formateConsumptionThunk,
  createConsumptionThunk,
} from '../store/thunks';
import type { UseCaseInConsumption } from '../types';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const detail = useAppSelector((s) => s.consumptions.detail);
  const draftInfo = useAppSelector((s) => s.consumptions.draftInfo);
  const loading = useAppSelector((s) => s.ui.loading);
  const [durationEdits, setDurationEdits] = useState<Record<number, number>>({});

  const isDraft = id === 'draft' || detail?.status === 'черновик';
  const consumptionId = id === 'draft' ? draftInfo?.consumption_id : (id ? Number(id) : 0);

  useEffect(() => {
    if (!user) return;
    if (id === 'draft' && draftInfo?.consumption_id) {
      dispatch(fetchConsumptionThunk(draftInfo.consumption_id, user.id));
    } else if (consumptionId) {
      dispatch(fetchConsumptionThunk(consumptionId, user.id));
    }
  }, [user?.id, id, draftInfo?.consumption_id, consumptionId]);

  useEffect(() => {
    if (detail?.use_cases) {
      const next: Record<number, number> = {};
      detail.use_cases.forEach((uc) => {
        next[uc.id] = uc.duration ?? 0;
      });
      setDurationEdits(next);
    }
  }, [detail?.use_cases]);

  const handleRemove = async (useCaseId: number) => {
    if (!user || !detail) return;
    await removeUseCaseFromDraftThunk(detail.id, useCaseId, user.id)(dispatch);
  };

  const handleDurationChange = (useCaseId: number, delta: number) => {
    setDurationEdits((prev) => ({
      ...prev,
      [useCaseId]: Math.max(0, (prev[useCaseId] ?? 0) + delta),
    }));
  };

  const handleDurationBlur = async (useCaseId: number) => {
    if (!user || !detail || !isDraft) return;
    const d = durationEdits[useCaseId] ?? 0;
    await changeDurationThunk(detail.id, useCaseId, d, user.id)(dispatch);
  };

  const handleConfirm = async () => {
    if (!user || !detail) return;
    const ok = await formateConsumptionThunk(detail.id, user.id)(dispatch);
    if (ok) navigate('/applications');
  };

  const handleCreateDraft = async () => {
    if (!user) return;
    const newId = await createConsumptionThunk(user.id)(dispatch);
    if (newId) {
      dispatch(fetchDraftThunk(user.id));
      navigate('/applications/draft');
    }
  };

  if (!user) return null;
  if (loading && !detail) return <div className="loading-text">Загрузка...</div>;

  if (id === 'draft' && !draftInfo?.consumption_id) {
    return (
      <div className="application-detail">
        <h2>Черновик заявки</h2>
        <p>Черновика нет. Создайте заявку и добавляйте сценарии со страницы услуг.</p>
        <button type="button" className="btn btn-primary" onClick={handleCreateDraft}>
          Создать черновик
        </button>
      </div>
    );
  }

  if (consumptionId && !detail && !loading) {
    return <div className="empty-text">Заявка не найдена</div>;
  }

  if (!detail) return null;

  return (
    <div className="application-detail">
      <h2>Заявка #{detail.id}</h2>
      <p>Статус: <strong>{detail.status}</strong>. Сумма: {detail.total_power} мА.</p>

      <div className="consumption-items-list">
        {detail.use_cases?.length === 0 ? (
          <div className="use-case-card" style={{ padding: '2rem', textAlign: 'center' }}>
            Нет сценариев в заявке
          </div>
        ) : (
          (detail.use_cases ?? []).map((uc: UseCaseInConsumption) => (
            <div key={uc.id} className="consumption-item">
              <img
                src={uc.image || `https://picsum.photos/seed/${uc.id}/200/200`}
                alt={uc.name}
                className="item-thumbnail"
              />
              <div className="item-details">
                <h3 className="item-title">{uc.name}</h3>
                <p>Потребление: {uc.consumption} мА</p>
                {isDraft && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemove(uc.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
              <div className="item-controls">
                <span className="control-label">Минут</span>
                {isDraft ? (
                  <>
                    <button
                      type="button"
                      className="btn-circle"
                      onClick={() => handleDurationChange(uc.id, -10)}
                      disabled={(durationEdits[uc.id] ?? uc.duration) <= 0}
                    >
                      -
                    </button>
                    <div className="control-display">
                      <input
                        type="number"
                        min={0}
                        value={durationEdits[uc.id] ?? uc.duration ?? 0}
                        onChange={(e) =>
                          setDurationEdits((prev) => ({
                            ...prev,
                            [uc.id]: Math.max(0, Number(e.target.value)),
                          }))
                        }
                        onBlur={() => handleDurationBlur(uc.id)}
                        className="form-control form-control-sm text-center"
                        style={{ width: '60px' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-circle"
                      onClick={() => handleDurationChange(uc.id, 10)}
                    >
                      +
                    </button>
                  </>
                ) : (
                  <span className="minutes-val">{uc.duration ?? 0}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isDraft && (
        <div className="mt-3">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleConfirm}
            disabled={loading || !detail.use_cases?.length}
          >
            Подтвердить заявку
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
