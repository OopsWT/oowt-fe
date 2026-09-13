"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Author } from "@/lib/types";

interface AuthorFilterControlsProps {
  authors: Author[];
  selectedAuthorId: number | null;
}

export function AuthorFilterControls({
  authors,
  selectedAuthorId,
}: AuthorFilterControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAuthorId, setPendingAuthorId] = useState<number | null>(null);

  const handleSelect = (authorId: number | null) => {
    setPendingAuthorId(authorId);
    const href = authorId ? `/?author=${authorId}` : "/";

    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => handleSelect(null)}
        className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-semibold shadow-sm transition-all ${
          selectedAuthorId === null
            ? "border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-200"
            : "border-white/50 bg-white/70 text-neutral-700 hover:border-amber-300 hover:bg-white"
        } ${isPending && pendingAuthorId === null ? "opacity-75" : ""}`}
        disabled={isPending && pendingAuthorId === null}
      >
        Wszyscy
        {isPending && pendingAuthorId === null && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/15 backdrop-blur-[1px]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" />
          </span>
        )}
      </button>

      {authors.map((author) => {
        const isSelected = selectedAuthorId === author.id;
        const avatarUrl = author.avatar?.url;
        const isLoading = isPending && pendingAuthorId === author.id;

        return (
          <button
            key={author.id}
            type="button"
            aria-label={`Filtruj po autorze ${author.name}`}
            onClick={() => handleSelect(author.id)}
            className={`relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 shadow-sm transition-all ${
              isSelected
                ? "border-amber-500 ring-2 ring-amber-200"
                : "border-white/60 hover:border-amber-300"
            } ${isLoading ? "opacity-75" : ""}`}
            disabled={isLoading}
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={author.name}
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-200 to-orange-300 text-sm font-bold text-neutral-800">
                {author.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            )}

            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-[1px]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
