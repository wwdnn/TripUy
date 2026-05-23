"use client";

import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/features/auth/schemas/loginSchema";
import { useSignIn } from "@/features/auth/hooks/useSignIn";

export interface LoginFormProps {
  redirectTo?: string;
}

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

export function LoginForm({ redirectTo }: LoginFormProps): JSX.Element {
  const { signIn, isPending, error } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function submit(): Promise<void> {
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LoginInput;
        if (key && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    await signIn(parsed.data);
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
        {fieldErrors.email ? (
          <p className="text-destructive text-sm">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.password ? (
          <p className="text-destructive text-sm">{fieldErrors.password}</p>
        ) : null}
      </div>

      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md p-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
