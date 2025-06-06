import { Schema, model } from 'mongoose';

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    enrolledClassrooms: [{
        type: Schema.Types.ObjectId,
        ref: 'Classroom'
    }]
}, {
    timestamps: true
});

const Student = model('Student', studentSchema);

export default Student;
