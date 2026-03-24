import express from "express";
import cors from "cors";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

// GET tareas (filtradas por usuario)
app.get("/api/tasks", async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.json([]);
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST crear tarea
app.post("/api/tasks", async (req, res) => {
  const { title, userId } = req.body;

  try {
    if (!title || !userId) {
      return res.status(400).json({ error: "title y userId requeridos" });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        userId,
      },
    });

    res.json(newTask);
  } catch (error) {
    console.error("POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT actualizar tarea
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { completed },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("PUT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE eliminar tarea
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});