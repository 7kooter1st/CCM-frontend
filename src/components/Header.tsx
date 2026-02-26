import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/thunks';
import Breadcrumbs from './BreadCrumbs';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  const draftInfo = useAppSelector((s) => s.consumptions.draftInfo);

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-top">
          <h1 className="brand-title">CCM Manager</h1>
          <div className="nav-links">
            <Link to="/" className="btn btn-nav">Домой</Link>
            {isAuthenticated && (
              <>
                <Link to="/applications" className="btn btn-nav">Заявки</Link>
                {draftInfo != null ? (
                  <Link to="/applications/draft" className="btn btn-nav btn-primary">
                    Черновик
                  </Link>
                ) : (
                  <span className="btn btn-nav btn-secondary disabled" title="Нет черновика">
                    Черновик
                  </span>
                )}
                <Link to="/profile" className="btn btn-nav">Кабинет</Link>
              </>
            )}
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-nav">Вход</Link>
                <Link to="/register" className="btn btn-nav">Регистрация</Link>
              </>
            ) : (
              <>
                <span className="nav-user-name">{user?.login ?? 'Пользователь'}</span>
                <button type="button" className="btn btn-nav btn-outline-danger" onClick={handleLogout}>
                  Выход
                </button>
              </>
            )}
          </div>
          <div
            className="nav-mobile-wrapper"
            onClick={(e) => e.currentTarget.classList.toggle('active')}
            aria-label="Меню"
          >
            <div className="nav-mobile-target" />
            <div className="nav-mobile-menu" onClick={(e) => e.stopPropagation()}>
              <Link to="/" className="btn btn-nav">Домой</Link>
              {isAuthenticated && (
                <>
                  <Link to="/applications" className="btn btn-nav">Заявки</Link>
                  <Link to="/applications/draft" className="btn btn-nav">Черновик</Link>
                  <Link to="/profile" className="btn btn-nav">Кабинет</Link>
                </>
              )}
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="btn btn-nav">Вход</Link>
                  <Link to="/register" className="btn btn-nav">Регистрация</Link>
                </>
              ) : (
                <button type="button" className="btn btn-nav" onClick={handleLogout}>Выход</button>
              )}
            </div>
          </div>
        </div>
        <div>
          <Breadcrumbs />
        </div>
      </div>
    </header>
  );
};

export default Header;
