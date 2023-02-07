const bcrypt = require('bcryptjs');
const axios = require("axios");

//Utility functions
module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hashSync(password, salt)
}

module.exports.ValidatePassword = async (enteredPassword, savedPassword) => {
    return await bcrypt.compareSync(enteredPassword, savedPassword)
}

module.exports.FormatData = (res, status, message, dataRes) => {
    if (status) {
        const data = {
            status,
            message: [message],
            data: dataRes
        }
        return res.json(data);
    } else {
        const data = {
            status,
            message: [message]
        }
        return res.json(data);
    }
}

//Just a Demo of connecting to other service
// module.exports.PublishDatabaseEvent = async (action) => {
//     try {
//         const apiResult = await axios.post("http://localhost:12000/database/app-events",
//             {
//                 action
//             })
//         return apiResult.data;
//     } catch (error) {
//         console.log("Publish Error", error.response.statusText);
//         throw error
//     }

// }
