const express = require('express');
const amqp = require('amqplib');
const winston = require('winston');

const app = express();
const port = 3000;

// Конфигурация логирования
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/microservice_M1.log' }),
  ],
});

// Middleware для логирования HTTP запросов
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Middleware для парсинга JSON данных из HTTP запроса
app.use(express.json());

// Middleware для отправки запроса в RabbitMQ
app.use((req, res, next) => {
  // Подключение к RabbitMQ
  amqp.connect('amqp://localhost').then((conn) => {
    return conn.createChannel();
  }).then((ch) => {
    const queue = 'task_queue';
    const message = JSON.stringify(req.headers); // Stringify the JSON data

    ch.assertQueue(queue, { durable: true });
    ch.sendToQueue(queue, Buffer.from(message), { persistent: true });

    logger.info('Запрос отправлен в RabbitMQ');
    next();
  }).catch((err) => {
    logger.error(`Ошибка при отправке запроса в RabbitMQ: ${err.message}`);
    next();
  });
});

// Запуск сервера М1
app.listen(port, () => {
  logger.info(`Микросервис М1 запущен и слушает порт ${port}`);
});
