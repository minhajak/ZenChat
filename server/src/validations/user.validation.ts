import z from "zod";

// Zod validation schema
export const userValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  profileImage: z.string().optional(),
});
export const userUpdateValidationSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});
export const userLoginValidationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserType = z.infer<typeof userValidationSchema>;
