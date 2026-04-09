import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { getRequiredEnv } from "../config.js";

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    email: string;
    name: string;
  };
};

export const requireAuth = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, getRequiredEnv("JWT_SECRET")) as {
      sub: string;
      email: string;
      name: string;
    };

    request.auth = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name
    };

    next();
  } catch (_error) {
    response.status(401).json({ error: "Invalid or expired token" });
  }
};
