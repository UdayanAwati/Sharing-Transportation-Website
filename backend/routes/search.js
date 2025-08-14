const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const SearchRide = require("../models/SearchRide");
const PublishRide = require("../models/PublishRide");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

// Middleware for parsing cookies
router.use(cookieParser());

// 🔒 Middleware to verify JWT from cookies
const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// 📦 Setup Multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save image to uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({ storage }).single('image');  // 'image' matches the name="image" in your form


// 📨 POST /searchride - handles ride search form with image upload
// Backend Route (search.js)

router.post("/searchride", verifyToken, upload, async (req, res) => {
  const { pickupLocation, deliveryLocation, cargoType, cargoSpaceRequired, date } = req.body;
  if (!pickupLocation || !deliveryLocation || !cargoType || !cargoSpaceRequired || !date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // try {
  //   const newSearch = new SearchRide({
  //     pickupLocation,
  //     deliveryLocation,
  //     cargoType,
  //     cargoSpaceRequired,
  //     date,
  //     cargoImage: req.file ? req.file.path : null // Optional image
  //   });

      try {
        const newSearch = new SearchRide({
            pickupLocation: {
                name: pickupLocation.name,
                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(pickupLocation.location.coordinates[0]),
                        parseFloat(pickupLocation.location.coordinates[1])
                    ]
                }
            },
            deliveryLocation: {
                name: deliveryLocation.name,
                location: {
                    type: "Point",
                    coordinates: [
                        parseFloat(deliveryLocation.location.coordinates[0]),
                        parseFloat(deliveryLocation.location.coordinates[1])
                    ]
                }
            },
            cargoType,
            cargoSpaceRequired,
            date,
            cargoImage: req.file ? req.file.path : null // Optional image
        });

    await newSearch.save();
    res.status(201).json({ message: "Search ride created successfully" });
  } catch (error) {
    console.error("Error saving search ride:", error);
    res.status(500).json({ message: error.message });
  }
});

// Export the router to be used in app.js or server.js
module.exports = router;

// // Fetch matching rides for a user
// router.get("/matching/:email", async (req, res) => {
//     const { email } = req.params;
  
//     try {
//       // Fetch the matching rides from the database based on the user's email
//       const matchedRides = await SearchRide.find({ email });
  
//       if (matchedRides.length === 0) {
//         return res.status(404).json({ message: "No matching rides found" });
//       }
  
//       res.json(matchedRides);
//     } catch (error) {
//       console.error("❌ Error fetching matching rides:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });

//   // Route: GET /api/search/recent
// router.get("/recent", async (req, res) => {
//   try {
//     const userEmail = req.session.email; // assuming session stores email

//     if (!userEmail) {
//       return res.status(401).json({ message: "User not logged in" });
//     }

//     const searches = await SearchRide.find({ email: userEmail })
//       .sort({ createdAt: -1 }) // make sure 'timestamps' is enabled in schema
//       .limit(5); // show 5 recent

//     res.json({ searches });
//   } catch (err) {
//     console.error("Error fetching recent searches:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Route: GET /api/search/recent
// router.get("/recent", async (req, res) => {
//   try {
//     console.log("Session in /recent route:", req.session); // Add this!

//     const userEmail = req.session.email;
//     if (!userEmail) {
//       return res.status(401).json({ message: "User not logged in" });
//     }

//     const searches = await SearchRide.find({ email: userEmail })
//       .sort({ createdAt: -1 })
//       .limit(5);

//     res.json({ searches });
//   } catch (err) {
//     console.error("🔥 Error in /recent route:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// module.exports = router;
