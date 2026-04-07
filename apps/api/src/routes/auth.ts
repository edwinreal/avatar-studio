import { Router } from "express";
import { authService } from "../services/auth.js";

export const authRouter = Router();

authRouter.post("/register", async (request, response) => {
  const { name, email, password } = request.body ?? {};

  if (!name || !email || !password) {
    response.status(400).json({ error: "name, email and password are required" });
    return;
  }

  try {
    const result = await authService.register({ name, email, password });
    response.status(201).json(result);
  } catch (error) {
    response.status(error instanceof Error && error.message === "EMAIL_IN_USE" ? 409 : 500).json({
      error:
        error instanceof Error && error.message === "EMAIL_IN_USE"
          ? "Email already in use"
          : "Could not register user"
    });
  }
});

authRouter.post("/login", async (request, response) => {
  const { email, password } = request.body ?? {};

  if (!email || !password) {
    response.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const result = await authService.login({ email, password });
    response.json(result);
  } catch (_error) {
    response.status(401).json({ error: "Invalid credentials" });
  }
});
