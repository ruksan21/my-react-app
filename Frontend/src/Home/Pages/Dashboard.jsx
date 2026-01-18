import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { useWard } from "../Context/WardContext";
import { useLanguage } from "../Context/useLanguage";
import { toNepaliNumber } from "../../data/nepal_locations";
import Navbar from "../Nav/Navbar";
import { API_ENDPOINTS } from "../../config/api";

const BudgetCard = ({ title, amount, color, icon }) => {
  const { language } = useLanguage();
  const isNP = language === "NP";
  return (
    <div className={`budget-card ${color}`}>
      <div className="budget-card-header">
        <span className="budget-title">{title}</span>
        <span className="budget-icon">{icon}</span>
      </div>
      <div className="budget-amount">
        {isNP ? `रु. ${toNepaliNumber(amount)}` : `Rs. ${amount}`}
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, color }) => (
  <div className="progress-row">
    <span className="progress-label">{label}</span>
    <div className="progress-track">
      <div
        className={`progress-fill ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className="progress-value">{value}%</span>
  </div>
);

const ActivityItem = ({ title, desc, date }) => (
  <div className="activity-item">
    <div className="activity-left">
      <div className="activity-texts">
        <div className="activity-title">{title}</div>
        <div className="activity-desc">{desc}</div>
      </div>
    </div>
    <div className="activity-date">{date}</div>
  </div>
);

export default function Dashboard({ embedded = false, wardId }) {
  const { t, language } = useLanguage();
  const isNP = language === "NP";
  const { municipality, ward, wardId: contextWardId } = useWard();
  const currentWardId = wardId || contextWardId;

  const [budgetData, setBudgetData] = useState(null);
  const [worksData, setWorksData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentWardId) {
      setLoading(false);
      return;
    }

    // Fetch budget data
    fetch(`${API_ENDPOINTS.assets.manageBudgets}?ward_id=${currentWardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBudgetData(data.data);
        }
      })
      .catch((err) => console.error("Error fetching budget:", err));

    // Fetch works data for progress calculation
    fetch(`${API_ENDPOINTS.works.getAll}?ward_id=${currentWardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setWorksData(data.data);
        } else if (Array.isArray(data)) {
          setWorksData(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching works:", err);
        setLoading(false);
      });
  }, [currentWardId]);

  // Calculate budget values
  const totalAllocated = budgetData?.total_allocated || 0;
  const totalSpent = budgetData?.total_spent || 0;
  const remaining = totalAllocated - totalSpent;

  const budget = {
    total: totalAllocated.toLocaleString("en-IN"),
    spent: totalSpent.toLocaleString("en-IN"),
    remaining: remaining.toLocaleString("en-IN"),
  };

  // Calculate work progress
  const totalWorks = worksData.length;
  const completedWorks = worksData.filter(
    (w) => w.status?.toLowerCase() === "completed",
  ).length;
  const ongoingWorks = worksData.filter(
    (w) => w.status?.toLowerCase() === "ongoing",
  ).length;
  const pendingWorks = worksData.filter(
    (w) =>
      w.status?.toLowerCase() === "pending" ||
      w.status?.toLowerCase() === "upcoming",
  ).length;

  const completedPercent =
    totalWorks > 0 ? Math.round((completedWorks / totalWorks) * 100) : 0;
  const ongoingPercent =
    totalWorks > 0 ? Math.round((ongoingWorks / totalWorks) * 100) : 0;
  const pendingPercent =
    totalWorks > 0 ? Math.round((pendingWorks / totalWorks) * 100) : 0;

  const progress = [
    {
      label: t("profile.dashboard.completed"),
      value: completedPercent,
      color: "blue",
    },
    {
      label: isNP ? "सञ्चालनमा" : "Ongoing",
      value: ongoingPercent,
      color: "green",
    },
    {
      label: isNP ? "योजनाबद्ध" : "Planned",
      value: pendingPercent,
      color: "orange",
    },
  ];

  const beneficiaries = {
    total: budgetData?.total_beneficiaries || 0,
    direct: budgetData?.direct_beneficiaries || 0,
    indirect: budgetData?.indirect_beneficiaries || 0,
  };

  if (loading) {
    return (
      <>
        {!embedded && <Navbar showHomeContent={false} />}
        <div className="dashboard-page">
          <div className="loading-state">
            {isNP ? "ड्यासबोर्ड लोड हुँदैछ..." : "Loading dashboard..."}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {!embedded && <Navbar showHomeContent={false} />}
      <div className={`dashboard-page ${embedded ? "embedded" : ""}`}>
        {embedded && (
          <div className="embedded-header" style={{ marginBottom: 12 }}>
            <span className="embedded-pin">📍</span>
            <span className="embedded-title">
              {municipality} - {t("nav.ward")}{" "}
              {isNP ? toNepaliNumber(ward) : ward}
            </span>
          </div>
        )}
        <div className="cards-row">
          <BudgetCard
            title={t("profile.dashboard.total_budget")}
            amount={budget.total}
            color="blue"
            icon="💰"
          />
          <BudgetCard
            title={t("profile.dashboard.spent_amount")}
            amount={budget.spent}
            color="green"
            icon="💳"
          />
          <BudgetCard
            title={t("profile.dashboard.remaining_budget")}
            amount={budget.remaining}
            color="purple"
            icon="🧾"
          />
        </div>

        <div className="grid-row">
          <div className="panel work-progress">
            <div className="panel-title">
              {t("profile.dashboard.work_progress")}
            </div>
            <div className="progress-list">
              {progress.map((p) => (
                <ProgressBar
                  key={p.label}
                  label={p.label}
                  value={isNP ? toNepaliNumber(p.value) : p.value}
                  color={p.color}
                />
              ))}
            </div>
          </div>

          <div className="panel beneficiaries">
            <div className="panel-title">
              {t("profile.dashboard.beneficiary_population")}
            </div>
            <div className="beneficiary-total">
              {isNP
                ? toNepaliNumber(beneficiaries.total.toLocaleString())
                : beneficiaries.total.toLocaleString()}
            </div>
            <div className="beneficiary-sub">
              <div>
                <div className="beneficiary-count">
                  {isNP
                    ? toNepaliNumber(beneficiaries.direct.toLocaleString())
                    : beneficiaries.direct.toLocaleString()}
                </div>
                <div className="beneficiary-label">
                  {isNP ? "प्रत्यक्ष" : "Direct"}
                </div>
              </div>
              <div>
                <div className="beneficiary-count">
                  {isNP
                    ? toNepaliNumber(beneficiaries.indirect.toLocaleString())
                    : beneficiaries.indirect.toLocaleString()}
                </div>
                <div className="beneficiary-label">
                  {isNP ? "अप्रत्यक्ष" : "Indirect"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
