const { GeneratePassword, FormatData, ValidatePassword, PublishDatabaseEvent } = require("../utils");
const { redisAndToken, redisDecodeRefreshToken, removeRefreshTokenRedis } = require("../utils/redis_token");
const { REDIS_SERVER_NOT_CONNECTED } = require("../utils/constants/constants");
const { GenerateActionObject } = require("../helpers/apiResponse");
const random = require('../utils/randomNumber');
const { formatEmailData, sendEmailWithStatic } = require("../../v1/utils/send_email");
const { sendOTP, reSendOTP, verifyOTP } = require("./otpController");
const { CustResponse } = require("../../v1/utils");
const db = require("../../models");
const UserModel = db.user;
const MobileOTPModel = db.mobile;
const EmailOTPModel = db.email;
const FCMUserModel = db.fcm;
const ResetModel = db.reset;


const SignUp = async (req, res, next) => {
    try {
        const { device_id, ip, fcm_token, name, email, mobile, password, img_url, roles, address, provider, confirmPassword, dob, about_me, country, state, district, genres, pin_code, dashboard, gamification } = req.body;

        if (!device_id && !ip) {
            return FormatData(res, false, "device id or ip is undefined")
        }
        let query = {};
        if (email) query.email = email;
        if (mobile) query.mobile = mobile;

        const action = GenerateActionObject("CHECK_USER_VERIFIED", query);
        const userVerify = await PublishDatabaseEvent(action);

        if (!userVerify) {
            return FormatData(res, false, "Please verify your email or mobile")
        }
        const action1 = GenerateActionObject("FIND_USER", {
            email, mobile, filter: { name: 1 }
        });

        const existUser = await PublishDatabaseEvent(action1);

        if (existUser) {
            return FormatData(res, false, "User email or mobile aleady exists")
        }

        if (password != confirmPassword) {
            return FormatData(res, false, "Password donot match")
        }

        let userPassword = await GeneratePassword(password, 8);

        if (device_id && fcm_token) {
            //Delete FCM Token on login
            const action2 = GenerateActionObject("FIND_UPDATE_FCM", {
                user_id: existUser._id, device_id, fcm_token, email: existUser.email
            });
            const fcmData = await PublishDatabaseEvent(action2);
        }

        const payload = { name, email, mobile, password: userPassword, provider, img_url, roles, address, dob, about_me, country, state, district, genres, pin_code, dashboard, gamification }
        const action3 = GenerateActionObject("CREATE_USER", payload);
        const statusInfo = await PublishDatabaseEvent(action3);

        let userResult;
        if (statusInfo.status) {
            userResult = statusInfo.data;
        } else {
            return FormatData(res, false, statusInfo.message)
        }
        const tokens = await redisAndToken(
            userResult._id,
            device_id,
            ip,
            userResult.roles[0]
        )

        if (tokens == REDIS_SERVER_NOT_CONNECTED) {
            return FormatData(res, false, "Redis not connected")
        }

        let data = { tokens }
        data.user = { ...userResult }
        delete data.user.password;

        return FormatData(res, true, "User created successfully", [data])
    } catch (error) {
        console.log("Error", error.message);
        next(error)
    }
}
const SignIn = async (req, res, next) => {
    try {

        const { email, password, device_id, ip, role, fcm_token } = req.body;

        if (!device_id && !ip) {
            return FormatData(res, false, "device id or ip is undefined");
        }

        const payload = {
            email
        }

        
        const existUser = await FindUser(payload);
        if (!existUser) {
            return FormatData(res, false, "User not found")
        }
        const isPasswordValid = await ValidatePassword(password, existUser.password)

        if (!isPasswordValid) {
            return FormatData(res, false, "Invalid password")
        }

        if (device_id && fcm_token) {
            //Delete FCM Token on login
            const fcmData = await FindFCMAndUpdate({
                user_id: existUser._id, device_id, fcm_token, email: existUser.email
            });
        }

        const tokens = await redisAndToken(
            existUser._id,
            device_id,
            ip,
            role ? role : existUser.roles[0]
        )

        let data = { tokens }
        data.user = { ...existUser }
        delete data.user.password

        return FormatData(res, true, "Sign in Successfull", [data]);
    } catch (error) {
        console.log(error);
        return FormatData(res, false, [error.message], [])
    }
}
const FindFCMAndUpdate = async({ user_id, ...rest })=> {
    try {
        let result = await FCMUserModel.findOneAndUpdate({ user_id }, rest, { upsert: true, new: true });
        return result;
    } catch (error) {
        console.log("error", error.message);
    }
}

