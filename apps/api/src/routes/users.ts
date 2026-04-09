import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { updateUserSchema } from "../validators.js";
import { usersRepository } from "../services/repositories.js";

export const usersRouter = Router();

// Proteger todos los endpoints de usuario
usersRouter.use(requireAuth);

usersRouter.get("/me", async (request: AuthenticatedRequest, response) => {
  const users = await usersRepository.findAll();
  const currentUser = users.find((user) => user.id === request.auth?.userId);

  if (!currentUser) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.json(currentUser);
});

usersRouter.post("/", async (request, response) => {
  const { name, email, syncLevel = 0, streakDays = 0 } = request.body ?? {};

  if (!name || !email) {
    response.status(400).json({ error: "name and email are required" });
    return;
  }

  if (typeof name !== "string" || typeof email !== "string") {
    response.status(400).json({ error: "Invalid input types" });
    return;
  }

  const user = await usersRepository.create({ name, email, syncLevel, streakDays });
  response.status(201).json(user);
});

usersRouter.patch("/:id", async (request: AuthenticatedRequest, response) => {
  const id = String(request.params.id);
  
  // Only allow users to update their own data
  if (request.auth?.userId !== id) {
    response.status(403).json({ error: "Forbidden" });
    return;
  }

  const validated = updateUserSchema.safeParse(request.body);
  if (!validated.success) {
    response.status(400).json({
      error: "Validation error",
      details: validated.error.flatten().fieldErrors
    });
    return;
  }

  const user = await usersRepository.update(id, validated.data);
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.json(user);
}); 

usersRouter.delete("/:id", async (request: AuthenticatedRequest, response) => {
  const id = String(request.params.id);

  if (request.auth?.userId !== id) {
    response.status(403).json({ error: "Forbidden" });
    return;
  }

  const removed = await usersRepository.remove(id);
  if (!removed) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.status(204).send();
});
