import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req) => {
            // Get batch and folder information from request
            const { batchId, folderId } = req.body;
            let folderPath = `tutor-mentor/batch-${batchId}`;
            
            // If there's a folderId, we'll add it to the path
            if (folderId) {
                folderPath += `/folder-${folderId}`;
            }
            
            return folderPath;
        },
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto',
        // Add timestamp to filename to prevent duplicates
        public_id: (req, file) => {
            const timestamp = Date.now();
            const originalName = file.originalname.split('.')[0];
            return `${originalName}-${timestamp}`;
        }
    }
});

const upload = multer({ storage: storage });

export { cloudinary, upload }; 