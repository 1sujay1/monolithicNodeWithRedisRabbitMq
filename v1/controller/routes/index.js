const express = require('express');
const router = express.Router();

const { roles } = require("../../utils/roles");
const userSchema = require("../../schemaValidations/templateSchemaValidation.js");
const { validate } = require("../../middlewares/authorize");

/**
* Will Check Schema validation and token validation
* @param {*} schema check scheam fields of incoming request and types are valid or not.
* @param {*} tokenVerify [true] [false] based on boolean it will check token vaild or not.
*/

/**
 * Import all controllers
 */

const authController = require('../authController');

const { validateRefreshToken } = require('../../middlewares/loginUtils');
var authorize = (schema, tokenVerify, role) => {
    return (req, res, next) => {
        validate(req, res, next, schema, tokenVerify, role)
    }
}

//Auth
router.post('/signup', authorize(null, false), authController.SignUp);
router.post('/signin', authorize(userSchema.schema.login, false), authController.SignIn)
router.post('/check', validateRefreshToken, authController.CheckUser);

router.post('/logout', authorize(null, true), authController.Logout);

router.post('/otp/send', authorize(null, false), authController.SendOTP);
router.post('/otp/verify', authorize(null, false), authController.VerifyOTP);
router.post('/otp/resend', authorize(null, false), authController.ResendOTP);


router.post('/changePass', authorize(null, false), authController.ChangePassword);
// router.post('/resetPassword', authorize(null, false), authController.ResetPassword);
// router.post('/resetVerify', authorize(null, false), authController.ResetVerify);

// book
router.get("/",(req,res,next)=>{res.send("Its working Sujay")})




module.exports = router;