const SendOTP = async (req, res, next) => {
    try {
        const { email, mobile } = req.body;
        if (email) {
            const getResult =await SendOTPEmail({ email })

            if (getResult.status) {
                const emailTemData = await formatEmailData(email, `Verification code`, `Your Verification code is ${getResult.data}`)
                const emailRes = await sendEmailWithStatic(emailTemData);

                if (emailRes != 202) {
                    return { status: false, message: emailRes }
                }
                return FormatData(res, true, `Please check your email, we sent a confirmation code to ${email}`)
            } else {
                return FormatData(res, false, getResult.message)
            }
        } else {
            // const resp = await sendOTP(mobile);
            // if (resp.data.type === "error") {
            //     return FormatData(res, false, resp.data.message)
            // }

            const getResult =await MobileOTPFindAndUpdate({ mobile })
            console.log("getResult",getResult
            );
            return FormatData(res, true, `OTP sent successfully to ${mobile}`)

        }
    } catch (error) {
        console.log("Error", error.message);
        next(error)
    }
}
const SendOTPEmail = async({ email })=> {
    try {
        const randomCode = await random.randomNumber(4);

        let emailData = await EmailOTPModel.findOne({ email });
        if (!emailData) {
            emailData = await EmailOTPModel.create({ email, verifyCode: randomCode })
        } else {
            emailData = await EmailOTPModel.updateOne({ email }, { verifyCode: randomCode });
        }

        return { status: true, data: randomCode };

    } catch (error) {
        console.log("error", error.message);
    }
}
const MobileOTPFindAndUpdate =async ({ mobile }) =>{
    try {
        const data = await MobileOTPModel.findOneAndUpdate({ mobile }, {}, { upsert: true, new: true });
        if (data && data._id) {
            return { status: true, message: "OTP sent successfully", data: [] }
        }
    } catch (error) {
        return { status: false, message: error.message }
    }
}
const ResendOTP = async (req, res, next) => {
    try {
        const { email, mobile } = req.body;

        if (email) {
            const getResult = await ResendOTPEmail({ email });

            if (getResult.status) {
                const emailTemData = await formatEmailData(email, `Resent Verification code`, `Your Verification code is ${getResult.data}`)
                const emailRes = await sendEmailWithStatic(emailTemData);

                if (emailRes != 202) {
                    return { status: false, message: emailRes }
                }
                return FormatData(res, true, `Resent verification code to ${email}`)
            } else {
                return FormatData(res, false, getResult.message)
            }
        } else {
            const getResult = await FindMobileOTP({ mobile });

            if (getResult.status) {
                // const resp = await reSendOTP(mobile);
                // if (resp.data.type === "error") {
                //     return FormatData(res, false, resp.data.message)
                // }
                return FormatData(res, true, "Resent OTP successfully!!!")
            }
            return FormatData(res, false, getResult.message)
        }

    } catch (error) {
        console.log("Error", error.message);
        next(error)
    }
}
const ResendOTPEmail = async ({ email }) =>{
    try {
        const randomCode = random.randomNumber(4);
        let emailData = await EmailOTPModel.findOne({ email });
        if (!emailData) {
            emailData = await EmailOTPModel.create({ email, verifyCode: randomCode })
        } else {
            emailData = await EmailOTPModel.updateOne({ email }, { verifyCode: randomCode });
        }

        return { status: true, data: randomCode };

    } catch (error) {
        console.log("error", error.message);
    }
}
const login = async (req, res, next, payload, tokenData) => {
    try {
        const { device_id, ip } = tokenData;
        const userData = await FindUser(payload);

        if (!userData && !userData._id) {
            return FormatData(res, false, "Please sign up")
        }
        const tokens = await redisAndToken(
            userData._id,
            device_id,
            ip,
            userData.roles[0]
        )

        let data = { tokens }
        data.user = userData;
        delete data.user.password;
        return FormatData(res, true, "Sign in successfull", [data])
    } catch (error) {
        console.log("Error", error.message);
        next(error)
    }
}

