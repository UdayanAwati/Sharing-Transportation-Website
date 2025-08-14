// controllers/searchRideController.js
const turf = require('@turf/turf');
const SearchRide = require("../models/SearchRide");
const PublishRide = require("../models/PublishRide");
const LivePublish = require("../models/LivePublish");

// Save the search request and immediately match rides
const saveAndMatchSearchRide = async (req, res) => {
  try {
    // 1️⃣ Prepare search data from request
    const searchData = {
      pickupLocation: {
        name: req.body.pickupLocation.name,
        location: {
          type: 'Point',
          coordinates: [req.body.pickupLocation.coordinates.lng, req.body.pickupLocation.coordinates.lat]
        }
      },
      deliveryLocation: {
        name: req.body.deliveryLocation.name,
        location: {
          type: 'Point',
          coordinates: [req.body.deliveryLocation.coordinates.lng, req.body.deliveryLocation.coordinates.lat]
        }
      },
      date: req.body.date,
      cargoSpaceRequired: req.body.cargoSpaceRequired,
      cargoType: req.body.cargoType,
      cargoImage: req.file ? req.file.filename : null
    };

    // 2️⃣ Save the search
    const newSearch = new SearchRide(searchData);
    await newSearch.save();

    // 3️⃣ Match PublishRide (shared transportation)
    const allRides = await PublishRide.find({
      cargoType: searchData.cargoType,
      space: { $gte: searchData.cargoSpaceRequired },
      date: { $eq: new Date(searchData.date) }
    }).lean();

    console.log("🔍 searchData:", searchData);
    console.log("🚚 allRides (fetched from DB):", allRides);
    
    function convertToGeoJSONLineString(routePoints) {
      return {
        type: "LineString",
        coordinates: routePoints.map(point => [point.lng, point.lat])
      };
    }
    
    const pickupPoint = turf.point(searchData.pickupLocation.location.coordinates);
    const deliveryPoint = turf.point(searchData.deliveryLocation.location.coordinates);
    
    const publishMatches = allRides.filter(ride => {
      if (!ride.fullRoutePath || ride.fullRoutePath.length < 2) return false;
    
      const routeLine = convertToGeoJSONLineString(ride.fullRoutePath);
      // console.log("🧭 routeLine:", JSON.stringify(routeLine, null, 2));
      
      const pickupDistance = turf.pointToLineDistance(pickupPoint, routeLine, { units: 'kilometers' });
      const deliveryDistance = turf.pointToLineDistance(deliveryPoint, routeLine, { units: 'kilometers' });
      
      console.log("📏 pickupDistance (km):", pickupDistance);
      console.log("📏 deliveryDistance (km):", deliveryDistance);

      return pickupDistance <= 15 && deliveryDistance <= 15;
    });
    console.log("✅ Matching publish rides (within 15km):", publishMatches);
    
    // 4️⃣ Match LivePublish (Uber-style)
    const liveMatches = await LivePublish.find({
      "location.coordinates": {
        $geoWithin: {
          $centerSphere: [
            [searchData.pickupLocation.location.coordinates[0], searchData.pickupLocation.location.coordinates[1]],
            30 / 3963
          ]
        }
      },
      cargoType: searchData.cargoType,
      vehicleSpace: { $gte: searchData.cargoSpaceRequired }
    }).lean();

    // 5️⃣ Merge all matches
    const allMatches = [
      ...publishMatches.map(ride => ({ ...ride, source: "PublishRide" })),
      ...liveMatches.map(ride => ({ ...ride, source: "LivePublish" }))
    ];

    // 6️⃣ Save matches into session or directly send to frontend
    res.status(200).json({
      success: true,
      searchId: newSearch._id,
      matches: allMatches
    });

  } catch (error) {
    console.error("❌ Error in saveAndMatchSearchRide:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { saveAndMatchSearchRide };


// const SearchRide = require("../models/SearchRide");
// const PublishRide = require("../models/PublishRide");
// const LivePublish = require("../models/LivePublish");

// // Save search data to SearchRide collection
// const saveSearchRide = async (req, res) => {
//   try {
//     // Extract the data from the form submission
//     const searchData = {
//       pickupLocation: {
//         name: req.body.pickupLocation.name,
//         location: {
//           type: 'Point',
//           coordinates: [req.body.pickupLocation.coordinates.lng, req.body.pickupLocation.coordinates.lat]
//         }
//       },
//       deliveryLocation: {
//         name: req.body.deliveryLocation.name,
//         location: {
//           type: 'Point',
//           coordinates: [req.body.deliveryLocation.coordinates.lng, req.body.deliveryLocation.coordinates.lat]
//         }
//       },
//       date: req.body.date,
//       cargoSpaceRequired: req.body.cargoSpaceRequired,
//       cargoType: req.body.cargoType,
//       cargoImage: req.file ? req.file.filename : null  // Optional image, only if uploaded
//     };

//     // Save the search data to MongoDB
//     const newSearch = new SearchRide(searchData);
//     await newSearch.save();

//     // Capture the search ID from the saved document
//     const searchID = newSearch._id;

//     // Redirect to the list of rides page with the search ID
//     res.redirect(`/listofrides?searchId=${newSearch._id}`);
//   } catch (error) {
//     console.error("❌ Error saving search data:", error);
//     res.status(500).json({ success: false, message: "Error saving search data" });
//   }
// };

// // Function to match PublishRide data (shared transportation)
// const matchPublishRides = async (searchData) => {
//   const { pickupLocation, deliveryLocation, cargoType, cargoSpaceRequired } = searchData;

//   // Perform geospatial matching within 15km radius for both pickup and delivery locations
//   const matchedPublishRides = await PublishRide.find({
//     "startLocation.coordinates": {
//       $geoWithin: {
//         $centerSphere: [
//           [pickupLocation.coordinates[0], pickupLocation.coordinates[1]],
//           15 / 3963  // 15 km radius (convert km to radians)
//         ]
//       }
//     },
//     "destination.coordinates": {
//       $geoWithin: {
//         $centerSphere: [
//           [deliveryLocation.coordinates[0], deliveryLocation.coordinates[1]],
//           15 / 3963  // 15 km radius
//         ]
//       }
//     },
//     cargoType,
//     space: { $gte: cargoSpaceRequired }  // Ensure cargo space is sufficient
    
//   });

//   return matchedPublishRides;
// };

// // Function to match LivePublishRide data (Uber-like)
// const matchLivePublishRides = async (searchData) => {
//   const { pickupLocation, cargoType, cargoSpaceRequired } = searchData;

//   // Perform geospatial matching within a 30 km radius for the pickup location
//   const matchedLivePublishRides = await LivePublish.find({
//     "location.coordinates": {
//       $geoWithin: {
//         $centerSphere: [
//           [pickupLocation.coordinates[0], pickupLocation.coordinates[1]],
//           30 / 3963  // 30 km radius (convert km to radians)
//         ]
//       }
//     },
//     cargoType,
//     vehicleSpace: { $gte: cargoSpaceRequired }  // Ensure cargo space is sufficient
//   });

//   return matchedLivePublishRides;
// };

// // Handle search request and find matching rides
// const searchRide = async (req, res) => {
//   try {
//     const searchData = {
//       pickupLocation: {
//         name: req.body.pickupLocation.name,
//         coordinates: [req.body.pickupLocation.coordinates.lng, req.body.pickupLocation.coordinates.lat]
//       },
//       deliveryLocation: {
//         name: req.body.deliveryLocation.name,
//         coordinates: [req.body.deliveryLocation.coordinates.lng, req.body.deliveryLocation.coordinates.lat]
//       },
//       date: req.body.date,
//       cargoSpaceRequired: req.body.cargoSpaceRequired,
//       cargoType: req.body.cargoType,
//       cargoImage: req.file ? req.file.filename : null // Optional image field
//     };

//     // 1️⃣ Save the search data to the SearchRide collection
//     const newSearch = new SearchRide(searchData);
//     await newSearch.save();

//     // 2️⃣ Find matching rides in PublishRide (shared transportation)
//     const matchedPublishRides = await matchPublishRides(searchData);

//     // 3️⃣ Find matching rides in LivePublish (Uber-like)
//     const matchedLivePublishRides = await matchLivePublishRides(searchData);

//     // 4️⃣ Combine results from both PublishRide and LivePublish
//     const allMatches = [...matchedPublishRides, ...matchedLivePublishRides];

//     // 5️⃣ Return the matching rides
//     res.status(200).json({
//       success: true,
//       matches: allMatches,
//       searchID: newSearch._id
//     });

//   } catch (error) {
//     console.error("❌ Error in matching rides:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// module.exports = { saveSearchRide, searchRide };
