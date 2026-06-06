"use client";

import { useActionState } from "react";
import { signIn } from "../actions";
import Link from "next/link";

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-lg font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-lg font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Signing In…" : "Sign In"}
      </button>

      <p className="text-center text-lg text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-brand underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
