import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Trainerstats.css";

// One light request returns all four counts (see statsRoute.js).
const STATS_URL = "http://localhost:5001/api/stats/trainer";

const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const full = new Intl.NumberFormat("en-IN");

const CARDS = [
  { key: "trainees",     emoji: "👥", label: "Trainees" },
  { key: "tasks",        emoji: "📋", label: "Tasks assigned" },
  { key: "dietPlans",    emoji: "🥗", label: "Diet plans" },
  { key: "workoutPlans", emoji: "🏋️", label: "Workout plans" },
];

const TrainerStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(STATS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setStats(data);
      } catch (err) {
        console.error("Stats error:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="td-stats-row">
      {CARDS.map(({ key, emoji, label }) => {
        const value = stats?.[key];
        const hasValue = typeof value === "number";

        return (
          <div key={key} className="td-stat-card">
            <span className="td-stat-emoji">{emoji}</span>
            <div className="td-stat-info">
              {loading ? (
                <span className="td-stat-skeleton" aria-hidden="true" />
              ) : (
                <span
                  className="td-stat-num"
                  title={hasValue ? full.format(value) : "Unavailable"}
                >
                  {hasValue ? compact.format(value) : "—"}
                </span>
              )}
              <span className="td-stat-label">{label}</span>
            </div>
          </div>
        );
      })}

      {error && (
        <p className="td-stats-error" role="alert">
          Couldn't load your totals. Refresh the page to try again.
        </p>
      )}
    </div>
  );
};

export default TrainerStats;
