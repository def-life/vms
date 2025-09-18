import { useCallback, useEffect, useRef, useState } from "react";
import useTimeline from "./hooks/useTimeline";
import TimelineComponent from "./Timeline";
import { Timeline } from "./types";
import mpegts from "mpegts.js";
import { minutesToSeconds } from "date-fns";
import { GET_LIVE_URL, GET_RECORDING_URL } from "./apiUrl.ts";
interface VideoPlaybackProps {
    cameraId: string
}

export default function VideoPlayback(props: VideoPlaybackProps) {
    const { cameraId } = props;
    const { timeline } = useTimeline(cameraId);
    const itemRef = useRef<Timeline | null>(null);
    const [src, setSrc] = useState<string | undefined>(undefined);
    const seekPosRef = useRef(Date.now());
    const [videoConnection, setVideoConnection] = useState<{ video: HTMLVideoElement, destroy: () => void, player: mpegts.Player | undefined } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const wrapperRef2 = useRef<HTMLDivElement>(null);
    const seekStartRef = useRef(0);
    const needSeekRef = useRef<number | boolean>(false)
    const itemIndexRef = useRef(0);
    const intervalRef = useRef<number | null>(null);
    const [_, setLiveConnection] = useState<{ video: HTMLVideoElement, destroy: () => void, player: mpegts.Player | undefined } | null>();
    const [showLoader, setShowLoader] = useState(false);

    console.log("wrapper", wrapperRef2)

    console.log("timeline", timeline);



    useEffect(() => {
        if (!wrapperRef2.current) return undefined;

        const wrapper = wrapperRef2.current;

        const liveUrl = GET_LIVE_URL(cameraId);
        setShowLoader(true);
        const lc = createVideoConnection(liveUrl, false, true)

        lc.video.addEventListener("canplay", () => {
            setShowLoader(false);
        });

        setLiveConnection(lc);
        console.log("appended", wrapperRef2.current)
        wrapperRef2.current.appendChild(lc.video);

        lc.video.setAttribute("id", "live-video");
        return () => {
            console.log('why', lc.video, wrapperRef2.current)
            if (lc.video && wrapper) {
                lc.video.removeEventListener("canplay", () => {
                    setShowLoader(false);
                });
                wrapper.removeChild(lc.video);

                console.log('removed')
            }
            lc.destroy();
        }
    }, [])

    function seek(pos: number) {
        handleLoad(pos)
    }

    function switchToLive() {
        setSrc(undefined);
        seekStartRef.current = 0;
        itemIndexRef.current = 0;
        itemRef.current = null;
        clearInterval(intervalRef.current as number);
        intervalRef.current = null;
    }


    const handleLoad = useCallback((seekPos: number) => {
        let idx = timeline.findLastIndex(
            (item) => item.start <= seekPos && (item.end === "live" || item.end > seekPos)
        );


        if (idx < 0) {
            idx = timeline.findIndex((item) => item.end === "live" || seekPos < item.end);
        }
        console.log("xxx idx is ", idx)

        if (idx >= 0) {
            const { recordingId: currentRecordingId } = itemRef.current || {};
            const item = timeline[idx];
            itemRef.current = item;

            const canSeekFile = item.recordingId === currentRecordingId;
            // console.log("idx", idx, "item", item, "currentRecordingId", currentRecordingId, "canSeekFile", canSeekFile);

            console.log("xxx can seek file", canSeekFile)
            if (canSeekFile) {
                // console.log("Seeking within the current file:", item.recordingId);
                if (videoConnection && videoConnection.video) {
                    videoConnection.video.currentTime = (seekPos - item.start) / 1000;
                    // console.log("Seeking to:", (seekPos - item.start) / 1000);
                } else {
                    // console.log("ignored No video connection available");
                }
            } else {
                seekStartRef.current = item.start;
                itemIndexRef.current = idx;
                const url = GET_RECORDING_URL(item.recordingId);
                setSrc(url);
                // console.log("Seeking to a new file:", url);
                needSeekRef.current = seekPos - item.start;
            }

            seekPosRef.current = seekPos;
        } else {
            console.log("no item found");
            return;
        }
    }, [timeline, videoConnection]);


    const handleLoadNext = useCallback(() => {
        const nextItem = timeline[itemIndexRef.current + 1];
        if (nextItem && nextItem.start) {
            const pos = nextItem.start;
            handleLoad(pos);
            console.log("Loading next item:");
        }
    }, [timeline, handleLoad]);

    const handleTimeUpdate = useCallback((e: Event) => {
        if (e.target instanceof HTMLVideoElement) {
            const currentTime = e.target.currentTime;
            const newSeekPos = seekStartRef.current + currentTime * 1000;
            seekPosRef.current = newSeekPos;

            const item = itemRef.current;
            if (item && item.end !== "live" && item.end - seekPosRef.current < 300) {
                console.log("End of the recording reached, seeking to the next item if available");
                handleLoadNext();
            }
        }
    }, [handleLoadNext]);

    const handleLoaded = useCallback((e: Event) => {
        if (e.target instanceof HTMLVideoElement) {
            if (needSeekRef.current !== false) {
                const video = e.target;
                const seekPos = needSeekRef.current;
                console.log("starting interval to seek", seekPos, video.currentTime);
                intervalRef.current = setInterval(() => {
                    console.log("interval inside attempting to seek", seekPos, video.currentTime);
                    video.currentTime = seekPos as number / 1000;

                    if (Math.abs(video.currentTime - (seekPos as number) / 1000) < 1) {
                        clearInterval(intervalRef.current as number);
                        intervalRef.current = null;
                        console.log("Seek successful, interval cleared");
                    }
                }, 500);
                needSeekRef.current = false;
                video.play();
            }
        }
    }, []);

    const onEnded = useCallback((e: Event) => {
        if (e.target instanceof HTMLVideoElement) {
            const isLastRecording = itemRef.current?.end === "live";
            console.log("onended fired", isLastRecording, videoConnection);
            if (isLastRecording && videoConnection?.player) {
                console.log("Last recording ended, no more items to play");
                const currentSeekPos = seekPosRef.current;
                videoConnection.player.unload();
                videoConnection.player.load();
                needSeekRef.current = currentSeekPos - itemRef.current!.start;
                return;
            } else {
                handleLoadNext();
            }
        }
    }, [videoConnection, handleLoadNext]);


    useEffect(() => {
        if (!wrapperRef.current || !src) return;

        const isLastRecording = itemRef.current?.end === "live";
        const connection = createVideoConnection(src, isLastRecording, false)
        setVideoConnection(connection);
        wrapperRef.current.appendChild(connection.video);

        return () => {
            if (connection.video && wrapperRef.current) {
                wrapperRef.current.removeChild(connection.video);
                connection.destroy();
            }
        };


    }, [src])

    useEffect(() => {
        if (videoConnection) {
            const connection = videoConnection;

            connection.video.addEventListener("timeupdate", handleTimeUpdate);
            connection.video.addEventListener("canplay", handleLoaded)
            connection.video.addEventListener("ended", onEnded);


            return () => {
                if (connection.video) {
                    connection.video.removeEventListener("timeupdate", handleTimeUpdate);
                    connection.video.removeEventListener("canplay", handleLoaded)
                    connection.video.removeEventListener("ended", onEnded);
                }
            }

        }


    }, [videoConnection, handleTimeUpdate, handleLoaded, onEnded]);

    useEffect(() => {

    }, []);



    return (
        <main className="main-container">
            <div className={`video-container ${!src ? "single-view" : ""}`}>

                {src && <div ref={wrapperRef} className="video-wrapper">

                </div>
                }
                {showLoader && <div className="loader">Loading...</div>}
                <div className="video-wrapper">
                    <div ref={wrapperRef2} >
                    </div>
                    {!showLoader && <span className="live-button" onClick={switchToLive}>Live</span>}
                </div>

            </div>
            <div>

                {Boolean(timeline.length) && <TimelineComponent timeline={timeline} seek={seek} seekPosRef={seekPosRef} src={src} />}
            </div>
        </main>
    );
}

