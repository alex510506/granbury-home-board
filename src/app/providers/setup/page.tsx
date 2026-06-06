import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProviderSetupForm } from "./form";

export const metadata = { title: "Set Up Your Provider Profile — Granbury Home Board" };

export default async function ProviderSetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "provider") redirect("/dashboard");

  // Check if already has a provider profile
  const { data: existing } = await supabase
    .from("providers")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (existing) redirect("/providers/edit");

  const { data: trades } = await supabase
    .from("trades")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Set Up Your Profile</h1>
      <p className="mb-8 text-lg text-muted">
        Tell homeowners about your business so they can find you.
      </p>
      <ProviderSetupForm trades={trades ?? []} />
    </div>
  );
}
