import { useState, useEffect } from "react";
import "./profile.css";
import Works from "./works";
import NoticePopup from "../Component/NoticePopup";
import jsPDF from "jspdf";
import Dashboard from "../Pages/Dashboard";
import Assets from "../Pages/Assets";
import Activities from "../Pages/Activities";
import { useWard } from "../Context/WardContext";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

// Default profile data (fallback if API fails)
const defaultProfileData = {
  name: "Ram Bahadur Shrestha",
  role: "wardChairperson - Kathmandu Metropolitan City, wardNumber 1",
  phone: "9841234567",
  email: "ram.shrestha@ktm.gov.np",
  imageUrl: "https://i.imgur.com/JQrOMa7.png",
  rating: 4.2,
  reviews: 89,
  followers: 1250,
  personalInfo: {
    address: "Ward No. 1, Kathmandu",
    education: "Master's Degree (Political Science)",
    experience: "15 years in local politics",
    politicalParty: "Nepali Congress",
    appointmentDate: "2022/08/31",
  },
  contactDetails: {
    phone: "9841234567",
    email: "ram.shrestha@ktm.gov.np",
    address: "Ward No. 1, Kathmandu",
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
  const { ward, wardId, stats, refreshStats } = useWard(); // Get global stats and refresh function
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [personalAssets, setPersonalAssets] = useState([]);

  const handleImageError = (e) => {
    if (profileData.photoFileName && !e.target.dataset.fallbackTried) {
      e.target.dataset.fallbackTried = "true";
      e.target.src = `${API_BASE_URL}/wards/uploads/${profileData.photoFileName}`;
      return;
    }
    e.target.src = "https://i.imgur.com/JQrOMa7.png";
  };

  useEffect(() => {
    // Initial fetch of isFollowing state for this specific user
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setIsFollowing(stats.isFollowing);
    }
  }, [stats.isFollowing]);

  useEffect(() => {
    // Fetch chairperson profile data from ward database using selected ward ID
    fetch(
      `${API_ENDPOINTS.officers.getChairpersonProfile}?ward_id=${wardId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const wardData = data.data;
          // Update profile data with database values
          setProfileData({
            name: wardData.chairperson_name || "Not Assigned",
            role: `wardChairperson - ${
              wardData.municipality || wardData.district_name
            } , Ward No. ${wardData.ward_number}`,
            phone: wardData.chairperson_phone || "N/A",
            email: wardData.chairperson_email || "N/A",
            imageUrl: wardData.chairperson_photo
              ? `${API_BASE_URL}/uploads/${wardData.chairperson_photo}`
              : "https://i.imgur.com/JQrOMa7.png",
            photoFileName: wardData.chairperson_photo || "",
            rating: 4.2,
            reviews: 89,
            followers: 1250,
            personalInfo: {
              address: `Ward No. ${wardData.ward_number}, ${
                wardData.municipality || wardData.district_name
              }`,
              education: wardData.chairperson_education || "N/A",
              experience: wardData.chairperson_experience || "N/A",
              politicalParty: wardData.chairperson_political_party || "N/A",
              appointmentDate: wardData.chairperson_appointment_date || "N/A",
            },
            contactDetails: {
              phone: wardData.chairperson_phone || "N/A",
              email: wardData.chairperson_email || "N/A",
              address: `Ward No. ${wardData.ward_number}, ${
                wardData.municipality || wardData.district_name
              }`,
            },
            wardId: wardData.ward_id,
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));

    // Refresh stats using ID
    const user = JSON.parse(localStorage.getItem("user"));
    const followerId = user ? user.id : null;
    refreshStats(wardId || 1, followerId);

    // Fetch personal assets
    fetch(
      `${API_ENDPOINTS.assets.manageChairpersonAssets}?ward_id=${wardId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPersonalAssets(data.data || []);
        }
      })
      .catch((err) => console.error("Error fetching personal assets:", err));
  }, [wardId, refreshStats]); // Re-fetch when wardId or refreshStats changes

  const handleFollow = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!isLoggedIn || !user) {
      alert("Please login to follow!");
      return;
    }

    if (user.role !== "citizen") {
      alert("Only citizens can follow officers.");
      return;
    }

    if (!profileData.officerId) {
      alert("No officer accounts connected to this ward.");
      return;
    }

    // Call backend API to persistence follow action
    fetch(API_ENDPOINTS.officers.toggleFollow, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        officer_id: profileData.officerId,
        follower_id: user.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Trigger global stats refresh!
          refreshStats(ward || 1, user.id);
        } else {
          alert(data.message || "Failed to update follow status.");
        }
      })
      .catch((err) => console.error("Error toggling follow:", err));
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
    doc.text(`Rating: ${stats.rating} (${stats.reviews} reviews)`, 20, yPos);
    yPos += 8;
    doc.text(`Followers: ${stats.followers}`, 20, yPos);

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
      return <Works wardId={profileData.wardId} />;
    }
    if (activeTab === "Dashboard") {
      return <Dashboard embedded={true} wardId={profileData.wardId} />;
    }
    if (activeTab === "Assets") {
      return <Assets embedded={true} />;
    }

    if (activeTab === "Activities") {
      return <Activities embedded={true} />;
    }

    if (activeTab === "Personal Property") {
      return (
        <div className="info-section">
          <h2>Chairperson's Property Declaration</h2>
          {personalAssets.length === 0 ? (
            <p>No property details declared.</p>
          ) : (
            <table
              className="works-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa", textAlign: "left" }}>
                  <th
                    style={{
                      padding: "12px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Asset Type
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Details
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      borderBottom: "2px solid #dee2e6",
                    }}
                  >
                    Ownership
                  </th>
                </tr>
              </thead>
              <tbody>
                {personalAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    style={{ borderBottom: "1px solid #dee2e6" }}
                  >
                    <td
                      style={{ padding: "12px", textTransform: "capitalize" }}
                    >
                      {asset.asset_type.replace("_", " ")}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <strong>{asset.asset_name}</strong>
                      {asset.description && (
                        <div style={{ fontSize: "0.9em", color: "#666" }}>
                          {asset.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>{asset.location || "-"}</td>
                    <td
                      style={{ padding: "12px", textTransform: "capitalize" }}
                    >
                      {asset.ownership_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div
            style={{
              marginTop: "20px",
              fontSize: "0.85rem",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            * This property details are declared by the chairperson as per
            public transparency regulations.
          </div>
        </div>
      );
    }

    return (
      <p className="tab-placeholder">Content coming soon for {activeTab}.</p>
    );
  };

  return (
    <div className="profile-container">
      {/* Notice Popup */}
      <NoticePopup />
      
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-left">
          <img
            src={profileData.imageUrl}
            alt="Ram Bahadur Shrestha"
            className="profile-picture"
            onError={handleImageError}
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
          <StarRating rating={stats.rating} reviews={stats.reviews} />
          <div className="followers-section">
            <span>&#128100; {stats.followers} followers</span>
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
            "Personal Property",
            "Works",
            "Assets",
            "Activities",
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
