import { headers } from "next/headers";
import type { JSX } from "react";
import { auth } from "@/lib/auth/auth";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export default async function DashboardPage(): Promise<JSX.Element> {
  const session = await auth.api.getSession({ headers: await headers() });
  const name = session?.user.name ?? "Traveler";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Selamat datang</p>
          <h1 className="text-2xl font-semibold">{name}</h1>
        </div>
        <LogoutButton />
      </header>

      <section className="border-border bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Trip kamu</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Belum ada trip. Fitur trip akan dikerjakan setelah authentication selesai.
        </p>
      </section>
    </main>
  );
}
