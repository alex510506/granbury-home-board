"use client";

import { useActionState } from "react";
import { createCheckoutSession, createPortalSession } from "./actions";

export function SubscribeButton() {
  const [state, action, pending] = useActionState(createCheckoutSession, {
    error: "",
  });

  return (
    <form action={action}>
      {state.error && (
        <p className="mb-3 text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-6 py-3 text-lg font-semibold text-white hover:bg-accent-light disabled:opacity-50"
      >
        {pending ? "Loading…" : "Subscribe — $29/month"}
      </button>
    </form>
  );
}

export function ManageSubscriptionButton() {
  const [state, action, pending] = useActionState(createPortalSession, {
    error: "",
  });

  return (
    <form action={action}>
      {state.error && (
        <p className="mb-3 text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border-2 border-brand px-6 py-3 text-lg font-semibold text-brand hover:bg-brand hover:text-white disabled:opacity-50"
      >
        {pending ? "Loading…" : "Manage Subscription"}
      </button>
    </form>
  );
}
