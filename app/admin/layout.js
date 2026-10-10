import AdminShell from "@/components/AdminShell";

export const instant = false;

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
