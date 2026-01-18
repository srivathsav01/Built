import { z } from "zod";

export const UserDTOSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  name: z.string().min(1).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateUserDTOSchema = UserDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserDTOSchema = UserDTOSchema.partial().required({
  id: true,
});

export type UserDTO = z.infer<typeof UserDTOSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>;
