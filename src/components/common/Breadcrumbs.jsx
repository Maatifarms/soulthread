import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    const routeLabels = {
        'series': 'Series Gallery',
        'explore': 'Explore',
        'profile': 'Profile',
        'post': 'Detail',
        'hyperfocus-series': 'Hyperfocus',
        'never-finished-series': 'Mental Toughness',
        'ego-id-series': 'The Ego and the Id',
        'prompt-engineering-series': 'Prompt Architect',
        'pricing': 'Pricing',
        'crisis': 'Get Help',
        'care': 'Psychologist Network'
    };

    return (
        <nav aria-label="Breadcrumb" className="breadcrumbs-container">
            <ol className="breadcrumbs-list">
                <li className="breadcrumb-item">
                    <Link to="/" className="breadcrumb-link">Home</Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

                    return (
                        <li key={to} className={`breadcrumb-item ${last ? 'active' : ''}`}>
                            <span className="breadcrumb-separator">/</span>
                            {last ? (
                                <span className="breadcrumb-current" aria-current="page">{label}</span>
                            ) : (
                                <Link to={to} className="breadcrumb-link">{label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
