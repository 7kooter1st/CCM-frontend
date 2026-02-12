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
                
                {/* {isAuthenticated ? (
                  <button onClick={onLogout} className="btn btn-nav">
                    Выйти
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-nav">
                    Войти
                  </Link>
                )} */}
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
