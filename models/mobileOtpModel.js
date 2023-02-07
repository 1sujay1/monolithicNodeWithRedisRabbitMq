const mongoose = require("mongoose");

const MobileOTP = mongoose.model(
    "MobileOTP",
    new mongoose.Schema({
        mobile: String,
        isVerified: { type: Boolean, default: false },
        registerStatus: {
            type: String,
            enum: ["INCOMPLETE", "REGISTERED"],
            default: "INCOMPLETE"
        },
        isAdDeleted: { type: Boolean, default: false }
    })
)
module.exports = MobileOTP;
