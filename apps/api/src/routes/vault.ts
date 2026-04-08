import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { vaultRepository } from "../services/repositories.js";
import { uploadRemoteAsset } from "../services/cloudinary.js";
import { createVaultAssetSchema } from "../validators.js";

export const vaultRouter = Router();

vaultRouter.use(requireAuth);

vaultRouter.get("/", async (request: AuthenticatedRequest, response) => {
  const { sceneId, vocabularyId } = request.query;
  response.json(
    await vaultRepository.findAll(request.auth!.userId, {
      sceneId: sceneId ? String(sceneId) : undefined,
      vocabularyId: vocabularyId ? String(vocabularyId) : undefined
    })
  );
});

vaultRouter.post("/", async (request: AuthenticatedRequest, response) => {
  const validated = createVaultAssetSchema.safeParse(request.body);

  if (!validated.success) {
    response.status(400).json({
      error: "Validation error",
      details: validated.error.flatten().fieldErrors
    });
    return;
  }

  const item = await vaultRepository.create({
    ownerId: request.auth!.userId,
    ...validated.data
  });
  response.status(201).json(item);
});

vaultRouter.post("/import", async (request: AuthenticatedRequest, response) => {
  const { vocabularyId, sceneId, sourceUrl, notes = "" } = request.body ?? {};

  if (!vocabularyId || !sceneId || !sourceUrl) {
    response
      .status(400)
      .json({ error: "vocabularyId, sceneId and sourceUrl are required" });
    return;
  }

  const uploaded = await uploadRemoteAsset({
    vocabularyId,
    sceneId,
    sourceUrl
  });

  const item = await vaultRepository.create({
    ownerId: request.auth!.userId,
    vocabularyId,
    sceneId,
    cloudinaryPublicId: uploaded.publicId,
    secureUrl: uploaded.secureUrl,
    assetType: uploaded.resourceType,
    notes
  });

  response.status(201).json({
    provider: uploaded.provider,
    item
  });
});
