import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    pdfLinks: [{
        type: String,
        required: true
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    }
}, {
    timestamps: true
});

const Material = mongoose.model('Material', materialSchema);

export const findById = Material.findById.bind(Material);

export default Material; 