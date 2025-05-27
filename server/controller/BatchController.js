import Batch from '../model/Batch.js';
import User from '../model/User.js';
import { generateBatchCode } from '../utils/BatchCodeGenerator.js';
import { cloudinary } from '../utils/cloudinary.js';

export const createBatch = async (req, res) => {
  try {
    const { name, adminId } = req.body;

    let batchCode;
    let isUnique = false;
    while (!isUnique) {
      batchCode = generateBatchCode();
      const existingBatch = await Batch.findOne({ batchCode });
      if (!existingBatch) {
        isUnique = true;
      }
    }

    const batch = new Batch({
      name,
      batchCode,
      createdBy: adminId
    });

    await batch.save();

    // Create Cloudinary folder for this batch
    await cloudinary.api.create_folder(`tutor-mentor/batch-${batch._id}`);

    res.status(201).json({ message: 'Batch created successfully', batch });
  } catch (error) {
    res.status(500).json({ message: 'Error creating batch', error: error.message });
  }
};

export const joinBatch = async (req, res) => {
  try {
    const { batchCode, studentId } = req.body;
    
    const batch = await Batch.findOne({ batchCode });
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const existingStudent = batch.students.find(
      s => s.student.toString() === studentId.toString()
    );
    if (existingStudent) {
      return res.status(400).json({ message: 'Already joined this batch' });
    }

    batch.students.push({
      student: studentId,
      status: 'Pending'
    });
    await batch.save();

    await User.findByIdAndUpdate(studentId, { 
      batch: batch._id,
      status: 'Pending' 
    });

    res.status(200).json({ message: 'Join request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining batch', error: error.message });
  }
};

export const updateStudentStatus = async (req, res) => {
  try {
    const { batchId, studentId, status, adminId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (batch.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update status' });
    }

    // Update student status
    const studentIndex = batch.students.findIndex(
      s => s.student.toString() === studentId
    );
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in batch' });
    }

    batch.students[studentIndex].status = status;
    await batch.save();

    // Update user's status
    await User.findByIdAndUpdate(studentId, { status });

    res.status(200).json({ message: 'Student status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student status', error: error.message });
  }
};

// Get all batches (for admin)
export const getAllBatches = async (req, res) => {
  try {
    const { adminId } = req.body;
    const batches = await Batch.find({ createdBy: adminId })
      .populate('students.student', 'name email status');
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batches', error: error.message });
  }
};

export const getBatchDetails = async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const batch = await Batch.findById(batchId)
      .populate('students.student', 'name email status')
      .populate('createdBy', 'name email');
      
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching batch details', error: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { batchId, adminId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    if (batch.createdBy.toString() !== adminId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this batch' });
    }

    await User.updateMany(
      { batch: batchId },
      { $unset: { batch: 1 }, status: 'NoBatch' }
    );

    await Batch.findByIdAndDelete(batchId);

    res.status(200).json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting batch', error: error.message });
  }
};