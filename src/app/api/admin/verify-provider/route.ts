import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
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

  if (profile?.role !== "admin") redirect("/dashboard");

  const formData = await request.formData();
  const providerId = formData.get("provider_id") as string;
  const verified = formData.get("verified") === "true";

  await supabase
    .from("providers")
    .update({ verified, updated_at: new Date().toISOString() })
    .eq("id", providerId);

  redirect("/admin");
}
