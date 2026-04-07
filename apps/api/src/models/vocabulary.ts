import { Schema, model, models } from "mongoose";

const vocabularySchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    term: { type: String, required: true, trim: true },
    type: { type: String, enum: ["vocab", "grammar"], required: true },
    meaning: { type: String, default: "" },
    sceneId: { type: String, required: true },
    scriptId: { type: String, required: true },
    assetUrl: { type: String, default: "cloudinary://synapse-studios/pending-link" }
  },
  { timestamps: true }
);

export const VocabularyModel =
  models.Vocabulary || model("Vocabulary", vocabularySchema);
