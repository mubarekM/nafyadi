import { Suspense } from "react";
import StudentShell from "@/components/StudentShell";

export const instant = false;

export default function StudentLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="tx flex min-h-dvh items-center justify-center font-bold">
          ...
        </div>
      }
    >
      <StudentShell>{children}</StudentShell>
    </Suspense>
  );
}
