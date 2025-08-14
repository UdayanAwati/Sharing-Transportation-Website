const express = require("express");
const { saveAndMatchSearchRide } = require("../controllers/searchRideController"); // ✅ correct controller
const router = express.Router();

// POST: Save search and immediately match rides
router.post('/searchride', saveAndMatchSearchRide);

module.exports = router;


// const express = require("express");
// const { searchRide, saveSearchRide } = require("../controllers/searchRideController"); // Import the controller
// const router = express.Router();

// // Add a route for matching rides using searchId
// router.get('/searchride/match/:searchId', async (req, res) => {
//   const searchId = req.params.searchId; // Get the searchId from the URL parameters

//   try {
//     // Fetch the search data using the searchId
//     const searchData = await SearchRide.findById(searchId);

//     if (!searchData) {
//       return res.status(404).json({ message: "Search ride not found" });
//     }

//     // Perform matching logic (you can use the same match functions you defined earlier)
//     const matchedPublishRides = await matchPublishRides(searchData);
//     const matchedLivePublishRides = await matchLivePublishRides(searchData);

//     // Combine the results from both sources
//     const allMatchedRides = [...matchedPublishRides, ...matchedLivePublishRides];

//     // Return the matched rides as a response
//     res.status(200).json(allMatchedRides);

//   } catch (error) {
//     console.error('Error fetching matching rides:', error);
//     res.status(500).json({ message: "Error fetching matching rides" });
//   }
// });

// module.exports = router;

// const express = require("express");
// const multer = require("multer"); // Import multer directly here
// const path = require("path");
// const router = express.Router();
// const { saveSearchRide } = require("../controllers/searchRideController"); // Import your controller

// // Multer setup for image upload
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Save image to uploads folder
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
//     }
// });

// const upload = multer({ storage }).single('image');  // 'image' should match the form field name in your HTML

// // Route to handle the search ride request (with image upload)
// router.post("/searchride", upload, saveSearchRide); // Updated route to /searchride

// module.exports = router;
// routes/searchRideRoutes.js

// routes/searchRideRoutes.js

