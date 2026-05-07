const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const entrenadorsRoutes = require("./routes/entrenadors");
const socisRoutes = require("./routes/socis");
const classesRoutes = require("./routes/classes");
const reservesRoutes = require("./routes/reserves");
const adminRoutes = require("./routes/admin");
const notificacionsRoutes = require("./routes/notificacions");
const { ensureSchema } = require("./schema");

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/entrenadors", entrenadorsRoutes);
app.use("/api/socis", socisRoutes);
app.use("/api/classes", classesRoutes);
app.use("/api/reserves", reservesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notificacions", notificacionsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GymMaster API funcionant correctament" });
});

async function start() {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`\nGymMaster API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error("Error iniciant servidor:", error);
    process.exit(1);
  }
}

start();
