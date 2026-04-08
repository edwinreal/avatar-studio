import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { usersRepository } from "../services/repositories.js";

export const usersRouter = Router();

// Proteger todos los endpoints de usuario
usersRouter.use(requireAuth);

usersRouter.get("/", async (_request, response) => {
  response.json(await usersRepository.findAll());
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

usersRouter.patch("/:id", async (request, response) => {
  const { id } = request.params;
  
  // Only allow users to update their own data
  if (request.auth?.userId !== id) {
    response.status(403).json({ error: "Forbidden" });
    return;
  }

  const user = await usersRepository.update(id, request.body ?? {});
  if (!user) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.json(user);
});

usersRouter.delete("/:id", async (request, response) => {
  const removed = await usersRepository.remove(request.params.id);
  if (!removed) {
    response.status(404).json({ error: "User not found" });
    return;
  }

  response.status(204).send();
});
