import Link from "next/link";
import type { JSX } from "react";
import { TripForm } from "@/features/trip/components/TripForm";



export default function NewTripPage(): JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <Link href="/trips" className="text-muted-foreground text-sm hover:underline">
          ← Kembali
        </Link>

        <h1 className="text-2xl font-semibold">Buat trip baru</h1>
      </header>

      <TripForm mode="create" />
    </main>
  );
}
