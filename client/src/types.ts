import Mpegts from "mpegts.js";

export interface VideoConnection {
    video: HTMLVideoElement;
    player: Mpegts.Player | undefined;
    destroy: () => void;
    lastFrameReceived: number;
}

export interface Timeline {
    start: number;
    end: number | "live";
    recordingId: string;
}

