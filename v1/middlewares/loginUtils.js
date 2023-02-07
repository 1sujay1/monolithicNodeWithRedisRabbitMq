const jwtHelper = require("../utils/jwtHelper");
const apiResponse = require('../helpers/apiResponse')
const { tokenExist, collectTokens } = require("../utils/redis_token.js");
const { REDIS_SERVER_NOT_CONNECTED } = require("../utils/constants/constants.js");

module.exports = {
    validateAccessToken: async (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        let data;

        if (authorizationHeader) {
            const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
            console.log("validateAccessToken", token);
            try {
                data = jwtHelper.verifyAccessToken(token);
                req.decoded = data;

                console.log(data);
                let foundDeviceToken = await collectTokens(data.user_id, data.device_id, data.ip);
                if (foundDeviceToken === REDIS_SERVER_NOT_CONNECTED) {
                    apiResponse.internalServerError(res, [REDIS_SERVER_NOT_CONNECTED], []);
                    return;
                }
                if (foundDeviceToken.length) {
                    next();
                }
                else {
                    apiResponse.unauthorizedResponse(res, [`Invalid token`], []);
                }
            } catch (err) {
                console.log(err);
                apiResponse.accessTokenExpired(res, [err.message], []);
                return
            }
        } else {
            apiResponse.unauthorizedResponse(res, [`Authentication error. Token required.`], []);
            return;
        }
    },
    validateRefreshToken: async (req, res, next) => {

        const { token } = req.body;
        console.log("validateRefreshToken", token);
        if (token) {
            try {
                data = jwtHelper.verifyRefreshToken(token);
                req.decoded = data;
                const redisResp = await tokenExist(data.user_id, token)
                if (redisResp === REDIS_SERVER_NOT_CONNECTED) {
                    apiResponse.internalServerError(res, [REDIS_SERVER_NOT_CONNECTED], []);
                    return;
                }
                if (redisResp) {
                    next();
                }
                else {
                    apiResponse.unauthorizedResponse(res, ["Token expired"], []);
                    return
                }

            } catch (err) {
                console.log(err);
                apiResponse.unauthorizedResponse(res, [err.message], []);
                return
            }
        } else {
            apiResponse.unauthorizedResponse(res, [`Authentication error. Token required.`], []);
            return;
        }
    },

    // checkToken: async (req, res, next) => {
    //     console.log("validateRefreshToken")
    //     const { token } = req.body;
    //     if (token) {
    //         try {
    //             data = jwtHelper.verifyRefreshToken(token);
    //             req.decoded = data;
    //             next();
    //         } catch (err) {
    //             console.log(err);
    //             apiResponse.unauthorizedResponse(res, [err.message], []);
    //             return
    //         }
    //     } else {
    //         apiResponse.unauthorizedResponse(res, [`Authentication error. Token required.`], []);
    //         return;
    //     }
    // },

    validateAccessAdminToken: (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        let data;
        if (authorizationHeader) {
            const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
            try {
                data = jwtHelper.verifyAccessToken(token);
                req.decoded = data;
                if (data.type === 'admin') {
                    next();
                } else {
                    apiResponse.unauthorizedResponse(res, [`User Permission Invalid`], []);
                    return;
                }
            } catch (err) {
                apiResponse.accessTokenExpired(res, [err.message], []);
                return;
            }
        } else {
            apiResponse.unauthorizedResponse(res, [`Authentication error. Token required.`], []);
        }
    }
};