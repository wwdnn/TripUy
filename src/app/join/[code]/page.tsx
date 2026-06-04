import Link from "next/link";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { JoinTripPanel } from "@/features/trip/components/JoinTripPanel";
import { getTripByInviteCode } from "@/features/trip/services/getTripByInviteCode";
import { TripNotFoundError } from "@/features/trip/services/errors";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { getGuestId } from "@/lib/auth/guestSession";
import type { TripInvitePreview } from "@/types/trip";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

function formatDateRange(start: Date, end: Date | null): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const startStr = new Date(start).toLocaleDateString("id-ID", opts);
  if (!end) return startStr;
  return `${startStr} – ${new Date(end).toLocaleDateString("id-ID", opts)}`;
}

function InvalidInvite(): JSX.Element {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Kode undangan tidak valid</h1>
      <p className="text-muted-foreground text-sm">
        Kode mungkin salah atau sudah diperbarui oleh pemilik trip. Minta kode terbaru lalu coba lagi.
      </p>
      <Button asChild variant="outline" className="h-11">
        <Link href="/">Ke beranda</Link>
      </Button>
    </main>
  );
}

export default async function JoinPage({ params }: JoinPageProps): Promise<JSX.Element> {
  const { code } = await params;
  const user = await getSessionUser();
  const guestId = await getGuestId();

  let preview: TripInvitePreview;
  try {
    preview = await getTripByInviteCode(code, { userId: user?.id ?? null, guestId });
  } catch (error) {
    if (error instanceof TripNotFoundError) return <InvalidInvite />;
    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">Kamu diundang ke trip</p>
        <h1 className="mt-1 text-2xl font-semibold">{preview.name}</h1>
      </div>

      <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tanggal</span>
          <span>{formatDateRange(preview.startDate, preview.endDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mata uang</span>
          <span>{preview.currency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Anggota</span>
          <span>{preview.memberCount} orang</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dibuat oleh</span>
          <span>{preview.ownerName}</span>
        </div>
      </div>

      <JoinTripPanel
        inviteCode={code}
        tripId={preview.id}
        isLoggedIn={Boolean(user)}
        isArchived={preview.status === "ARCHIVED"}
        isAlreadyMember={preview.isAlreadyMember}
        memberName={preview.memberName}
      />
    </main>
  );
}
