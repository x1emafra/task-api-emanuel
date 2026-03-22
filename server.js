const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

// ✅ CORS CONFIGURADO PARA PRODUCCIÓN
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// Middlewares
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Task API Emanuel Live!" });
});

// GET - obtener todas las tareas
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany();
    res.json(tasks);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST - crear tarea
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        completed: completed || false,
      },
    });

    res.json(task);
  } catch (error) {
    console.error("POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - actualizar tarea
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        completed,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("PUT ERROR:", error);
    res.status(404).json({ error: "Task no encontrada" });
  }
});

// DELETE - eliminar tarea
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Task eliminada" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(404).json({ error: "Task no encontrada" });
  }
});

// Servidor
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port " + PORT);
});