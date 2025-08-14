const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

// Import Routes
const authRoutes = require("./routes/auth");
const publishRoutes = require("./routes/publish");
const searchRoutes = require("./routes/search");
const driverInfoRoutes = require("./routes/driverinfo");
const livePublishRoutes = require("./routes/livepublish");
const searchRideRoutes = require("./routes/searchRideRoutes");
const app = express();

// ✅ Middleware
// ✅ Increase request body limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ["http://127.0.0.1:5500", "http://localhost:5500"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ✅ Routes 
app.use("/api/auth", authRoutes);
app.use("/api/publish", publishRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/driverinfo", driverInfoRoutes);
app.use("/api/livepublish", livePublishRoutes);
app.use("/api", searchRideRoutes);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


