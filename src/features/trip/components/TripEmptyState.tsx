import Link from "next/link";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";

interface TripEmptyStateProps {
  archived?: boolean;
}

export function TripEmptyState({ archived = false }: TripEmptyStateProps): JSX.Element {
  return (
    <div className="border-border bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <h3 className="text-base font-semibold">
        {archived ? "Belum ada trip yang diarsipkan" : "Belum ada trip"}
      </h3>
      <p className="text-muted-foreground text-sm">
        {archived
          ? "Trip yang sudah selesai akan muncul di sini."
          : "Mulai catat perjalanan bersama dengan membuat trip baru."}
      </p>
      {!archived ? (
        <Button asChild className="h-11">
          <Link href="/trips/new">Buat Trip Baru</Link>
        </Button>
      ) : null}
    </div>
  );
}
