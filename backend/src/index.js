import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AIController } from './controllers/aiController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize AI Controller
const aiController = new AIController();

// Routes
app.post('/api/chat', (req, res) => aiController.chat(req, res));
app.post('/api/parallel-chat', (req, res) => aiController.parallelChat(req, res));
app.post('/api/deep-research', (req, res) => aiController.deepResearch(req, res));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Multi-AI Chat Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
