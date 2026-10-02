import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthGuard from "./useAuthGuard";
import TrainerStats from "./Trainerstats";
import "./TrainerDashboard.css";

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthGuard("trainer");
  const [trainerName, setTrainerName] = useState("Trainer");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setTrainerName(name);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const menuItems = [
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="10" cy="9" r="4" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M2.5 22c0-3.866 3.358-7 7.5-7s7.5 3.134 7.5 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M17 5.5a4 4 0 010 7M20.5 15.5c1.9.9 3 2.6 3 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
      label: "Trainees",
      desc: "Browse all trainees with their tasks, proofs and plans",
      path: "/TrainerDashboard/Trainees",
      accent: "#14b8a6",
      light: "#f0fdfa",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect x="3" y="5" width="20" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M8 5V3M18 5V3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M3 10h20" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M7 15h5M7 18h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
      label: "Assign Task",
      desc: "Create and assign workout tasks to trainees",
      path: "/TrainerDashboard/AssignTask",
      accent: "#6c63ff",
      light: "#f0effe",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="9" r="4.5" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M4 23c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M18 12l2.5 2.5-2.5 2.5M21 14.5h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: "Diet Plan",
      desc: "Design personalised nutrition plans for each trainee",
      path: "/TrainerDashboard/DietPlan",
      accent: "#10b981",
      light: "#ecfdf5",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M3 13h3.5l2.5-6 3 12 3-9 2 3H23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: "Workout Plan",
      desc: "Build customised workout schedules",
      path: "/TrainerDashboard/WorkoutPlan",
      accent: "#f59e0b",
      light: "#fffbeb",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M4 7h18v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M4 7l9 7 9-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
      label: "Chatbox",
      desc: "Message and support all your trainees",
      path: "/TrainerDashboard/Chatbox",
      accent: "#3b82f6",
      light: "#eff6ff",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M4 22V17M9 22V11M14 22V14M19 22V7M24 22V3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
      label: "Track Progress",
      desc: "View trainee task and workout completion stats",
      path: "/TrainerDashboard/TrackProgress",
      accent: "#ec4899",
      light: "#fdf2f8",
    },
  ];

  return (
    <div className="td-root">
      {/* Sidebar */}
      <aside className="td-sidebar">
        <div className="td-brand">
          <div className="td-brand-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="13" fill="#6c63ff"/>
              <path d="M7 19L13 7l6 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M9 15h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="td-brand-text">FitPro</span>
        </div>

        <p className="td-sidebar-section-label">Navigation</p>

        <nav className="td-nav">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="td-nav-btn"
              onClick={() => navigate(item.path)}
            >
              <span className="td-nav-icon" style={{ background: item.light, color: item.accent }}>
                {item.icon}
              </span>
              <span className="td-nav-label">{item.label}</span>
              <svg className="td-nav-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </nav>

        <div className="td-sidebar-bottom">
          <div className="td-user-chip">
            <div className="td-user-avatar">{trainerName.charAt(0).toUpperCase()}</div>
            <div className="td-user-info">
              <span className="td-user-name">{trainerName}</span>
              <span className="td-user-role">Trainer</span>
            </div>
          </div>
          <button className="td-logout-btn" onClick={logout}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M6.5 15H3a1 1 0 01-1-1V3a1 1 0 011-1h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 12l4-4-4-4M15 8H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="td-main">
        <header className="td-topbar">
          <div className="td-topbar-left">
            <p className="td-greeting-text">{getGreeting()},</p>
            <h1 className="td-welcome-text">{trainerName} 👋</h1>
          </div>
          <div className="td-topbar-right">
            <div className="td-clock-badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="td-topbar-avatar">{trainerName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Real numbers from the server */}
        <TrainerStats />

        <div className="td-section-hd">
          <h2 className="td-section-title">Quick actions</h2>
          <p className="td-section-sub">Tap any card to get started</p>
        </div>

        <div className="td-cards-grid">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="td-card"
              onClick={() => navigate(item.path)}
              style={{ "--accent": item.accent, "--light": item.light }}
            >
              <div className="td-card-icon-wrap">{item.icon}</div>
              <div className="td-card-content">
                <h3 className="td-card-title">{item.label}</h3>
                <p className="td-card-desc">{item.desc}</p>
              </div>
              <div className="td-card-arrow-wrap">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboard;
