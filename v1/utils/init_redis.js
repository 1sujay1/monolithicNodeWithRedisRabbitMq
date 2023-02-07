const redis = require('redis');

const client = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    // legacyMode: true
});
// const asyncRedis = require("async-redis");

// const asyncRedisClient = asyncRedis.decorate(client);

(async () => {

    try {
        client.on('error', (err) => console.log('Redis Client Error', err));

        await client.connect();

        let pinged = await client.ping();

        if (!pinged || pinged !== "PONG") {
            return console.log("Redis not connected");
        }
        console.log("client connected to redis");

        // Below is the syntax for getting keys
        // let dataRedis = await client.keys("*")

        // const newARRAY = await dataRedis.map(async (key) => {
        //     let keyType = await client.type(key)
        //     if (keyType === 'string') {

        //         return await client.get(key)
        //     }
        // })
        // Promise.all(newARRAY).then((values) => {
        //     console.log(values);
        // });

    } catch (error) {
        console.log("Error connecting to redis", error);
    }

})();

// client.on("ready", () => {
//     console.log("redis client is ready to use");
// });
// try {
//     client.set("key", "value", redis.print);

// } catch (error) {
//     console.log(error);
// }

// client.on("error", (err) => {
//     console.log("redis error", err.message);
// })

// client.on("end", () => {
//     console.log("redis client disconnected");
// });

process.on("SIGINT", () => {
    console.log("process.on SIGINT");
    client.quit();
    process.exit(0);
})


module.exports = client;