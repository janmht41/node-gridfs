import winston from "winston";
const { combine, timestamp, json } = winston.format;
import { config } from "dotenv";
config();
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({
      filename: "./logs/combined.log",
    }),
    new winston.transports.File({
      filename: "./logs/app-error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "app-info.log",
      level: "info",
      format: combine(infoFilter(), timestamp(), json()),
    }),
  ],
});
