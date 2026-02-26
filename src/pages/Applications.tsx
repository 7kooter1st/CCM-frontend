import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchConsumptionsThunk,
  fetchDraftThunk,
  moderatorActionThunk,
} from '../store/thunks';
import { setFilters, setCreatorFilter } from '../store/consumptionsSlice';
import type { ConsumptionFilter } from '../types';

const POLL_INTERVAL_MS = 5000;
const STATUS_OPTIONS = ['черновик', 'новая', 'одобрена', 'отклонена', 'удален'];

const Applications: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const list = useAppSelector((s) => s.consumptions.list);
  const draftInfo = useAppSelector((s) => s.consumptions.draftInfo);
  const filters = useAppSelector((s) => s.consumptions.filters);
  const creatorFilter = useAppSelector((s) => s.consumptions.creatorFilter);
  const loading = useAppSelector((s) => s.ui.loading);
  const isModerator = user?.role === 1;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchList = () => {
    const params: ConsumptionFilter = {};
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.status) params.status = filters.status;
    dispatch(fetchConsumptionsThunk(params));
  };

  useEffect(() => {
    if (!user) return;
    dispatch(fetchDraftThunk(user.id));
    fetchList();
  }, [user?.id]);

  useEffect(() => {
    if (!isModerator || !user) return;
    pollRef.current = setInterval(() => fetchList(), POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isModerator, user?.id, filters.start_date, filters.end_date, filters.status]);

  const filteredList = useMemo(() => {
    if (!creatorFilter.trim()) return list;
    const q = creatorFilter.trim().toLowerCase();
    return list.filter((c) => c.creator?.toLowerCase().includes(q));
  }, [list, creatorFilter]);

  const handleModerate = async (consumptionId: number, action: string) => {
    if (!user || user.role !== 1) return;
    await moderatorActionThunk(consumptionId, action, user.id)(dispatch);
  };

  const formatDate = (ts: number) => {
    if (!ts) return '—';
    return new Date(ts * 1000).toLocaleDateString('ru-RU');
  };

  if (!user) return null;

  return (
    <div className="applications-page">
      <h2>Заявки</h2>

      <div className="applications-toolbar">
        <div className="filters-row">
          <label>
            Дата от
            <input
              type="date"
              value={filters.start_date ?? ''}
              onChange={(e) => dispatch(setFilters({ start_date: e.target.value || undefined }))}
              className="form-control form-control-sm d-inline-block ms-1"
              style={{ width: 'auto' }}
            />
          </label>
          <label className="ms-2">
            Дата до
            <input
              type="date"
              value={filters.end_date ?? ''}
              onChange={(e) => dispatch(setFilters({ end_date: e.target.value || undefined }))}
              className="form-control form-control-sm d-inline-block ms-1"
              style={{ width: 'auto' }}
            />
          </label>
          <label className="ms-2">
            Статус
            <select
              value={filters.status ?? ''}
              onChange={(e) => dispatch(setFilters({ status: e.target.value || undefined }))}
              className="form-select form-select-sm d-inline-block ms-1"
              style={{ width: 'auto' }}
            >
              <option value="">Все</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          {isModerator && (
            <label className="ms-2">
              Создатель (фронт)
              <input
                type="text"
                value={creatorFilter}
                onChange={(e) => dispatch(setCreatorFilter(e.target.value))}
                placeholder="Логин..."
                className="form-control form-control-sm d-inline-block ms-1"
                style={{ width: '120px' }}
              />
            </label>
          )}
          <button type="button" className="btn btn-sm btn-outline-primary ms-2" onClick={fetchList}>
            Обновить
          </button>
        </div>
        <div className="draft-link mt-2">
          {draftInfo != null ? (
            <Link to="/applications/draft" className="btn btn-primary">
              Черновик заявки ({draftInfo.use_cases_in_consumption})
            </Link>
          ) : (
            <span className="btn btn-secondary disabled">Черновика нет</span>
          )}
        </div>
      </div>

      {loading && <div className="loading-text">Загрузка...</div>}
      {!loading && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Статус</th>
                <th>Создатель</th>
                <th>Дата</th>
                <th>Модератор</th>
                <th>Сумма (мА)</th>
                {isModerator && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr><td colSpan={isModerator ? 7 : 6}>Нет заявок</td></tr>
              ) : (
                filteredList.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/applications/${c.id}`}>{c.id}</Link>
                    </td>
                    <td>{c.status}</td>
                    <td>{c.creator}</td>
                    <td>{formatDate(c.created_at)}</td>
                    <td>{c.moderator || '—'}</td>
                    <td>{c.total_power}</td>
                    {isModerator && c.status !== 'черновик' && c.status !== 'удален' && (
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleModerate(c.id, 'одобрена')}
                        >
                          Одобрить
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleModerate(c.id, 'отклонена')}
                        >
                          Отклонить
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Applications;
