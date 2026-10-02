const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5001;
const SECRET_KEY = "secretkey";

// ─────────────────────────────────────────────
// Server + Socket.io
// ─────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// File uploads (task proof images)
// ─────────────────────────────────────────────
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ─────────────────────────────────────────────
// MongoDB
// ─────────────────────────────────────────────
mongoose
  .connect("mongodb://localhost:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected to 'mydb'"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ─────────────────────────────────────────────
// Schemas & Models
// ─────────────────────────────────────────────

// User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // "trainer" or "trainee"
});
const User = mongoose.model("users", userSchema);

// Task  (timestamps added so new tasks get createdAt)
const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    deadline: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);
const Task = mongoose.model("tasks", taskSchema);

// Diet plan
const dietPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  createdAt: { type: Date, default: Date.now },
});
const DietPlan = mongoose.model("dietPlans", dietPlanSchema);

// Workout plan
const workoutPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  createdAt: { type: Date, default: Date.now },
});
const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

// Chat
const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Chat = mongoose.model("chats", chatSchema);

// Task completion (proof image uploads)
// NOTE: refs now point at the real model names ("tasks" / "users")
const taskCompletionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
      required: true,
      index: true,
    },
    traineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);
const TaskCompletion = mongoose.model("TaskCompletion", taskCompletionSchema);

// ─────────────────────────────────────────────
// Auth middleware
// ─────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// Only trainers may use the routes that wrap this
const requireTrainer = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "trainer") {
    return res.status(403).json({ message: "Trainer access only" });
  }
  next();
};

// Small helpers
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const countMap = (rows) =>
  Object.fromEntries(rows.map((r) => [String(r._id), r.count]));

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// LOGIN  (name is in the JWT so chat sender names work)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role, userId: user._id, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// ─────────────────────────────────────────────
// TRAINEES (simple list used by the assign forms)
// ─────────────────────────────────────────────
app.get("/api/trainees", authenticateToken, async (req, res) => {
  try {
    const trainees = await User.find({ role: "trainee" }, "_id name email");
    res.json(trainees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trainees" });
  }
});

// ─────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────

// Assign task
app.post("/api/tasks/assign", authenticateToken, async (req, res) => {
  try {
    const { title, description, deadline, assignedTo } = req.body;
    const task = new Task({
      title,
      description,
      deadline,
      assignedTo,
      assignedBy: req.user.userId,
    });
    await task.save();
    io.emit("taskAssigned", task);
    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Error assigning task" });
  }
});

// Get tasks for the logged-in trainee
app.get("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId }).populate(
      "assignedBy",
      "name"
    );
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Upload proof for a task
app.post(
  "/api/tasks/:taskId/upload",
  authenticateToken,
  upload.single("proof"),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const traineeId = req.user.userId;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      if (!imageUrl) {
        return res.status(400).json({ message: "File upload failed." });
      }
      if (!mongoose.isValidObjectId(taskId)) {
        return res.status(400).json({ message: "Invalid task id." });
      }

      // Make sure the task exists and really belongs to this trainee
      const task = await Task.findById(taskId).select("assignedTo");
      if (!task) return res.status(404).json({ message: "Task not found." });
      if (String(task.assignedTo) !== String(traineeId)) {
        return res
          .status(403)
          .json({ message: "This task is not assigned to you." });
      }

      const taskCompletion = new TaskCompletion({ taskId, traineeId, imageUrl });
      await taskCompletion.save();

      res
        .status(201)
        .json({ message: "Proof uploaded successfully", taskCompletion });
    } catch (error) {
      console.error("Error uploading proof:", error);
      res.status(500).json({ message: "Error uploading proof" });
    }
  }
);

// ─────────────────────────────────────────────
// DIET PLANS
// ─────────────────────────────────────────────

// Assign
app.post("/api/diet-plans/assign", authenticateToken, async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    const diet = new DietPlan({
      title,
      description,
      assignedTo,
      assignedBy: req.user.userId,
    });

    await diet.save();
    io.emit("dietPlanAssigned", diet);
    res.status(201).json({ message: "Diet plan assigned successfully", diet });
  } catch (error) {
    res.status(500).json({ message: "Error assigning diet plan" });
  }
});

// Get for the logged-in trainee
app.get("/api/diet-plans", authenticateToken, async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({ assignedTo: req.user.userId })
      .populate("assignedBy", "name")
      .select("title description assignedBy createdAt");

    res.json(dietPlans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching diet plans" });
  }
});

