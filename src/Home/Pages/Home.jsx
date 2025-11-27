import { useState } from "react";
import Navbar from "../Nav/Navbar";
import Profile from "../Profile/profile.jsx";
import HeroSection from "./HeroSection.jsx";
import Status from "./Status.jsx";

const Home = () => {
  const [selectedMuni, setSelectedMuni] = useState("Select Municipality");

  return (
    <div className="app">
      <Navbar
        onWardSelect={(muni, ward) => setSelectedMuni(`${muni} - Ward ${ward}`)}
      />

      <main className="main-content">
        <HeroSection selectedMuni={selectedMuni} />
        <Status />
      </main>
      <Profile />
    </div>
  );
};

export default Home;
