require('dotenv').config();
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/tasks', taskRoutes);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido');
  server.close(() => process.exit(0));
});

module.exports = app;



