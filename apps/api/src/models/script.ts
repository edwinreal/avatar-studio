import { Schema, model, models } from "mongoose";

const tagSchema = new Schema(
  {
    label: { type: String, enum: ["vocab", "grammar"], required: true },
    value: { type: String, required: true },
    sceneId: { type: String, required: true }
  },
  { _id: false }
);

const scriptSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    sceneId: { type: String, required: true, default: "scene_unassigned" },
    tags: { type: [tagSchema], default: [] },
    visualPrompts: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const ScriptModel = models.Script || model("Script", scriptSchema);
