// const mongoose = require("mongoose");

// const publishRideSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   startLocation: {
//     name: { type: String, required: true },
//     coordinates: {
//       lat: { type: Number, required: true },
//       lng: { type: Number, required: true }
//     }
//   },
//   destination: {
//     name: { type: String, required: true },
//     coordinates: {
//       lat: { type: Number, required: true },
//       lng: { type: Number, required: true }
//     }
//   },
//   stops: [{
//     name: { type: String, required: true },
//     coordinates: {
//       lat: { type: Number, required: true },
//       lng: { type: Number, required: true }
//     }
//   }],
//   departureTime: { type: String, required: true },
//   date: { type: Date, required: true },
//   vehicleType: { type: String, required: true },
//   cargoType: { type: String, required: true },
//   space: { type: Number, required: true },
//   totalDistance: { type: Number, required: true },
//   totalDuration: { type: Number, required: true },
//   fullRoutePath: { type: [Object], required: true },  // Assuming this stores an array of route points
// });

// publishRideSchema.index({ "startLocation.coordinates": "2dsphere" });
// publishRideSchema.index({ "destination.coordinates": "2dsphere" });
// publishRideSchema.index({ "stops.coordinates": "2dsphere" });


// const PublishRide = mongoose.model("PublishRide", publishRideSchema);

// module.exports = PublishRide;

const mongoose = require("mongoose");

const publishRideSchema = new mongoose.Schema({
  email: { type: String, required: true },
  startLocation: {
    name: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  destination: {
    name: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  stops: [{
    name: { type: String, required: true },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }],
  departureTime: { type: String, required: true },
  date: { type: Date, required: true },
  vehicleType: { type: String, required: true },
  cargoType: { type: String, required: true },
  space: { type: Number, required: true },
  totalDistance: { type: Number, required: true },
  totalDuration: { type: Number, required: true },
  fullRoutePath: { type: [Object], required: true },  // Assuming this stores an array of route points
  // fullRoutePath: [
  //   {
  //     type: { type: String, enum: ['Point'], required: true },
  //     coordinates: { type: [Number], required: true }
  //   }
  // ]
  
});

// Adding 2dsphere indexes for geospatial queries
publishRideSchema.index({ "startLocation.coordinates": "2dsphere" });
publishRideSchema.index({ "destination.coordinates": "2dsphere" });
publishRideSchema.index({ "stops.coordinates": "2dsphere" });
// publishRideSchema.index({ "fullRoutePath": "2dsphere" });
const PublishRide = mongoose.model("PublishRide", publishRideSchema);

module.exports = PublishRide;
