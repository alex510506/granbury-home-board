"use client";

import { useActionState } from "react";
import { signUp } from "../actions";
import Link from "next/link";

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, { error: "" });

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className="mb-1 block text-lg font-medium">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

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
          minLength={8}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
        />
      </div>

      <div>
        <label htmlFor="zip" className="mb-1 block text-lg font-medium">
          ZIP Code
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

      <fieldset>
        <legend className="mb-2 text-lg font-medium">I am a…</legend>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-lg">
            <input
              type="radio"
              name="role"
              value="homeowner"
              defaultChecked
              className="h-5 w-5"
            />
            Homeowner
          </label>
          <label className="flex items-center gap-2 text-lg">
            <input
              type="radio"
              name="role"
              value="provider"
              className="h-5 w-5"
            />
            Service Provider
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {pending ? "Creating Account…" : "Sign Up"}
      </button>

      <p className="text-center text-lg text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-brand underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
