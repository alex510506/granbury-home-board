import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: provider } = await supabase
    .from("providers")
    .select("business_name")
    .eq("id", id)
    .single();

  return {
    title: provider
      ? `${provider.business_name} — Granbury Home Board`
      : "Provider Not Found",
  };
}

export default async function ProviderProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("*, profiles(full_name), provider_trades(trade_id, trades(name))")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!provider) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/providers" className="mb-6 inline-block text-brand underline text-lg">
        &larr; Back to directory
      </Link>

      <div className="rounded-lg border border-gray-200 p-8">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{provider.business_name}</h1>
          {provider.verified && (
            <span className="rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              Verified
            </span>
          )}
        </div>

        <p className="mb-6 text-lg text-muted">
          {provider.description ?? "No description provided."}
        </p>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {provider.phone && (
            <div>
              <p className="text-sm font-medium text-muted">Phone</p>
              <p className="text-lg">{provider.phone}</p>
            </div>
          )}
          {provider.email && (
            <div>
              <p className="text-sm font-medium text-muted">Email</p>
              <p className="text-lg">{provider.email}</p>
            </div>
          )}
          {provider.website && (
            <div>
              <p className="text-sm font-medium text-muted">Website</p>
              <p className="text-lg">{provider.website}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted">Based in</p>
            <p className="text-lg">{provider.zip}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-muted">Services</p>
          <div className="flex flex-wrap gap-2">
            {(provider.provider_trades as any[])?.map((pt: any) => (
              <span
                key={pt.trade_id}
                className="rounded-full bg-surface px-4 py-2 text-lg font-medium"
              >
                {pt.trades?.name}
              </span>
            ))}
          </div>
        </div>

        {provider.service_area && provider.service_area.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted">Service Area (ZIP codes)</p>
            <p className="text-lg">{provider.service_area.join(", ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
