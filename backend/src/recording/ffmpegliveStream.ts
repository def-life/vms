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


    // Refers to the NOTE of README.md
    //     getArgs(): string[] {

    //  const args: string[] = [

    // "-hide_banner",

    // "-threads", "1",

    // "-y",

    // "-fflags", "nobuffer",

    // "-fflags", "discardcorrupt",



    // "-flags", "low_delay",



    // "-strict", "experimental",



    // "-analyzeduration", "0",



    // "-avioflags", "direct",



    // "-rtsp_flags", "prefer_tcp",

    // "-rtsp_transport", "tcp",



    // "-i", this.input,



    // // 🔹 Force baseline@3.0 for browser

    // "-c:v", "libx264",

    // "-profile:v", "baseline",

    // "-level", "3.0",

    // "-preset", "veryfast",

    // "-tune", "zerolatency",



    // // 🔹 Audio (re-encode to AAC for FLV)

    // "-c:a", "aac",

    // "-ar", "44100",

    // "-b:a", "128k",



    // "-flvflags", "no_duration_filesize",

    // "-f", "flv",

    // this.output

    //  ]



    // return args;

    // }



}