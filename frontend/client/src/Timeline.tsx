import { format, minutesToMilliseconds } from "date-fns";
import useTimedRender from "./hooks/useTimedRender";
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { parseTimelineValue, mapValue } from "./utils";
import { Timeline } from "./types";

const TIMESPAN = minutesToMilliseconds(15);
const TIME_FORMAT = "HH:mm:ss";
const SHORT = 15;
const ROUNDING = 60 * 1000;
const MANUAL_TIMEOUT = 5000;

// inputs will be these


// via api call
// const timeline = [
//     {
//         "start": 1745722660015,
//         "end": 1745723271015,
//         "recordingId": "680d9d24ca0e12c830140664"
//     },
//     {
//         "start": 1745723270007,
//         "end": 1745723881007,
//         "recordingId": "680d9f86ca0e12c830140719"
//     },
//     {
//         "start": 1745723880017,
//         "end": 1745724491017,
//         "recordingId": "680da1e8ca0e12c8301407cd"
//     },
//     {
//         "start": 1745724490007,
//         "end": "live",
//         "recordingId": "680da44aca0e12c830140887"
//     }
// ]


// currentPosition should also come via input
// seekPos

type TimelineProps = {
    timeline: Timeline[];
    seek: (pos: number) => void;
    seekPosRef: React.MutableRefObject<number>;
    src: string | undefined;
}

export default function TimelineComponent(props: TimelineProps) {
    const { timeline, seek, seekPosRef, src } = props;
    const [clicked, setClicked] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const globalStart = timeline[0].start;
    const globalEnd = parseTimelineValue(timeline[timeline.length - 1].end)
    const [manualPosition, setManualPosition] = useState(0);

    const [[timelineStart, timelineEnd], setTimelineRegion] = useState([globalEnd - TIMESPAN, globalEnd])
    // const seekPosRef = useRef(Date.now());
    const seekpos = seekPosRef.current;
    const frame = useTimedRender(1000);
    useEffect(() => {
        if (!src) {
            seekPosRef.current = Date.now();
        }
    }, [frame, src])

    useTimedRender(1000);

    function handleMouseDown(e: React.MouseEvent) {
        if (!containerRef.current) return;
        setClicked(true)
    }

    useEffect(() => {
        if (manualPosition || !seekPosRef.current || clicked) {
            return
        }

        if (seekPosRef.current >= timelineEnd && seekPosRef.current - timelineEnd <= 1000) {
            const end = Math.min(seekPosRef.current + TIMESPAN, globalEnd);
            const start = Math.max(end - TIMESPAN, globalStart);
            setTimelineRegion([start, end])
            return;
        }

        if (seekPosRef.current >= timelineEnd || seekPosRef.current < timelineStart) {
            const end = Math.min(seekPosRef.current + TIMESPAN / 2, globalEnd);
            const start = Math.max(end - TIMESPAN, globalStart);
            setTimelineRegion([start, end])
        }

    }, [manualPosition, seekpos, timelineStart, timelineEnd, globalEnd, globalStart, seekPosRef.current])

    useEffect(() => {
        if (manualPosition) {
            const timeout = setTimeout(() => {
                setManualPosition(0);
            }, MANUAL_TIMEOUT);
            return () => {
                clearTimeout(timeout);
            };
        }
        return undefined;

    }, [manualPosition])


    const handleMouseUp = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (containerRef.current && !draggingRef.current && clicked) {
            const box = containerRef.current.getBoundingClientRect();
            seekPosRef.current = mapValue(e.clientX, box.left, box.right, timelineStart, timelineEnd);

            // TODO: call handleSeek(seekPosRef.current)
            seek(Math.floor(seekPosRef.current))
            console.log("xxx", "seek called")

        }
        setClicked(false)
        draggingRef.current = false
    }, [clicked, containerRef])

    const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
        if ("movementX" in e && clicked && containerRef.current) {
            draggingRef.current = true;
            setManualPosition(Date.now())
            const { movementX } = e;
            const box = containerRef.current.getBoundingClientRect();
            const moved = mapValue(movementX, 0, box.width, 0, timelineEnd - timelineStart)
            setTimelineRegion(([ts, te]) => {
                ts -= moved;
                if (ts < globalStart) ts = globalStart;
                if (ts >= globalEnd - TIMESPAN) ts = globalEnd - TIMESPAN;

                te = ts + TIMESPAN;
                if (te >= globalEnd) te = globalEnd;

                return [ts, te];
            })

        }
    }, [clicked, containerRef, setManualPosition])

    const seekPosLeft = useMemo(() => {
        const newLeft = mapValue(seekPosRef.current, timelineStart, timelineEnd, 0, 100);
        return newLeft + "%";
    }, [seekPosRef.current, timelineStart, timelineEnd])

    const times = useMemo(() => {
        const times: [number, string][] = [];

        for (let i = 0; i < SHORT; i++) {
            const time = Math.round((mapValue(i, 0, SHORT, timelineStart, timelineEnd) / ROUNDING)) * ROUNDING;
            const left = mapValue(time, timelineStart, timelineEnd, 0, 100) + "%";
            times.push([time, left])
        }

        return times;

    }, [timelineStart, timelineEnd, seekPosRef.current])


    useEffect(() => {
        if (!containerRef.current) return;


        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [handleMouseMove, handleMouseUp])

    return (
        <div className="timeline-root">

            <div
                onMouseDown={handleMouseDown}
                ref={containerRef}
                className="timeline">
                <div style={{ left: seekPosLeft }} className="cursor"></div>

            </div>
            <div className="times dynamic-times">
                {times.map((time, i) => {
                    return <div key={i} className="time">
                        <span style={{ left: time[1] }}>{format(time[0], TIME_FORMAT)}</span>
                    </div>
                })}
            </div>
            <div className="times">
                {[timelineStart, timelineEnd].map((time, i) => {
                    return <div key={i} className="time">
                        {format(time, TIME_FORMAT)}
                    </div>
                })}
            </div>
        </div>
    )
}