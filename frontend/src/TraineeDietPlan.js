// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const TraineeDietPlan = () => {
//   const [dietPlans, setDietPlans] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDietPlans = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           console.error("❌ No token found!");
//           return;
//         }

//         console.log("📢 Fetching diet plans...");

//         const response = await axios.get("http://localhost:5001/api/diet-plans", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         console.log("✅ API Response:", response.data);

//         if (!response.data || response.data.length === 0) {
//           console.warn("⚠ No diet plans found");
//         }

//         setDietPlans(response.data || []);
//       } catch (error) {
//         console.error("❌ API Error:", error.response ? error.response.data : error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDietPlans();
//   }, []);

//   // Styles
//   const containerStyle = {
//     minHeight: "100vh",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     padding: "40px",
//     fontFamily: "'Poppins', sans-serif",
//     background: "linear-gradient(135deg, #f9f9f9, #e3f2fd)",
//     color: "#333",
//   };

//   const headerStyle = {
//     fontSize: "32px",
//     fontWeight: "bold",
//     marginBottom: "20px",
//     textAlign: "center",
//     textTransform: "uppercase",
//     letterSpacing: "2px",
//     color: "#007bff",
//   };

//   const dietListStyle = {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
//     gap: "20px",
//     width: "100%",
//     maxWidth: "900px",
//   };

//   const dietItemStyle = {
//     background: "white",
//     padding: "20px",
//     borderRadius: "12px",
//     boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//     transition: "transform 0.3s ease, box-shadow 0.3s ease",
//     cursor: "pointer",
//     borderLeft: "5px solid #007bff",
//   };

//   const dietItemHoverStyle = {
//     transform: "scale(1.05)",
//     boxShadow: "0px 6px 15px rgba(0, 123, 255, 0.3)",
//   };

//   return (
//     <div style={containerStyle}>
//       <h2 style={headerStyle}>🥗 Your Diet Plans</h2>

//       {loading ? (
//         <p style={{ fontSize: "18px", color: "#555" }}>Loading diet plans...</p>
//       ) : dietPlans.length === 0 ? (
//         <p style={{ fontSize: "18px", color: "#555" }}>No diet plans assigned yet.</p>
//       ) : (
//         <div style={dietListStyle}>
//           {dietPlans.map((plan) => (
//             <div
//               key={plan._id}
//               style={dietItemStyle}
//               onMouseOver={(e) => {
//                 e.currentTarget.style.transform = dietItemHoverStyle.transform;
//                 e.currentTarget.style.boxShadow = dietItemHoverStyle.boxShadow;
//               }}
//               onMouseOut={(e) => {
//                 e.currentTarget.style.transform = "scale(1)";
//                 e.currentTarget.style.boxShadow = dietItemStyle.boxShadow;
//               }}
//             >
//               <h3 style={{ color: "#007bff", marginBottom: "10px" }}>🥗 {plan.title}</h3>
//               <p style={{ color: "#555" }}>{plan.description}</p>
//               <p style={{ fontSize: "14px", fontWeight: "bold" }}>
//                 👤 Assigned By: {plan.assignedBy?.name || "Trainer"}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TraineeDietPlan;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TraineeDietPlan.css";

const TraineeDietPlan = () => {
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDietPlans = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not signed in. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/api/diet-plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDietPlans(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Diet plan API error:", err.response ? err.response.data : err);
        setError("Could not load your diet plans. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlans();
  }, []);

  return (
    <div className="tdp-root">
      <div className="tdp-container">
        {/* Header */}
        <header className="tdp-header">
          <div className="tdp-header-left">
            <div className="tdp-header-icon">🥗</div>
            <div>
              <h1 className="tdp-title">Diet Plan</h1>
              <p className="tdp-subtitle">Nutrition plans assigned by your trainer</p>
            </div>
          </div>
          <button className="tdp-back-btn" onClick={() => navigate("/TraineeDashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 7H4M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to dashboard
          </button>
        </header>

        {/* Content */}
        {loading ? (
          <div className="tdp-state">
            <div className="tdp-spinner" />
            <p className="tdp-state-text">Loading your diet plans…</p>
          </div>
        ) : error ? (
          <div className="tdp-state">
            <span className="tdp-state-icon">⚠️</span>
            <p className="tdp-state-title">Something went wrong</p>
            <p className="tdp-state-text">{error}</p>
          </div>
        ) : dietPlans.length === 0 ? (
          <div className="tdp-state">
            <span className="tdp-state-icon">🍽️</span>
            <p className="tdp-state-title">No diet plans yet</p>
            <p className="tdp-state-text">
              When your trainer assigns a diet plan, it will show up here.
            </p>
          </div>
        ) : (
          <>
            <span className="tdp-count">
              {dietPlans.length} {dietPlans.length === 1 ? "plan" : "plans"} assigned
            </span>
            <div className="tdp-grid">
              {dietPlans.map((plan) => {
                const trainer = plan.assignedBy?.name || "Trainer";
                return (
                  <article key={plan._id} className="tdp-card" tabIndex={0}>
                    <div className="tdp-card-top">
                      <span className="tdp-card-icon">🥗</span>
                      <h3 className="tdp-card-title">{plan.title || "Diet Plan"}</h3>
                    </div>

                    <p className="tdp-card-desc">
                      {plan.description || "No details provided."}
                    </p>

                    <footer className="tdp-card-footer">
                      <span className="tdp-trainer-avatar">
                        {trainer.charAt(0).toUpperCase()}
                      </span>
                      <span className="tdp-trainer-info">
                        <span className="tdp-trainer-label">Assigned by</span>
                        <span className="tdp-trainer-name">{trainer}</span>
                      </span>
                    </footer>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TraineeDietPlan;