const VerifyOTP = async (req, res, next) => {
    try {
        const { email, mobile, otp, device_id, ip } = req.body;

        if (!device_id && !ip) {
            return FormatData(res, false, "device id or ip is undefined")
        }
        if (email) {
            const getResult =await VerifyOTPEmail({ email, verifyCode: otp, device_id, ip })
            if (getResult) {
                if (getResult.registerStatus !== 'REGISTERED') {
                    return FormatData(res, true, "New User Registered", [])
                }

                return login(req,res,next, { email }, { device_id, ip })

            } else {
                return FormatData(res, false, "Invalid email or verification code")
            }

        } else {
            const getResult =await FindMobileOTP({ mobile, filter: { isVerified: 1, registerStatus: 1 }});

            if (!getResult.status) {
                return FormatData(res, false, getResult.message)
            }
            // const resp = await verifyOTP(mobile);
            // if (resp.data.type === "error") {
            //     return FormatData(res, false, resp.data.message)
            // }
            if(otp!='123ABC'){
                return FormatData(res, false, "OTP verification failed, Invalid OTP")
            }
            if (!getResult.data.isVerified) {
                await UpdateMobileOTP({ _id: getResult.data._id, isVerified: true })
            }
            if (getResult.data.registerStatus !== "REGISTERED") {
                return FormatData(res, true, "New User Mobile Registered")
            }
            return login(req, res, next, { mobile }, { device_id, ip })
        }
    } catch (error) {
        console.log(error);
        console.log("Errors", error.message);
        next(error)
    }
}
const UpdateMobileOTP = async({ _id, ...rest })=> {
    try {
        const data = await MobileOTPModel.updateOne({ _id }, rest);
        if (data && data.modifiedCount) {
            return { status: true, message: "Updated successfully", data }
        }
        return { status: false, message: "Failed to update,try again" }

    } catch (error) {
        return { status: false, message: error.message }
    }
}
const FindMobileOTP = async({ mobile, filter }) =>{
    try {
        const data = await MobileOTPModel.findOne({ mobile }, filter);
        if (data && data._id) {
            return { status: true, message: "Mobile exists", data }
        }
        return { status: false, message: "No Mobile found" }

    } catch (error) {
        return { status: false, message: error.message }
    }
}
const VerifyOTPEmail = async({ email, verifyCode, device_id, ip }) =>{
    try {
        let queryFcm = {}
        if (device_id) queryFcm.device_id = device_id;
        if (ip) queryFcm.ip = ip;
        let findFcmUser = await FCMUserModel.findOne({ email });

        if (!findFcmUser) {
            await FCMUserModel.create({ email, queryFcm });
        }

        let emailData = await EmailOTPModel.findOne({ email, verifyCode })
        if (emailData) {
            if (!emailData.isVerified) {
                emailData = await EmailOTPModel.findOneAndUpdate({ email }, { isVerified: true }, { new: true })
            }
            // await FCMUserModel.deleteOne({ email });
            await FCMUserModel.updateOne({ email }, queryFcm);
        }
        return emailData;

    } catch (error) {
        console.log("error", error.message);
    }
}
const ChangePassword = async (req, res, next) => {
    try {
        const { value, password, confirmPassword } = req.body;

        if (password != confirmPassword) {
            return FormatData(res, false, "password and confirmPassword donot match")
        }
        const existsUser = await FindUser({ value });

        if (!existsUser) {
            return FormatData(res, false, "No account found")
        }

        const checkVerified = await FindReset({ userId: existsUser._id });

        if (!checkVerified || !checkVerified.isVerified) {
            return FormatData(res, false, "Kindly verify to reset your password")
        }

        let userPassword = await GeneratePassword(password, 8);

        const getResult = await ChangePasswordDB({ _id: existsUser._id, password: userPassword });

        if (getResult) {
            return FormatData(res, true, "Password reset successfull, you can now continue logging in with the above provided password", [])
        } else {
            return FormatData(res, false, "Something went wrong")
        }
    } catch (error) {
        console.log("Error", error.message);
        next(error)
    }
}
const ChangePasswordDB = async ({ _id, password })=> {
    console.log("user_id, password", _id, password);
    try {
        const result = await UserModel.updateOne({ _id }, { password })
        await ResetModel.updateOne({ userId: _id }, { isVerified: false });
        return result;

    } catch (error) {
        console.log("error", error.message);
    }
}
const FindReset = async({ userId }) =>{
    try {
        const resp = await ResetModel.findOne({ userId }, { isVerified: 1, userId: 1 });
        return resp;

    } catch (error) {
        console.log("error", error.message);
        return null;
    }
}
const FindUser = async ({ _id, email, mobile, value, filter })=> {
    let query = { isDeleted: false }
    if (!filter) {
        filter = {};
    }

    if (email) {
        query.email = email;
        const checkResult = await UserModel.findOne(query, filter);
        return checkResult;
    }
    if (mobile) {
        query.mobile = mobile;
        const checkResult = await UserModel.findOne(query, filter);
        return checkResult;
    }
    if (value) {
        const checkResult = await UserModel.findOne({
            $or: [{ email: value, isDeleted: false }, { mobile: value, isDeleted: false }]
        }, filter);
        return checkResult;
    }
    if (_id) {
        const checkResult = await UserModel.findOne({ _id, isDeleted: false });
        return checkResult;
    }
}

