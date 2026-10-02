import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WorkoutPlan.css";

const WorkOutPlan = () => {
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5001/api/trainees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrainees(response.data);
      } catch (error) {
        console.error("Error fetching trainees:", error);
      }
    };

    fetchTrainees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!workoutTitle || !workoutDescription || !selectedTrainee) {
      alert("❌ All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/workout-plans/assign",
        { title: workoutTitle, description: workoutDescription, assignedTo: selectedTrainee },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Workout plan assigned successfully!");
      setWorkoutTitle("");
      setWorkoutDescription("");
      setSelectedTrainee("");
    } catch (error) {
      console.error("Error assigning workout plan:", error);
      alert("❌ Failed to assign workout plan");
    }
  };

  return (
    <div className="workout-plan-container">
      <h2>Assign Workout Plan</h2>
      <form onSubmit={handleSubmit} className="workout-plan-form">
        <div className="form-group">
          <label>Workout Title:</label>
          <input type="text" value={workoutTitle} onChange={(e) => setWorkoutTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea value={workoutDescription} onChange={(e) => setWorkoutDescription(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Select Trainee:</label>
          <select value={selectedTrainee} onChange={(e) => setSelectedTrainee(e.target.value)} required>
            <option value="">-- Select Trainee --</option>
            {trainees.length > 0 ? (
              trainees.map((trainee) => (
                <option key={trainee._id} value={trainee._id}>
                  {trainee.email}
                </option>
              ))
            ) : (
              <option disabled>No trainees available</option>
            )}
          </select>
        </div>

        <button type="submit" className="assign-button">Assign Workout Plan</button>
      </form>
    </div>
  );
};

export default WorkOutPlan;
