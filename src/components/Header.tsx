
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumbs from './BreadCrumbs';

const Header: React.FC = () => {
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
                        К заявке
                    </Link>
                )}
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
