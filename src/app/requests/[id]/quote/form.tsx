"use client";

import { useActionState } from "react";
import { submitQuote } from "./actions";

export function QuoteForm({
  requestId,
  providerId,
}: {
  requestId: string;
  providerId: string;
}) {
  const [state, action, pending] = useActionState(submitQuote, { error: "" });

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}

      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="provider_id" value={providerId} />

      <div>
        <label htmlFor="amount" className="mb-1 block text-lg font-medium">
          Your Price ($)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          required
          min="1"
          step="0.01"
          placeholder="250.00"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-lg font-medium">
          Message to Homeowner (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Explain what's included, your timeline, or anything else they should know."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-accent px-6 py-3 text-lg font-semibold text-white hover:bg-accent-light disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send Quote"}
      </button>
    </form>
  );
}
