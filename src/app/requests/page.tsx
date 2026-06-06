import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Open Requests — Granbury Home Board" };

export default async function RequestsPage(props: {
  searchParams: Promise<{ trade?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("requests")
    .select("*, trades(name, slug)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (searchParams.trade) {
    const { data: trade } = await supabase
      .from("trades")
      .select("id")
      .eq("slug", searchParams.trade)
      .single();
    if (trade) {
      query = query.eq("trade_id", trade.id);
    }
  }

  const { data: requests } = await query;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Open Requests</h1>
        <Link
          href="/requests/new"
          className="rounded-lg bg-brand px-5 py-2 text-lg font-semibold text-white hover:bg-brand-dark"
        >
          Post a Job
        </Link>
      </div>

      {(!requests || requests.length === 0) && (
        <p className="py-12 text-center text-xl text-muted">
          No open requests yet. Be the first to{" "}
          <Link href="/requests/new" className="text-brand underline">
            post a job
          </Link>
          !
        </p>
      )}

      <div className="space-y-4">
        {(requests ?? []).map((req) => (
          <Link
            key={req.id}
            href={`/requests/${req.id}`}
            className="block rounded-lg border border-gray-200 p-5 hover:border-brand hover:shadow"
          >
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{req.title}</h2>
              <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-brand">
                {(req as any).trades?.name}
              </span>
            </div>
            <p className="text-lg text-muted line-clamp-2">
              {req.description}
            </p>
            <p className="mt-2 text-sm text-muted">
              ZIP: {req.zip} &middot;{" "}
              {new Date(req.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
