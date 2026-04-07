import cors from "cors";
import express from "express";
import { db } from "./data/store.js";
import { mongoStatus } from "./db/mongo.js";
import { aiRouter } from "./routes/ai.js";
import { authRouter } from "./routes/auth.js";
import { scriptsRouter } from "./routes/scripts.js";
import { usersRouter } from "./routes/users.js";
import { vaultRouter } from "./routes/vault.js";
import { vocabularyRouter } from "./routes/vocabulary.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "synapse-studios-api",
    architecture: "lightweight-microservices",
    dataSource: mongoStatus().connected ? "mongodb-atlas" : "in-memory-fallback",
    mongodb: mongoStatus(),
    totals: {
      scripts: db.scripts.length,
      users: db.users.length,
      vocabulary: db.vocabulary.length,
      vaultAssets: db.vault.length
    }
  });
});

app.get("/architecture", (_request, response) => {
  response.json({
    frontend: "React / Netlify",
    gateway: "Node.js / Express / Render",
    services: [
      "scripts-service",
      "users-service",
      "vocabulary-service",
      "vault-service",
      "ai-orchestrator-service"
    ],
    integrations: ["MongoDB Atlas", "Cloudinary", "OpenAI or Anthropic"]
  });
});

app.use("/api/scripts", scriptsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/vocabulary", vocabularyRouter);
app.use("/api/vault", vaultRouter);
app.use("/api/ai", aiRouter);
