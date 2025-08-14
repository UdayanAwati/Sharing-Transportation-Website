
const express = require("express");
const router = express.Router();
const DriverInfo = require("../models/DriverInfo");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

// ✅ Middleware to verify token from cookies
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // decoded.email will be available
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// ✅ Only ONE post route!
router.post("/", verifyToken, async (req, res) => {
    const { name, mobile, age, experience, vehicleName, vehicleNumber } = req.body;
    const email = req.user.email; // Securely from JWT

    try {
        const newDriver = new DriverInfo({
            email, // ✅ Make sure to store it
            name,
            mobile,
            age,
            experience,
            vehicleName,
            vehicleNumber
        });

        await newDriver.save();
        res.status(201).json({ message: "Driver info saved successfully" });
    } catch (error) {
        console.error("❌ Error saving driver info:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
