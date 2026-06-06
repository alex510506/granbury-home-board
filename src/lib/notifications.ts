"use server";

import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/email";

export async function notifyHomeownerNewQuote(requestId: string, providerName: string) {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("requests")
    .select("title, profile_id")
    .eq("id", requestId)
    .single();

  if (!request) return;

  const { data: owner } = await supabase.auth.admin.getUserById(request.profile_id);

  if (!owner?.user?.email) return;

  await sendNotification({
    to: owner.user.email,
    subject: `New quote on "${request.title}"`,
    body: `${providerName} sent you a quote on your request "${request.title}".\n\nLog in to Granbury Home Board to compare quotes and pick your pro.`,
  });
}

export async function notifyProviderNewRequest(tradeId: number, requestTitle: string, requestZip: string) {
  const supabase = await createClient();

  // Find providers who offer this trade and serve this ZIP
  const { data: providerTrades } = await supabase
    .from("provider_trades")
    .select("provider_id")
    .eq("trade_id", tradeId);

  if (!providerTrades || providerTrades.length === 0) return;

  const providerIds = providerTrades.map((pt) => pt.provider_id);

  const { data: providers } = await supabase
    .from("providers")
    .select("profile_id, business_name, service_area")
    .in("id", providerIds)
    .eq("active", true);

  if (!providers) return;

  // Filter to those who serve the request ZIP
  const relevantProviders = providers.filter(
    (p) => (p.service_area as string[])?.includes(requestZip)
  );

  for (const provider of relevantProviders) {
    const { data: user } = await supabase.auth.admin.getUserById(provider.profile_id);
    if (!user?.user?.email) continue;

    await sendNotification({
      to: user.user.email,
      subject: `New job in your area: "${requestTitle}"`,
      body: `A homeowner in ZIP ${requestZip} posted a job: "${requestTitle}".\n\nLog in to Granbury Home Board to view the details and send a quote.`,
    });
  }
}
