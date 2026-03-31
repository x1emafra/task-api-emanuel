import express from "express";
import cors from "cors";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();

// 🔹 Middleware base
app.use(express.json());

// 🔥 CORS (arreglado + completo) ✅ RESPETADO
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5175",
      "http://10.151.128.39:5173",
      "https://task-frontend-ten-sigma.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* =========================
   GET TASKS (propias + compartidas)
========================= */
app.get("/api/tasks", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId requerido" });
  }

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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   CREATE TASK ✅ FIX REAL
========================= */
app.post("/api/tasks", async (req, res) => {
  const { title, userId, email } = req.body;

  if (!title || !userId) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    // 🔧 FIX: email ahora es opcional (NO rompe)
    await prisma.user.upsert({
      where: { id: userId },
      update: email ? { email } : {},
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
        completed: false,
      },
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   UPDATE TASK
========================= */
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed, order } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        ...(completed !== undefined && { completed }),
        ...(order !== undefined && { order }),
      },
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   DELETE TASK
========================= */
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId requerido" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    if (!task) {
      return res.status(404).json({ error: "Tarea no existe" });
    }

    if (task.ownerId !== userId && user?.role !== "admin") {
      return res.status(403).json({ error: "No permitido" });
    }

    await prisma.task.delete({
      where: { id: Number(id) },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   SHARE TASK
========================= */
app.post("/api/tasks/share", async (req, res) => {
  const { taskId, email } = req.body;

  if (!taskId || !email) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    const task = await prisma.task.update({
      where: { id: Number(taskId) },
      data: {
        sharedWith: {
          connect: { id: user.id },
        },
      },
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   SERVER
========================= */
app.listen(8080, () => {
  console.log("🚀 Server running on port 8080");
});