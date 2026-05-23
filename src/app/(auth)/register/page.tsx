import Link from "next/link";
import type { JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";

export default function RegisterPage(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Buat akun TripUy</CardTitle>
        <CardDescription>Atur trip bareng, atur biaya bareng.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <RegisterForm />

        <div className="relative flex items-center">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground px-3 text-xs uppercase">atau</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <GoogleSignInButton />

        <p className="text-muted-foreground text-center text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-foreground font-medium underline">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
