import File from '../model/File.js';
import Folder from '../model/Folder.js';
import { cloudinary } from '../utils/cloudinary.js';

export const uploadFile = async (req, res) => {
    try {
        const { batchId, folderId, adminId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let path = req.file.originalname;
        let cloudinaryPath = `tutor-mentor/batch-${batchId}`;
        
        if (folderId) {
            const folder = await Folder.findById(folderId);
            if (!folder) {
                return res.status(404).json({ message: 'Folder not found' });
            }
            path = `${folder.path}/${req.file.originalname}`;
            cloudinaryPath += `/folder-${folderId}`;
        }

        // Create the file document
        const file = new File({
            name: req.file.originalname,
            originalName: req.file.originalname,
            url: req.file.path,
            publicId: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            batch: batchId,
            folder: folderId || null,  // Explicitly set folder ID
            uploadedBy: adminId,
            path
        });

        // Save the file
        const savedFile = await file.save();

        res.status(201).json(savedFile);
    } catch (error) {
        console.error('File upload error:', error);
        if (error.code === 11000) {
            res.status(400).json({ message: 'A file with this name already exists in this location' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(file.publicId, {
            resource_type: 'auto',
            invalidate: true
        });

        // Delete from database
        await file.deleteOne();

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFileDetails = async (req, res) => {
    try {
        const { fileId } = req.params;
        const file = await File.findById(fileId)
            .populate('uploadedBy', 'name')
            .populate('folder', 'name path')
            .populate('batch', 'name');

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 