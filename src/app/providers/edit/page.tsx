import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProviderEditForm } from "./form";

export const metadata = { title: "Edit Provider Profile — Granbury Home Board" };

export default async function ProviderEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: provider } = await supabase
    .from("providers")
    .select("*, provider_trades(trade_id)")
    .eq("profile_id", user.id)
    .single();

  if (!provider) redirect("/providers/setup");

  const { data: trades } = await supabase
    .from("trades")
    .select("id, name")
    .order("name");

  const selectedTradeIds = (provider.provider_trades as any[])?.map(
    (pt: any) => pt.trade_id
  ) ?? [];

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Edit Your Profile</h1>
      <p className="mb-8 text-lg text-muted">
        Update your business info so homeowners can find you.
      </p>
      <ProviderEditForm
        provider={provider}
        trades={trades ?? []}
        selectedTradeIds={selectedTradeIds}
      />
    </div>
  );
}
