const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cookieParser = require("cookie-parser");

const router = express.Router();

// ✅ Use cookie-parser middleware
router.use(cookieParser());

// Signup Route
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    console.log("📥 Signup Request Received:", req.body); // Debugging

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("⚠️ Email already exists:", email); // Debugging
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        // 🔐 Create and send token in cookie
        const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("authToken", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 3600000,
        });

        console.log("✅ Token set in cookie:", token);
        res.json({ message: "Signup successful" });
    } catch (error) {
        console.error("❌ Signup error:", error);
        res.status(500).json({ message: "Server error!" });
    }
});


// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found!" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // Generate JWT Token
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Store JWT in HTTP-only cookie
        res.cookie("authToken", token, {
            httpOnly: true, // Prevent client-side JavaScript from accessing cookies
            secure: false,
            sameSite: "lax", // CSRF protection
            maxAge: 3600000, // 1 hour
        });
        
        console.log("✅ Token set in cookie:", token);
        res.json({ message: "Login successful!" });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ message: "Server error!" });
    }
});

// Logout Route
router.post("/logout", (req, res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        sameSite: "Lax",
        secure: false // Make true in production with HTTPS
    });
    return res.json({ message: "Logged out successfully" });
});

// ✅ Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken; // Get token from cookies

    if (!token) {
        return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        console.error("❌ JWT verification failed:", error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// ✅ Secure user route (Only accessible if authenticated)
router.get("/user", (req, res) => {
    const token = req.cookies.authToken;
    console.log("📥 Token received in request:", token);
  
    if (!token) {
      return res.status(401).json({ message: "No token found in cookies." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return res.json({ email: decoded.email });
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  });
  

module.exports = router;
