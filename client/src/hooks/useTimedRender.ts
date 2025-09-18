import { useEffect, useRef, useState } from "react";

export default function useTimedRender(ms: number) {
    const frame = useRef(0);
    const [, forceUpdate] = useState({});

    useEffect(() => {
        forceUpdate({});
        frame.current++;

        const interval = setInterval(() => {
            forceUpdate({});
            frame.current++;
        }, ms);

        return () => clearInterval(interval);
    }, [ms]);

    return frame.current;
}