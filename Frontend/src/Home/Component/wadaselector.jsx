import { useState, useEffect, useMemo } from "react";
import { useWard } from "../Context/WardContext";
import { useAuth } from "../Context/AuthContext";
import "./wadaselector.css";

const WardSelector = ({ onWardSelect }) => {
  const { municipality, ward, setMunicipality, setWard, setWardId } = useWard();
  const { wards: allWards } = useAuth(); // Get real wards from DB
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480);

  // Group wards by Municipality
  const municipalities = useMemo(() => {
    if (!allWards) return [];

    const groups = {};
    allWards.forEach((w) => {
      const muniName = w.municipality || "Unknown Municipality";
      if (!groups[muniName]) {
        groups[muniName] = { name: muniName, wards: [] };
      }
      // Store both number and ID
      groups[muniName].wards.push({ number: w.number, id: w.id });
    });

    // Convert to array and sorting
    return Object.values(groups)
      .map((g) => ({
        ...g,
        wards: g.wards.sort((a, b) => a.number - b.number),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allWards]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Initialize from context
    if (municipality) {
      const muniObj = municipalities.find((m) => m.name === municipality);
      if (muniObj) setSelectedMunicipality(muniObj);
    }
    if (ward) setSelectedWard(ward);
  }, [municipality, ward, municipalities]);

  const filteredMunicipalities = municipalities.filter((m) => {
    return m.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectMunicipality = (muni) => {
    setSelectedMunicipality(muni);
    setSearchTerm("");
  };

  const selectWard = (wardObj) => {
    // wardObj is { number, id }
    setSelectedWard(wardObj.number);
    if (selectedMunicipality) {
      setWard(wardObj.number);
      setWardId(wardObj.id); // Set the actual DB ID
      setMunicipality(selectedMunicipality.name);
      onWardSelect && onWardSelect(selectedMunicipality.name, wardObj.number);
    }
    setIsOpen(false);
  };

  // Helper to get display text for the button
  const getDisplayText = () => {
    if (municipality && ward) {
      return `${municipality}, Ward ${ward}`;
    } else if (municipality) {
      return `${municipality}`;
    }
    return "Select Ward";
  };

  const handleBack = () => {
    setSelectedMunicipality(null);
    setSearchTerm("");
  };

  const displayText = getDisplayText();

  return (
    <div className="ward-selector-container">
      <button className="ward-selector-button" onClick={toggleDropdown}>
        <i className="icon-map-pin">📍</i>
        <span>{displayText}</span>
        <i className={`arrow-icon ${isOpen ? "up" : ""}`}>▲</i>
      </button>

      {isOpen && (
        <>
          <div
            className="ward-selector-backdrop"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="ward-selector-dropdown">
            <button
              className="close-dropdown-mobile"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
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
                  {filteredMunicipalities.length === 0 ? (
                    <li
                      className="municipality-list-item"
                      style={{ justifyContent: "center", color: "#888" }}
                    >
                      No Municipalities Found
                    </li>
                  ) : (
                    filteredMunicipalities.map((muni) => (
                      <li
                        key={muni.name}
                        className="municipality-list-item"
                        onClick={() => selectMunicipality(muni)}
                      >
                        <span className="municipality-name">{muni.name}</span>
                        <span className="ward-count">
                          {muni.wards.length} Wards
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </>
            ) : (
              <div className="ward-grid-view">
                <button className="back-button" onClick={handleBack}>
                  &larr; Back
                </button>
                <h4 className="selected-municipality-title">
                  {selectedMunicipality.name}
                </h4>
                <div className="ward-grid">
                  {selectedMunicipality.wards.map((wardObj) => (
                    <button
                      key={wardObj.id}
                      className={`ward-grid-item ${
                        selectedWard === wardObj.number ? "selected" : ""
                      }`}
                      onClick={() => selectWard(wardObj)}
                    >
                      {wardObj.number}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WardSelector;
