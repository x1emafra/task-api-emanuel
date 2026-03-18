require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

exports.findAll = () => prisma.task.findMany({ orderBy: { id: 'desc' } });
exports.create = ({ title, completed }) => 
  prisma.task.create({ data: { title: title.trim(), completed } });
// ... código existente ...

exports.toggleComplete = (id) => 
  prisma.task.update({ where: { id }, data: { completed: { toggle: true } } });

exports.updateTask = (id, data) => 
  prisma.task.update({ where: { id }, data });

exports.deleteTask = (id) => 
  prisma.task.delete({ where: { id } });

// Toggle completar tarea
exports.toggleComplete = (id) => 
  prisma.task.update({ 
    where: { id: Number(id) }, 
    data: { completed: { toggle: true } } 
  });

// Eliminar tarea
exports.deleteTask = (id) => 
  prisma.task.delete({ where: { id: Number(id) } });


