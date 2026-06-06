"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyHomeownerNewQuote } from "@/lib/notifications";

export async function submitQuote(
  _prev: { error: string },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const requestId = formData.get("request_id") as string;
  const providerId = formData.get("provider_id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const message = (formData.get("message") as string)?.trim() || null;

  if (!requestId || !providerId) {
    return { error: "Missing request information." };
  }

  if (isNaN(amount) || amount <= 0) {
    return { error: "Enter a valid price." };
  }

  // Verify this provider belongs to the user
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("id", providerId)
    .eq("profile_id", user.id)
    .single();

  if (!provider) {
    return { error: "Provider not found." };
  }

  // Verify request is open
  const { data: request } = await supabase
    .from("requests")
    .select("id, status")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "open") {
    return { error: "This request is no longer accepting quotes." };
  }

  // Check free tier cap (1 quote/month for unpaid providers)
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("provider_id", providerId)
    .eq("status", "active")
    .single();

  if (!subscription) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { count } = await supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", providerId)
      .gte("created_at", startOfMonth);

    if ((count ?? 0) >= 1) {
      return {
        error:
          "Free providers can send 1 quote per month. Upgrade to send unlimited quotes.",
      };
    }
  }

  const { error } = await supabase.from("quotes").insert({
    request_id: requestId,
    provider_id: providerId,
    amount,
    message,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already sent a quote for this request." };
    }
    return { error: "Failed to send quote. Please try again." };
  }

  // Update request status to 'quoted' if it was 'open'
  await supabase
    .from("requests")
    .update({ status: "quoted", updated_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "open");

  // Get provider name for notification
  const { data: providerInfo } = await supabase
    .from("providers")
    .select("business_name")
    .eq("id", providerId)
    .single();

  notifyHomeownerNewQuote(requestId, providerInfo?.business_name ?? "A provider");

  redirect(`/requests/${requestId}`);
}
