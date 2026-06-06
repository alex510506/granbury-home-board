import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewRequestForm } from "./form";

export const metadata = { title: "Post a Job — Granbury Home Board" };

export default async function NewRequestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, zip")
    .eq("id", user.id)
    .single();

  if (profile?.role === "provider") redirect("/dashboard");

  const { data: trades } = await supabase
    .from("trades")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Post a Job</h1>
      <p className="mb-8 text-lg text-muted">
        Describe what you need done. Local pros will send you quotes.
      </p>
      <NewRequestForm trades={trades ?? []} defaultZip={profile?.zip ?? ""} />
    </div>
  );
}
