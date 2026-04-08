import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { vocabularyRepository } from "../services/repositories.js";
import { createVocabularySchema, updateVocabularySchema } from "../validators.js";

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
  const validated = createVocabularySchema.safeParse(request.body);

  if (!validated.success) {
    response.status(400).json({
      error: "Validation error",
      details: validated.error.flatten().fieldErrors
    });
    return;
  }

  const item = await vocabularyRepository.create({
    ownerId: request.auth!.userId,
    ...validated.data
  });
  response.status(201).json(item);
});

vocabularyRouter.patch("/:id", async (request: AuthenticatedRequest, response) => {
  const validated = updateVocabularySchema.safeParse(request.body);

  if (!validated.success) {
    response.status(400).json({
      error: "Validation error",
      details: validated.error.flatten().fieldErrors
    });
    return;
  }

  const item = await vocabularyRepository.update(
    String(request.params.id),
    request.auth!.userId,
    validated.data
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
