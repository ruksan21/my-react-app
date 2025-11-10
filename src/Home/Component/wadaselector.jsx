import { useState, useEffect } from 'react';
import './wadaselector.css';

// API बाट आउने data को mock (उदाहरण)
const mockMunicipalities = [
    {  name: "Kathmandu Metropolitan City", name_ne: "काठमाडौं महानगरपालिका", totalWards: 32 },
    {  name: "Lalitpur Metropolitan City", name_ne: "ललितपुर महानगरपालिका", totalWards: 29 },
    {  name: "Bhaktapur Municipality", name_ne: "भक्तपुर नगरपालिका", totalWards: 10 },
    {  name: "Kirtipur Municipality", name_ne: "कीर्तिपुर नगरपालिका", totalWards: 10 },
    {  name: "Tokha Municipality", name_ne: "टोखा नगरपालिका", totalWards: 11 },
    {  name: "Chandragiri Municipality", name_ne: "चन्द्रागिरी नगरपालिका", totalWards: 15 },
];

const WardSelector = ({ onWardSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const [municipalities, setMunicipalities] = useState([]);
    const [selectedMunicipality, setSelectedMunicipality] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // भविष्यमा यहाँ API call हुन्छ
        setMunicipalities(mockMunicipalities);
    }, []);

    const filteredMunicipalities = municipalities.filter(municipality => {
        return municipality.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    const toggleDropdown = () => setIsOpen(!isOpen);

    const selectMunicipality = (municipality) => {
        setSelectedMunicipality(municipality);
        setSearchTerm('');
    };

    const selectWard = (wardNumber) => {
        setSelectedWard(wardNumber);
        if (selectedMunicipality) {
            onWardSelect(selectedMunicipality.name, wardNumber);
        }
        setIsOpen(false);
    };

    const handleBack = () => {
        setSelectedMunicipality(null);
        setSelectedWard(null);
    };

    // Button मा देखाउने Text
    const displayText = selectedMunicipality && selectedWard
        ? `${selectedMunicipality.name} - Ward ${selectedWard}`
        : 'Select Ward';

    return (
        <div className="ward-selector-container">
            <button className="ward-selector-button" onClick={toggleDropdown}>
                <i className="icon-map-pin">📍</i>
                <span>{displayText}</span>
                <i className={`arrow-icon ${isOpen ? 'up' : ''}`}>▲</i>
            </button>

            {isOpen && (
                <div className="ward-selector-dropdown">
                    {!selectedMunicipality ? (
                        <>
                            <h3 className="dropdown-title">Municipality</h3>
                            <div className="search-box">
                                <i className="icon-search">🔍</i>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search municipality..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <ul className="municipality-list">
                                {filteredMunicipalities.map((muni) => (
                                    <li
                                        key={muni.id}
                                        className="municipality-list-item"
                                        onClick={() => selectMunicipality(muni)}
                                    >
                                        <span className="municipality-name">{muni.name}</span>
                                        <span className="ward-count">{muni.totalWards} Wards</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <div className="ward-grid-view">
                            <button className="back-button" onClick={handleBack}>
                                &larr; Back
                            </button>
                            <h4 className="selected-municipality-title">{selectedMunicipality.name}</h4>
                            <div className="ward-grid">
                                {Array.from({ length: selectedMunicipality.totalWards }, (_, i) => i + 1).map((wardNum) => (
                                    <button
                                        key={wardNum}
                                        className="ward-grid-item"
                                        onClick={() => selectWard(wardNum)}
                                    >
                                        {wardNum}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WardSelector;