"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJoinTrip } from "@/features/trip/hooks/useJoinTrip";

interface JoinTripPanelProps {
  inviteCode: string;
  tripId: string;
  isLoggedIn: boolean;
  isArchived: boolean;
  isAlreadyMember: boolean;
  memberName: string | null;
}

export function JoinTripPanel({
  inviteCode,
  tripId,
  isLoggedIn,
  isArchived,
  isAlreadyMember,
  memberName,
}: JoinTripPanelProps): JSX.Element {
  const router = useRouter();
  const { join, isPending, error } = useJoinTrip();
  const [guestName, setGuestName] = useState("");
  const [joinedName, setJoinedName] = useState<string | null>(null);

  const joined = isAlreadyMember || joinedName !== null;

  async function handleMemberJoin(): Promise<void> {
    const result = await join({ inviteCode });
    if (result) router.push(`/trips/${result.tripId}`);
  }

  async function handleGuestJoin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const result = await join({ inviteCode, guestName: guestName.trim() });
    if (result) setJoinedName(result.memberName);
  }

  if (isArchived) {
    return (
      <p className="text-muted-foreground text-center text-sm">Trip ini sudah diarsipkan.</p>
    );
  }

  if (joined) {
    if (isLoggedIn) {
      return (
        <Button asChild className="h-12 w-full">
          <Link href={`/trips/${tripId}`}>Buka trip</Link>
        </Button>
      );
    }

    return (
      <div className="border-border bg-card flex flex-col items-center gap-2 rounded-xl border p-6 text-center">
        <p className="text-base font-semibold">Kamu sudah gabung 🎉</p>
        <p className="text-muted-foreground text-sm">
          Bergabung sebagai <span className="text-foreground font-medium">{joinedName ?? memberName}</span>.
          Buat akun untuk mengakses detail trip secara penuh.
        </p>
        <Button asChild variant="outline" className="mt-2 h-11">
          <Link href="/register">Buat akun</Link>
        </Button>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          className="h-12 w-full"
          disabled={isPending}
          onClick={() => {
            void handleMemberJoin();
          }}
        >
          {isPending ? "Memproses..." : "Gabung ke trip"}
        </Button>
        {error ? (
          <p className="text-destructive text-center text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleGuestJoin}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guestName">Nama kamu</Label>
        <Input
          id="guestName"
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Tulis namamu"
          maxLength={40}
          className="h-12"
        />
      </div>

      <Button type="submit" className="h-12 w-full" disabled={isPending || guestName.trim().length < 2}>
        {isPending ? "Memproses..." : "Gabung sebagai tamu"}
      </Button>

      {error ? (
        <p className="text-destructive text-center text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-muted-foreground text-center text-xs">
        Sudah punya akun?{" "}
        <Link href={`/login?redirect=/join/${inviteCode}`} className="text-foreground underline">
          Masuk dulu
        </Link>
      </p>
    </form>
  );
}
