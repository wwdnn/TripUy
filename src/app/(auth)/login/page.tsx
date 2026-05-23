import Link from "next/link";
import type { JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps): Promise<JSX.Element> {
  const { redirect } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Masuk ke TripUy</CardTitle>
        <CardDescription>Lanjutkan perencanaan trip bersama tim.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <LoginForm redirectTo={redirect} />

        <div className="relative flex items-center">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground px-3 text-xs uppercase">atau</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <GoogleSignInButton callbackURL={redirect ?? "/dashboard"} />

        <p className="text-muted-foreground text-center text-sm">
          Belum punya akun?{" "}
          <Link href="/register" className="text-foreground font-medium underline">
            Daftar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
