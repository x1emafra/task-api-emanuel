const express = require('express');
const taskRoutes = require('./src/routes/taskRoutes');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/api/tasks', taskRoutes);

app.listen(3000, () => console.log('🚀 http://localhost:3000'));


