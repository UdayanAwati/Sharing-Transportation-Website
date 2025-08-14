const mongoose = require("mongoose");

const DriverInfoSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    age: { type: Number, required: true },
    experience: { type: Number, required: true },
    vehicleName: { type: String, required: true },
    vehicleNumber: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("DriverInfo", DriverInfoSchema);
