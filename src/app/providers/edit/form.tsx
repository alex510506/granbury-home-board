"use client";

import { useActionState } from "react";
import { updateProvider } from "./actions";

export function ProviderEditForm({
  provider,
  trades,
  selectedTradeIds,
}: {
  provider: any;
  trades: { id: number; name: string }[];
  selectedTradeIds: number[];
}) {
  const [state, action, pending] = useActionState(updateProvider, { error: "", success: false });

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700">
          Profile updated successfully.
        </div>
      )}

      <input type="hidden" name="provider_id" value={provider.id} />

      <div>
        <label htmlFor="business_name" className="mb-1 block text-lg font-medium">
          Business Name
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          required
          defaultValue={provider.business_name}
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
          defaultValue={provider.description ?? ""}
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
          defaultValue={provider.phone ?? ""}
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
          defaultValue={provider.email ?? ""}
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
          defaultValue={provider.website ?? ""}
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
          defaultValue={provider.zip}
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
          defaultValue={(provider.service_area ?? []).join(", ")}
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
                defaultChecked={selectedTradeIds.includes(trade.id)}
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
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
