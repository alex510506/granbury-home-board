"use client";

import { useActionState } from "react";
import { closeRequest } from "./actions";

export function CloseRequestButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(closeRequest, {
    error: "",
    success: false,
  });

  if (state.success) {
    return (
      <p className="text-lg font-semibold text-green-700">
        Request closed. Thanks for using Granbury Home Board!
      </p>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="request_id" value={requestId} />
      {state.error && (
        <p className="mb-2 text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gray-800 px-6 py-3 text-lg font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
      >
        {pending ? "Closing…" : "Close This Request"}
      </button>
      <p className="mt-2 text-sm text-muted">
        Mark this job as done once you&apos;ve picked a provider.
      </p>
    </form>
  );
}
