const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: '🚀 Task API Emanuel Live!' });
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const task = await prisma.task.create({
      data: { title, description, completed: completed || false }
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server: http://0.0.0.0:${PORT}`);
});