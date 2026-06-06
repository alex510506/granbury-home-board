import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Service Providers — Granbury Home Board" };

export default async function ProvidersPage(props: {
  searchParams: Promise<{ trade?: string; zip?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const { data: trades } = await supabase
    .from("trades")
    .select("id, name, slug")
    .order("name");

  let query = supabase
    .from("providers")
    .select("*, profiles(full_name), provider_trades(trade_id, trades(name))")
    .eq("active", true)
    .order("verified", { ascending: false })
    .order("created_at", { ascending: false });

  if (searchParams.zip) {
    query = query.contains("service_area", [searchParams.zip]);
  }

  if (searchParams.trade) {
    const matchedTrade = (trades ?? []).find(
      (t) => t.slug === searchParams.trade
    );
    if (matchedTrade) {
      const { data: providerIds } = await supabase
        .from("provider_trades")
        .select("provider_id")
        .eq("trade_id", matchedTrade.id);
      const ids = (providerIds ?? []).map((p) => p.provider_id);
      if (ids.length > 0) {
        query = query.in("id", ids);
      } else {
        query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      }
    }
  }

  const { data: providers } = await query;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Service Providers</h1>

      {/* Filters */}
      <form className="mb-8 flex flex-wrap gap-4">
        <select
          name="trade"
          defaultValue={searchParams.trade ?? ""}
          className="rounded-lg border border-gray-300 px-4 py-3 text-lg"
        >
          <option value="">All Trades</option>
          {(trades ?? []).map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          name="zip"
          type="text"
          placeholder="ZIP code"
          defaultValue={searchParams.zip ?? ""}
          pattern="[0-9]{5}"
          className="rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-dark"
        >
          Filter
        </button>
      </form>

      {(!providers || providers.length === 0) && (
        <p className="py-12 text-center text-xl text-muted">
          No providers found matching your filters.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {(providers ?? []).map((provider) => (
          <Link
            key={provider.id}
            href={`/providers/${provider.id}`}
            className="rounded-lg border border-gray-200 p-6 hover:border-brand hover:shadow"
          >
            <div className="mb-2 flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {provider.business_name}
              </h2>
              {provider.verified && (
                <span className="rounded bg-green-100 px-2 py-0.5 text-sm font-medium text-green-700">
                  Verified
                </span>
              )}
            </div>
            <p className="mb-3 text-muted line-clamp-2">
              {provider.description ?? "No description provided."}
            </p>
            <div className="flex flex-wrap gap-2">
              {(provider.provider_trades as any[])?.map((pt: any) => (
                <span
                  key={pt.trade_id}
                  className="rounded-full bg-surface px-3 py-1 text-sm font-medium"
                >
                  {pt.trades?.name}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">
              Based in {provider.zip}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
