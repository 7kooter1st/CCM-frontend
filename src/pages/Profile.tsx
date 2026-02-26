import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { protectedApi } from '../services/apiClient';
import { setUser } from '../store/authSlice';
import { setError } from '../store/uiSlice';

const Profile: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [login, setLogin] = useState(user?.login ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    dispatch(setError(null));
    try {
      const { data } = await protectedApi.getMe();
      dispatch(setUser({ ...data, login: login || data.login }));
      setMessage('Данные обновлены (только логин; сброс пароля — при наличии эндпоинта на бэкенде).');
    } catch {
      dispatch(setError('Не удалось обновить данные'));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="auth-card">
        <h2>Личный кабинет</h2>
        <p>Логин: <strong>{user.login}</strong></p>
        <p>Роль: {user.role === 1 ? 'Модератор' : 'Пользователь'}</p>
        <form onSubmit={handleSaveLogin}>
          <div className="mb-3">
            <label className="form-label">Новый логин</label>
            <input
              type="text"
              className="form-control"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder={user.login}
            />
          </div>
          {message && <div className="alert alert-info">{message}</div>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
        <p className="mt-3 text-muted small">
          Смена пароля: при наличии соответствующего метода на бэкенде здесь будет форма.
        </p>
      </div>
    </div>
  );
};

export default Profile;
