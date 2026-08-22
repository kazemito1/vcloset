import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
