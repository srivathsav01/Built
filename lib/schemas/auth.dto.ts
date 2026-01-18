import { z } from "zod";

/**
 * Login DTO Schema for authentication
 */
export const LoginDTOSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;

/**
 * Sign Up DTO Schema for user registration
 */
export const SignUpDTOSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpDTO = z.infer<typeof SignUpDTOSchema>;
