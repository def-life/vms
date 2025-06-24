import { createRoot } from 'react-dom/client'
import './index.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import VideoPlaybackPage from './pages/VideoPlaybackPage.tsx'
import DevicesPage from './pages/Devices/DevicesPage.tsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')!).render(
  <>
    <ToastContainer />
    <HashRouter>
      <Routes>
        <Route path="/" element={<DevicesPage />} />
        <Route path="/videoplayback/:cameraId" element={<VideoPlaybackPage />} />
        <Route path='*' element={<p>No such Page</p>} />
      </Routes>
    </HashRouter>
  </>,
)

