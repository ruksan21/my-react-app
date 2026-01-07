import React, { useEffect, useState } from "react";
import "./Budget.css";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";

export default function OfficerBudget() {
  const { getOfficerWorkLocation, user } = useAuth();
  const workLocation = getOfficerWorkLocation();

  // Beneficiary form state
  const [benTotal, setBenTotal] = useState("");
  const [benDirect, setBenDirect] = useState("");
  const [benIndirect, setBenIndirect] = useState("");

  // Budget summary form state
  const [budgetAllocated, setBudgetAllocated] = useState("");
  const [budgetSpent, setBudgetSpent] = useState("");

  // Toast notification state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Load budget data from backend
  useEffect(() => {
    if (workLocation) {
      fetchBudgetData(workLocation);
    }
  }, [workLocation]);

  const fetchBudgetData = async (loc) => {
    try {
      const params = new URLSearchParams({
        work_province: loc.work_province,
        work_district: loc.work_district,
        work_municipality: loc.work_municipality,
        work_ward: String(loc.work_ward || ""),
      });
      const response = await fetch(`${API_ENDPOINTS.assets.manageBudgets}?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        setBudgetAllocated(data.total_allocated || "");
        setBudgetSpent(data.total_spent || "");
        setBenTotal(data.total_beneficiaries || "");
        setBenDirect(data.direct_beneficiaries || "");
        setBenIndirect(data.indirect_beneficiaries || "");
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Handle beneficiary form submission
  async function handleBeneficiarySubmit(e) {
    e.preventDefault();

    if (!benTotal || !benDirect || !benIndirect) {
      setToast({
        show: true,
        message: "⚠️ Please fill all beneficiary fields!",
        type: "error",
      });
      return;
    }

    await saveBudgetData();
  }

  async function handleBudgetSummarySubmit(e) {
    e.preventDefault();

    if (!budgetAllocated || !budgetSpent) {
      setToast({
        show: true,
        message: "⚠️ Please fill all budget fields!",
        type: "error",
      });
      return;
    }

    await saveBudgetData();
  }

  const saveBudgetData = async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.assets.manageBudgets,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ward_id: 0,
            officer_id: user.id,
            total_allocated: Number(budgetAllocated) || 0,
            total_spent: Number(budgetSpent) || 0,
            total_beneficiaries: Number(benTotal) || 0,
            direct_beneficiaries: Number(benDirect) || 0,
            indirect_beneficiaries: Number(benIndirect) || 0,
            fiscal_year: "2023/24",
            // include location so backend resolves ward_id
            work_province: workLocation?.work_province,
            work_district: workLocation?.work_district,
            work_municipality: workLocation?.work_municipality,
            work_ward: workLocation?.work_ward,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setToast({
          show: true,
          message: "Budget data saved successfully!",
          type: "success",
        });
      } else {
        setToast({
          show: true,
          message: "Error: " + result.message,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error saving budget:", error);
      setToast({
        show: true,
        message: "Failed to save budget data",
        type: "error",
      });
    }
  };

  function clearBeneficiaryForm() {
    setBenTotal("");
    setBenDirect("");
    setBenIndirect("");
  }

  function clearBudgetSummaryForm() {
    setBudgetAllocated("");
    setBudgetSpent("");
  }

  return (
    <OfficerLayout title="Budgets">
      <div className="budget-container">
        <h2 className="budget-title">Officer Budgets</h2>

        {toast.show && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" && <span className="toast-icon">✓</span>}
            {toast.message}
          </div>
        )}

        <div className="summary">
          <div className="summary-item">
            <div className="summary-label">Total Allocated</div>
            <div className="summary-value">Rs {budgetAllocated || "0"}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">Rs {budgetSpent || "0"}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Remaining</div>
            <div className="summary-value">
              Rs {Number(budgetAllocated) - Number(budgetSpent) || "0"}
            </div>
          </div>
        </div>

        <div className="forms-row">
          <form
            className="beneficiary-form"
            onSubmit={handleBudgetSummarySubmit}
          >
            <label className="label">Total Allocated (Rs.)</label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 30000000"
              value={budgetAllocated}
              onChange={(e) => setBudgetAllocated(e.target.value)}
            />

            <label className="label">Total Spent (Rs.)</label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 7000000"
              value={budgetSpent}
              onChange={(e) => setBudgetSpent(e.target.value)}
            />

            <div className="form-actions">
              <button className="btn primary" type="submit">
                Save Budget
              </button>
              <button
                className="btn"
                type="button"
                onClick={clearBudgetSummaryForm}
              >
                Clear
              </button>
            </div>
          </form>

          <form className="beneficiary-form" onSubmit={handleBeneficiarySubmit}>
            <label className="label">Total Beneficiaries</label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 15000"
              value={benTotal}
              onChange={(e) => setBenTotal(e.target.value)}
            />

            <label className="label">Direct</label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 8000"
              value={benDirect}
              onChange={(e) => setBenDirect(e.target.value)}
            />

            <label className="label">Indirect</label>
            <input
              className="input"
              type="number"
              placeholder="e.g., 7000"
              value={benIndirect}
              onChange={(e) => setBenIndirect(e.target.value)}
            />

            <div className="form-actions">
              <button className="btn primary" type="submit">
                Save
              </button>
              <button
                className="btn"
                type="button"
                onClick={clearBeneficiaryForm}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </OfficerLayout>
  );
}
