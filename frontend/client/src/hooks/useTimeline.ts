import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Timeline } from "../types";

function GETPLAYBACKURL(cameraId: string) {
    // return `http://localhost:8000/v1/recordings/timeline/${cameraId}`;
    return `http://localhost:4000/timeline/${cameraId}`;
}


export default function useTimeline(cameraId: string): { timeline: Timeline[], isLoading: boolean } {
    const [timeline, setTimeline] = useState<{ timeline: Timeline[] }>({ timeline: [] });
    const [isLoading, setLoading] = useState(true)

    const fetchTimeline = useCallback(async () => {
        try {
            setLoading(true)
            const url = GETPLAYBACKURL(cameraId)
            console.log("fetching timeline", url)
            const res = await axios.get(url);
            // if (res.data.errors.length > 0) {
            //     throw new Error(res.data.errors)
            // }

            setTimeline(res.data);
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }, [cameraId])

    useEffect(() => {
        fetchTimeline();
        const timer = setInterval(() => {
            fetchTimeline();
        }, 60 * 1000)


        return () => {
            clearInterval(timer)
        }
    }, [cameraId])



    return { ...timeline, isLoading };
}