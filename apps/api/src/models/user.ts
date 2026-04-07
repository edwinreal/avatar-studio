import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    syncLevel: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const UserModel = models.User || model("User", userSchema);
