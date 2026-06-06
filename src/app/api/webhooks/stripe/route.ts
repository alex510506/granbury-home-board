import { getStripe, MONETIZATION_ENABLED } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Use service role client for webhook — no user session available
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  if (!MONETIZATION_ENABLED) {
    return NextResponse.json({ error: "Monetization disabled" }, { status: 400 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const providerId = session.metadata?.provider_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!providerId) break;

      // Fetch subscription to get period end
      const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;

      await supabase.from("subscriptions").upsert(
        {
          provider_id: providerId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: "active",
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_id" }
      );

      // Mark provider as verified when they subscribe
      await supabase
        .from("providers")
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq("id", providerId);

      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      const subscriptionId = invoice.subscription as string;

      if (!subscriptionId) break;

      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;

      await supabase
        .from("subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
