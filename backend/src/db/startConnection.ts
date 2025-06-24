import mongoose from "mongoose";
import { vars } from "../config";
import { logger } from "../logger";

let connection: mongoose.Connection | undefined = undefined

export async function startConnection() {
    if (!connection) {
        let instance = await mongoose.connect(vars.DATABASE_URL);
        connection = instance.connection;
    }
    logger.info("Connected to Database", {
        database: vars.DATABASE_URL
    })
    return connection
}

