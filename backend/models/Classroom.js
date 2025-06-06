import { Schema, model } from 'mongoose';

const classroomSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    section: {
        type: String,
        required: true,
        trim: true
    },
    classCode: {
        type: String,
        required: true,
        unique: true,
        length: 6
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    enrolledTeachers: [{
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }],
    materials: [{
        type: Schema.Types.ObjectId,
        ref: 'Material'
    }]
}, {
    timestamps: true 
});

const Classroom = model('Classroom', classroomSchema);

export default Classroom;
