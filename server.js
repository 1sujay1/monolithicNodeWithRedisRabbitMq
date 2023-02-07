const express = require('express');

const { PORT } = require('./config');
const expressApp = require('./express-app');
const databaseConnection = require('./connection');

const StartServer = async () => {

    const app = express();

    await databaseConnection();
    await expressApp(app);

    app.listen(PORT, () => {
        console.log(`listening to port ${PORT}`);
    })
        .on('error', (err) => {
            console.log(err);
            process.exit()
        })


    require('./v1/utils/queue/sender.js')
    require('./v1/utils/queue/receiver.js')
    require('./v1/utils/init_redis.js')

    // const resp = await redisAndToken("1234", '4567', "24", 'STUDENT');
    // console.log("resp", resp);

}
StartServer();