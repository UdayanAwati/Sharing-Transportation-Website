const express = require("express");
const router = express.Router();
const PublishRide = require("../models/PublishRide");
const jwt = require("jsonwebtoken");

// ✅ Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

function splitLocation(locationObj) {
  const { name, coordinates } = locationObj;

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error("Invalid coordinates format. Expected [lng, lat]");
  }

  const [lng, lat] = coordinates.map(Number); // Make sure they are numbers

  return {
    name: name.trim(),
    coordinates: [lng, lat]
  };
}


router.post("/", verifyToken, async (req, res) => {
  const {
    pickupLocation,
    deliveryLocation,
    stops,
    departureTime,
    date,
    vehicleType,
    cargoType,
    space,
    totalDistance,
    totalDuration,
    fullRoutePath,
  } = req.body;

  const email = req.user.email;

  try {
    const pickup = splitLocation(pickupLocation);
    const delivery = splitLocation(deliveryLocation);
    const stopCoordinates = stops.map(stop => splitLocation(stop));

    
    const ride = new PublishRide({
      email,
      startLocation: pickup,
      destination: delivery,
      stops: stopCoordinates,
      departureTime,
      date: new Date(date),
      vehicleType,
      cargoType,
      space,
      totalDistance: parseFloat(totalDistance),
      totalDuration: parseFloat(totalDuration),
      fullRoutePath,
    });

    await ride.save();
    res.status(201).json({ message: "Ride published successfully" });
  } catch (error) {
    console.error("❌ Error saving ride:", error);
    res.status(500).json({ message: "Server error while publishing ride" });
  }
});

module.exports = router;
// // ✅ Get recent rides for the user
// router.get("/recent", verifyToken, async (req, res) => {
//   const email = req.user.email;

//   try {
//     const rides = await PublishRide.find({ email }).sort({ date: -1 }).limit(5);
//     res.json({ rides });
//   } catch (err) {
//     console.error("❌ Error fetching recent rides:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ Get all rides from the database
// router.get("/allrides", async (req, res) => {
//   try {
//     const allRides = await PublishRide.find(); // No filters = get everything
//     res.json(allRides);
//   } catch (error) {
//     console.error("❌ Error fetching all rides:", error);
//     res.status(500).json({ message: "Error fetching all rides" });
//   }
// });

// // ✅ Search route to search for matching rides based on user input
// router.post("/searchride", verifyToken, async (req, res) => {
//   const { pickupLocation, deliveryLocation, cargoType, date } = req.body;

//   console.log("Search query:", { pickupLocation, deliveryLocation, cargoType, date });

//   const searchQuery = {};

//   if (pickupLocation)
//     searchQuery.startLocation.name = { $regex: new RegExp(pickupLocation, "i") };

//   if (deliveryLocation)
//     searchQuery.destination.name = { $regex: new RegExp(deliveryLocation, "i") };

//   if (cargoType)
//     searchQuery.cargoType = { $regex: new RegExp(cargoType, "i") };

//   if (date)
//     searchQuery.date = date; // Optional: Use date range if needed

//   console.log("Final MongoDB Query:", searchQuery);

//   try {
//     const matchingRides = await PublishRide.find(searchQuery);
//     console.log("Matching rides found:", matchingRides);

//     if (matchingRides.length === 0) {
//       return res.status(404).json({ message: "No matching rides found" });
//     }

//     res.json(matchingRides);
//   } catch (error) {
//     console.error("❌ Error searching rides:", error);
//     res.status(500).json({ message: "Error searching rides" });
//   }
// });


