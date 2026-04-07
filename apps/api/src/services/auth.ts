import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createIdFactory, db } from "../data/store.js";
import { mongoStatus } from "../db/mongo.js";
import { UserModel } from "../models/user.js";
import type { UserRecord } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET?.trim() || "synapse-dev-secret";

const useMongo = () => mongoStatus().connected;

const sanitizeUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  syncLevel: user.syncLevel,
  streakDays: user.streakDays,
  createdAt: user.createdAt
});

const buildToken = (user: { id: string; email: string; name: string }) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 10);

    if (!useMongo()) {
      const existing = db.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
      if (existing) {
        throw new Error("EMAIL_IN_USE");
      }

      const user: UserRecord = {
        id: createIdFactory("usr"),
        name: input.name,
        email: normalizedEmail,
        syncLevel: 0,
        streakDays: 0,
        passwordHash,
        createdAt: new Date().toISOString()
      };

      db.users.unshift(user);
      return {
        token: buildToken(user),
        user: sanitizeUser(user)
      };
    }

    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error("EMAIL_IN_USE");
    }

    const created = await UserModel.create({
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      syncLevel: 0,
      streakDays: 0
    });

    const user = {
      id: created._id.toString(),
      name: created.name,
      email: created.email,
      syncLevel: created.syncLevel,
      streakDays: created.streakDays,
      createdAt: created.createdAt?.toISOString?.() ?? new Date().toISOString()
    };

    return {
      token: buildToken(user),
      user
    };
  },

  async login(input: { email: string; password: string }) {
    const normalizedEmail = input.email.trim().toLowerCase();

    if (!useMongo()) {
      const existing = db.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);
      if (!existing?.passwordHash) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const matches = await bcrypt.compare(input.password, existing.passwordHash);
      if (!matches) {
        throw new Error("INVALID_CREDENTIALS");
      }

      return {
        token: buildToken(existing),
        user: sanitizeUser(existing)
      };
    }

    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (!existing?.passwordHash) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const matches = await bcrypt.compare(input.password, existing.passwordHash);
    if (!matches) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const user = {
      id: existing._id.toString(),
      name: existing.name,
      email: existing.email,
      syncLevel: existing.syncLevel,
      streakDays: existing.streakDays,
      createdAt: existing.createdAt?.toISOString?.() ?? new Date().toISOString()
    };

    return {
      token: buildToken(user),
      user
    };
  }
};
