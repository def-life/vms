import express from "express";
import { vars } from "../config";
import { logger } from "../logger";
import rootRouter from "./routes/rootRoutes";
import cors from "cors";
import { morganMiddleware } from "./middlewares/morgan";


export function startServer() {

    const app = express();
    app.use(morganMiddleware)
    app.use(cors({
        origin: "*"
    }))

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));


    app.use("/", rootRouter)

    app.listen(vars.PORT, () => {
        logger.info("Server Started", {
            port: vars.PORT
        })
    })
}


export default startServer;