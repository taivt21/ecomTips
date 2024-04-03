const amqp = require("amqplib");
const messages = "hello and wellcome rabbitMQ";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost");
    const channel = await connection.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName);

    //send a message to consumer channel
    channel.sendToQueue(queueName, Buffer.from(messages));
    console.log(`message sent : ${messages}`);
  } catch (error) {
    console.error(error);
  }
};

runProducer().catch(console.error);
