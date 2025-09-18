import { FFMpegProcess } from "./ffmpegProcess";
import { IRecordingDto } from "../db/model/recording";


/**
 * NOTE: if using -c copy flag then frame= will not be emitted as this only get emitted in stderr when encoding and decoding
 * so workaround is to use -progress pipe:2 and check existance of out_time= or progress=
 * 
 * NOTE: For some unknown reason, i was facing the issue that the process would not exit after 10 minutes of recording on ffmpeg + udp.
 * 
 * 
 */

export class FFMpegProcessRecordingProcess extends FFMpegProcess {
    recording: IRecordingDto | undefined;

    constructor(input: string, output: string) {
        super(input, output)
    }

    getRecording(): IRecordingDto | undefined {
        return this.recording;
    }

    setRecording(recording: IRecordingDto) {
        this.recording = recording;
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
            // these 4 option refer to my NOTE of readme.md
            // "-c:v", "libx264",
            // "-profile:v", "baseline",

            // "-level", "3.0",

            // "-preset", "veryfast",

            "-tune", "zerolatency",

            // refer to my NOTE of readme.md
            // "-c:a", "aac",

            // "-ar", "44100",

            // "-b:a", "128k",

            "-flvflags", "no_duration_filesize",

            "-f", "flv",
            "-progress", "pipe:2",

            this.output

        ];

        return args

    }
}