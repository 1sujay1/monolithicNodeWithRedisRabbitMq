const mongoose = require('mongoose');
const { DB_URL } = require('./config');

module.exports = async () => {
    try {

        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Connected to DB", DB_URL);
    } catch (error) {
        console.log('Error connecting to DB=================');
        console.log(error);
        process.exit(1);//1 for because since this exception not handled by us
    }
}