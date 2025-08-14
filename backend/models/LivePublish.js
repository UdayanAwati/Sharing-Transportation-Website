// const mongoose = require("mongoose");

// const livePublishSchema = new mongoose.Schema({
//     email: { type: String, required: true },
//     lat: { type: Number, required: true },
//     lng: { type: Number, required: true },
//     vehicleType: { type: String, required: true },
//     vehicleSpace: { type: Number, required: true },
//     cargoType: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// });

// const LivePublish = mongoose.model("LivePublish", livePublishSchema);

// module.exports = LivePublish;
const mongoose = require("mongoose");

const livePublishSchema = new mongoose.Schema({
    email: { type: String, required: true },
    location: {   // 👈 Add location as GeoJSON
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
    },
    vehicleType: { type: String, required: true },
    vehicleSpace: { type: Number, required: true },
    cargoType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// ✅ Add 2dsphere index
livePublishSchema.index({ location: "2dsphere" });

const LivePublish = mongoose.model("LivePublish", livePublishSchema);

module.exports = LivePublish;
