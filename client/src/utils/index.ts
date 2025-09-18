export function parseTimelineValue(value: number | string) {
    if (typeof value === "string") return Date.now();
    return value;
}

export function mapValue(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
    const fraction = (value - fromMin) / (fromMax - fromMin);
    return (fraction * (toMax - toMin)) + toMin;
}


export function isRelayUrl(url: string) {
    return url.includes("relay");
}