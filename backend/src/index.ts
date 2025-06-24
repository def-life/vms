import { startServer } from "./server";
import { startCronJobs } from "./cron";
import { startConnection } from "./db/startConnection";

async function main() {
    await startConnection();
    startServer()
    startCronJobs();
}

main()
