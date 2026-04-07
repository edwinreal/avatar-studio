require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "synapse-studios-api",
    mode: "basic-server-js",
    databaseTarget: "MongoDB Atlas",
    assetTarget: "Cloudinary",
    aiTarget: "OpenAI | Anthropic"
  });
});

app.get("/api/scripts", (_req, res) => {
  res.json([{ id: "scr_demo", title: "Demo script", status: "draft" }]);
});

app.get("/api/users", (_req, res) => {
  res.json([{ id: "usr_demo", name: "Demo learner", syncLevel: 42 }]);
});

app.get("/api/vocabulary", (_req, res) => {
  res.json([{ id: "voc_demo", term: "momentum", type: "vocab" }]);
});

app.listen(port, () => {
  console.log(`Basic server.js ready on http://localhost:${port}`);
});
