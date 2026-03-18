const taskRepository = require('../repositories/taskRepository');

exports.getAll = () => {
  return taskRepository.findAll();
};

exports.create = (data) => {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Task title cannot be empty');
  }
  return taskRepository.create(data);
};
// ... código existente ...

exports.toggleTask = (id) => taskRepository.toggleComplete(id);
exports.updateTask = (id, title) => 
  taskRepository.updateTask(id, { title: title.trim() });
exports.deleteTask = (id) => taskRepository.deleteTask(id);
// Toggle completar
exports.toggleTask = (id) => taskRepository.toggleComplete(id);

// Eliminar
exports.deleteTask = (id) => taskRepository.deleteTask(id);
