// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const TaskList = () => {
//   const [tasks, setTasks] = useState([]);
//   const [selectedFile, setSelectedFile] = useState({});
//   const [uploading, setUploading] = useState({});

//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5001/api/tasks", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setTasks(response.data);
//       } catch (error) {
//         console.error("Error fetching tasks:", error);
//       }
//     };
//     fetchTasks();
//   }, []);

//   // Reminder pop-up for tasks with less than 30 minutes remaining (every 2 minutes)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       tasks.forEach((task) => {
//         const deadlineTime = new Date(task.deadline).getTime();
//         const currentTime = new Date().getTime();
//         const timeLeft = deadlineTime - currentTime;

//         if (timeLeft > 0 && timeLeft <= 30 * 60 * 1000) { // If time left is within 30 minutes
//           alert(`⏳ Reminder: Task "${task.title}" is due in less than 30 minutes!`);
//         }
//       });
//     }, 6000); 

//     return () => clearInterval(interval);
//   }, [tasks]);

//   const handleFileChange = (event, taskId) => {
//     if (event.target.files.length > 0) {
//       setSelectedFile((prev) => ({ ...prev, [taskId]: event.target.files[0] }));
//     }
//   };

//   const handleUpload = async (taskId) => {
//     if (!selectedFile[taskId]) {
//       alert("Please select a file before uploading.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("proof", selectedFile[taskId]);

//     try {
//       setUploading((prev) => ({ ...prev, [taskId]: true }));
//       const token = localStorage.getItem("token");

//       const response = await axios.post(
//         `http://localhost:5001/api/tasks/${taskId}/upload`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       if (response.status === 200) {
//         alert("Proof uploaded successfully!");
//         setSelectedFile((prev) => ({ ...prev, [taskId]: null }));
//       } else {
//         alert("  Proof Uploaded Successfully");
//       }
//     } catch (error) {
//       console.error("Upload failed:", error);
//       alert(
//         error.response?.data?.message || "Proof uploaded successfully!."
//       );
//     } finally {
//       setUploading((prev) => ({ ...prev, [taskId]: false }));
//     }
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         padding: "40px",
//         fontFamily: "'Poppins', sans-serif",
//         background: "linear-gradient(135deg, #f9f9f9, #e3f2fd)",
//         color: "#333",
//       }}
//     >
//       <h2
//         style={{
//           fontSize: "32px",
//           fontWeight: "bold",
//           marginBottom: "20px",
//           textAlign: "center",
//           textTransform: "uppercase",
//           letterSpacing: "2px",
//           color: "#007bff",
//         }}
//       >
//         📋 Assigned Tasks
//       </h2>

//       {tasks.length === 0 ? (
//         <p style={{ fontSize: "18px", color: "#555" }}>No tasks assigned yet.</p>
//       ) : (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
//             gap: "20px",
//             width: "100%",
//             maxWidth: "900px",
//           }}
//         >
//           {tasks.map((task) => {
//             const deadlineTime = new Date(task.deadline).getTime();
//             const currentTime = new Date().getTime();
//             const isOverdue = deadlineTime < currentTime;

//             return (
//               <div
//                 key={task._id}
//                 style={{
//                   background: "white",
//                   padding: "20px",
//                   borderRadius: "12px",
//                   boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//                   borderLeft: isOverdue ? "5px solid #d9534f" : "5px solid #007bff",
//                 }}
//               >
//                 {isOverdue && (
//                   <p style={{ color: "red", fontWeight: "bold", fontSize: "16px" }}>
//                     ⚠️ Task Overdue
//                   </p>
//                 )}
//                 <h3 style={{ color: "#007bff", marginBottom: "10px" }}>
//                   📌 {task.title}
//                 </h3>
//                 <p style={{ color: "#555" }}>{task.description}</p>
//                 <p style={{ fontSize: "14px", fontWeight: "bold" }}>
//                   👤 Assigned By: {task.assignedBy?.name || "Trainer"}
//                 </p>
//                 <p
//                   style={{
//                     fontSize: "14px",
//                     fontWeight: "bold",
//                     color: isOverdue ? "#d9534f" : "#007bff",
//                   }}
//                 >
//                   ⏳ Deadline: {new Date(task.deadline).toLocaleString()}
//                 </p>

//                 <input
//                   type="file"
//                   onChange={(e) => handleFileChange(e, task._id)}
//                   accept="image/*"
//                   style={{ marginTop: "10px" }}
//                 />

//                 <button
//                   onClick={() => handleUpload(task._id)}
//                   disabled={!selectedFile[task._id] || uploading[task._id]}
//                   style={{
//                     marginTop: "10px",
//                     padding: "10px 15px",
//                     backgroundColor: selectedFile[task._id] ? "#28a745" : "#ccc",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: selectedFile[task._id] ? "pointer" : "not-allowed",
//                   }}
//                 >
//                   {uploading[task._id] ? "Uploading..." : "Upload Proof"}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default TaskList;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TaskList.css";

const REMINDER_WINDOW_MS = 30 * 60 * 1000; // remind when < 30 min left
const REMINDER_INTERVAL_MS = 2 * 60 * 1000; // check every 2 minutes

