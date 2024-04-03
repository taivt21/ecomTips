const amqp = require("amqplib");
const messages = "hello and wellcome rabbitMQ";

const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost");
    const channel = await connection.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true,
    });

    //send a message to consumer channel
    channel.consume(
      queueName,
      (messages) => {
        console.log(`'Received message: ${messages.content.toString()}`);
      },
      {

        //true: ko xu li cai nhan roi, false van hien thi cai nhan roi
        noAck: true,
      }
    );
    console.log(`message sent : ${messages}`);
  } catch (error) {
    console.error(error);
  }
};

runConsumer().catch(console.error);
