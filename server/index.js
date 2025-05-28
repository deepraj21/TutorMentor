import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; 
import authRoutes from './routes/Auth.js';
import batchRoutes from './routes/Batch.js';
import folderRoutes from './routes/Folder.js';
import fileRoutes from './routes/File.js';
import testRoutes from './routes/Test.js';
import aiRoutes from './routes/AI.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

connectDB();

app.get('/', (req, res) => {
    res.send('Welcome to tutor-mentor-server');
});

app.use('/api/auth', authRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/folder', folderRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/test', testRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});