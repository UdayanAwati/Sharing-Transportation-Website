const express = require("express");
const router = express.Router();
const LivePublish = require("../models/LivePublish");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

router.use(cookieParser());

// Middleware to verify token from cookies
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

// Live publish POST route
router.post("/", verifyToken, async (req, res) => {
    const { lat, lng, vehicleType, vehicleSpace, cargoType, publishStatus } = req.body;
    const email = req.user.email;

    try {
        const newLivePublish = new LivePublish({
            email,
            location: {
            type: 'Point',
            coordinates: [lng, lat]
            },
            vehicleType,
            vehicleSpace,
            cargoType
        });

        await newLivePublish.save();
        res.status(201).json({ message: "Live ride published successfully" });
    } catch (error) {
        console.error("❌ Error publishing live ride:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
