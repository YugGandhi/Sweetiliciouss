const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http"); // Required for WebSockets
const socketIo = require("socket.io"); // WebSocket library
require("dotenv").config();
const multer = require("multer");

const app = express();
const server = http.createServer(app); // Create HTTP Server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow frontend connection
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// ✅ Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ Multer Setup for Image Uploads (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ WebSocket Connection
io.on("connection", (socket) => {
  console.log("🔥 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ✅ Import Routes (Pass io to sweetRoutes for real-time updates)
const authRoutes = require("./routes/authRoutes");
const sweetRoutes = require("./routes/sweetRoutes")(io);
const { router: orderRoutes } = require("./routes/orderRoutes");
const { router: notificationRoutes } = require("./routes/notificationRoutes");

// Register routes with proper error handling
app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

// Add route logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Route to Fetch Image Data from MongoDB
app.get("/api/sweets/image/:id", async (req, res) => {
  const Sweet = require("./models/Sweet"); // Import model
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet || !sweet.photos.length) {
      return res.status(404).send("Image not found");
    }
    res.contentType(sweet.photos[0].contentType);
    res.send(sweet.photos[0].data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch image", error: error.message });
  }
});

// ✅ Basic Route
app.get("/", (req, res) => {
  res.send("Sweetiliciouss Backend is Running!");
});

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ✅ Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
