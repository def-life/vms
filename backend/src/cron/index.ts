import schedule from "node-schedule";
import { populateRecordings } from "../recording/recordings";
import { logger } from "../logger";

export function startCronJobs() {
    logger.info("Cron Job Started:")
    schedule.scheduleJob("*/15 * * * * *", () => {
        populateRecordings()
    })
}


