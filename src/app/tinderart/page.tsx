"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import {
  PrimaryButton,
  PrimaryLinkButton,
} from "@/components/ui/primary-button";
import {
  ROUTES,
  TINDERART_MAX_UPLOADS,
  TINDERART_STORAGE_KEY,
} from "@/lib/constants";

function toDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

export default function TinderArtPage() {
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "done">("idle");

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    const dataUrls = await Promise.all(
      imageFiles.slice(0, TINDERART_MAX_UPLOADS).map(toDataUrl),
    );
    setPreviews(dataUrls.filter(Boolean));
  };

  const submitUploads = () => {
    window.localStorage.setItem(
      TINDERART_STORAGE_KEY,
      JSON.stringify(previews),
    );
    setSubmitStatus("done");
  };

  const enterArena = () => {
    if (previews.length === 0) {
      window.localStorage.setItem(TINDERART_STORAGE_KEY, JSON.stringify([]));
    }
    router.push(ROUTES.tinderArtArena);
  };

  const requiresSubmit = previews.length > 0 && submitStatus !== "done";

  return (
    <PageShell maxWidth="4xl">
      <PageCard className="px-5 py-9 sm:px-8 sm:py-11 md:px-12 animate-[rise-in_700ms_ease-out]">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
          tinderart
        </p>
        <PageTitle className="mt-4 text-4xl sm:text-5xl">
          Upload art and enter the arena
        </PageTitle>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          Add your own image (optional). Then enter the arena and swipe yes/no
          on art from other players.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="block">
            <span className="sr-only">Upload art</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => onFilesSelected(event.target.files)}
              className="block w-full rounded-2xl border border-stone-300 bg-[#fffaf1] px-4 py-3 text-sm text-stone-700"
            />
          </label>
          <PrimaryButton
            onClick={submitUploads}
            disabled={previews.length === 0}
            className="w-full px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Submit upload
          </PrimaryButton>
        </div>

        {previews.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((src, index) => (
              <Image
                key={`${src}-${index}`}
                src={src}
                alt={`Uploaded preview ${index + 1}`}
                width={300}
                height={300}
                unoptimized
                className="aspect-square w-full rounded-xl border border-stone-200 object-cover"
              />
            ))}
          </div>
        )}

        {submitStatus === "done" && (
          <p className="mt-4 text-sm font-semibold text-emerald-700">
            Picture uploaded successfully.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton
            onClick={enterArena}
            disabled={requiresSubmit}
            className="w-full px-7 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
          >
            Enter arena
          </PrimaryButton>
          <PrimaryLinkButton
            href={ROUTES.home}
            className="w-full border-stone-400 bg-stone-100 text-stone-800 hover:bg-stone-200 sm:flex-1"
          >
            Back home
          </PrimaryLinkButton>
        </div>
      </PageCard>
    </PageShell>
  );
}
