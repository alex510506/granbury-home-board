import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { QuoteForm } from "./form";

export const metadata = { title: "Send a Quote — Granbury Home Board" };

export default async function QuotePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // Must be a provider
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!provider) redirect("/providers/setup");

  // Request must exist and be open
  const { data: request } = await supabase
    .from("requests")
    .select("id, title, status, profile_id, trades(name)")
    .eq("id", id)
    .single();

  if (!request) notFound();

  if (request.status !== "open") {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">Request Closed</h1>
        <p className="text-lg text-muted">This request is no longer accepting quotes.</p>
      </div>
    );
  }

  // Can't quote your own request
  if (request.profile_id === user.id) redirect(`/requests/${id}`);

  // Check if already quoted
  const { data: existingQuote } = await supabase
    .from("quotes")
    .select("id")
    .eq("request_id", id)
    .eq("provider_id", provider.id)
    .single();

  if (existingQuote) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">Quote Already Sent</h1>
        <p className="text-lg text-muted">
          You already submitted a quote for this request.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Send a Quote</h1>
      <p className="mb-8 text-lg text-muted">
        For: <strong>{request.title}</strong> ({(request as any).trades?.name})
      </p>
      <QuoteForm requestId={id} providerId={provider.id} />
    </div>
  );
}
