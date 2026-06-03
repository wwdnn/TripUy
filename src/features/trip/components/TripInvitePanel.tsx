"use client";

import { AlertDialog } from "radix-ui";
import { QRCodeSVG } from "qrcode.react";
import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { getClientEnv } from "@/lib/env/client";
import { useRegenerateInvite } from "@/features/trip/hooks/useRegenerateInvite";
import type { Trip } from "@/types/trip";

interface TripInvitePanelProps {
  trip: Trip;
}

type CopyTarget = "code" | "link";

export function TripInvitePanel({ trip }: TripInvitePanelProps): JSX.Element {
  const { regenerate, isPending, error } = useRegenerateInvite();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState<CopyTarget | null>(null);

  const inviteLink = `${getClientEnv().NEXT_PUBLIC_APP_URL}/join/${trip.inviteCode}`;

  async function copy(target: CopyTarget, value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(target);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  async function share(): Promise<void> {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: trip.name, text: "Yuk gabung ke trip ini!", url: inviteLink });
        return;
      } catch {
        return;
      }
    }
    await copy("link", inviteLink);
  }

  async function confirmRegenerate(): Promise<void> {
    const result = await regenerate(trip.id);
    if (result) setConfirmOpen(false);
  }




  
  return (
    <section className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6">
      <div>
        <h2 className="text-base font-semibold">Undang Member</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Bagikan kode, link, atau QR di bawah agar orang lain bisa bergabung ke trip ini.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={inviteLink} size={160} bgColor="#ffffff" fgColor="#000000" />
        </div>
        <span className="text-muted-foreground text-xs">Scan untuk membuka link undangan</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground text-xs">Kode undangan</span>
        <div className="flex items-center gap-2">
          <span className="border-border bg-background flex h-11 flex-1 items-center rounded-lg border px-3 font-mono text-lg tracking-widest">
            {trip.inviteCode}
          </span>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => {
              void copy("code", trip.inviteCode);
            }}
          >
            {copied === "code" ? "Tersalin" : "Salin"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1"
          onClick={() => {
            void copy("link", inviteLink);
          }}
        >
          {copied === "link" ? "Link tersalin" : "Salin link"}
        </Button>
        <Button
          type="button"
          className="h-11 flex-1"
          onClick={() => {
            void share();
          }}
        >
          Bagikan
        </Button>
      </div>

      <button
        type="button"
        className="text-muted-foreground hover:text-foreground self-start text-xs underline"
        onClick={() => setConfirmOpen(true)}
      >
        Buat ulang kode
      </button>

      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <AlertDialog.Content className="bg-background border-border fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6 shadow-lg">
            <AlertDialog.Title className="text-lg font-semibold">Buat ulang kode?</AlertDialog.Title>
            <AlertDialog.Description className="text-muted-foreground mt-2 text-sm">
              Kode dan link undangan yang lama akan berhenti berlaku. Pastikan kamu membagikan kode
              yang baru.
            </AlertDialog.Description>

            {error ? (
              <p className="text-destructive bg-destructive/10 mt-3 rounded-md p-3 text-sm" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <AlertDialog.Cancel asChild>
                <Button type="button" variant="outline" className="h-11" disabled={isPending}>
                  Batal
                </Button>
              </AlertDialog.Cancel>
              <Button
                type="button"
                className="h-11"
                disabled={isPending}
                onClick={() => {
                  void confirmRegenerate();
                }}
              >
                {isPending ? "Memproses..." : "Buat ulang"}
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
