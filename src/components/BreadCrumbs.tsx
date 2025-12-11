
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link">
            Главная
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Translate common paths for better UI
          let displayName = value;
          if (value === 'consumption') displayName = 'Заявка';
          if (value === 'use-cases') displayName = 'Сценарий';
          // If it's a number (ID), likely logic for Details, simplify display
          if (!isNaN(Number(value))) displayName = 'Подробнее';

          const isLast = index === pathnames.length - 1;

          return (
            <li key={to} className="breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              {isLast ? (
                <span className="breadcrumb-active">{displayName}</span>
              ) : (
                <Link to={to} className="breadcrumb-link">
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
