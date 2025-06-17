import mongoose from 'mongoose';

const expressionSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    type: {
        type: String,
        enum: ['math', 'graph'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Add index for faster search by title
expressionSchema.index({ title: 'text' });

const Expression = mongoose.model('Expression', expressionSchema);

// Export the model and its methods
export const find = (query) => Expression.find(query);
export const findOneAndUpdate = (query, update, options) => Expression.findOneAndUpdate(query, update, options);
export const findOneAndDelete = (query) => Expression.findOneAndDelete(query);

export default Expression; 