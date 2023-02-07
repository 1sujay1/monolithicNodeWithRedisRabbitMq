const { REDIS_SERVER_NOT_CONNECTED } = require('../utils/constants/constants');
const { verifyAccessToken } = require('../utils/jwtHelper');
const { collectTokens } = require('../utils/redis_token');
const apiResponse = require('../helpers/apiResponse');
const response = require('./responseHandler');

//Schema validation for incoming request
const validateSchema = async (req, res, next, schema) => {
    try {
        await schema.validateAsync(req.body, { convert: false })
    } catch (error) {
        console.log(error);
        if (error.details[0].type === 'object.allowUnknown') {
            const message = error.details[0].message.split(/(?=[A-Z])/u).join(' ')
            return res.status(500).send({ message });
        }
        const message = error.details[0].message || error.details[0].context.label;
        return apiResponse.validationErrorWithData(res, [message], [])

    }
    next();
}

/**
  When user not signed in ,prevent their access
 */
exports.requireUser = (req, res, next) => {
    if (req && !req.user) {
        req.flash('error', 'Sign in please to access this page');
        res.redirect('/signin')
    } else {
        return next()
    }
}


//Verify token
const verifyToken = async (req, res, next, schema, accessRole) => {

    if (!req.headers.authorization) {
        return apiResponse.unauthorizedResponse(res, [response.responseText[1000]], [])
    }
    const authorizationHeader = req.headers.authorization;

    let data;

    if (authorizationHeader) {
        const token = authorizationHeader.split(' ')[1]; //Bearer token
        try {
            data = await verifyAccessToken(token);
            req.decoded = data;
            let foundDeviceToken = await collectTokens(data.user_id, data.device_id, data.ip);

            if (foundDeviceToken === REDIS_SERVER_NOT_CONNECTED) {
                return apiResponse.internalServerError(res, [REDIS_SERVER_NOT_CONNECTED], [])
            }

            if (foundDeviceToken.length) {
                console.log(accessRole, '----roles---', data.type);
                if (accessRole && accessRole.length !== 0 && !accessRole.includes(data.type)) {
                    console.log('--Mid-- Access Denied --', data.type, '\n');
                    return apiResponse.forbiddenResponse(res, [response.responseText[1001]], [])
                } else {
                    if (schema) {
                        return validateSchema(req, res, next, schema)
                    }
                    next()
                }
            } else {
                return apiResponse.unauthorizedResponse(res, [response.responseText[1000]], [])
            }

        } catch (error) {
            console.log(error);
            return apiResponse.accessTokenExpired(res, [error.message], [])
        }
    } else {
        return apiResponse.forbiddenResponse(res, [response.responseText[1002]], [])
    }

}

module.exports.validate = (req, res, next, schema, tokenVerify, accessRole) => {
    tokenVerify
        ? verifyToken(req, res, next, schema, accessRole)
        : schema
            ? validateSchema(req, res, next, schema)
            : next()
}