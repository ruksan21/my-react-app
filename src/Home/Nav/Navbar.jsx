import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMuni, setSelectedMuni] = useState("Kathmandu Metropolitan City - wardNumber 1");

    // Municipality List
    const municipalities = [
        "Kathmandu Metropolitan City - wardNumber 1",
        "Lalitpur Metropolitan City - wardNumber 29",
        "Bhaktapur Municipality - wardNumber 10",
        "Kirtipur Municipality - wardNumber 5",
        "Tokha Municipality - wardNumber 7",
        "Chandragiri Municipality - wardNumber 3",
    ];

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const selectOption = (option) => {
        setSelectedMuni(option);
        setIsOpen(false);
    };

    return (
        <div className="app">
            {/* Top Navigation Bar */}
            <nav className="navbar">
                <div className="navbar-left">
                    <span className="logo">वडा पोर्टल</span>
                </div>
                <div className="navbar-center">
                    <a href="#home" className="nav-link active">home</a>
                    <a href="#about" className="nav-link">about</a>
                    <a href="#contact" className="nav-link">contact</a>
                </div>
                <div className="navbar-right">
                    <div className="language-selector">
                        <span>US</span>
                        <select>
                            <option>English</option>
                            <option>Nepali</option>
                        </select>
                    </div>
                    <button className="login-btn">login</button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                {/* Hero Section */}
                <section className="hero">
                    <img src="https://via.placeholder.com/1920x600?text=Mountain+Background" alt="Hero" />
                    <div className="hero-overlay">
                        <h1>Ward Chairperson</h1>
                        <p>View your Ward Chairperson details</p>
                        <div className="selected-muni">{selectedMuni}</div>
                    </div>
                </section>

                {/* Dropdown Button */}
                <div className="dropdown-container">
                    <button className="dropdown-btn" onClick={toggleDropdown}>
                        <span>📍 {selectedMuni}</span>
                        <span className="arrow">▲</span>
                    </button>
                    {isOpen && (
                        <ul className="dropdown-list">
                            {municipalities.map((muni, index) => (
                                <li
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => selectOption(muni)}
                                >
                                    {muni}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Stats Cards */}
                <section className="stats-section">
                    <div className="stat-card">
                        <div className="icon">💼</div>
                        <h3>3</h3>
                        <p>Total Works</p>
                    </div>
                    <div className="stat-card">
                        <div className="icon">✅</div>
                        <h3>1</h3>
                        <p>Completed Works</p>
                    </div>
                    <div className="stat-card">
                        <div className="icon">⭐</div>
                        <h3>4.2</h3>
                        <p>Average Rating</p>
                    </div>
                    <div className="stat-card">
                        <div className="icon">👥</div>
                        <h3>1250</h3>
                        <p>Followers</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Navbar;
