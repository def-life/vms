import { Router } from "express";
import path from "path";
import { vars } from "../../config";
import { Recording } from "../../db/model/recording";
import { startLiveStream } from "../../recording/recordings";
import { Camera } from "../../db/model/camera";
import { Request } from "express";

// TODO: Add all the route handler in try catch wrapper utility.
import { addCamera, deleteCamera, getAllCameras } from "./camera/controller";

const rootRouter = Router();


//cameras
rootRouter.get('/camera', getAllCameras);
rootRouter.post('/camera/add', addCamera);
rootRouter.delete('/camera/delete/:id', deleteCamera);

rootRouter.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is running",
        timestamp: Date.now()
    })
})

rootRouter.get("/flvfile", (req, res) => {
    res.sendFile(path.resolve(vars.RECORDING_PATH + "/test.flv"))
})

rootRouter.get("/timeline/:cameraId", async (req, res: any) => {
    const { cameraId } = req.params;

    try {
        const camera = await Camera.findById(cameraId);
        if (!camera) {
            return res.status(404);
        }
        let timeline = await Recording.find({ cameraId }).sort({ start: 1 });

        let miniTimeline = timeline.map((recording) => recording.miniInfo());

        for (let i = 0; i < miniTimeline.length; i++) {
            if (i === miniTimeline.length - 1) {
                miniTimeline[i].end = "live";
            }
            else if (miniTimeline[i].end === "live") {
                miniTimeline[i].end = miniTimeline[i + 1].start;
            }
        }

        res.status(200).json({
            timeline: miniTimeline,
        })
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Server is running",
            timestamp: Date.now(),
            error: err
        })
    }

})


rootRouter.get("/live/:cameraId", async (req: Request, res: any) => {
    const { cameraId } = req.params;

    let camera = await Camera.findById(cameraId);

    if (!camera) {
        return res.status(404)
    }

    const process = await startLiveStream(camera.toDto());

    if (!process) {
        return res.status(500);
    }

    res.setHeader("Content-Type", "video/x-flv");

    res.status(200);
    process.process?.stdout?.pipe(res);


    res.on("close", () => {
        process.stop();
    });

    req.on("close", () => {
        process.stop();
    }
    );

});


rootRouter.get("/recording/:recordingId", async (req: Request, res: any) => {
    const { recordingId } = req.params;
    const recording = await Recording.findById(recordingId);
    if (!recording) {
        return res.status(404);
    }
    const filePath = path.resolve(vars.RECORDING_PATH, recording.file_path);

    if (!filePath) {
        return res.status(404);
    }

    res.sendFile(filePath);

});

export default rootRouter