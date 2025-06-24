import winston from "winston";
import { vars } from "../config";

const logger = winston.createLogger({
    level: vars.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
})

export {
    logger
}