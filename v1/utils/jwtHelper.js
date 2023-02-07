const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRE_TIME;
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRE_TIME;

const signAccessToken = (payload) => {
    // let privateKey = fs.readFileSync(path.resolve(__dirname, "key/privateAccessKey.pem", 'utf8'));
    let privateKey = "SECRET_KEY_ECN"
    return jwt.sign(payload, privateKey, { algorithm: 'HS256', expiresIn: accessTokenExpiresIn });
}

const signRefreshToken = (payload) => {
    // let privateKey = fs.readFileSync(path.resolve(__dirname, '/keys/privateRefreshKey.pem', 'utf8'));
    let privateKey = "SECRET_KEY_ECN"
    return jwt.sign(payload, privateKey, { algorithm: 'HS256', expiresIn: refreshTokenExpiresIn });
}
const verifyAccessToken = (token) => {
    // let privateKey = fs.readFileSync(path.resolve(__dirname, '/keys/privateAccessKey.pem', 'utf8'));
    let privateKey = "SECRET_KEY_ECN"
    return jwt.verify(token, privateKey)
}
const verifyRefreshToken = (token) => {
    // let privateKey = fs.readFileSync(path.resolve(__dirname, '/keys/privateRefreshKey.pem', 'utf8'));
    let privateKey = "SECRET_KEY_ECN"
    return jwt.verify(token, privateKey)
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}