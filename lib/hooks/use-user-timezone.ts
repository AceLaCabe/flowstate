"use client";

import { useEffect, useState } from "react";

export function useUserTimeZone() {
  const [timeZone, setTimeZone] = useState<string | null>(null);

  useEffect(() => {
    setTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    );
  }, []);

  return timeZone;
}