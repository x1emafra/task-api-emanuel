import express from "express";
import cors from "cors";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

// GET tareas (propias + compartidas)
app.get("/api/tasks", async (req, res) => {
  const { userId } = req.query;

  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { sharedWith: { some: { id: userId } } },
        ],
      },
      orderBy: { order: "asc" },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE tarea + auto crear usuario
app.post("/api/tasks", async (req, res) => {
  const { title, userId, email } = req.body;

  try {
    // crear usuario si no existe
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: email || "sin-email",
      },
    });

    const count = await prisma.task.count({
      where: { ownerId: userId },
    });

    const task = await prisma.task.create({
      data: {
        title,
        ownerId: userId,
        order: count,
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE (toggle / reorder)
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed, order } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: { completed, order },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE (owner o admin)
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (task.ownerId !== userId && user.role !== "admin") {
      return res.status(403).json({ error: "No permitido" });
    }

    await prisma.task.delete({
      where: { id: Number(id) },
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SHARE tarea
app.post("/api/tasks/share", async (req, res) => {
  const { taskId, email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        sharedWith: {
          connect: { id: user.id },
        },
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});