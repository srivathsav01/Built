"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignUpDTOSchema, type SignUpDTO } from "@/lib/schemas/auth.dto";
import { useState, useTransition } from "react";
import Link from "next/link";
// import { useUser } from "@/lib/contexts/UserContext";

export default function SignUpPage() {
  // const { setUser } = useUser();
  const [formData, setFormData] = useState<SignUpDTO>({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpDTO, string>>>({});
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof SignUpDTO]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form data
    const result = SignUpDTOSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpDTO, string>> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof SignUpDTO] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        // Remove confirmPassword before sending to API

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Sign up failed. Please try again.");
          return;
        }
        window.location.href = "/";
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error(err);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 h-full">
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-medium">Creating account...</p>
          </div>
        </div>
      )}
      <div className={`w-full max-w-md space-y-6 ${isPending ? "blur-sm pointer-events-none" : ""}`}>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 border border-destructive/50 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              disabled={isPending}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isPending}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={isPending}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isPending}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
