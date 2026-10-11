import { Suspense } from "react";
import StudentShell from "@/components/StudentShell";

export const metadata = {
  title: "Student | English with Nafyad",
  robots: { index: false, follow: false },
};

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
