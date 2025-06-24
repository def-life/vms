import { FFMpegProcess } from "./ffmpegProcess";

export class FFMpegLiveStream extends FFMpegProcess {
    constructor(input: string, output: string) {
        super(input, output)
    }

    getArgs(): string[] {
        const args: string[] = [
            "-hide_banner",
            "-threads", "1",
            "-y",
            '-fflags', 'nobuffer',
            '-fflags', 'discardcorrupt',

            "-flags", "low_delay",

            "-strict", "experimental",

            "-analyzeduration", "0",

            "-avioflags", "direct",

            "-rtsp_flags", "prefer_tcp",

            "-rtsp_transport", "tcp",

            "-i", this.input,
            "-c", "copy",

            "-tune", "zerolatency",

            "-flvflags", "no_duration_filesize",
            "-f", "flv",
            this.output
        ]


        return args;
    }
}