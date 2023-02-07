function randomNumber(len) {
    let result = Math.floor(Math.random() * Math.pow(10, len));

    return (result.toString().length < len) ? random(len) : result;
}

function randomChar(len) {
    var text = "";

    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}


module.exports = {
    randomNumber,
    randomChar
};