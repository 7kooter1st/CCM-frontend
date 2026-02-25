import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumbs from './BreadCrumbs';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = () => { //{ isAuthenticated, onLogout } 
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Navbar Row */}
        <div className="header-top">
            <h1 className="brand-title">
                CCM Manager
            </h1>
            <div className="nav-links">
                <Link 
                    to="/" 
                    className="btn btn-nav"
                >
                    Домой
                </Link>
                {location.pathname !== '/consumption' && (
                    <Link 
                        to="/consumption" 
                        className="btn btn-nav"
                    >
                        потребление
                    </Link>
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
                    {location.pathname !== '/consumption' && (
                        <Link to="/consumption" className="btn btn-nav">потребление</Link>
                    )}
                </div>
            </div>
        </div>

        {/* Breadcrumbs Row */}
        <div>
            <Breadcrumbs />
        </div>
      </div>
    </header>
  );
};

export default Header;
