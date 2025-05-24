import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    parentFolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    createdBy: {
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

// Create a compound index to ensure unique folder names within the same parent folder and batch
folderSchema.index({ name: 1, parentFolder: 1, batch: 1 }, { unique: true });

const Folder = mongoose.model('Folder', folderSchema);
export default Folder; 