// src/useAuthGuard.js
// 
// Add this hook to BOTH TrainerDashboard.js and TraineeDashboard.js
// It solves the "back button shows previous user" problem.
//
// HOW TO USE:
//   import useAuthGuard from "./useAuthGuard";
//   const { logout } = useAuthGuard("trainer");   // or "trainee"
//
// Then add a Logout button somewhere in your dashboard:
//   <button onClick={logout}>Logout</button>

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuthGuard = (requiredRole) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If no token or wrong role → kick to login
    if (!token || role !== requiredRole) {
      localStorage.clear();
      navigate("/", { replace: true });
      return;
    }

    // Push an extra history entry so back button comes here first,
    // then we intercept it and redirect to login instead.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // User pressed browser back — redirect to login
      localStorage.clear();
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, requiredRole]);

  const logout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  return { logout };
};

export default useAuthGuard;