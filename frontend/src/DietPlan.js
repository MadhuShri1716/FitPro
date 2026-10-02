import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DietPlan.css";

const DietPlan = () => {
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [dietTitle, setDietTitle] = useState("");
  const [dietDescription, setDietDescription] = useState("");

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

    if (!dietTitle || !dietDescription || !selectedTrainee) {
      alert("❌ All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/diet-plans/assign",
        { title: dietTitle, description: dietDescription, assignedTo: selectedTrainee },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Diet plan assigned successfully!");
      setDietTitle("");
      setDietDescription("");
      setSelectedTrainee("");
    } catch (error) {
      console.error("Error assigning diet plan:", error);
      alert("❌ Failed to assign diet plan");
    }
  };

  return (
    <div className="diet-plan-container">
      <h2>Assign Diet Plan</h2>
      <form onSubmit={handleSubmit} className="diet-plan-form">
        <div className="form-group">
          <label>Diet Title:</label>
          <input type="text" value={dietTitle} onChange={(e) => setDietTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea value={dietDescription} onChange={(e) => setDietDescription(e.target.value)} required />
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

        <button type="submit" className="assign-button">Assign Diet Plan</button>
      </form>
    </div>
  );
};

export default DietPlan;
