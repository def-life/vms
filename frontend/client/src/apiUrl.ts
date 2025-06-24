export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// recording
export const RECORDING_ROUTE = `${API_URL}/recording`;
export const GET_RECORDING_URL = (recordingId: string) => `${RECORDING_ROUTE}/${recordingId}`;

// live
export const LIVE_ROUTE = `${API_URL}/live`;
export const GET_LIVE_URL = (cameraId: string) => `${LIVE_ROUTE}/${cameraId}`;

// cameras
export const CAMERAS_ROUTE = `${API_URL}/camera`;
export const GET_CAMERAS_URL = `${CAMERAS_ROUTE}`;
export const ADD_CAMERA_URL = `${CAMERAS_ROUTE}/add`;
export const DELETE_CAMERA_URL = (cameraId: string) => `${CAMERAS_ROUTE}/delete/${cameraId}`;