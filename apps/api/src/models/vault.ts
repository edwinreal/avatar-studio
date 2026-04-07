import { Schema, model, models } from "mongoose";

const vaultSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    vocabularyId: { type: String, required: true },
    sceneId: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    secureUrl: { type: String, default: "" },
    assetType: {
      type: String,
      enum: ["image", "video", "prompt"],
      default: "video"
    },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

export const VaultModel = models.Vault || model("Vault", vaultSchema);
