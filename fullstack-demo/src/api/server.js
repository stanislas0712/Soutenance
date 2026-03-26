const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: null, message: 'ok' });
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, data: null, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

module.exports = app;
