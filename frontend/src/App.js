import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Login from "./Login";
import Signup from "./Signup";

// Trainer pages
import TrainerDashboard from "./TrainerDashboard";
import Trainees from "./Trainees";
import AssignTask from "./AssignTask";
import DietPlan from "./DietPlan";
import WorkoutPlan from "./WorkoutPlan";
import Chatbox from "./Chatbox";
import TrackProgress from "./TrackProgress";

// Trainee pages
import TraineeDashboard from "./TraineeDashboard";
import TaskList from "./TaskList";
import TraineeDietPlan from "./TraineeDietPlan";
import TraineeWorkoutPlan from "./TraineeWorkoutPlan";
import TraineeChatbox from "./TraineeChatbox";

/*
  Guards a page by role.
  It reads the role from localStorage on every render, so it works right
  after login without needing a page refresh.
*/
const ProtectedRoute = ({ role, children }) => {
  const token = localStorage.getItem("token");
  const userRole = (localStorage.getItem("role") || "").toLowerCase();

  // Not logged in -> login page
  if (!token || !userRole) {
    return <Navigate to="/" replace />;
  }

  // Logged in with the wrong role -> login page
  if (userRole !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <Router>
      <Routes>
        {/* ───────── Public routes (login is the landing page) ───────── */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ───────── Trainer routes ───────── */}
        <Route
          path="/TrainerDashboard"
          element={
            <ProtectedRoute role="trainer">
              <TrainerDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TrainerDashboard/Trainees"
          element={
            <ProtectedRoute role="trainer">
              <Trainees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TrainerDashboard/AssignTask"
          element={
            <ProtectedRoute role="trainer">
              <AssignTask />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TrainerDashboard/DietPlan"
          element={
            <ProtectedRoute role="trainer">
              <DietPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TrainerDashboard/WorkoutPlan"
          element={
            <ProtectedRoute role="trainer">
              <WorkoutPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TrainerDashboard/Chatbox"
          element={
            <ProtectedRoute role="trainer">
              <Chatbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TrainerDashboard/TrackProgress"
          element={
            <ProtectedRoute role="trainer">
              <TrackProgress />
            </ProtectedRoute>
          }
        />

        {/* ───────── Trainee routes ───────── */}
        <Route
          path="/TraineeDashboard"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TraineeDashboard/TaskList"
          element={
            <ProtectedRoute role="trainee">
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TraineeDashboard/TraineeDietPlan"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDietPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TraineeDashboard/TraineeWorkoutPlan"
          element={
            <ProtectedRoute role="trainee">
              <TraineeWorkoutPlan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/TraineeDashboard/TraineeChatbox"
          element={
            <ProtectedRoute role="trainee">
              <TraineeChatbox />
            </ProtectedRoute>
          }
        />

        {/* ───────── Anything else -> login ───────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;