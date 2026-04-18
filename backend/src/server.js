const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { testDatabaseConnection } = require("./config/db");

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OK 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/health/db", async (req, res) => {
  try {
    await testDatabaseConnection();
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

async function startServer() {
  try {
    await testDatabaseConnection();
    console.log("Conexao com MySQL estabelecida.");

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Falha ao conectar no MySQL:", error.message);
    process.exit(1);
  }
}

startServer();