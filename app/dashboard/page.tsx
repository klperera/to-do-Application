import { TodoDashboard } from "@/components/todo-dashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return <div>Please login</div>;

  const user = session.user;
  return (
    <div className="min-h-screen bg-gray-50">
      <TodoDashboard user={user} />
    </div>
  );
}
