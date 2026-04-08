import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error | AppError,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  console.error("[ERROR]", err);

  if (err instanceof z.ZodError) {
    const errors = err.errors.reduce(
      (acc: Record<string, string[]>, error) => {
        const path = error.path.join(".");
        if (!acc[path]) {
          acc[path] = [];
        }
        acc[path].push(error.message);
        return acc;
      },
      {} as Record<string, string[]>
    );

    return response.status(400).json({
      error: "Validation error",
      details: errors
    });
  }

  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      error: err.message,
      ...(err.errors && { details: err.errors })
    });
  }

  if (err instanceof Error) {
    // Don't leak internal errors to client
    return response.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { message: err.message })
    });
  }

  response.status(500).json({ error: "Unknown error occurred" });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
