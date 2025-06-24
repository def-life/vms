import { spawn } from "child_process";
import path from "path"
import { vars } from "../config";
import { logger } from "../logger";
import { randomUUID } from "crypto";
import fs from "fs"

export async function repackRecording(input: string) {
    const tmp_file = path.resolve(vars.RECORDING_PATH, randomUUID() + ".mp4");

    const args = [
        "-hide_banner",
        "-y",
        "-i", input,
        "-movflags", "+faststart",
        "-c", "copy",
        "-f", "mp4",
        tmp_file
    ]

    const ffmpegProcess = spawn(vars.FFMPEG_PATH, args);

    return new Promise((res, rej) => {
        ffmpegProcess.on("error", (err) => {
            logger.error('ffmpeg repack failed', {
                error: err,
                args
            })
            rej(false)
            ffmpegProcess.kill();
        })


        ffmpegProcess.on("close", async (code) => {
            logger.info("ffmpeg repack close", {
                process: ffmpegProcess.pid,
                code
            })

            if (code !== 0) {
                rej(false)
                return
            }

            // Move the tmp file to the original input path
            const originalFile = path.resolve(vars.RECORDING_PATH, input);
            try {
                await fs.promises.rename(tmp_file, originalFile);
            } catch (err) {
                logger.error('Failed to rename tmp file', {
                    error: err,
                    tmp_file,
                    originalFile
                })
                rej(false);
                return;
            }
            res(true)
        })

    })
}