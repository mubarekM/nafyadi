import { Suspense } from "react";
import AdminShell from "@/components/AdminShell";

export const metadata = {
  title: "Admin | English with Nafyad",
  robots: { index: false, follow: false },
};

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
