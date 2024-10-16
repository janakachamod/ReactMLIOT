import React from 'react';
import { Link } from 'react-router-dom'; 
import './Header.css';  

function Header() {
    return (
        <header className="header">
            <h1 className="header-title">AnomAlert</h1>
            <nav className="nav">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/predict-sensors" className="nav-link">Real Time Detection</Link>
                <Link to="/predict-rf-model" className="nav-link">Predict Occupancy</Link>
            </nav>
        </header>
    );
}

export default Header;