// ─────────────────────────────────────────────
// WORKOUT PLANS
// ─────────────────────────────────────────────

// Assign
app.post("/api/workout-plans/assign", authenticateToken, async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    const workout = new WorkoutPlan({
      title,
      description,
      assignedTo,
      assignedBy: req.user.userId,
    });

    await workout.save();
    io.emit("workoutPlanAssigned", workout);
    res
      .status(201)
      .json({ message: "Workout plan assigned successfully", workout });
  } catch (error) {
    console.error("Error assigning workout plan:", error);
    res.status(500).json({ message: "Error assigning workout plan" });
  }
});

// Get for the logged-in trainee
// FIX: always returns an array (the old version returned an object when empty,
// which the frontend treated as an error)
app.get("/api/workout-plans", authenticateToken, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({
      assignedTo: req.user.userId,
    }).populate("assignedBy", "name");

    res.json(workoutPlans);
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    res.status(500).json({ message: "Error fetching workout plans" });
  }
});

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────
app.get("/api/chat/messages", authenticateToken, async (req, res) => {
  try {
    const messages = await Chat.find()
      .populate("senderId", "name")
      .sort("timestamp");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat messages" });
  }
});

app.post("/api/chat/send", authenticateToken, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required." });
  }

  try {
    const chatMessage = new Chat({
      senderId: req.user.userId,
      message,
    });

    const savedMessage = await chatMessage.save();

    io.emit("newCommunityMessage", {
      ...savedMessage.toObject(),
      senderId: { _id: req.user.userId, name: req.user.name || "Unknown" },
    });

    res
      .status(201)
      .json({ message: "Message sent successfully.", savedMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message." });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);
  socket.on("disconnect", () => {
    console.log("A user disconnected: " + socket.id);
  });
});

// ─────────────────────────────────────────────
// TRAINER: DASHBOARD STATS
// GET /api/stats/trainer
// ─────────────────────────────────────────────
app.get(
  "/api/stats/trainer",
  authenticateToken,
  requireTrainer,
  async (req, res) => {
    try {
      const trainerId = req.user.userId;

      const [trainees, tasks, dietPlans, workoutPlans] = await Promise.all([
        User.countDocuments({ role: "trainee" }),
        Task.countDocuments({ assignedBy: trainerId }),
        DietPlan.countDocuments({ assignedBy: trainerId }),
        WorkoutPlan.countDocuments({ assignedBy: trainerId }),
      ]);

      res.json({ trainees, tasks, dietPlans, workoutPlans });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  }
);

// ─────────────────────────────────────────────
// TRAINER: TRAINEE LIST (search + pagination + summary counts)
// GET /api/trainer/trainees?search=&page=1&limit=15
// Counts are fetched only for the trainees on the current page, so this
// stays fast even with thousands of trainees.
// ─────────────────────────────────────────────
app.get(
  "/api/trainer/trainees",
  authenticateToken,
  requireTrainer,
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 50);
      const search = String(req.query.search || "").trim();

      const filter = { role: "trainee" };
      if (search) {
        const rx = new RegExp(escapeRegex(search), "i");
        filter.$or = [{ name: rx }, { email: rx }];
      }

      const [total, trainees] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter, "_id name email")
          .collation({ locale: "en", strength: 2 })
          .sort({ name: 1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
      ]);

      const ids = trainees.map((t) => t._id);

      const [taskRows, doneRows, dietRows, workoutRows] = await Promise.all([
        Task.aggregate([
          { $match: { assignedTo: { $in: ids } } },
          { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
        ]),
        // tasks with at least one proof upload (distinct per task)
        TaskCompletion.aggregate([
          { $match: { traineeId: { $in: ids } } },
          { $group: { _id: { trainee: "$traineeId", task: "$taskId" } } },
          { $group: { _id: "$_id.trainee", count: { $sum: 1 } } },
        ]),
        DietPlan.aggregate([
          { $match: { assignedTo: { $in: ids } } },
          { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
        ]),
        WorkoutPlan.aggregate([
          { $match: { assignedTo: { $in: ids } } },
          { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
        ]),
      ]);

      const taskMap = countMap(taskRows);
      const doneMap = countMap(doneRows);
      const dietMap = countMap(dietRows);
      const workoutMap = countMap(workoutRows);

      const items = trainees.map((t) => {
        const key = String(t._id);
        const tasksTotal = taskMap[key] || 0;
        return {
          _id: t._id,
          name: t.name,
          email: t.email,
          tasksTotal,
          tasksCompleted: Math.min(doneMap[key] || 0, tasksTotal),
          dietPlans: dietMap[key] || 0,
          workoutPlans: workoutMap[key] || 0,
        };
      });

      res.json({
        trainees: items,
        total,
        page,
        pages: Math.max(Math.ceil(total / limit), 1),
      });
    } catch (error) {
      console.error("Error fetching trainee list:", error);
      res.status(500).json({ message: "Error fetching trainees" });
    }
  }
);

// ─────────────────────────────────────────────
// TRAINER: ONE TRAINEE IN FULL
// GET /api/trainer/trainees/:id
// Returns tasks (with proof images), diet plans and workout plans.
// ─────────────────────────────────────────────
app.get(
  "/api/trainer/trainees/:id",
  authenticateToken,
  requireTrainer,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid trainee id" });
      }

      const trainee = await User.findOne(
        { _id: id, role: "trainee" },
        "_id name email"
      ).lean();
      if (!trainee) {
        return res.status(404).json({ message: "Trainee not found" });
      }

      const [tasks, dietPlans, workoutPlans, completions] = await Promise.all([
        Task.find({ assignedTo: id })
          .populate("assignedBy", "name")
          .sort({ deadline: -1 })
          .lean(),
        DietPlan.find({ assignedTo: id })
          .populate("assignedBy", "name")
          .sort({ createdAt: -1 })
          .lean(),
        WorkoutPlan.find({ assignedTo: id })
          .populate("assignedBy", "name")
          .sort({ createdAt: -1 })
          .lean(),
        TaskCompletion.find({ traineeId: id }).sort({ createdAt: 1 }).lean(),
      ]);

      // Group proof uploads by task
      const proofsByTask = {};
      completions.forEach((c) => {
        const key = String(c.taskId);
        (proofsByTask[key] = proofsByTask[key] || []).push(c);
      });

      const now = Date.now();

      const taskItems = tasks.map((t) => {
        const proofs = proofsByTask[String(t._id)] || [];
        const deadlineMs = t.deadline ? new Date(t.deadline).getTime() : null;

        let status = "pending";
        if (proofs.length > 0) status = "completed";
        else if (deadlineMs !== null && deadlineMs < now) status = "overdue";

        return {
          _id: t._id,
          title: t.title,
          description: t.description,
          deadline: t.deadline || null,
          createdAt: t.createdAt || t._id.getTimestamp(),
          assignedBy: t.assignedBy?.name || "Trainer",
          status,
          submissions: proofs.map((p) => ({
            _id: p._id,
            imageUrl: p.imageUrl,
            uploadedAt: p.createdAt,
            late:
              deadlineMs !== null &&
              new Date(p.createdAt).getTime() > deadlineMs,
          })),
        };
      });

      const mapPlan = (p) => ({
        _id: p._id,
        title: p.title,
        description: p.description,
        createdAt: p.createdAt || p._id.getTimestamp(),
        assignedBy: p.assignedBy?.name || "Trainer",
      });

      res.json({
        trainee,
        summary: {
          tasksTotal: taskItems.length,
          tasksCompleted: taskItems.filter((t) => t.status === "completed").length,
          tasksOverdue: taskItems.filter((t) => t.status === "overdue").length,
          dietPlans: dietPlans.length,
          workoutPlans: workoutPlans.length,
        },
        tasks: taskItems,
        dietPlans: dietPlans.map(mapPlan),
        workoutPlans: workoutPlans.map(mapPlan),
      });
    } catch (error) {
      console.error("Error fetching trainee detail:", error);
      res.status(500).json({ message: "Error fetching trainee details" });
    }
  }
);

// ─────────────────────────────────────────────
// TRAINER: PROGRESS (used by Track Progress page)
// ─────────────────────────────────────────────
app.get("/api/progress", authenticateToken, async (req, res) => {
  try {
    const trainees = await User.find({ role: "trainee" }, "_id name");

    const progressData = await Promise.all(
      trainees.map(async (trainee) => {
        const tasksCompleted = await TaskCompletion.countDocuments({
          traineeId: trainee._id,
        });
        const totalTasks = await Task.countDocuments({
          assignedTo: trainee._id,
        });
        const workoutsCompleted = await WorkoutPlan.countDocuments({
          assignedTo: trainee._id,
        });

        return {
          traineeName: trainee.name,
          tasksCompleted,
          totalTasks,
          workoutsCompleted,
        };
      })
    );

    res.json(progressData);
  } catch (error) {
    console.error("Error fetching progress data:", error);
    res.status(500).json({ message: "Error fetching progress data" });
  }
});

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));