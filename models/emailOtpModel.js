const mongoose = require('mongoose');

const EmailOTP = mongoose.model(
    'EmailOTP',
    new mongoose.Schema({
        email: String,
        isVerified: { type: Boolean, default: false },
        registerStatus: {
            type: String, enum: ["INCOMPLETE", "REGISTERED"],
            default: "INCOMPLETE"
        },
        verifyCode: String,
        isAdDeleted: { type: Boolean, default: false }
    })
)
module.exports = EmailOTP;