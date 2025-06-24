
import { ChildProcess, spawn } from 'child_process';
import { vars } from '../config';
import { logger } from "../logger"
import { repackRecording } from './repack';

const KILL_TIMEOUT = 60 * 1000;



export abstract class FFMpegProcess {
    input: string
    output: string
    process: ChildProcess | undefined
    pid: number | undefined
    startedAt: number | undefined

    constructor(input: string, output: string) {
        this.input = input;
        this.output = output;
    }

    abstract getArgs(): string[]

    start() {
        let args = this.getArgs();

        this.process = spawn(vars.FFMPEG_PATH, args)
        let pid = this.pid = this.process.pid;

        this.startedAt = Date.now();

        this.process.on("error", (err) => {
            logger.error("FFMPEG ERROR", {
                pid,
                input: this.input,
                output: this.output,
                args,
                error: err
            })
        })

        this.process.on("spawn", () => {
            logger.info("FFMPEG STARTED", {
                pid,
                input: this.input,
                output: this.output,
                startedAt: this.startedAt,
                args
            })

            this.startedAt = Date.now();
        })


        this.process.stderr?.on("error", () => {
        });
        this.process.stdout?.on("error", () => {
        });
        this.process.stdin?.on("error", () => {
        });


        // important, drain the stderr for the first one as well
        this.process.stderr?.on("data", (data) => {

        });

        this.process.on("close", (code) => {
            logger.info("FFMPEG CLOSED", {
                pid,
                input: this.input,
                output: this.output,
                args,
                code: code
            })
            this.process = undefined;
            this.pid = undefined
        })

    }

    isAlive() {
        return this.process !== undefined && this.process.exitCode == null;
    }

    on(eventType: string, handler: () => void) {
        if (this.process) {
            this.process.on(eventType, handler)
        }
    }

    stop() {
        if (this.process) {
            logger.info("ffmpeg: stopping process", {
                pid: this.pid,
            })
            try {
                this.process.stdin?.write("q\n");
                this.process.stdin?.end();

            } catch (err) {
            }
            setTimeout(() => {
                if (this.process && this.isAlive()) {
                    logger.info("ffmpeg: attempting to kill sigkill")
                    this.process?.kill("SIGKILL");
                }
            }, KILL_TIMEOUT)
        }
    }

}