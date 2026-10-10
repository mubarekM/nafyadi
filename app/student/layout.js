import StudentShell from "@/components/StudentShell";

export const instant = false;

export default function StudentLayout({ children }) {
  return <StudentShell>{children}</StudentShell>;
}
