import { vars } from "../config";
import { Camera, ICameraDto } from "../db/model/camera";
import { logger } from "../logger";
import { createDirectory } from "../utils";
import { FFMpegProcessRecordingProcess } from "./ffmpegRecordingProcess";
import { randomUUID } from "crypto";
import path from "path"
import { processes } from "./processManager";
import { FFMpegLiveStream } from "./ffmpegliveStream";
import { FFMpegProcess } from "./ffmpegProcess";
import { repackRecording } from "./repack";
import { createRecording, updateRecording } from "../services/recording";


const TEN_MINUTES = 10 * 60 * 1000;

export async function populateRecordings() {
    let cameras = (await Camera.find({})).map((camera) => camera.toDto())
    try {
        await createDirectory(vars.RECORDING_PATH)
    } catch (err) {
        logger.error("Population Recordings", {
            error: err,
            message: "Failed to create recording directory"
        })
        return
    }

    for (let i = 0; i < cameras.length; i++) {
        startRecording(cameras[i])
    }
}

export async function startRecording(camera: ICameraDto) {
    const id = "".concat(camera.name + camera.rtspServer)
    let process = processes.get(id);

    const createProcess = async () => {
        const file_name = path.resolve(vars.RECORDING_PATH, randomUUID() + ".flv");
        const ffmpegProcess = new FFMpegProcessRecordingProcess(camera.rtspServer, file_name);
        processes.set(id, ffmpegProcess);
        ffmpegProcess.start();
        const recording = await createRecording({
            cameraId: camera._id,
            start: ffmpegProcess.startedAt || Date.now(),
            end: "live",
            repack: false,
            file_path: file_name
        })
        ffmpegProcess.setRecording(recording)

        return ffmpegProcess
    }

    if (!process || !process.isAlive()) {
        return await createProcess()
    }

    if (process.startedAt && ((Date.now() - process.startedAt) > TEN_MINUTES)) {
        const ffmpegProcess = await createProcess()
        logger.info("Starting new process as recording is older than 10 minutes", {
            startedAt: process.startedAt,
            now: Date.now(),
            oldProcessId: process.pid,
            newProcessId: ffmpegProcess.pid
        })

        const onData = (data: Buffer) => {
            if (data.toString().includes("frame=") || data.toString().includes("out_time=")) {
                logger.info("New process started writing", {
                    oldProcessId: process.pid,
                    newProcessId: ffmpegProcess.pid
                })
                process.on("close", async () => {
                    await repackRecording(process.output)
                    const recording = process.getRecording();
                    if (recording) {
                        await updateRecording({
                            _id: recording._id,
                            end: Date.now(),
                            repack: true,
                            file_path: process.output,
                        })
                    }
                })
                process.stop();
                ffmpegProcess.process?.stderr?.off("data", onData)
            }
        }
        ffmpegProcess.process?.stderr?.on("data", onData);
    }
}


// ignore pub sub for now
// each request for live stream equal one ffmpeg process
// in future i will introduce a media server to destribute the stream to multiple clients
export function startLiveStream(camera: ICameraDto): FFMpegProcess {
    const process = new FFMpegLiveStream(camera.rtspServer, "-")
    process.start();
    return process;
}