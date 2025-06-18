import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import classRoutes from './routes/classroom.js'
import materialRoutes from './routes/material.js';
import materialLibraryRoutes from './routes/materialLibrary.js';
import aiRoutes from './routes/tutor-ai.js';
import expressionRoutes from './routes/expressions.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/classroom')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/classroom', classRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/material-library', materialLibraryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/expressions', expressionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the classroom API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
