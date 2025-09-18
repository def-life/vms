import { useEffect, useState } from 'react';
import axios from 'axios';
import './DevicesPage.css';
import { FaCamera, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADD_CAMERA_URL, DELETE_CAMERA_URL, GET_CAMERAS_URL } from '../../apiUrl';


export default function DevicesPage() {
    const [cameras, setCameras] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', rtsp: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCameras();
    }, []);

    const fetchCameras = async () => {
        try {
            const res: any = await axios.get(GET_CAMERAS_URL);
            setCameras(res.data.cameras || []);
        } catch (err) {
            console.error('Error fetching cameras:', err);
        }
    };

    const handleAddCamera = async () => {
        console.log('Form Data:', formData);
        if (!formData.name || !formData.rtsp) {
            console.log("Error")
            toast.error('Please fill in all fields');
            return;
        }
        try {
            const newCamera = {
                name: formData.name,
                rtspServer: formData.rtsp
            };
            const res: any = await axios.post(ADD_CAMERA_URL, newCamera);
            if (res?.data?.success) {
                toast.success('Camera added successfully');
                setCameras([...res.data.camera]);
                setFormData({ name: '', rtsp: '' });
                setShowModal(false);
            } else {
                toast.error(res.data.message || 'Failed to add camera');
            }
        } catch (err) {
            console.error('Error adding camera:', err);
            toast.error('Failed to add camera');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleDeleteCamera = async (cameraId: string) => {
        console.log("HandleDeleteCamera", cameraId)
        try {
            const res: any = await axios.delete(DELETE_CAMERA_URL(cameraId));
            if (res.data.success) {
                setCameras(res?.data?.cameras || []);
                toast.success('Camera deleted successfully');
            }
        } catch (error) {
            toast.error('Failed to delete camera');
        }
    }
    return (
        <div className="devices-container">
            <div className="header">
                <div className="header-left">
                    <FaCamera className="header-icon" />
                    <div>
                        <h2>Devices</h2>
                        <p className="subtitle">Connected camera list</p>
                    </div>
                </div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    <FaPlus /> Add Camera
                </button>
            </div>

            <div>
                <table className="device-table">
                    <thead>
                        <tr>
                            <th>Sr. No</th>
                            <th>Name</th>
                            <th>RTSP link</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cameras.map((camera, index) => (
                            <tr key={camera?._id}
                                onClick={() => navigate(`videoplayback/${camera._id}`)}>
                                <td className='serial-no'>
                                    {index + 1}.
                                    <FaCamera className="table-icon" />
                                </td>
                                <td>{camera?.name}</td>
                                <td>{camera?.rtspServer}</td>
                                <td>
                                    <FaEdit className="action-icon edit-icon" />
                                </td>
                                <td>
                                    <FaTrash
                                        className="action-icon delete-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCamera(camera?._id);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add New Camera</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="Camera Name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="rtsp"
                            placeholder="RTSP Link"
                            value={formData.rtsp}
                            onChange={handleChange}
                        />
                        <div className="modal-buttons">
                            <button className="save-btn" onClick={handleAddCamera}>Save</button>
                            <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
