import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher']
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true
    },
    parts: [{
      text: {
        type: String,
        required: true
      },
      images: [String]
    }]
  }],
  title: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Chat', chatSchema);