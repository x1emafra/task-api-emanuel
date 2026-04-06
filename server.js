import express from "express";
import cors from "cors";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();

// 🔹 Middleware base
app.use(express.json());

// 🔥 CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5175",
      "http://10.151.128.39:5173",
      "https://task-frontend-ten-sigma.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* =========================
   GET TASKS
========================= */
app.get("/api/tasks", async (req, res) => {
  console.log("📥 GET /tasks query:", req.query);

  const { userId } = req.query;

  if (!userId) {
    console.log("❌ userId faltante en GET");
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

    console.log("📤 GET RESPONSE:", tasks);

    res.json(tasks);
  } catch (error) {
    console.error("💥 GET TASKS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   CREATE TASK
========================= */
app.post("/api/tasks", async (req, res) => {
  console.log("📥 POST /tasks BODY:", req.body);

  const { title, userId, email } = req.body;

  if (!title || !userId) {
    console.log("❌ Faltan datos en POST:", { title, userId });

    return res.status(400).json({
      error: "Faltan datos",
      received: req.body,
    });
  }

  try {
    // 👤 Usuario
    await prisma.user.upsert({
      where: { id: userId },
      update: email ? { email } : {},
      create: {
        id: userId,
        email: email || `${userId}@no-email.com`,
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

    console.log("📤 CREATED TASK:", task);

    res.json(task);
  } catch (error) {
    console.error("💥 CREATE TASK ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   UPDATE TASK
========================= */
app.put("/api/tasks/:id", async (req, res) => {
  console.log("📥 PUT /tasks:", {
    id: req.params.id,
    body: req.body,
  });

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

    console.log("📤 UPDATED TASK:", task);

    res.json(task);
  } catch (error) {
    console.error("💥 UPDATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   DELETE TASK
========================= */
app.delete("/api/tasks/:id", async (req, res) => {
  console.log("📥 DELETE /tasks:", {
    id: req.params.id,
    query: req.query,
  });

  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    console.log("❌ userId faltante en DELETE");
    return res.status(400).json({ error: "userId requerido" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const task = await prisma.task.findUnique({
      where: { id: Number(id) },
    });

    console.log("🔍 TASK FOUND:", task);

    if (!task) {
      return res.status(404).json({ error: "Tarea no existe" });
    }

    if (task.ownerId !== userId && user?.role !== "admin") {
      console.log("❌ No permitido");
      return res.status(403).json({ error: "No permitido" });
    }

    await prisma.task.delete({
      where: { id: Number(id) },
    });

    console.log("🗑️ TASK DELETED:", id);

    res.json({ ok: true });
  } catch (error) {
    console.error("💥 DELETE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   SHARE TASK
========================= */
app.post("/api/tasks/share", async (req, res) => {
  console.log("📥 SHARE BODY:", req.body);

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

    console.log("📤 SHARED TASK:", task);

    res.json(task);
  } catch (error) {
    console.error("💥 SHARE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   SERVER
========================= */
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});