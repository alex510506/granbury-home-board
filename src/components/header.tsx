import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-brand text-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Granbury Home Board
        </Link>

        <div className="flex items-center gap-4 text-lg">
          <Link href="/requests" className="hover:underline">
            Browse Jobs
          </Link>
          <Link href="/providers" className="hover:underline">
            Providers
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="rounded-lg bg-white px-4 py-2 font-semibold text-brand hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hover:underline"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent-light"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
