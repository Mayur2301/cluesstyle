// PATH: app/admin/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSession, ADMIN_SESSION_COOKIE } from "@/app/lib/admin-auth";
import { getPendingOrdersCount } from "@/app/lib/admin-stats";
import AdminShell from "./AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = token ? await verifyAdminSession(token) : null;

  if (!session) redirect("/admin/login");

  const pendingOrdersCount = await getPendingOrdersCount();

  return (
    <AdminShell adminName={session.name} adminRole={session.role} notificationCount={pendingOrdersCount}>
      {children}
    </AdminShell>
  );
}