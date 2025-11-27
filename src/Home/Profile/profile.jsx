import { useState } from "react";
import "./profile.css";
import Works from "./works";
import jsPDF from "jspdf";

// Data for the profile, which you can later fetch from a backend.
const profileData = {
  name: "Ram Bahadur Shrestha",
  role: "wardChairperson - Kathmandu Metropolitan City, wardNumber 1",
  phone: "9841234567",
  email: "ram.shrestha@ktm.gov.np",
  imageUrl: "https://i.imgur.com/JQrOMa7.png", // Using a placeholder image URL
  rating: 4.2,
  reviews: 89,
  followers: 1250,
  personalInfo: {
    address: "वडा नं. १, काठमाडौं",
    education: "स्नातकोत्तर (राजनीति विज्ञान)",
    experience: "१५ वर्ष स्थानीय राजनीतिमा",
    politicalParty: "नेपाली कांग्रेस",
    appointmentDate: "२०७९/०५/१५",
  },
  contactDetails: {
    phone: "9841234567",
    email: "ram.shrestha@ktm.gov.np",
    address: "वडा नं. १, काठमाडौं",
  },
};

// Star rating component
const StarRating = ({ rating, reviews }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="star-rating">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`}>&#9733;</span>
      ))}
      {halfStar && <span>&#9734;</span>}{" "}
      {/* Using an empty star for half, can be improved with better icons */}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`}>&#9734;</span>
      ))}
      <span className="reviews-text">
        {rating} ({reviews} reviews)
      </span>
    </div>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Details");
  const [followers, setFollowers] = useState(profileData.followers);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      alert("Please login to follow!");
      return;
    }

    if (isFollowing) {
      setFollowers((prev) => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowers((prev) => prev + 1);
      setIsFollowing(true);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Set font and colors
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Ward Chairperson Profile", 105, 20, { align: "center" });

    // Add profile name
    doc.setFontSize(14);
    doc.text(profileData.name, 105, 35, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(profileData.role, 105, 43, { align: "center" });

    // Personal Information Section
    let yPos = 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Personal Information", 20, yPos);

    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const personalInfo = [
      { label: "Address", value: profileData.personalInfo.address },
      { label: "Education", value: profileData.personalInfo.education },
      { label: "Experience", value: profileData.personalInfo.experience },
      {
        label: "Political Party",
        value: profileData.personalInfo.politicalParty,
      },
      {
        label: "Appointment Date",
        value: profileData.personalInfo.appointmentDate,
      },
    ];

    personalInfo.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${item.label}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, 70, yPos);
      yPos += 8;
    });

    // Contact Details Section
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Contact Details", 20, yPos);

    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const contactInfo = [
      { label: "Phone", value: profileData.contactDetails.phone },
      { label: "Email", value: profileData.contactDetails.email },
      { label: "Address", value: "Ward No. 1, Kathmandu" },
    ];

    contactInfo.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${item.label}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, 70, yPos);
      yPos += 8;
    });

    // Stats Section
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Statistics", 20, yPos);

    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `Rating: ${profileData.rating} (${profileData.reviews} reviews)`,
      20,
      yPos
    );
    yPos += 8;
    doc.text(`Followers: ${followers}`, 20, yPos);

    // Save the PDF
    doc.save(`${profileData.name.replace(/\s+/g, "_")}_Profile.pdf`);
  };


  const renderActivePanel = () => {
    if (activeTab === "Details") {
      return (
        <div className="info-section">
          <div className="personal-info">
            <h2>Personal Information</h2>
            <div className="info-item">
              <label>Address</label>
              <p>{profileData.personalInfo.address}</p>
            </div>
            <div className="info-item">
              <label>Education</label>
              <p>{profileData.personalInfo.education}</p>
            </div>
            <div className="info-item">
              <label>Experience</label>
              <p>{profileData.personalInfo.experience}</p>
            </div>
            <div className="info-item">
              <label>Political Party</label>
              <p>{profileData.personalInfo.politicalParty}</p>
            </div>
            <div className="info-item">
              <label>Appointment Date</label>
              <p>{profileData.personalInfo.appointmentDate}</p>
            </div>
          </div>

          <div className="contact-details">
            <h2>Contact Details</h2>
            <div className="contact-item">
              <span>&#9742; {profileData.contactDetails.phone}</span>
            </div>
            <div className="contact-item">
              <span>&#9993; {profileData.contactDetails.email}</span>
            </div>
            <div className="contact-item">
              <span>&#128205; {profileData.contactDetails.address}</span>
            </div>
            <button className="download-button" onClick={handleDownloadPDF}>
              Download Details
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === "Works") {
      return <Works />;
    }

    return (
      <p className="tab-placeholder">Content coming soon for {activeTab}.</p>
    );
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-left">
          <img
            src={profileData.imageUrl}
            alt="Ram Bahadur Shrestha"
            className="profile-picture"
          />
          <div className="profile-name-role">
            <h1>{profileData.name}</h1>
            <p>{profileData.role}</p>
            <div className="profile-header-contact">
              <span>&#9742; {profileData.phone}</span>
              <span>&#9993; {profileData.email}</span>
            </div>
          </div>
        </div>
        <div className="profile-header-right">
          <StarRating
            rating={profileData.rating}
            reviews={profileData.reviews}
          />
          <div className="followers-section">
            <span>&#128100; {followers} followers</span>
            <button
              className={`follow-button ${isFollowing ? "following" : ""}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      <div className="profile-body">
        <div className="tabs">
          {[
            "Details",
            "Works",
            "Assets",
            "Activities",
            "Reviews",
            "Dashboard",
          ].map((tab) => (
            <button
              key={tab}
              className={`tab-item ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-content">{renderActivePanel()}</div>
      </div>
    </div>
  );
};

export default Profile;
