"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateProvider(
  _prev: { error: string; success: boolean },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in.", success: false };

  const providerId = formData.get("provider_id") as string;
  const businessName = formData.get("business_name") as string;
  const description = formData.get("description") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const website = formData.get("website") as string;
  const zip = formData.get("zip") as string;
  const serviceAreaRaw = formData.get("service_area") as string;
  const tradeIds = formData.getAll("trades").map((id) => Number(id));

  if (!businessName || !zip) {
    return { error: "Business name and ZIP code are required.", success: false };
  }

  if (!/^\d{5}$/.test(zip)) {
    return { error: "Enter a valid 5-digit ZIP code.", success: false };
  }

  if (tradeIds.length === 0) {
    return { error: "Select at least one service you offer.", success: false };
  }

  // Verify ownership
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("id", providerId)
    .eq("profile_id", user.id)
    .single();

  if (!provider) {
    return { error: "Provider not found or you don't have permission.", success: false };
  }

  const serviceArea = serviceAreaRaw
    ? serviceAreaRaw.split(",").map((z) => z.trim()).filter((z) => /^\d{5}$/.test(z))
    : [zip];

  const { error } = await supabase
    .from("providers")
    .update({
      business_name: businessName,
      description: description || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      zip,
      service_area: serviceArea,
      updated_at: new Date().toISOString(),
    })
    .eq("id", providerId);

  if (error) {
    return { error: "Failed to update profile.", success: false };
  }

  // Replace trade associations
  await supabase.from("provider_trades").delete().eq("provider_id", providerId);

  const tradeRows = tradeIds.map((tradeId) => ({
    provider_id: providerId,
    trade_id: tradeId,
  }));

  await supabase.from("provider_trades").insert(tradeRows);

  return { error: "", success: true };
}
