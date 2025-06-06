import mongoose from 'mongoose';

const materialLibrarySchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  sharedAt: {
    type: Date,
    default: Date.now
  }
});

const MaterialLibrary = mongoose.model('MaterialLibrary', materialLibrarySchema);

export const findOne = MaterialLibrary.findOne.bind(MaterialLibrary);
export const find = MaterialLibrary.find.bind(MaterialLibrary);
export const countDocuments = MaterialLibrary.countDocuments.bind(MaterialLibrary);

export default MaterialLibrary; 