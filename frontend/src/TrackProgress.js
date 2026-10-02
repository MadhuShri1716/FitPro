import React, { useState, useEffect } from "react";
import "./TrackProgress.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const TrackProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5001/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setProgressData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching progress data:", error);
        setError("Failed to load progress data.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="track-progress">
      <h1 className="track-progress-title">Track Progress</h1>

      {loading && <p className="status-msg">Loading progress data...</p>}
      {error && <p className="status-msg error">{error}</p>}

      {!loading && !error && progressData.length === 0 && (
        <p className="status-msg">No trainee data found yet.</p>
      )}

      {!loading && !error && progressData.length > 0 && (
        <>
          {/* Bar Chart */}
          <div className="chart-container">
            <h2 className="chart-title">Trainee Progress Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={progressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="traineeName"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar
                  dataKey="tasksCompleted"
                  fill="#8884d8"
                  name="Tasks Completed"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="totalTasks"
                  fill="#ffc658"
                  name="Total Tasks Assigned"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="workoutsCompleted"
                  fill="#82ca9d"
                  name="Workout Plans Assigned"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="table-container">
            <h2 className="chart-title">Trainee Summary</h2>
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Trainee Name</th>
                  <th>Tasks Completed</th>
                  <th>Total Tasks</th>
                  <th>Completion %</th>
                  <th>Workout Plans</th>
                </tr>
              </thead>
              <tbody>
                {progressData.map((trainee, index) => {
                  const percent =
                    trainee.totalTasks > 0
                      ? Math.round(
                          (trainee.tasksCompleted / trainee.totalTasks) * 100
                        )
                      : 0;
                  return (
                    <tr key={index}>
                      <td>{trainee.traineeName}</td>
                      <td>{trainee.tasksCompleted}</td>
                      <td>{trainee.totalTasks}</td>
                      <td>
                        <div className="progress-bar-wrapper">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${percent}%` }}
                          />
                          <span className="progress-percent">{percent}%</span>
                        </div>
                      </td>
                      <td>{trainee.workoutsCompleted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TrackProgress;