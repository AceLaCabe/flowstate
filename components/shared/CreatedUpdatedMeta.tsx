"use client";

import { useEffect, useState } from "react";

type Props = {
  createdAt?: string;
  updatedAt?: string;
};

function formatCreated(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(date: string) {
  const diff = Date.now() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function CreatedUpdatedMeta({
  createdAt,
  updatedAt,
}: Props) {
  const [relative, setRelative] = useState("");

  useEffect(() => {
    if (updatedAt) {
      setRelative(formatRelative(updatedAt));

      const interval = setInterval(() => {
        setRelative(formatRelative(updatedAt));
      }, 60000); // updates every minute

      return () => clearInterval(interval);
    }
  }, [updatedAt]);

  return (
    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
      <span>Created {createdAt ? formatCreated(createdAt) : "Unknown"}</span>
      <span>•</span>
      <span>Updated {relative || "…"}</span>
    </div>
  );
}