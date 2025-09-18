import { useEffect, useRef } from "react";
import mpegts from "mpegts.js"

// Easy sample to understand live recording.

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekPosRef = useRef<number>(0);
  const needSeekAfterLoad = useRef<boolean | number>(false);
  const playerRef = useRef<mpegts.Player | null>(null);

  function seek(pos: number) {
    if (!videoRef.current) return;
    if (!playerRef.current) return;

    let intervalId = setInterval(() => {

      if (videoRef.current) {
        try {
          videoRef.current.currentTime = seekPosRef.current;

        } catch { }
        if (Math.abs(videoRef.current.currentTime - pos) < 1) {
          clearInterval(intervalId);
        }

      }

    }, 300)

  }

  function handleLoad() {
    console.log('handle load')
    if (needSeekAfterLoad.current) {
      seek(seekPosRef.current);
      needSeekAfterLoad.current = false;
    }
  }

  function loadLastRecording() {
    if (!videoRef.current) return;
    if (!playerRef.current) return;

    playerRef.current.unload();
    playerRef.current.load();
  }


  function handleEnded() {
    console.log("ended")
    let currentPosition = seekPosRef.current;
    needSeekAfterLoad.current = currentPosition;
    loadLastRecording();
  }



  function handleTimeUpdate(e: any) {
    if (!videoRef.current) return;
    if (!playerRef.current) return;
    if (needSeekAfterLoad.current === false) {
      seekPosRef.current = e.target.currentTime;
      console.log(seekPosRef.current)
    }
  }

  useEffect(() => {
    if (!videoRef.current) return;

    if (mpegts.getFeatureList().mseLivePlayback) {
      var player = mpegts.createPlayer({
        type: 'mse',  // could also be mpegts, m2ts, flv
        isLive: false,
        url: 'http://localhost:4000/flvfile'
      });
      playerRef.current = player;
      player.attachMediaElement(videoRef.current);
      player.load();
      player.play();
      // videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      // videoRef.current.addEventListener('ended', handleEnded);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      // videoRef?.current?.removeEventListener('timeupdate', handleTimeUpdate);
      // videoRef?.current?.removeEventListener('ended', handleEnded);
    }

  }, [videoRef])

  return (
    // <div className="App">
    <video onEnded={handleEnded} onError={handleEnded} onCanPlay={handleLoad} onTimeUpdate={handleTimeUpdate} ref={videoRef} id="video" width="640" height="480" controls />
    // </div>
  )
}