import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import createHttpError from "http-errors";
import { z } from "zod";

export const validation = (schema: z.ZodType) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { success } = await schema.safeParseAsync(req.body);

    if (!success) {
      throw createHttpError(400, "Validation error");
    }

    return next();
  });
