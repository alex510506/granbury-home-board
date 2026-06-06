"use client";

import { useActionState, useState } from "react";
import { createRequest } from "./actions";

export function NewRequestForm({
  trades,
  defaultZip,
}: {
  trades: { id: number; name: string }[];
  defaultZip: string;
}) {
  const [state, action, pending] = useActionState(createRequest, { error: "" });
  const [photos, setPhotos] = useState<File[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="trade_id" className="mb-1 block text-lg font-medium">
          What type of work?
        </label>
        <select
          id="trade_id"
          name="trade_id"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        >
          <option value="">Choose a category…</option>
          {trades.map((trade) => (
            <option key={trade.id} value={trade.id}>
              {trade.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-lg font-medium">
          Short Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. Leaky kitchen faucet"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-lg font-medium">
          Describe the Job
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="Give providers enough detail to give you an accurate quote. What's wrong? How big is the area? Any deadlines?"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="zip" className="mb-1 block text-lg font-medium">
          Job ZIP Code
        </label>
        <input
          id="zip"
          name="zip"
          type="text"
          required
          pattern="[0-9]{5}"
          defaultValue={defaultZip}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label className="mb-1 block text-lg font-medium">
          Photos (optional, up to 5)
        </label>
        <input
          type="file"
          name="photos"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg file:mr-4 file:rounded file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white"
        />
        {photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {photos.map((file, i) => (
              <div key={i} className="relative">
                <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center text-sm text-muted overflow-hidden">
                  {file.name.slice(0, 8)}…
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-sm text-muted">
          JPG or PNG, max 5 MB each.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Posting…" : "Post Job Request"}
      </button>
    </form>
  );
}
