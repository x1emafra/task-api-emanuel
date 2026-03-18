const express = require('express');
const taskController = require('../controllers/taskController');
const router = express.Router();

router.get('/', taskController.getAll);
router.post('/', taskController.create);
router.put('/:id/toggle', taskController.toggleTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
// ... código existente ...

router.put('/:id/toggle', taskController.toggleTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
