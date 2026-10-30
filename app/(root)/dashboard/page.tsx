import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireUser, signOut } from "@/lib/server/auth.server";

async function logout() {
  "use server";
  await signOut();
  redirect("/login");
}

async function Dashboard() {
  const user = await requireUser();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p>Signed in as {user.firstName ?? user.email}</p>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg bg-foreground px-6 py-3 text-background"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <main className="flex flex-1 justify-center p-8">
      <Suspense fallback={<p>Loading your account...</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
