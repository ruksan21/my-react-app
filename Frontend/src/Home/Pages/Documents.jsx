import React, { useState } from "react";
import Navbar from "../Nav/Navbar";
import "./Documents.css";
import { useLanguage } from "../Context/useLanguage";

export default function Documents() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedService, setSelectedService] = useState(null);

  // Service categories with labels from image
  const categories = [
    { id: "all", name: t("documents.categories.all"), icon: "⊞" },
    {
      id: "certificates",
      name: t("documents.categories.certificates"),
      icon: "📜",
    },
    {
      id: "registration",
      name: t("documents.categories.registration"),
      icon: "📋",
    },
    { id: "tax", name: t("documents.categories.tax"), icon: "💰" },
    { id: "social", name: t("documents.categories.social"), icon: "❤️" },
    { id: "other", name: t("documents.categories.other"), icon: "⋯" },
  ];

  // Complete service catalog
  const documents = [
    {
      id: 1,
      title: t("documents.services.1.title"),
      category: "certificates",
      categoryLabel: "certificate",
      description: t("documents.services.1.desc"),
      time: t("documents.services.1.time"),
      fee: t("documents.services.1.fee"),
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "👤",
      requiredDocs: t("documents.services.1.docs"),
    },
    {
      id: 2,
      title: t("documents.services.2.title"),
      category: "certificates",
      categoryLabel: "certificate",
      description: t("documents.services.2.desc"),
      time: t("documents.services.2.time"),
      fee: t("documents.services.2.fee"),
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      icon: "👶",
      requiredDocs: t("documents.services.2.docs"),
    },
    {
      id: 3,
      title: t("documents.services.3.title"),
      category: "certificates",
      categoryLabel: "certificate",
      description: t("documents.services.3.desc"),
      time: t("documents.services.3.time"),
      fee: t("documents.services.3.fee"),
      gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
      icon: "💑",
      requiredDocs: t("documents.services.3.docs"),
    },
    {
      id: 4,
      title: t("documents.services.4.title"),
      category: "certificates",
      categoryLabel: "certificate",
      description: t("documents.services.4.desc"),
      time: t("documents.services.4.time"),
      fee: t("documents.services.4.fee"),
      gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)",
      icon: "🕊️",
      requiredDocs: t("documents.services.4.docs"),
    },
    {
      id: 5,
      title: t("documents.services.5.title"),
      category: "registration",
      categoryLabel: "registration",
      description: t("documents.services.5.desc"),
      time: t("documents.services.5.time"),
      fee: t("documents.services.5.fee"),
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      icon: "🏢",
      requiredDocs: t("documents.services.5.docs"),
    },
    {
      id: 6,
      title: t("documents.services.6.title"),
      category: "tax",
      categoryLabel: "tax",
      description: t("documents.services.6.desc"),
      time: t("documents.services.6.time"),
      fee: t("documents.services.6.fee"),
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      icon: "🏞️",
      requiredDocs: t("documents.services.6.docs"),
    },
    {
      id: 7,
      title: t("documents.services.7.title"),
      category: "tax",
      categoryLabel: "tax",
      description: t("documents.services.7.desc"),
      time: t("documents.services.7.time"),
      fee: t("documents.services.7.fee"),
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      icon: "🏠",
      requiredDocs: t("documents.services.7.docs"),
    },
    {
      id: 8,
      title: t("documents.services.8.title"),
      category: "social",
      categoryLabel: "social welfare",
      description: t("documents.services.8.desc"),
      time: t("documents.services.8.time"),
      fee: t("documents.services.8.fee"),
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      icon: "👴",
      requiredDocs: t("documents.services.8.docs"),
    },
    {
      id: 9,
      title: t("documents.services.9.title"),
      category: "social",
      categoryLabel: "social welfare",
      description: t("documents.services.9.desc"),
      time: t("documents.services.9.time"),
      fee: t("documents.services.9.fee"),
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      icon: "♿",
      requiredDocs: t("documents.services.9.docs"),
    },
    {
      id: 10,
      title: t("documents.services.10.title"),
      category: "other",
      categoryLabel: "recommendation",
      description: t("documents.services.10.desc"),
      time: t("documents.services.10.time"),
      fee: t("documents.services.10.fee"),
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      icon: "📝",
      requiredDocs: t("documents.services.10.docs"),
    },
    {
      id: 11,
      title: t("documents.services.11.title"),
      category: "other",
      categoryLabel: "certificate",
      description: t("documents.services.11.desc"),
      time: t("documents.services.11.time"),
      fee: t("documents.services.11.fee"),
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      icon: "💵",
      requiredDocs: t("documents.services.11.docs"),
    },
    {
      id: 12,
      title: t("documents.services.12.title"),
      category: "other",
      categoryLabel: "permit",
      description: t("documents.services.12.desc"),
      time: t("documents.services.12.time"),
      fee: t("documents.services.12.fee"),
      gradient: "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
      icon: "🏗️",
      requiredDocs: t("documents.services.12.docs"),
    },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      activeCategory === "all" || doc.category === activeCategory;
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (docId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const openModal = (service) => {
    setSelectedService(service);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedService(null);
    document.body.style.overflow = "unset";
  };

  return (
    <>
      <Navbar showHomeContent={false} />
      <div className="documents-page">
        {/* Hero Section */}
        <div className="documents-hero">
          <div className="hero-content">
            <div className="hero-icon">📄</div>
            <h1>{t("documents.page_title")}</h1>
            <p>{t("documents.page_subtitle")}</p>

            <div className="hero-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder={t("documents.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="documents-container">
          {/* Filter Section - Matching Image exactly */}
          <div className="filter-section">
            <div className="filter-header">
              <span className="filter-toggle-icon">≡</span>
              <h2>{t("documents.filter_title")}</h2>
            </div>

            <div className="category-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-card ${
                    activeCategory === cat.id ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <div className="category-icon-wrapper">
                    <span className="category-icon">{cat.icon}</span>
                  </div>
                  <span className="category-name">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="services-count">
            <span className="count-bar">|</span> {filteredDocuments.length}{" "}
            {t("documents.services_found")}
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {filteredDocuments.map((doc) => {
              const isExpanded = expandedCards[doc.id];
              const visibleDocs = isExpanded
                ? doc.requiredDocs
                : doc.requiredDocs.slice(0, 3);
              const hasMore = doc.requiredDocs.length > 3;

              return (
                <div key={doc.id} className="service-card">
                  <div
                    className="service-card-header"
                    style={{ background: doc.gradient }}
                  >
                    <div className="service-icon-badge">{doc.icon}</div>
                    <h3>{doc.title}</h3>
                    <p className="service-desc">{doc.description}</p>
                  </div>

                  <div className="service-card-body">
                    <div className="service-info-row">
                      <div className="info-item time">
                        <span className="info-icon">🕐</span>
                        <div className="info-text">
                          <span className="info-label">
                            {t("documents.time")}
                          </span>
                          <span className="info-value">{doc.time}</span>
                        </div>
                      </div>
                      <div className="info-item fee">
                        <span className="info-icon">✓</span>
                        <div className="info-text">
                          <span className="info-label">
                            {t("documents.fee")}
                          </span>
                          <span className="info-value">{doc.fee}</span>
                        </div>
                      </div>
                    </div>

                    <div className="required-docs-section">
                      <div className="docs-header">
                        <span className="docs-icon">📋</span>
                        <strong>{t("documents.required_docs_title")}</strong>
                      </div>
                      <ul className="docs-list">
                        {visibleDocs.map((reqDoc, index) => (
                          <li key={index}>
                            <span className="bullet">•</span> {reqDoc}
                          </li>
                        ))}
                      </ul>
                      {hasMore && (
                        <button
                          className="show-more-btn"
                          onClick={() => toggleExpand(doc.id)}
                        >
                          {isExpanded
                            ? t("documents.show_less")
                            : `${doc.requiredDocs.length - 3} ${t("documents.more")}`}
                        </button>
                      )}
                    </div>

                    <button
                      className="view-details-btn"
                      onClick={() => openModal(doc)}
                    >
                      {t("documents.view_details")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Popup */}
        {selectedService && (
          <div className="documents-modal-overlay" onClick={closeModal}>
            <div
              className="documents-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="documents-modal-header"
                style={{ background: selectedService.gradient }}
              >
                <div className="documents-modal-icon-badge">
                  {selectedService.icon}
                </div>
                <div className="documents-modal-title-info">
                  <h2>{selectedService.title}</h2>
                  <p>{selectedService.description}</p>
                </div>
                <button
                  className="documents-modal-close-btn"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>

              <div className="documents-modal-body">
                <div className="documents-modal-info-row">
                  <div className="documents-modal-info-card time">
                    <span className="documents-modal-info-icon">🕐</span>
                    <div className="documents-modal-info-text">
                      <span className="documents-modal-label">
                        {t("documents.processing_time")}
                      </span>
                      <span className="documents-modal-value">
                        {selectedService.time}
                      </span>
                    </div>
                  </div>
                  <div className="documents-modal-info-card fee">
                    <span className="documents-modal-info-icon">💰</span>
                    <div className="documents-modal-info-text">
                      <span className="documents-modal-label">
                        {t("documents.fee")}
                      </span>
                      <span className="documents-modal-value">
                        {selectedService.fee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="documents-modal-docs-section">
                  <h3>{t("documents.required_docs_title")}</h3>
                  <ul className="documents-modal-docs-list">
                    {selectedService.requiredDocs.map((doc, index) => (
                      <li key={index}>
                        <div className="documents-modal-doc-num">
                          {index + 1}
                        </div>
                        <span className="documents-modal-doc-name">{doc}</span>
                        <span className="documents-modal-doc-check">✓</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
