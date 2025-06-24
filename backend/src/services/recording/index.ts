import { Recording } from "../../db/model/recording";

interface ICreateRecording {
    cameraId: string,
    start: number,
    end: number | "live",
    repack: boolean,
    file_path: string
}

export async function createRecording(recording: ICreateRecording) {
    const { cameraId, start, end = "live", repack = false, file_path } = recording;

    const newRecording = new Recording({
        cameraId,
        start,
        end,
        repack,
        file_path
    });
    await newRecording.save();
    return newRecording.toDto();
}

export async function updateRecording(recording: Partial<Omit<ICreateRecording, "cameraId" | "start">> & { _id: string }) {
    const { _id, end, repack, file_path } = recording;

    const updateRecorded = await Recording.findById(_id);
    if (!updateRecorded) {
        throw new Error("Recording not found");
    }
    if (end) {
        updateRecorded.end = end;
    }
    if (repack) {
        updateRecorded.repack = repack;
    }
    if (file_path) {
        updateRecorded.file_path = file_path;
    }

    await updateRecorded.save();
    return updateRecorded.toDto();
}