const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', (connError, connection) => {

    if (connError) throw connError;

    //Create channel
    connection.createChannel((channelError, channel) => {

        if (channelError) throw channelError;

        // Check queue or assert queue
        const TESTQUEUE = 'TEST';
        channel.assertQueue(TESTQUEUE)

        //Receive message from queue
        channel.consume(TESTQUEUE, (msg) => {
            console.log('Testing Message received');
            console.log(msg.content.toString());
        }, {
            noAck: true
        })

    })
})
