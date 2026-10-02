import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthGuard from "./useAuthGuard";
import "./TraineeDashboard.css";

const TraineeDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthGuard("trainee");
  const [traineeName, setTraineeName] = useState("Trainee");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setTraineeName(name);
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
          <rect x="3" y="5" width="20" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M8 5V3M18 5V3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M3 10h20" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M7 15h5M7 18h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
      label: "My Tasks",
      desc: "View and complete your assigned tasks",
      path: "/TraineeDashboard/TaskList",
      accent: "#6c63ff",
      light: "#f0effe",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M13 3C7.477 3 3 7.477 3 13s4.477 10 10 10 10-4.477 10-10S18.523 3 13 3z" stroke="currentColor" strokeWidth="1.7"/>
          <path d="M9 13c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
          <path d="M13 9v1M13 17v1M9 13H8M18 13h-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
      label: "Diet Plan",
      desc: "Check your personalised nutrition plan",
      path: "/TraineeDashboard/TraineeDietPlan",
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
      desc: "View your assigned workout schedule",
      path: "/TraineeDashboard/TraineeWorkoutPlan",
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
      label: "Chat",
      desc: "Talk to your trainer anytime",
      path: "/TraineeDashboard/TraineeChatbox",
      accent: "#3b82f6",
      light: "#eff6ff",
    },
  ];

  const today = currentTime.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="tnd-root">
      {/* Sidebar */}
      <aside className="tnd-sidebar">
        <div className="tnd-brand">
          <div className="tnd-brand-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="13" fill="#6c63ff"/>
              <path d="M7 19L13 7l6 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M9 15h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="tnd-brand-text">FitPro</span>
        </div>

        <p className="tnd-sidebar-section-label">My Space</p>

        <nav className="tnd-nav">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="tnd-nav-btn"
              onClick={() => navigate(item.path)}
            >
              <span className="tnd-nav-icon" style={{ background: item.light, color: item.accent }}>
                {item.icon}
              </span>
              <span className="tnd-nav-label">{item.label}</span>
              <svg className="tnd-nav-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </nav>

        <div className="tnd-sidebar-bottom">
          <div className="tnd-user-chip">
            <div className="tnd-user-avatar">{traineeName.charAt(0).toUpperCase()}</div>
            <div className="tnd-user-info">
              <span className="tnd-user-name">{traineeName}</span>
              <span className="tnd-user-role">Trainee</span>
            </div>
          </div>
          <button className="tnd-logout-btn" onClick={logout}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path d="M6.5 15H3a1 1 0 01-1-1V3a1 1 0 011-1h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 12l4-4-4-4M15 8H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="tnd-main">
        {/* Topbar */}
        <header className="tnd-topbar">
          <div className="tnd-topbar-left">
            <p className="tnd-greeting-text">{getGreeting()},</p>
            <h1 className="tnd-welcome-text">{traineeName} 💪</h1>
          </div>
          <div className="tnd-topbar-right">
            <div className="tnd-date-badge">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M4 1v2M10 1v2M1 5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              {today}
            </div>
            <div className="tnd-topbar-avatar">{traineeName.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Motivational banner */}
        <div className="tnd-banner">
          <div className="tnd-banner-text">
            <p className="tnd-banner-title">Stay consistent, stay strong 🔥</p>
            <p className="tnd-banner-sub">Complete your tasks and upload proof to track your fitness journey.</p>
          </div>
          <div className="tnd-banner-emoji">🏆</div>
        </div>

        {/* Quick tip cards row */}
        <div className="tnd-tips-row">
          {[
            { emoji: "💧", tip: "Stay hydrated", sub: "Drink 8 glasses today" },
            { emoji: "😴", tip: "Rest well", sub: "Aim for 7–8 hrs sleep" },
            { emoji: "🥦", tip: "Eat clean", sub: "Follow your diet plan" },
          ].map((t) => (
            <div key={t.tip} className="tnd-tip-card">
              <span className="tnd-tip-emoji">{t.emoji}</span>
              <div>
                <p className="tnd-tip-title">{t.tip}</p>
                <p className="tnd-tip-sub">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="tnd-section-hd">
          <h2 className="tnd-section-title">Your dashboard</h2>
          <p className="tnd-section-sub">Everything you need in one place</p>
        </div>

        {/* Cards */}
        <div className="tnd-cards-grid">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="tnd-card"
              onClick={() => navigate(item.path)}
              style={{ "--accent": item.accent, "--light": item.light }}
            >
              <div className="tnd-card-icon-wrap">{item.icon}</div>
              <div className="tnd-card-content">
                <h3 className="tnd-card-title">{item.label}</h3>
                <p className="tnd-card-desc">{item.desc}</p>
              </div>
              <div className="tnd-card-arrow-wrap">
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

export default TraineeDashboard;