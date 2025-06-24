import { use, useEffect, useRef, useState } from "react";
import { createVideoConnection } from "./utils/video";
import { VideoConnection } from "./types";

export default function Video({
    url
}: {
    url: string
}) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [videoConnection, setVideoConnection] = useState<VideoConnection | null>(null);
    const [isLoading, setIsLoading] = useState(true);



    useEffect(() => {
        const conn = createVideoConnection(url);
        setVideoConnection(conn)

    }, [])

    useEffect(() => {
        if (url && videoConnection && wrapperRef.current) {
            wrapperRef.current.appendChild(videoConnection.video);

            function handleCanPlay() {
                console.log("canplay")
                setIsLoading(false)

            }

            videoConnection.video.addEventListener("canplay", handleCanPlay)

            return () => {
                videoConnection.video.removeEventListener("canplay", handleCanPlay)
            }
        }

        return undefined;
    })

    return (
        <>
            <div ref={wrapperRef}>

            </div>
            <div>{isLoading ? "loading" : ""}</div>
        </>

    );
}