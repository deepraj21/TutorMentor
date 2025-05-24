import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    path: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create a compound index to ensure unique file names within the same folder and batch
fileSchema.index({ name: 1, folder: 1, batch: 1 }, { unique: true });

const File = mongoose.model('File', fileSchema);
export default File; 