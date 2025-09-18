# Simple VMS Implementation

## About

This is a simple Video Management System (VMS). Add a camera RTSP stream via the frontend, and the backend will start recording and save the media content to files. These recording files can then be accessed via the client.

## Usage

### Starting the System

1. Start the application:
   ```bash
    docker compose up
   ```

2. Stop the application(use -v flag to remove volume):
   ```bash
   docker compose down
   ```

3. Access the web interface at `http://localhost:5173`


Note: Please configure your camera to stream H.264 (AVC, e.g. avc1.42c01e) video with a compatible profile/level (Baseline/Main, Level ≤ 4.0).
Other codecs may not play correctly since the ffmpeg copies the stream without transcoding in my implementation but you can uncomment the code to modify it.