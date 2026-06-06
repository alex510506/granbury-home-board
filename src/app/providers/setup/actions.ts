"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function setupProvider(
  _prev: { error: string },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const businessName = formData.get("business_name") as string;
  const description = formData.get("description") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const website = formData.get("website") as string;
  const zip = formData.get("zip") as string;
  const serviceAreaRaw = formData.get("service_area") as string;
  const tradeIds = formData.getAll("trades").map((id) => Number(id));

  if (!businessName || !zip) {
    return { error: "Business name and ZIP code are required." };
  }

  if (!/^\d{5}$/.test(zip)) {
    return { error: "Enter a valid 5-digit ZIP code." };
  }

  if (tradeIds.length === 0) {
    return { error: "Select at least one service you offer." };
  }

  const serviceArea = serviceAreaRaw
    ? serviceAreaRaw.split(",").map((z) => z.trim()).filter((z) => /^\d{5}$/.test(z))
    : [zip];

  const { data: provider, error } = await supabase
    .from("providers")
    .insert({
      profile_id: user.id,
      business_name: businessName,
      description: description || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      zip,
      service_area: serviceArea,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Failed to create profile. You may already have one." };
  }

  const tradeRows = tradeIds.map((tradeId) => ({
    provider_id: provider.id,
    trade_id: tradeId,
  }));

  await supabase.from("provider_trades").insert(tradeRows);

  redirect("/dashboard");
}
