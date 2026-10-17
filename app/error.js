"use client";

import { useEffect } from "react";
import ErrorCard from "@/components/ErrorCard";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorCard error={error} onRetry={reset} full />;
}
