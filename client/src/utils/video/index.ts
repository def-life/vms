import Mpegts from "mpegts.js";
import { isRelayUrl } from "..";
import { VideoConnection } from "../../types";
import { connectionCache } from "./connectionManger";
import mpegts from "mpegts.js"


// http://localhost:8000/v1/cameras/relay/6820696f97b91096421e5b72?height=720

async function createPlayer(url: string, video: HTMLVideoElement, isLive: boolean) {
    let player: Mpegts.Player | undefined = undefined

    try {

        if (isLive || !await testDirectPlay(url)) {
            player = mpegts.createPlayer({
                type: 'mse',  // could also be mpegts, m2ts, flv
                isLive,
                url
            });
            player.attachMediaElement(video);
            player.load();
            player.play();

        } else {
            video.src = url;
            video.play();
        }

        return player;
    } catch (err) {
        return;
    }



}


async function testDirectPlay(url: string) {
    const video = document.createElement("video");
    const promise = new Promise((resolve) => {
        video.addEventListener("canplay", () => {
            resolve(true);
        })
        video.addEventListener("error", () => {
            resolve(false);
        })
        video.src = url;

    })

    const result = await promise;
    video.src = ""
    return result;
}

export function createVideoConnection(url: string) {

    let existingConnection = connectionCache.get(url);
    if (existingConnection) {
        return existingConnection;
    }

    const video = document.createElement('video');
    console.log("[createVideoConnection] video element created ");
    const isLive = isRelayUrl(url);
    let connection: VideoConnection = {
        video,
        player: undefined,
        destroy,
        lastFrameReceived: 0
    }

    createPlayer(url, video, isLive).then((player) => {
        connection.player = player;
    })

    function destroy(force: boolean = false) {
        if (!isLive || force) {
            if (connection.player) {
                connection.player.destroy();
                connection.player = undefined;
                connectionCache.delete(url);
            }
        }
    }

    if (isLive) {
        connectionCache.set(url, connection);
    }

    return connection
}


// video element/ player if there is an error then i want to reconnect again obviously onended is natural for last recording
// but error is bad so destroy player in that case.
