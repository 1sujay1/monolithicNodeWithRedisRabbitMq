const amqp = require('amqplib/callback_api');

const AMQP_CONNECTION = process.env.AMQP_CONNECTION;

let ch = null;

amqp.connect(AMQP_CONNECTION, (connError, connection) => {
    if (connError) {
        throw connError
    }

    // Create channel
    connection.createChannel((channelError, channel) => {
        if (channelError) {
            throw channelError;
        }
        console.log('AMQP Connected');
        ch = channel;

        //Check the queue or assert queue
        const QUEUE = 'TEST';
        channel.assertQueue(QUEUE)
        channel.sendToQueue(QUEUE, Buffer.from("RabbitMQ Working successfully."))
        // Send message to queue
        console.log(`Message sent to ${QUEUE}`);
    })
})


const publishToQueue = async (queueName, data) => {
    const QUEUE = queueName;
    ch.assertQueue(QUEUE);
    ch.sendToQueue(QUEUE, Buffer.from(data))
}

process.on('exit', (code) => {
    ch.close();
    console.log('Closing RabbitMQ Channel');
})

module.exports = {
    publishToQueue
}