import { Request, Response } from 'express';
import { Camera } from '../../../db/model/camera';

export const addCamera = async (req: Request, res: Response) => {
    try {
        const camera = req.body;
        const newCamera = new Camera(camera);
        await newCamera.save();
        console.log("Camera added successfully:", newCamera);
        const camData = await Camera.find({});
        res.status(201).json({
            success: true,
            message: "Camera added successfully",
            camera: camData.map(cam => cam.toDto())
        });
    }
    catch (error) {
        console.error("Error adding camera:", error);
        res.status(500).json({ error: "Failed to add camera" });
    }
}


export const getAllCameras = async (req: Request, res: Response) => {
    try {
        const cameras = await Camera.find({});
        res.status(200).json({
            success: true,
            cameras: cameras.map(camera => camera.toDto())
        });
    } catch (error) {
        console.error("Error fetching cameras:", error);
        res.status(500).json({ error: "Failed to fetch cameras" });
    }
}

export const deleteCamera = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    try {
        const camera = await Camera.findByIdAndDelete(id);
        if (!camera) {
            res.status(404).json({ error: "Camera not found" });
        }
        console.log("Camera deleted successfully:", camera);
        const camData = await Camera.find({});
        res.status(200).json({
            success: true,
            message: "Camera deleted successfully",
            cameras: camData.map(cam => cam.toDto())
        });
    } catch (error) {
        console.error("Error deleting camera:", error);
        res.status(500).json({ error: "Failed to delete camera" });
    }
}