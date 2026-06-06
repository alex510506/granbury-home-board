import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MONETIZATION_ENABLED } from "@/lib/stripe";

export const metadata = { title: "Dashboard — Granbury Home Board" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">
        Welcome, {profile?.full_name ?? "there"}
      </h1>
      <p className="mb-8 text-lg text-muted">
        You are signed in as a <strong>{profile?.role ?? "user"}</strong>.
      </p>

      {profile?.role === "homeowner" && (
        <div className="space-y-4">
          <Link
            href="/requests/new"
            className="inline-block rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-dark"
          >
            Post a New Job Request
          </Link>
          <p className="text-muted">
            Or{" "}
            <Link href="/requests" className="text-brand underline">
              browse current requests
            </Link>
          </p>
        </div>
      )}

      {profile?.role === "provider" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/requests"
              className="inline-block rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-dark"
            >
              Browse Open Jobs
            </Link>
            <Link
              href="/providers/edit"
              className="inline-block rounded-lg border-2 border-brand px-6 py-3 text-lg font-semibold text-brand hover:bg-brand hover:text-white"
            >
              Edit My Profile
            </Link>
            {MONETIZATION_ENABLED && (
              <Link
                href="/billing"
                className="inline-block rounded-lg bg-accent px-6 py-3 text-lg font-semibold text-white hover:bg-accent-light"
              >
                Billing &amp; Plan
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
