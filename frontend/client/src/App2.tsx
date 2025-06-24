import { format, milliseconds, millisecondsToSeconds, minutesToMilliseconds, set } from "date-fns"
import "./App.css"
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

const timespan = minutesToMilliseconds(15);
console.log(timespan); // 900000

const timeline = [
    {
        "start": 1745722660015,
        "end": 1745723271015,
        "recordingId": "680d9d24ca0e12c830140664"
    },
    {
        "start": 1745723270007,
        "end": 1745723881007,
        "recordingId": "680d9f86ca0e12c830140719"
    },
    {
        "start": 1745723880017,
        "end": 1745724491017,
        "recordingId": "680da1e8ca0e12c8301407cd"
    },
    {
        "start": 1745724490007,
        "end": "live",
        "recordingId": "680da44aca0e12c830140887"
    }
]

function mapNumber(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
    const mapped01 = (value - fromMin) / (fromMax - fromMin);
    return (mapped01 * (toMax - toMin)) + toMin;
}


function parseTimelineValue(value: number | string) {
    if (!value) return 0;
    if (value === "live") return Date.now();
    if (typeof value === "string") return parseInt(value)
    return value
}

function useTimedRender(ms: number) {
    const [{ }, forceUpdate] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate({});
        }, ms);

        return () => clearInterval(interval);
    }, [ms])
}

export default function App2() {
    const globalStart = timeline[0].start;
    const globalEnd = parseTimelineValue(timeline[timeline.length - 1].end)

    const seekPosRef = useRef<number>(Date.now() - 30 * 1000);
    const seekpos = seekPosRef.current
    const [manualPosition, setManualPosition] = useState<boolean>(false)

    const [[timelineStart, timelineEnd], setTimelineRegion] = useState<[number, number]>([Date.now() - timespan, Date.now()]);

    useTimedRender(1000)


    const [clicked, setClicked] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {

        if (clicked) {
            return;
        }

        if (seekpos >= timelineEnd) {
            // console.log('yes')
            const end = seekPosRef.current + timespan;
            setTimelineRegion([end - timespan, end])
        }

    }, [seekpos])


    useEffect(() => {
        let interval = setInterval(() => {
            seekPosRef.current = seekPosRef.current + 300;
        }, 300)
        return () => clearInterval(interval);
    }, [])

    function handleDown() {
        setClicked(true)
    }


    function handleUp(e: MouseEvent) {

        if (!containerRef.current) return;

        // if (clicked) {
        //     const clientX = e.clientX;

        //     const box = containerRef.current.getBoundingClientRect();

        //     const diff = clientX - box.left;
        //     const diff2 = box.right - box.left;
        //     const fraction = diff / diff2;

        //     seekPosRef.current = timelineStart + (fraction * (timelineEnd - timelineStart));

        //     // update seekPos

        // }

        setClicked(false)

    }

    const handleMove = (e: MouseEvent) => {
        if (!clicked) return;
        if (!containerRef.current) return;

        // should run only for dragging cursor
        // const { clientX } = e;
        // const { left, width } = containerRef.current!.getBoundingClientRect();
        // const percent = (clientX - left) / width;
        // const newStart = mapNumber(percent, 0, 100, globalStart, globalEnd);
        // const newEnd = newStart + timespan;
        // setTimelineRegion([newStart, newEnd])


        if ('movementX' in e) {
            const box = containerRef.current.getBoundingClientRect();
            const movedTime = mapNumber(e.movementX, 0, box.width, 0, timelineEnd - timelineStart);
            console.log(timelineEnd - timelineStart)
            if (e.movementX) {
                // console.log(e.movementX)

                setTimelineRegion(([ts, te]): [number, number] => {
                    ts -= movedTime;
                    if (ts < globalStart) ts = globalStart;
                    if (ts >= globalEnd - timespan) ts = globalEnd - timespan;

                    te = ts + timespan;
                    if (te >= globalEnd) te = globalEnd;

                    return [ts, te];
                });

            }

        }

    };

    // const handleMove = useCallback((e: MouseEvent) => {
    //     if (clicked && containerRef.current && 'movementX' in e) {
    //         // draggedRef.current = true;
    //         const { movementX } = e;
    //         const box = containerRef.current.getBoundingClientRect();
    //         const movedTime = mapNumber(movementX, 0, box.width, 0, timelineEnd - timelineStart);

    //         console.log(timelineStart, timelineEnd, movedTime)

    //         setTimelineRegion(([ts, te]): [number, number] => {
    //             ts -= movedTime;
    //             if (ts < globalStart) ts = globalStart;
    //             if (ts >= globalEnd - timespan) ts = globalEnd - timespan;

    //             te = ts + timespan;
    //             if (te >= globalEnd) te = globalEnd;

    //             return [ts, te];
    //         });
    //         // onSetManual?.(true);
    //     }
    // }, [clicked, containerRef]);

    // const handleMove = (e) => {
    //     {
    //         if (clicked && containerRef.current && 'movementX' in e) {
    //             // draggedRef.current = true;
    //             const { movementX } = e;
    //             const box = containerRef.current.getBoundingClientRect();
    //             const movedTime = mapNumber(movementX, 0, box.width, 0, timelineEnd - timelineStart);
    //             // console.log(timelineEnd - timelineStart)

    //             console.log(box.width)

    //             setTimelineRegion(([ts, te]): [number, number] => {
    //                 ts -= movedTime;
    //                 if (ts < globalStart) ts = globalStart;
    //                 if (ts >= globalEnd - timespan) ts = globalEnd - timespan;

    //                 te = ts + timespan;
    //                 if (te >= globalEnd) te = globalEnd;

    //                 return [ts, te];
    //             });
    //             // onSetManual?.(true);
    //         }
    //     }
    // }
    // console.log(format(timelineStart, "HH:mm:ss"), format(timelineEnd, "HH:mm:ss"))

    useEffect(() => {
        if (!containerRef.current) return;

        // containerRef.current.addEventListener("click", handleDown)
        containerRef.current.addEventListener("mousedown", handleDown)
        containerRef.current.addEventListener("mouseup", handleUp)
        document.addEventListener("mousemove", handleMove)

        return () => {
            containerRef.current?.removeEventListener("click", handleDown)
            containerRef.current?.removeEventListener("mousedown", handleDown)
            containerRef.current?.removeEventListener("mouseup", handleUp)
            document.removeEventListener("mousemove", handleMove)
        }
    })


    const cursorLeft = useMemo(() => {
        const diff = seekpos - timelineStart
        const diff2 = timelineEnd - timelineStart

        return (diff / diff2) * 100
        // return mapNumber(seekpos, timelineStart, timelineEnd, 0, 100)
    }, [timelineStart, timelineEnd, seekpos])


    const times = useMemo(() => {
        const times: [[number, string]] = [];
        const rounding = 60 * 1000;
        for (let i = 0; i < 15; i++) {
            const n = Math.round(mapNumber(i, 0, 15, timelineStart, timelineEnd) / rounding) * rounding;
            const l = mapNumber(n, timelineStart, timelineEnd, 0, 100) + "%";

            times.push([n, l]);
        }



        return times;

    }, [timelineStart, timelineEnd])

    // console.log(times)


    return <div ref={containerRef} className="container">
        <div style={{
            left: cursorLeft +
                "%",
        }} className="cursor">


        </div>
        <div className="dynamic-times">
            {times.map(([time, left]) => {
                // console.log(time)
                return <div key={time} className="time" style={{
                    left: left
                }}>
                    {format(time, "HH:mm:ss")}
                </div>
            })}
        </div>
    </div>
}
