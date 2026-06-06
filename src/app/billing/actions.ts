"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe, MONETIZATION_ENABLED } from "@/lib/stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSession(_prev: { error: string }) {
  if (!MONETIZATION_ENABLED) return { error: "Subscriptions are not yet available." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!provider) return { error: "Set up your provider profile first." };

  // Find or create Stripe customer
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("provider_id", provider.id)
    .single();

  let customerId = existingSub?.stripe_customer_id;

  const stripe = getStripe();

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { provider_id: provider.id, user_id: user.id },
    });
    customerId = customer.id;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 2900,
          recurring: { interval: "month" },
          product_data: {
            name: "Granbury Home Board Pro",
            description: "Unlimited quotes, priority placement, verified badge",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/billing?success=true`,
    cancel_url: `${appUrl}/billing`,
    metadata: { provider_id: provider.id },
  });

  if (!session.url) return { error: "Failed to create checkout session." };

  redirect(session.url);
}

export async function createPortalSession(_prev: { error: string }) {
  if (!MONETIZATION_ENABLED) return { error: "Subscriptions are not yet available." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!provider) return { error: "Provider not found." };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("provider_id", provider.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return { error: "No active subscription found." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${appUrl}/billing`,
  });

  redirect(session.url);
}
