import { useState } from 'react';
import './Navbar.css';
import HeroImage from '../../Image/Home.png';
import Profile from '../Profile/profile.jsx';
import WardSelector from '../Component/wadaselector.jsx';

const Navbar = () => {
    const [selectedMuni, setSelectedMuni] = useState('Select Municipality');
    
    return (
        <div className="app">
            {/* Top Navigation Bar */}
            <nav className="navbar">
                <div className="navbar-left">
                    <span className="logo">वडा पोर्टल</span>
                </div>
                <div className="navbar-center">
                    <a href="#home" className="nav-link active">Home</a>
                    <a href="#about" className="nav-link">About</a>
                    <a href="#contact" className="nav-link">Contact</a>
                </div>
                 {/* Dropdown Button */}
                <div className="navbar-center">
                    <WardSelector onWardSelect={(muni, ward) => setSelectedMuni(`${muni} - Ward ${ward}`)} />
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
                    <img src={HeroImage} alt="Hero" />
                    <div className="hero-overlay">
                        <h1>Ward Chairperson</h1>
                        <p>View your Ward Chairperson details</p>
                        <div className="selected-muni">{selectedMuni}</div>
                    </div>
                </section>

               

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
            <Profile />
        </div>
    );
};

export default Navbar;
