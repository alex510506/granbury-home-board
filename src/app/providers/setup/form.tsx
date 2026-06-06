"use client";

import { useActionState } from "react";
import { setupProvider } from "./actions";

export function ProviderSetupForm({
  trades,
}: {
  trades: { id: number; name: string }[];
}) {
  const [state, action, pending] = useActionState(setupProvider, { error: "" });

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="business_name" className="mb-1 block text-lg font-medium">
          Business Name
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-lg font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Tell homeowners what you do and what makes you stand out."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-lg font-medium">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-lg font-medium">
          Contact Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="website" className="mb-1 block text-lg font-medium">
          Website (optional)
        </label>
        <input
          id="website"
          name="website"
          type="url"
          placeholder="https://"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="zip" className="mb-1 block text-lg font-medium">
          Your Business ZIP Code
        </label>
        <input
          id="zip"
          name="zip"
          type="text"
          required
          pattern="[0-9]{5}"
          placeholder="76048"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="service_area" className="mb-1 block text-lg font-medium">
          Service Area ZIP Codes
        </label>
        <input
          id="service_area"
          name="service_area"
          type="text"
          placeholder="76048, 76049, 76050"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
        <p className="mt-1 text-sm text-muted">
          Comma-separated list of ZIP codes you serve.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-lg font-medium">Services You Offer</legend>
        <div className="grid grid-cols-2 gap-3">
          {trades.map((trade) => (
            <label key={trade.id} className="flex items-center gap-2 text-lg">
              <input
                type="checkbox"
                name="trades"
                value={trade.id}
                className="h-5 w-5"
              />
              {trade.name}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Saving…" : "Create Profile"}
      </button>
    </form>
  );
}
