const winston = require('winston');
const { combine, format, timestamp, json, errors, printf, colorize } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  // format: combine(errors({ stack: true }), timestamp(), json()),
  format: combine(
    colorize(),
    timestamp(),
    printf(({ timestamp, level, request, message }) => `${timestamp} ${level}: ${request ? request : "app"} ${message}`)
  ),
  transports: [new winston.transports.Console()],
  defaultMeta: { service: 'Tasks' },

});

module.exports = logger;