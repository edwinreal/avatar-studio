import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { vocabularyRepository } from "../services/repositories.js";
import type { TagKind } from "../types.js";

export const vocabularyRouter = Router();

vocabularyRouter.use(requireAuth);

vocabularyRouter.get("/", async (request: AuthenticatedRequest, response) => {
  const { type, scriptId } = request.query;
  response.json(
    await vocabularyRepository.findAll(request.auth!.userId, {
      type: type ? String(type) : undefined,
      scriptId: scriptId ? String(scriptId) : undefined
    })
  );
});

vocabularyRouter.post("/", async (request: AuthenticatedRequest, response) => {
  const {
    term,
    type = "vocab",
    meaning = "",
    sceneId = "scene_unassigned",
    scriptId = "manual",
    assetUrl = "cloudinary://synapse-studios/manual-link"
  } = request.body ?? {};

  if (!term) {
    response.status(400).json({ error: "term is required" });
    return;
  }

  const item = await vocabularyRepository.create({
    ownerId: request.auth!.userId,
    term,
    type: type as TagKind,
    meaning,
    sceneId,
    scriptId,
    assetUrl
  });
  response.status(201).json(item);
});

vocabularyRouter.patch("/:id", async (request: AuthenticatedRequest, response) => {
  const item = await vocabularyRepository.update(
    String(request.params.id),
    request.auth!.userId,
    request.body ?? {}
  );
  if (!item) {
    response.status(404).json({ error: "Vocabulary item not found" });
    return;
  }

  response.json(item);
});

vocabularyRouter.delete("/:id", async (request: AuthenticatedRequest, response) => {
  const removed = await vocabularyRepository.remove(
    String(request.params.id),
    request.auth!.userId
  );
  if (!removed) {
    response.status(404).json({ error: "Vocabulary item not found" });
    return;
  }

  response.status(204).send();
});
