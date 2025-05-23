import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['NoBatch','Pending', 'Accepted', 'Rejected'],
    default: 'NoBatch'
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  },
  recent_files: {
    type: [String],
    default: []
  }
});

export default model('User', userSchema);