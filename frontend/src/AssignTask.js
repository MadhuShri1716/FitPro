import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AssignTask.css";

const AssignTask = () => {
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [deadline, setDeadline] = useState("");

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

    if (!taskTitle || !taskDescription || !deadline || !selectedTrainee) {
      alert("❌ All fields are required!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/tasks/assign",
        { title: taskTitle, description: taskDescription, deadline, assignedTo: selectedTrainee },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Task assigned successfully!");
      setTaskTitle("");
      setTaskDescription("");
      setDeadline("");
      setSelectedTrainee("");
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("❌ Failed to assign task");
    }
  };

  return (
    <div className="assign-task-container">
      <h2>Assign Task</h2>
      <form onSubmit={handleSubmit} className="assign-task-form">
        <div className="form-group">
          <label>Task Title:</label>
          <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Deadline:</label>
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
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

        <button type="submit" className="assign-button">Assign Task</button>
      </form>
    </div>
  );
};

export default AssignTask;
