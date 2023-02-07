const { REDIS_SERVER_NOT_CONNECTED } = require('./constants/constants.js');
const redisClient = require('./init_redis.js');
// const redisClient = asyncRedisClient
const jwtHelper = require('./jwtHelper.js');

const redisAndToken = async (user_id, device_id, ip, type) => {
    let pinged = await redisClient.ping();

    if (!pinged || pinged !== "PONG") {
        return REDIS_SERVER_NOT_CONNECTED;
    }

    let payload = { user_id, device_id, ip, type };

    const accessToken = jwtHelper.signAccessToken(payload);
    const refreshToken = jwtHelper.signRefreshToken(payload);
    console.log("Token generated with the parameters", payload);

    const tokens = {
        accessToken,
        refreshToken
    }
    const redisRespExists = await redisClient.exists(user_id);
    if (redisRespExists) {
        const tokenRes = await redisClient.get(user_id);
        const decodedTokens = async () => {
            try {
                const data = jwtHelper.verifyRefreshToken(tokenRes);
                return data
            } catch (error) {
                console.log(error);
                await redisClient.del(user_id)
                return null;
            }
        }

        console.log("decodedTokens", await decodedTokens());

        // const redisResp = await redisClient.lrange(user_id, 0, -1);
        // const decodedTokens = await Promise.all(redisResp.map(async (token) => {
        //     try {
        //         return jwtHelper.verifyRefreshToken(token);
        //     } catch (error) {
        //         await redisClient.lrem(user_id, -1, token);
        //         return {}
        //     }
        // }));
        // let deviceTokens = [];
        // if (device_id) {
        //     deviceTokens = decodedTokens.filter(c => c.device_id !== undefined);
        // }
        // if (ip) {
        //     deviceTokens = decodedTokens.filter(c => c.device_id !== undefined)
        // }
        // const removeRecursive = async (i) => {
        //     if (i < 0) {
        //         return;
        //     }
        //     await redisClient.lrem(user_id, -1, redisResp[i])
        //     await removeRecursive(i - 1);
        // }
        // if (deviceTokens.length) {
        //     await removeRecursive(deviceTokens.length - 1)
        // }

    }
    // await redisClient.lpush(user_id, refreshToken);
    await redisClient.set(user_id, refreshToken);
    return tokens;

}
const redisDecodeRefreshToken = async (user_id, device_id, ip, type) => {

    let pinged = await redisClient.ping();

    if (!pinged || pinged !== "PONG") {
        return REDIS_SERVER_NOT_CONNECTED;
    }
    const redisRespExists = await redisClient.exists(user_id);
    let foundDeviceTokens = []
    if (redisRespExists) {
        const tokenRes = await redisClient.get(user_id);
        const decodedTokensFunction = async () => {
            try {
                const data = jwtHelper.verifyRefreshToken(tokenRes);
                return data
            } catch (error) {
                console.log(error);
                await redisClient.del(user_id)
                return null
            }
        }
        const decodedTokens = await decodedTokensFunction();
        if (device_id) {
            foundDeviceTokens = decodedTokens && decodedTokens.device_id == device_id ? [decodedTokens] : []
        }
        if (ip) {
            foundDeviceTokens = decodedTokens && decodedTokens.ip == ip ? [decodedTokens] : []
        }
    }
    return foundDeviceTokens;
}
const tokenExist = async (user_id, token) => {
    let pinged = await redisClient.ping();
    if (!pinged || pinged !== "PONG") {
        return REDIS_SERVER_NOT_CONNECTED;
    }
    const redisRespExists = await redisClient.exists(user_id);
    if (redisRespExists) {
        const getToken = await redisClient.get(user_id);
        if (getToken == token) {
            return true
        }
    }
    return false;

}
const renewTokesAndRedis = async (token, payload) => {

    // Payload user_id, device_id, ip, type, preference_id, schoolCode
    let pinged = await redisClient.ping();
    if (!pinged || pinged !== "PONG") {
        return REDIS_SERVER_NOT_CONNECTED;
    }
    console.log('renew access payload', payload);
    const redisResp = await redisClient.get(payload.user_id);
    if (redisResp) {
        const accessToken = jwtHelper.signAccessToken(payload);
        const refreshToken = jwtHelper.signRefreshToken(payload);
        await redisClient.set(payload.user_id, refreshToken);
        const data = { accessToken, refreshToken };
        return data;
    }
    return null;
}

const collectTokens = async (user_id, device_id, ip) => {
    let pinged = await redisClient.ping();
    if (!pinged || pinged !== "PONG") {
        return REDIS_SERVER_NOT_CONNECTED
    }

    const checkExists = await redisClient.exists(user_id);
    let foundDeviceTokens = []
    if (checkExists) {
        const redisResp = await redisClient.get(user_id);
        const decodedTokensFunction = async () => {
            try {
                return await jwtHelper.verifyRefreshToken(redisResp);
            } catch (error) {
                console.log(error);
                await redisClient.del(user_id)
                return null;
            }
        }
        const decodedTokens = await decodedTokensFunction();
        console.log("decodedTokens", decodedTokens);

        if (device_id) {
            foundDeviceTokens = decodedTokens && decodedTokens.device_id == device_id ? [decodedTokens] : []
        }
        if (ip) {
            foundDeviceTokens = decodedTokens && decodedTokens.ip == ip ? [decodedTokens] : []
        }

    }
    console.log("foundDeviceTokens", foundDeviceTokens);
    return foundDeviceTokens;
}
const removeRefreshTokenRedis = async (user_id) => {
    let pinged = await redisClient.ping();
    if (!pinged || pinged !== "PONG") {
        return REDIS_SERVER_NOT_CONNECTED;
    }
    const redisRespExists = await redisClient.exists(user_id);
    if (redisRespExists) {
        await redisClient.del(user_id);
        return true
    }
    return false;
}
module.exports = {
    redisAndToken,
    redisDecodeRefreshToken,
    tokenExist,
    renewTokesAndRedis,
    collectTokens,
    removeRefreshTokenRedis
}
