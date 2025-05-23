import { Schema, model } from 'mongoose';

const batchSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  batchCode: {
    type: String,
    required: true,
    unique: true,
    length: 4
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  students: [{
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['NoBatch','Pending', 'Accepted', 'Rejected'],
      default: 'NoBatch'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('Batch', batchSchema);