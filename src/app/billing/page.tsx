import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MONETIZATION_ENABLED } from "@/lib/stripe";
import Link from "next/link";
import { ManageSubscriptionButton, SubscribeButton } from "./buttons";

export const metadata = { title: "Billing — Granbury Home Board" };

export default async function BillingPage() {
  if (!MONETIZATION_ENABLED) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!provider) redirect("/providers/setup");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("provider_id", provider.id)
    .single();

  const isActive = subscription?.status === "active";

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link href="/dashboard" className="mb-6 inline-block text-lg text-brand underline">
        &larr; Back to dashboard
      </Link>

      <h1 className="mb-2 text-3xl font-bold">Billing</h1>
      <p className="mb-8 text-lg text-muted">
        Manage your Granbury Home Board subscription.
      </p>

      <div className="rounded-lg border border-gray-200 p-8">
        {isActive ? (
          <>
            <div className="mb-6">
              <span className="rounded-full bg-green-100 px-4 py-1 text-lg font-semibold text-green-700">
                Pro Plan — Active
              </span>
            </div>
            <ul className="mb-6 space-y-2 text-lg">
              <li>Unlimited quotes per month</li>
              <li>Priority placement in search results</li>
              <li>Verified badge on your profile</li>
            </ul>
            {subscription?.current_period_end && (
              <p className="mb-6 text-muted">
                Renews{" "}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            <ManageSubscriptionButton />
          </>
        ) : (
          <>
            <h2 className="mb-4 text-2xl font-semibold">Upgrade to Pro</h2>
            <p className="mb-4 text-3xl font-bold">
              $29<span className="text-lg font-normal text-muted">/month</span>
            </p>
            <ul className="mb-6 space-y-2 text-lg">
              <li>Unlimited quotes per month (free plan: 1/month)</li>
              <li>Priority placement in search results</li>
              <li>Verified badge on your profile</li>
            </ul>
            <SubscribeButton />
          </>
        )}
      </div>
    </div>
  );
}
