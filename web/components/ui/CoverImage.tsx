"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  cover?: string | null;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
}

export function CoverImage({ cover, alt, className, fit = "cover" }: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [cover]);

  if (!cover || failed) {
    return <div className={cn("bg-zinc-800/60", className)} aria-hidden="true" />;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={cover}
        alt={alt}
        fill
        unoptimized
        sizes="100vw"
        className={cn("bg-zinc-800/60", fit === "contain" ? "object-contain" : "object-cover")}
        onError={() => setFailed(true)}
      />
    </div>
  );
}