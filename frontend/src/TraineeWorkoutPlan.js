// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const TraineeWorkoutPlan = () => {
//   const [workoutPlans, setWorkoutPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchWorkoutPlans = async () => {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("❌ Authentication error. Please log in again.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get("http://localhost:5001/api/workout-plans", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.status === 200 && Array.isArray(response.data)) {
//           setWorkoutPlans(response.data);
//         } else {
//           setError("❌ Failed to fetch workout plans.");
//         }
//       } catch (error) {
//         setError("❌ Error fetching workout plans. Please check your network.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWorkoutPlans();
//   }, []);

//   return (
//     <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", padding: "20px", background: "#f8fbff" }}>
//       <h2 style={{ color: "#007bff", fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
//         📋 ASSIGNED WORKOUTplANS
//       </h2>

//       {loading ? (
//         <p style={{ fontSize: "18px", color: "gray" }}>Loading workout plans...</p>
//       ) : error ? (
//         <p style={{ fontSize: "18px", color: "red" }}>{error}</p>
//       ) : workoutPlans.length === 0 ? (
//         <p style={{ fontSize: "18px", color: "gray" }}>No workout plans assigned yet.</p>
//       ) : (
//         <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
//           {workoutPlans.map((plan) => (
//             <div
//               key={plan._id}
//               style={{
//                 background: "#fff",
//                 padding: "20px",
//                 borderRadius: "12px",
//                 width: "320px",
//                 boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//                 borderLeft: "6px solid #007bff",
//                 transition: "0.3s",
//               }}
//             >
//               <h3 style={{ color: "#007bff", fontWeight: "bold", marginBottom: "5px" }}>
//                 📌 {plan.title || "Workout Plan"}
//               </h3>
//               <p style={{ color: "#555", fontSize: "16px" }}>{plan.description || "No details provided."}</p>
//               <p style={{ fontSize: "14px", color: "#444", fontWeight: "bold" }}>
//                 <span style={{ color: "#6c757d", marginRight: "5px" }}>👤</span> Assigned By:{" "}
//                 {plan.assignedBy?.name || "Unknown"}
//               </p>
//               <p style={{ fontSize: "14px", color: "#d9534f", fontWeight: "bold" }}>
//                 <span style={{ marginRight: "5px" }}>⏳</span> Deadline: {plan.deadline || "Not Set"}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TraineeWorkoutPlan;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TraineeWorkoutPlan.css";

const formatDeadline = (value) => {
  if (!value) return { text: "No deadline", state: "none" };
  const date = new Date(value);
  if (isNaN(date.getTime())) return { text: String(value), state: "upcoming" };
  return {
    text: date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    state: date < new Date() ? "overdue" : "upcoming",
  };
};

const TraineeWorkoutPlan = () => {
  const navigate = useNavigate();
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not signed in. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5001/api/workout-plans", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && Array.isArray(response.data)) {
          setWorkoutPlans(response.data);
        } else {
          setError("Could not load your workout plans. Please try again.");
        }
      } catch (err) {
        setError("Could not load your workout plans. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, []);

  return (
    <div className="twp-root">
      <div className="twp-container">
        {/* Header */}
        <header className="twp-header">
          <div className="twp-header-left">
            <div className="twp-header-icon">🏋️</div>
            <div>
              <h1 className="twp-title">Workout Plan</h1>
              <p className="twp-subtitle">Workout schedules assigned by your trainer</p>
            </div>
          </div>
          <button className="twp-back-btn" onClick={() => navigate("/TraineeDashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 7H4M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to dashboard
          </button>
        </header>

        {/* Content */}
        {loading ? (
          <div className="twp-state">
            <div className="twp-spinner" />
            <p className="twp-state-text">Loading your workout plans…</p>
          </div>
        ) : error ? (
          <div className="twp-state">
            <span className="twp-state-icon">⚠️</span>
            <p className="twp-state-title">Something went wrong</p>
            <p className="twp-state-text">{error}</p>
          </div>
        ) : workoutPlans.length === 0 ? (
          <div className="twp-state">
            <span className="twp-state-icon">💪</span>
            <p className="twp-state-title">No workout plans yet</p>
            <p className="twp-state-text">
              When your trainer assigns a workout plan, it will show up here.
            </p>
          </div>
        ) : (
          <>
            <span className="twp-count">
              {workoutPlans.length} {workoutPlans.length === 1 ? "plan" : "plans"} assigned
            </span>
            <div className="twp-grid">
              {workoutPlans.map((plan) => {
                const trainer = plan.assignedBy?.name || "Trainer";
                const deadline = formatDeadline(plan.deadline);
                return (
                  <article key={plan._id} className="twp-card" tabIndex={0}>
                    <div className="twp-card-top">
                      <span className="twp-card-icon">🏋️</span>
                      <h3 className="twp-card-title">{plan.title || "Workout Plan"}</h3>
                    </div>

                    <p className="twp-card-desc">
                      {plan.description || "No details provided."}
                    </p>

                    <span className={`twp-deadline twp-deadline--${deadline.state === "upcoming" ? "ok" : deadline.state}`}>
                      ⏳{" "}
                      {deadline.state === "overdue"
                        ? "Overdue: "
                        : deadline.state === "none"
                        ? ""
                        : "Due: "}
                      {deadline.text}
                    </span>

                    <footer className="twp-card-footer">
                      <span className="twp-trainer-avatar">
                        {trainer.charAt(0).toUpperCase()}
                      </span>
                      <span className="twp-trainer-info">
                        <span className="twp-trainer-label">Assigned by</span>
                        <span className="twp-trainer-name">{trainer}</span>
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

export default TraineeWorkoutPlan;
