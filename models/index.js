//importing all models
const db = {};

// importing models
db.user = require("./userModel");
db.mobile = require("./mobileOtpModel");
db.email = require("./emailOtpModel");
db.fcm = require('./fcmModel.js')
db.reset= require('./passwordResetModel')



module.exports = db;