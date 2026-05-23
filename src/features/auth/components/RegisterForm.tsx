"use client";

import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas/registerSchema";
import { useSignUp } from "@/features/auth/hooks/useSignUp";

export interface RegisterFormProps {
  redirectTo?: string;
}

type FieldErrors = Partial<Record<keyof RegisterInput, string>>;

export function RegisterForm({ redirectTo }: RegisterFormProps): JSX.Element {
  const { signUp, isPending, error } = useSignUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(): Promise<void> {
    setFieldErrors({});

    const parsed = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterInput;
        if (key && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    await signUp(parsed.data);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <input type="hidden" name="redirect" value={redirectTo ?? ""} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.name ? <p className="text-destructive text-sm">{fieldErrors.name}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.email ? <p className="text-destructive text-sm">{fieldErrors.email}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.password ? (
          <p className="text-destructive text-sm">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.confirmPassword ? (
          <p className="text-destructive text-sm">{fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md p-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending ? "Memproses..." : "Daftar"}
      </Button>
    </form>
  );
}
