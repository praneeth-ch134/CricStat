import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Route
import authRoutes from './routes/authRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

// Models
import User from './models/User.js';
import Match from './models/Match.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://srikar:srikar@cluster0.zjbzxy4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('password', 10);
      const newAdmin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/admin/matches', matchRoutes);
app.use('/api', publicRoutes);

// Socket.io event handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle subscribe to match events
  socket.on('subscribe_match', ({ matchId }) => {
    console.log(`Client ${socket.id} subscribed to match ${matchId}`);
    socket.join(`match:${matchId}`);
  });
  
  // Handle unsubscribe from match events
  socket.on('unsubscribe_match', ({ matchId }) => {
    console.log(`Client ${socket.id} unsubscribed from match ${matchId}`);
    socket.leave(`match:${matchId}`);
  });
  
  // Handle ball updates
  socket.on('ball_update', (data) => {
    console.log('Ball update received:', data);
    io.to(`match:${data.matchId}`).emit('match_update', {
      matchId: data.matchId,
      type: data.type,
      innings: data.innings,
      currentInnings: data.currentInnings,
      ballInfo: data.ballInfo
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createAdminUser();
});

export default app;