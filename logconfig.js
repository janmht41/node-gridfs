import winston from "winston";
const { combine, timestamp, json } = winston.format;
import { config } from "dotenv";
config();
// combined log file for all log events ;
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: "./logs/combined.log",
    }),
  ],
});
