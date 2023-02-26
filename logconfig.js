const winston = require("winston");
const { combine, timestamp, json } = winston.format;
require("dotenv").config;
// combined log file for all log events ;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: "combined.log",
    }),
  ],
});

module.exports = { logger };
