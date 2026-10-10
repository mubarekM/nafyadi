import { Suspense } from "react";
import AdminShell from "@/components/AdminShell";

export const instant = false;

export default function AdminLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="tx flex min-h-dvh items-center justify-center font-bold">
          ...
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