function createVideoConnection(src: string, isLastRecording: boolean, isLive: boolean) {


    const video = document.createElement("video");

    const result: { video: HTMLVideoElement, destroy: () => void, player: mpegts.Player | undefined } = { video, destroy: () => { }, player: undefined };

    createPlayer(isLive, src, isLastRecording, video).then((p) => {
        console.log("Player created", p);
        result.player = p;
    })

    result.destroy = () => {
        if (result.player) {
            result.player.destroy();
        }
    }

    return result;
}


async function testDirectPlay(url: string) {
    const video = document.createElement("video");
    const promise = new Promise<boolean>((resolve) => {
        video.addEventListener("canplay", () => {
            resolve(true);
        });

        video.addEventListener("error", () => {
            resolve(false);
        });

    });
    video.src = url;
    video.load();
    const bool = await promise;
    video.src = "";
    return bool;
}

async function createPlayer(isLive: boolean, src: string, isLastRecording: boolean, video: HTMLVideoElement) {
    let player: mpegts.Player | undefined;
    if (isLive || isLastRecording || !await testDirectPlay(src)) {
        console.log("important player created")
        player = mpegts.createPlayer({
            type: "mse",
            url: src,
            isLive: isLive
        }, {
            lazyLoadMaxDuration: minutesToSeconds(15),
        }
        );
        player.attachMediaElement(video);
        player.load();
        player.play();

        player.on(mpegts.Events.ERROR, (error) => {
            console.log("MPEG-TS Player Error:", error);


        });

    } else {
        video.src = src;
    }



    // video.controls = true;
    video.autoplay = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.disablePictureInPicture = true
    return player;

}