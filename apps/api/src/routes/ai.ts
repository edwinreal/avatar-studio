import { Router } from "express";
import { analyzeScriptWithAI } from "../services/openai.js";

export const aiRouter = Router();

aiRouter.post("/analyze-script", async (request, response) => {
  const { script = "" } = request.body ?? {};

  if (!script) {
    response.status(400).json({ error: "script is required" });
    return;
  }

  response.json(await analyzeScriptWithAI(script));
});
