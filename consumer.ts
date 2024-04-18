import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getEvent() {
    const url = process.env.URL || "amqp://michi:michi123@52.205.249.137";
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();

    const exchange = 'Maikol';

    await channel.assertExchange(exchange, 'direct', { durable: true });

    const queueName = 'initial';
    const queue = await channel.assertQueue(queueName, { exclusive: false });
    await channel.bindQueue(queue.queue, exchange, '12345');

    console.log('Listening events of RabbitMQ');

    channel.consume(queue.queue, async (mensaje) => {
        if (typeof mensaje === 'string') {
            console.log(JSON.parse(mensaje));
        }
        
        if (mensaje !== null) {
            const id = JSON.parse(mensaje.content.toString());
            const idMmalon = parseInt(id)
            console.log(`Message received: ${id}`);
            try {
                const response = await axios.post('https://hexagonal-2.onrender.com/registrations', { id_venta: id });
            } catch (error) {
                console.log(error);
            }
        }
    }, { noAck: true });

}
getEvent().then((res) => console.log(res)
).catch(console.error);