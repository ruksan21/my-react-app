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

  const remaining = Number(budgetAllocated) - Number(budgetSpent) || 0;
  const isNegative = remaining < 0;

  return (
    <OfficerLayout title="Budgets">
      <div className="budget-container">
        <h2 className="budget-title">💰 Budget Management</h2>
        <p className="budget-subtitle">Track and manage your ward's financial allocations and beneficiaries</p>

        {toast.show && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === "success" && <span className="toast-icon">✓</span>}
            {toast.message}
          </div>
        )}

        <div className="summary">
          <div className="summary-card allocated">
            <div className="summary-icon">💵</div>
            <div className="summary-label">Total Allocated</div>
            <div className="summary-value">
              Rs {Number(budgetAllocated || 0).toLocaleString()}
            </div>
          </div>
          <div className="summary-card spent">
            <div className="summary-icon">📊</div>
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">
              Rs {Number(budgetSpent || 0).toLocaleString()}
            </div>
          </div>
          <div className={`summary-card remaining ${isNegative ? 'negative' : ''}`}>
            <div className="summary-icon">{isNegative ? '⚠️' : '✨'}</div>
            <div className="summary-label">Remaining Balance</div>
            <div className="summary-value">
              Rs {remaining.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="forms-row">
          <div className="form-card">
            <div className="form-header">
              <div className="form-icon budget">💳</div>
              <div>
                <h3 className="form-title">Budget Allocation</h3>
                <p className="form-subtitle">Set your ward's financial targets</p>
              </div>
            </div>
            <form onSubmit={handleBudgetSummarySubmit}>
              <div className="form-group">
                <label className="label">Total Allocated Amount</label>
                <div className="input-with-icon">
                  <span className="input-prefix">Rs</span>
                  <input
                    className="input"
                    type="number"
                    placeholder="0.00"
                    value={budgetAllocated}
                    onChange={(e) => setBudgetAllocated(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Total Spent Amount</label>
                <div className="input-with-icon">
                  <span className="input-prefix">Rs</span>
                  <input
                    className="input"
                    type="number"
                    placeholder="0.00"
                    value={budgetSpent}
                    onChange={(e) => setBudgetSpent(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn primary" type="submit">
                  💾 Save Budget
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={clearBudgetSummaryForm}
                >
                  ↺ Clear
                </button>
              </div>
            </form>
          </div>

          <div className="form-card">
            <div className="form-header">
              <div className="form-icon beneficiary">👥</div>
              <div>
                <h3 className="form-title">Beneficiary Details</h3>
                <p className="form-subtitle">Track the impact of your programs</p>
              </div>
            </div>
            <form onSubmit={handleBeneficiarySubmit}>
              <div className="form-group">
                <label className="label">Total Beneficiaries</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Enter total beneficiaries..."
                  value={benTotal}
                  onChange={(e) => setBenTotal(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Direct Beneficiaries</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Enter direct beneficiaries..."
                  value={benDirect}
                  onChange={(e) => setBenDirect(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="label">Indirect Beneficiaries</label>
                <input
                  className="input"
                  type="number"
                  placeholder="Enter indirect beneficiaries..."
                  value={benIndirect}
                  onChange={(e) => setBenIndirect(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button className="btn primary" type="submit">
                  💾 Save Details
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={clearBeneficiaryForm}
                >
                  ↺ Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </OfficerLayout>
  );
}
