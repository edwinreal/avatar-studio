import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { scriptsRepository } from "../services/repositories.js";
import { createScriptSchema, updateScriptSchema } from "../validators.js";

export const scriptsRouter = Router();

scriptsRouter.use(requireAuth);

scriptsRouter.get("/", async (request: AuthenticatedRequest, response) => {
  response.json(await scriptsRepository.findAll(request.auth!.userId));
});

scriptsRouter.get("/:id", async (request: AuthenticatedRequest, response) => {
  const script = await scriptsRepository.findById(
    String(request.params.id),
    request.auth!.userId
  );
  if (!script) {
    response.status(404).json({ error: "Script not found" });
    return;
  }

  response.json(script);
}); 

scriptsRouter.post("/", async (request: AuthenticatedRequest, response) => {
  const validated = createScriptSchema.safeParse(request.body);

  if (!validated.success) {
    response.status(400).json({
      error: "Validation error",
      details: validated.error.flatten().fieldErrors
    });
    return;
  }

  const script = await scriptsRepository.create({
    ownerId: request.auth!.userId,
    ...validated.data
  });

  response.status(201).json(script);
});

scriptsRouter.patch("/:id", async (request: AuthenticatedRequest, response) => {
  const validated = updateScriptSchema.safeParse(request.body);

  if (!validated.success) {
    response.status(400).json({
      error: "Validation error",
      details: validated.error.flatten().fieldErrors
    });
    return;
  }

  const updated = await scriptsRepository.update(
    String(request.params.id),
    request.auth!.userId,
    validated.data
  );
  if (!updated) {
    response.status(404).json({ error: "Script not found" });
    return;
  }

  response.json(updated);
});

scriptsRouter.delete("/:id", async (request: AuthenticatedRequest, response) => {
  const removed = await scriptsRepository.remove(
    String(request.params.id),
    request.auth!.userId
  );
  if (!removed) {
    response.status(404).json({ error: "Script not found" });
    return;
  }

  response.status(204).send();
});
