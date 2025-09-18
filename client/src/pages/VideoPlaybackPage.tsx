import { useNavigate, useParams } from "react-router-dom"
import VideoPlayback from "../VideoPlayback";

export default function VideoPlaybackPage() {
    const { cameraId } = useParams();
    const navigate = useNavigate();

    if (!cameraId) {
        return <div>
            NO Camera ID Provided
        </div>
    }


    const handleGoToHome = () => {
        navigate("/");

    };
    return (
        <div className="video-playback-page">
            <div className="child-1">
                <button onClick={handleGoToHome}>Go to Home</button>
            </div>
            <div className="child-2">
                <VideoPlayback cameraId={cameraId} />
            </div>
        </div>
    );
}