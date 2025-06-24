import path from "path"

export const vars = {
    FFMPEG_PATH: process.env.FFMPEG_PATH || "/usr/bin/ffmpeg",
    LOG_LEVEL: process.env.LOG_LEVEL || "debug",
    PORT: process.env.PORT || 4000,
    RECORDING_PATH: process.env.RECORDING_PATH || path.resolve(__dirname, "../../data"),
    DATABASE_URL: process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/VMS"

}