import mongoose, { Schema, Types } from "mongoose";


export interface IRecordingDto {
    _id: string,
    start: number,
    end: number | "live",
    cameraId: string,
    repack: boolean,
    file_path: string
}
export interface IMini {
    recordingId: string,
    start: number,
    end: number | "live"
}

interface Recording extends mongoose.Document {
    start: number,
    end: number | "live",
    repack: boolean,
    createdAt: Date,
    updatedAt: Date,
    cameraId: Types.ObjectId,
    file_path: string,
    toDto: () => IRecordingDto
    miniInfo: () => IMini
}

const RecordingSchema = new mongoose.Schema<Recording>({
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Schema.Types.Mixed,
        validate: {
            validator: (v) => {
                return typeof v === "number" || v === "live"
            },
            message: props => `${props.value} must be a string literal 'live' or number`
        },
        required: true,
        default: "live"
    },
    cameraId: {
        type: Schema.Types.ObjectId,
        ref: "Camera",
        required: true
    },
    repack: {
        type: Boolean,
        required: true
    },
    file_path: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

RecordingSchema.methods.toDto = function dto() {
    return {
        _id: this._id.toString(),
        start: this.start,
        end: this.end,
        repack: this.repack,
        cameraId: this.cameraId.toString(),
        file_path: this.file_path
    }
}

RecordingSchema.methods.miniInfo = function miniInfo() {
    return {
        recordingId: this._id.toString(),
        start: this.start,
        end: this.end,
    }
}

export const Recording = mongoose.model<Recording>("Recording", RecordingSchema)