const formatDeadline = (value) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Not set";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState({});
  const [uploading, setUploading] = useState({});
  const [uploaded, setUploaded] = useState({});
  const [status, setStatus] = useState({}); // { [taskId]: { type, message } }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5001/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Could not load your tasks. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Reminder pop-up for tasks due in under 30 minutes (checked every 2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach((task) => {
        if (uploaded[task._id]) return;
        const timeLeft = new Date(task.deadline).getTime() - Date.now();
        if (timeLeft > 0 && timeLeft <= REMINDER_WINDOW_MS) {
          alert(`⏳ Reminder: Task "${task.title}" is due in less than 30 minutes!`);
        }
      });
    }, REMINDER_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [tasks, uploaded]);

  const handleFileChange = (event, taskId) => {
    if (event.target.files.length > 0) {
      setSelectedFile((prev) => ({ ...prev, [taskId]: event.target.files[0] }));
      setStatus((prev) => ({ ...prev, [taskId]: null }));
    }
  };

  const handleUpload = async (taskId) => {
    const file = selectedFile[taskId];
    if (!file) {
      setStatus((prev) => ({
        ...prev,
        [taskId]: { type: "error", message: "Choose an image before uploading." },
      }));
      return;
    }

    const formData = new FormData();
    formData.append("proof", file);

    try {
      setUploading((prev) => ({ ...prev, [taskId]: true }));
      const token = localStorage.getItem("token");

      await axios.post(`http://localhost:5001/api/tasks/${taskId}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUploaded((prev) => ({ ...prev, [taskId]: true }));
      setSelectedFile((prev) => ({ ...prev, [taskId]: null }));
      setStatus((prev) => ({
        ...prev,
        [taskId]: { type: "success", message: "Proof uploaded successfully." },
      }));
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus((prev) => ({
        ...prev,
        [taskId]: {
          type: "error",
          message: err.response?.data?.message || "Upload failed. Please try again.",
        },
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const overdueCount = tasks.filter(
    (t) => new Date(t.deadline).getTime() < Date.now() && !uploaded[t._id]
  ).length;

  return (
    <div className="tl-root">
      <div className="tl-container">
        {/* Header */}
        <header className="tl-header">
          <div className="tl-header-left">
            <div className="tl-header-icon">📋</div>
            <div>
              <h1 className="tl-title">My Tasks</h1>
              <p className="tl-subtitle">Complete your tasks and upload proof before the deadline</p>
            </div>
          </div>
          <button className="tl-back-btn" onClick={() => navigate("/TraineeDashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 7H4M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to dashboard
          </button>
        </header>

        {/* Content */}
        {loading ? (
          <div className="tl-state">
            <div className="tl-spinner" />
            <p className="tl-state-text">Loading your tasks…</p>
          </div>
        ) : error ? (
          <div className="tl-state">
            <span className="tl-state-icon">⚠️</span>
            <p className="tl-state-title">Something went wrong</p>
            <p className="tl-state-text">{error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="tl-state">
            <span className="tl-state-icon">🎯</span>
            <p className="tl-state-title">No tasks yet</p>
            <p className="tl-state-text">When your trainer assigns a task, it will show up here.</p>
          </div>
        ) : (
          <>
            <div className="tl-summary">
              <span className="tl-pill">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} assigned
              </span>
              {overdueCount > 0 && (
                <span className="tl-pill tl-pill--danger">{overdueCount} overdue</span>
              )}
            </div>

            <div className="tl-grid">
              {tasks.map((task) => {
                const isOverdue = new Date(task.deadline).getTime() < Date.now();
                const isDone = !!uploaded[task._id];
                const trainer = task.assignedBy?.name || "Trainer";
                const file = selectedFile[task._id];
                const msg = status[task._id];

                const cardClass = [
                  "tl-card",
                  isDone ? "tl-card--done" : isOverdue ? "tl-card--overdue" : "",
                ].join(" ").trim();

                return (
                  <article key={task._id} className={cardClass}>
                    <div className="tl-card-top">
                      <span className="tl-card-icon">{isDone ? "✅" : "📌"}</span>
                      <div className="tl-card-heading">
                        <h3 className="tl-card-title">{task.title}</h3>
                      </div>
                      {isDone ? (
                        <span className="tl-badge tl-badge--done">Submitted</span>
                      ) : isOverdue ? (
                        <span className="tl-badge">Overdue</span>
                      ) : null}
                    </div>

                    <p className="tl-card-desc">{task.description}</p>

                    <div className="tl-meta">
                      <div className="tl-meta-row">
                        <span className="tl-meta-label">Assigned by</span>
                        <span className="tl-meta-value">{trainer}</span>
                      </div>
                      <div className="tl-meta-row">
                        <span className="tl-meta-label">Deadline</span>
                        <span
                          className={`tl-meta-value ${
                            isOverdue && !isDone ? "tl-meta-value--overdue" : "tl-meta-value--due"
                          }`}
                        >
                          {formatDeadline(task.deadline)}
                        </span>
                      </div>
                    </div>

                    <div className="tl-upload">
                      <input
                        id={`proof-${task._id}`}
                        className="tl-file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, task._id)}
                      />
                      <label
                        htmlFor={`proof-${task._id}`}
                        className={`tl-file-label ${file ? "tl-file-label--selected" : ""}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M9 12V3M5.5 6.5L9 3l3.5 3.5M3 12v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="tl-file-name">
                          {file ? file.name : "Choose a proof image"}
                        </span>
                      </label>

                      <button
                        className="tl-upload-btn"
                        onClick={() => handleUpload(task._id)}
                        disabled={!file || uploading[task._id]}
                      >
                        {uploading[task._id] ? "Uploading…" : "Upload proof"}
                      </button>

                      {msg && (
                        <p className={`tl-status tl-status--${msg.type}`} role="status">
                          {msg.message}
                        </p>
                      )}
                    </div>
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

export default TaskList;
