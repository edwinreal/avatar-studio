import { z } from "zod";

// Auth validators
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});

// User validators
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  syncLevel: z.number().int().min(0).default(0),
  streakDays: z.number().int().min(0).default(0)
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  syncLevel: z.number().int().min(0).optional(),
  streakDays: z.number().int().min(0).optional()
});

// Script validators
export const createScriptSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  sceneId: z.string().default("scene_unassigned")
});

export const updateScriptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  sceneId: z.string().optional()
});

// Vault validators
export const createVaultAssetSchema = z.object({
  vocabularyId: z.string().min(1, "vocabularyId is required"),
  sceneId: z.string().min(1, "sceneId is required"),
  cloudinaryPublicId: z.string().min(1, "cloudinaryPublicId is required"),
  secureUrl: z.string().url().optional(),
  assetType: z.enum(["image", "video", "prompt"]).default("video"),
  notes: z.string().default("")
});

export const updateVaultAssetSchema = z.object({
  vocabularyId: z.string().min(1).optional(),
  sceneId: z.string().min(1).optional(),
  cloudinaryPublicId: z.string().min(1).optional(),
  secureUrl: z.string().url().optional(),
  assetType: z.enum(["image", "video", "prompt"]).optional(),
  notes: z.string().optional()
});

// Vocabulary validators
export const createVocabularySchema = z.object({
  term: z.string().min(1, "term is required").max(100, "term too long"),
  type: z.enum(["vocab", "grammar"]).default("vocab"),
  meaning: z.string().default(""),
  sceneId: z.string().default("scene_unassigned"),
  scriptId: z.string().default("manual"),
  assetUrl: z.string().default("cloudinary://synapse-studios/manual-link")
});

export const updateVocabularySchema = z.object({
  term: z.string().min(1).max(100).optional(),
  type: z.enum(["vocab", "grammar"]).optional(),
  meaning: z.string().optional(),
  sceneId: z.string().optional(),
  scriptId: z.string().optional(),
  assetUrl: z.string().optional()
});

// Helper function to validate request data
export const validateRequest = <T>(schema: z.ZodSchema, data: unknown): T | null => {
  try {
    return schema.parse(data) as T;
  } catch (_error) {
    return null;
  }
};

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateScriptInput = z.infer<typeof createScriptSchema>;
export type UpdateScriptInput = z.infer<typeof updateScriptSchema>;
export type CreateVaultAssetInput = z.infer<typeof createVaultAssetSchema>;
export type UpdateVaultAssetInput = z.infer<typeof updateVaultAssetSchema>;
export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
