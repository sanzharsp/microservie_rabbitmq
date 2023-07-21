const amqp = require('amqplib');
const winston = require('winston');

// Конфигурация логирования
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/microservice_M2.log' }),
  ],
});

// Подключение к RabbitMQ и обработка заданий
amqp.connect('amqp://localhost').then((conn) => {
  return conn.createChannel();
}).then((ch) => {
  const queue = 'task_queue';

  ch.assertQueue(queue, { durable: true });
  ch.prefetch(1);

  logger.info('Микросервис М2 ожидает задания из RabbitMQ');

  ch.consume(queue, (msg) => {
    const message = JSON.parse(msg.content.toString());

    // Предполагается, что тут будет обработка задания из RabbitMQ
    // и результат отправится обратно в другую очередь или в базу данных

    logger.info(`Задание обработано: ${JSON.stringify(message)}`);

    ch.ack(msg);
  });
}).catch((err) => {
  logger.error(`Ошибка при подключении к RabbitMQ или обработке заданий: ${err.message}`);
});

