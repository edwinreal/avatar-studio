import { Router } from "express";
import { usersRepository } from "../services/repositories.js";

export const usersRouter = Router();

usersRouter.get("/", async (_request, response) => {
  response.json(await usersRepository.findAll());
});

usersRouter.post("/", async (request, response) => {
  const { name, email, syncLevel = 0, streakDays = 0 } = request.body ?? {};

  if (!name || !email) {
    response.status(400).json({ error: "name and email are required" });
    return;
  }

  const user = await usersRepository.create({ name, email, syncLevel, streakDays });
  response.status(201).json(user);
});

usersRouter.patch("/:id", async (request, response) => {
  const user = await usersRepository.update(request.params.id, request.body ?? {});
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
