import z from "zod";

export const messageValidationSchema = z
  .object({
    senderId: z.string().min(1, "Sender ID is required"),
    recieverId: z.string().min(1, "Receiver ID is required"),
    text: z.string().optional(),
    image: z.string().url("Must be a valid URL").optional(),
  })
  .refine((data) => data.text || data.image, {
    message: "Either text or image must be provided",
    path: ["text"],
  });

export type MessageType = z.infer<typeof messageValidationSchema>;
