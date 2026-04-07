import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { scriptsRepository } from "../services/repositories.js";

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
  const { title, content, sceneId = "scene_unassigned" } = request.body ?? {};

  if (!title || !content) {
    response.status(400).json({ error: "title and content are required" });
    return;
  }

  const script = await scriptsRepository.create({
    ownerId: request.auth!.userId,
    title,
    content,
    sceneId
  });

  response.status(201).json(script);
});

scriptsRouter.patch("/:id", async (request: AuthenticatedRequest, response) => {
  const updated = await scriptsRepository.update(
    String(request.params.id),
    request.auth!.userId,
    request.body ?? {}
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