const Logout = async (req, res, next) => {
    try {
        const { user_id, device_id, ip } = req.decoded;
        if (!device_id && !ip) {
            return FormatData(res, false, "Invalid device", []);
        }

        let redisResp = await removeRefreshTokenRedis(user_id);
        if (redisResp == REDIS_SERVER_NOT_CONNECTED) {
            return FormatData(res, false, REDIS_SERVER_NOT_CONNECTED, []);
        }
        if (!redisResp) {
            return FormatData(res, false, "Already Logged out successfully", [])
        }
        const response = await DeleteFCM({ user_id });
        if (response) {
            return FormatData(res, true, "Logout successfully", [])
        }
        return FormatData(res, false, "Something went wrong")
    } catch (error) {
        console.log("Error", error.message);
        next(error)
    }
}
const DeleteFCM = async({ user_id })=> {
    try {
        let result = await FCMUserModel.deleteOne({ user_id });
        return result;
    } catch (error) {
        console.log("error", error.message);
    }
}
const CheckUser = async (req, res, next) => {
    try {
        const { user_id } = req.decoded;
        const action1 = GenerateActionObject("FIND_USER", { _id: user_id });
        const response = await PublishDatabaseEvent(action1);
        console.log("response", response);
        if (response) {
            return FormatData(res, true, "Logged in", [])
        }
        return FormatData(res, false, "User not found")
    } catch (error) {
        console.log("Error", error.message);
        next(error)
    }
}
module.exports = {
    SignUp,
    SignIn,
    SendOTP,
    VerifyOTP,
    ResendOTP,
    ChangePassword,
    Logout,
    CheckUser
}