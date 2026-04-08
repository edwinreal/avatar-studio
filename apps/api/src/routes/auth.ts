import { Router } from "express";
import { authService } from "../services/auth.js";
import { loginSchema, registerSchema } from "../validators.js";

export const authRouter = Router();

authRouter.post("/register", async (request, response) => {
  try {
    const validated = registerSchema.safeParse(request.body);

    if (!validated.success) {
      response.status(400).json({
        error: "Validation error",
        details: validated.error.flatten().fieldErrors
      });
      return;
    }

    const result = await authService.register(validated.data);
    response.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    response.status(message === "EMAIL_IN_USE" ? 409 : 500).json({
      error: message === "EMAIL_IN_USE" ? "Email already in use" : "Could not register user"
    });
  }
});

authRouter.post("/login", async (request, response) => {
  try {
    const validated = loginSchema.safeParse(request.body);

    if (!validated.success) {
      response.status(400).json({
        error: "Validation error",
        details: validated.error.flatten().fieldErrors
      });
      return;
    }

    const result = await authService.login(validated.data);
    response.json(result);
  } catch (_error) {
    response.status(401).json({ error: "Invalid credentials" });
  }
});
