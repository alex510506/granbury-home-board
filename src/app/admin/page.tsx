import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Admin — Granbury Home Board" };

export default async function AdminPage() {
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

  const { data: providers } = await supabase
    .from("providers")
    .select("*, profiles(full_name, email:id)")
    .order("created_at", { ascending: false });

  const { data: requests } = await supabase
    .from("requests")
    .select("*, trades(name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold">
          Providers ({(providers ?? []).length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-lg">
            <thead className="border-b text-sm font-medium text-muted">
              <tr>
                <th className="pb-2 pr-4">Business</th>
                <th className="pb-2 pr-4">ZIP</th>
                <th className="pb-2 pr-4">Verified</th>
                <th className="pb-2 pr-4">Active</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(providers ?? []).map((p) => (
                <tr key={p.id}>
                  <td className="py-3 pr-4">
                    <Link href={`/providers/${p.id}`} className="text-brand underline">
                      {p.business_name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{p.zip}</td>
                  <td className="py-3 pr-4">
                    {p.verified ? (
                      <span className="text-green-700">Yes</span>
                    ) : (
                      <span className="text-muted">No</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {p.active ? (
                      <span className="text-green-700">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <form action={`/api/admin/verify-provider`} method="POST">
                        <input type="hidden" name="provider_id" value={p.id} />
                        <input type="hidden" name="verified" value={p.verified ? "false" : "true"} />
                        <button className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-brand hover:bg-blue-200">
                          {p.verified ? "Unverify" : "Verify"}
                        </button>
                      </form>
                      <form action={`/api/admin/toggle-provider`} method="POST">
                        <input type="hidden" name="provider_id" value={p.id} />
                        <input type="hidden" name="active" value={p.active ? "false" : "true"} />
                        <button className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200">
                          {p.active ? "Deactivate" : "Reactivate"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">
          Recent Requests ({(requests ?? []).length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-lg">
            <thead className="border-b text-sm font-medium text-muted">
              <tr>
                <th className="pb-2 pr-4">Title</th>
                <th className="pb-2 pr-4">Trade</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Posted By</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(requests ?? []).map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-4">
                    <Link href={`/requests/${r.id}`} className="text-brand underline">
                      {r.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{(r as any).trades?.name}</td>
                  <td className="py-3 pr-4">{r.status}</td>
                  <td className="py-3 pr-4">{(r as any).profiles?.full_name}</td>
                  <td className="py-3">
                    <form action={`/api/admin/remove-request`} method="POST">
                      <input type="hidden" name="request_id" value={r.id} />
                      <button className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
