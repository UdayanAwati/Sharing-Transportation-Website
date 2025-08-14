// const mongoose = require('mongoose');

// const searchRideSchema = new mongoose.Schema({
//   pickupLocation: {
//     name: { type: String, required: true },
//     coordinates: {
//       lat: { type: Number, required: true },
//       lng: { type: Number, required: true }
//     }
//   },
//   deliveryLocation: {
//     name: { type: String, required: true },
//     coordinates: {
//       lat: { type: Number, required: true },
//       lng: { type: Number, required: true }
//     }
//   },
//   date: { type: Date, required: true },
//   cargoSpaceRequired: { type: Number, required: true },  // In cubic meters
//   cargoType: { type: String, required: true },
//   cargoImage: { type: String, required: false },  // Optional image path
// });

// const SearchRide = mongoose.model('SearchRide', searchRideSchema);

// module.exports = SearchRide;
const mongoose = require('mongoose');

const searchRideSchema = new mongoose.Schema({
  pickupLocation: {
    name: { type: String, required: true },
    location: {   // ✅ GeoJSON
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],  // [lng, lat]
        required: true
      }
    }
  },
  deliveryLocation: {
    name: { type: String, required: true },
    location: {   // ✅ GeoJSON
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],  // [lng, lat]
        required: true
      }
    }
  },
  date: { type: Date, required: true },
  cargoSpaceRequired: { type: Number, required: true },  // In cubic meters
  cargoType: { type: String, required: true },
  cargoImage: { type: String, required: false },  // Optional image path
});

// ✅ Add 2dsphere indexes
searchRideSchema.index({ "pickupLocation.location": "2dsphere" });
searchRideSchema.index({ "deliveryLocation.location": "2dsphere" });

const SearchRide = mongoose.model('SearchRide', searchRideSchema);

module.exports = SearchRide;
