const taskService = require('../services/taskService');

exports.getAll = async (req, res) => {
  try {
    const tasks = await taskService.getAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    
    const task = await taskService.create({ title });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ... código existente ...

exports.toggleTask = async (req, res) => {
  try {
    const task = await taskService.toggleTask(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body.title);
    res.json(task);
  } catch (error) {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
};
// Toggle completar
exports.toggleTask = async (req, res) => {
  try {
    const task = await taskService.toggleTask(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
};

// Eliminar tarea
exports.deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Eliminada OK' });
  } catch (error) {
    res.status(404).json({ error: 'No encontrada' });
  }
};
// Toggle completar
exports.toggleTask = async (req, res) => {
  try {
    const task = await taskService.toggleTask(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(404).json({ error: 'Tarea no encontrada' });
  }
};

// Eliminar tarea
exports.deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Eliminada OK' });
  } catch (error) {
    res.status(404).json({ error: 'No encontrada' });
  }
};
