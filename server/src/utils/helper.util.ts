import type { NextFunction, Response } from "express";
import dotenv from "dotenv";
import z from "zod";

dotenv.config();

// Validate and get env variable
export const getEnvVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: Environment variable '${name}' is not defined.`);
    process.exit(1);
  }
  return value;
};

export const catchError = (res: Response, error: unknown, name?: string) => {
  if (error instanceof Error) {
    console.log(`Error in ${name || "Unknown File"} : ${error.message}`);
  }
  return res.status(500).json({
    message: "Internal Server Error",
  });
};

const formatZodErrors = (error: z.ZodError) => {
  const formatted: { [key: string]: string } = {};

  error.issues.forEach((issue) => {
    const path = issue.path.map(String).join(".");
    formatted[path] = issue.message;
  });

  return formatted;
};

export const validateInpuWithZod = (
  schema: z.ZodSchema,
  data: {},
  res: Response,
) => {
  try {
    schema.parse(data);
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: formatZodErrors(validationError),
      });
      return;
    }
    throw validationError;
  }
};
