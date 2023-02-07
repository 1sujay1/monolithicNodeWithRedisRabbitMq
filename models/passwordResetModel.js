const mongoose = require("mongoose");

const passwordReset = mongoose.model(
    "passwordReset",
    new mongoose.Schema({
        userId: String,
        verificationId: { type: String, default: null },
        otp: { type: String, default: null },
        expiresOn: Date,
        created_at: Date,
        isVerified: { type: Boolean, default: false }
    }),
    "reset_password"
);

module.exports = passwordReset;
