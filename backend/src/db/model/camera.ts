import mongoose from "mongoose";

export interface ICameraDto {
    _id: string,
    name: string,
    rtspServer: string
}


interface Camera extends mongoose.Document {
    name: string,
    rtspServer: string,
    createdAt: Date,
    updatedAt: Date,
    toDto: () => ICameraDto
}

const CameraSchema = new mongoose.Schema<Camera>({
    name: {
        type: String,
        required: [true, "Camera name is required"],
    },
    rtspServer: {
        type: String,
        required: [true, "RTSP server URL is required"],
    }
}, {
    timestamps: true

})

CameraSchema.methods.toDto = function dto() {
    return {
        _id: this._id.toString(),
        name: this.name,
        rtspServer: this.rtspServer
    }
}


export const Camera = mongoose.model<Camera>("Camera", CameraSchema)