import React, { useState, useEffect } from "react";
import "./works.css";
import CommentSection from "../Component/CommentSection";
import { useWard } from "../Context/WardContext";

const Works = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ward } = useWard();

  useEffect(() => {
    setLoading(true);
    fetch(
      `http://127.0.0.1/my-react-app/Backend/api/get_works.php?ward_id=${ward}`
    )
      .then((res) => res.json())
      .then((data) => {
        setWorks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching works:", err);
        setLoading(false);
      });
  }, [ward]);

  if (loading) {
    return <div className="loading-state">Loading works...</div>;
  }

  if (works.length === 0) {
    return <div className="no-works">No works found for this ward.</div>;
  }

  return (
    <section className="works-section">
      {works.map((work) => (
        <div
          className="works-card"
          key={work.id}
          style={{ marginBottom: "30px" }}
        >
          <div className="works-card-header">
            <div>
              <p className="works-label">Works</p>
              <h3>{work.title}</h3>
              <p className="works-subtitle">
                {work.location || work.subtitle || "Ward No. 1, Kathmandu"}
              </p>
            </div>
            <span
              className={`status-pill status-${(work.status || "pending")
                .toLowerCase()
                .replace("-", "")}`}
            >
              {work.status || "Pending"}
            </span>
          </div>

          <img
            src={
              work.image
                ? `http://127.0.0.1/my-react-app/Backend/api/${work.image}`
                : "https://sewellbeard.com/wp-content/uploads/2021/02/us-72-west-road-project.jpeg"
            }
            alt={work.title}
            className="works-image"
            onError={(e) => {
              e.target.src =
                "https://sewellbeard.com/wp-content/uploads/2021/02/us-72-west-road-project.jpeg";
            }}
          />

          <div className="works-details">
            <div>
              <strong>Start Date</strong>
              <p>{work.start_date || work.startDate || "N/A"}</p>
            </div>
            <div>
              <strong>End Date</strong>
              <p>{work.end_date || work.endDate || "N/A"}</p>
            </div>
            <div>
              <strong>Budget</strong>
              <p>{work.budget ? `Rs. ${work.budget}` : work.budget || "N/A"}</p>
            </div>
            <div>
              <strong>Beneficiaries</strong>
              <p>{work.beneficiaries || "N/A"}</p>
            </div>
          </div>

          <p className="works-description">{work.description}</p>

          {/* Integrated Comment Section */}
          <CommentSection workId={work.id} />
        </div>
      ))}
    </section>
  );
};

export default Works;
