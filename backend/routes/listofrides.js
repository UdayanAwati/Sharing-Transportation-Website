// const express = require("express");
// const PublishRide = require("../models/PublishRide");
// const SearchRide = require("../models/SearchRide");

// const router = express.Router();

// // Fetch matched and all rides
// router.get("/getrides", async (req, res) => {
//   try {
//     if (!req.session.user || !req.session.user.email) {
//       return res.status(401).json({ message: "User not logged in." });
//     }

//     // Get last search of this user
//     const lastSearch = await SearchRide.findOne({ email: req.session.user.email }).sort({ _id: -1 });

//     if (!lastSearch) {
//       return res.json({ matchingRides: [], allRides: await PublishRide.find() });
//     }

//     // Find matching rides
//     const matchingRides = await PublishRide.find({
//       startLocation: lastSearch.pickupLocation,
//       destination: lastSearch.deliveryLocation,
//       date: lastSearch.date,
//       cargoType: lastSearch.cargoType,
//     });

//     const allRides = await PublishRide.find();

//     res.json({ matchingRides, allRides });
//   } catch (error) {
//     console.error("Error fetching rides:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

// router.get("/listofrides", verifyToken, async (req, res) => {
//   try {
//     const email = req.user.email;

//     // Retrieve matched rides from cache
//     const matched = matchCache[email] || [];

//     // Get all published rides
//     const allRides = await PublishRide.find();

//     res.json({ matchedRides: matched, allRides });
//   } catch (err) {
//     console.error("❌ Error loading rides:", err.message);
//     res.status(500).json({ message: "Failed to fetch rides" });
//   }
// });


// module.exports = router;
