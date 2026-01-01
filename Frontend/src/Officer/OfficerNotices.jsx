import React, { useState } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerNotices.css";

const OfficerNotices = () => {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Ward Meeting Announcement",
      content: "Monthly ward meeting scheduled for November 25th at 2 PM",
      date: "2023-11-10",
      active: true,
    },
    {
      id: 2,
      title: "Tax Collection Notice",
      content: "Property tax collection will begin from December 1st",
      date: "2023-11-08",
      active: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotice = {
      id: notices.length + 1,
      title: formData.title,
      content: formData.content,
      date: new Date().toISOString().split("T")[0],
      active: true,
    };
    setNotices([newNotice, ...notices]);
    setFormData({ title: "", content: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      setNotices(notices.filter((notice) => notice.id !== id));
    }
  };

  return (
    <OfficerLayout title="Notices">
      <div className="recent-activity">
        <div className="notices-header">
          <h2 className="section-title">Ward Notices</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="create-notice-btn"
          >
            <span>{showForm ? "✕" : "+"}</span>{" "}
            {showForm ? "Cancel" : "Create Notice"}
          </button>
        </div>

        {showForm && (
          <div className="notice-form-container">
            <h3 className="notice-form-title">New Notice</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter notice title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="form-input"
                  placeholder="Enter notice content"
                />
              </div>
              <button type="submit" className="publish-btn">
                Publish Notice
              </button>
            </form>
          </div>
        )}

        <div className="notices-list">
          {notices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <div className="notice-header">
                <div>
                  <h3 className="notice-title">{notice.title}</h3>
                  <p className="notice-date">📅 Published on {notice.date}</p>
                </div>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="notice-delete-btn"
                >
                  Delete
                </button>
              </div>
              <p className="notice-content">{notice.content}</p>
            </div>
          ))}
        </div>

        {notices.length === 0 && (
          <div className="no-notices">
            No notices published yet. Click "Create Notice" to add one.
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerNotices;
