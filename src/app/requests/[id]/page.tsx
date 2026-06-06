import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CloseRequestButton } from "./close-button";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: request } = await supabase
    .from("requests")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: request
      ? `${request.title} — Granbury Home Board`
      : "Request Not Found",
  };
}

export default async function RequestDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("requests")
    .select("*, trades(name), profiles(full_name)")
    .eq("id", id)
    .single();

  if (!request) notFound();

  const { data: photos } = await supabase
    .from("request_photos")
    .select("id, storage_path")
    .eq("request_id", id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === request.profile_id;

  // Get photo URLs
  const photoUrls = (photos ?? []).map((photo) => {
    const { data } = supabase.storage.from("photos").getPublicUrl(photo.storage_path);
    return { id: photo.id, url: data.publicUrl };
  });

  // Get quotes if owner
  let quotes: any[] = [];
  if (isOwner) {
    const { data } = await supabase
      .from("quotes")
      .select("*, providers(business_name, verified)")
      .eq("request_id", id)
      .order("created_at", { ascending: true });
    quotes = data ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/requests" className="mb-6 inline-block text-lg text-brand underline">
        &larr; Back to requests
      </Link>

      <div className="rounded-lg border border-gray-200 p-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{request.title}</h1>
            <p className="mt-1 text-lg text-muted">
              {(request as any).trades?.name} &middot; ZIP {request.zip}
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-1 text-sm font-semibold ${
              request.status === "open"
                ? "bg-green-100 text-green-700"
                : request.status === "quoted"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>

        <p className="mb-6 whitespace-pre-wrap text-lg">{request.description}</p>

        <p className="mb-6 text-sm text-muted">
          Posted by {(request as any).profiles?.full_name} on{" "}
          {new Date(request.created_at).toLocaleDateString()}
        </p>

        {/* Photos */}
        {photoUrls.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold">Photos</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photoUrls.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt="Job photo"
                  className="h-40 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Quotes section — visible to request owner */}
        {isOwner && (
          <div className="border-t pt-6">
            <h2 className="mb-4 text-xl font-semibold">
              Quotes Received ({quotes.length})
            </h2>
            {quotes.length === 0 ? (
              <p className="text-lg text-muted">
                No quotes yet. Providers will see your request and send quotes soon.
              </p>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote: any) => (
                  <div
                    key={quote.id}
                    className="rounded-lg border border-gray-200 p-5"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {quote.providers?.business_name}
                        </span>
                        {quote.providers?.verified && (
                          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-2xl font-bold text-brand">
                        ${Number(quote.amount).toLocaleString()}
                      </span>
                    </div>
                    {quote.message && (
                      <p className="text-lg text-muted">{quote.message}</p>
                    )}
                    <p className="mt-2 text-sm text-muted">
                      Received {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Close button for owner */}
        {isOwner && request.status !== "closed" && quotes.length > 0 && (
          <div className="border-t pt-6">
            <CloseRequestButton requestId={id} />
          </div>
        )}

        {/* Provider CTA — if signed in as provider and request is open */}
        {user && !isOwner && request.status === "open" && (
          <div className="border-t pt-6">
            <Link
              href={`/requests/${id}/quote`}
              className="inline-block rounded-lg bg-accent px-6 py-3 text-lg font-semibold text-white hover:bg-accent-light"
            >
              Send a Quote
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
