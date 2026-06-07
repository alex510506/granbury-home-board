import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b-4 border-brand bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/granbury-logo.png"
            alt="Granbury"
            width={60}
            height={40}
            className="object-contain"
          />
          <span
            className="text-2xl font-bold tracking-tight text-brand"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Home Board
          </span>
        </Link>

        <div className="flex items-center gap-4 text-lg font-medium text-brand">
          <Link href="/requests" className="hover:text-accent">
            Browse Jobs
          </Link>
          <Link href="/providers" className="hover:text-accent">
            Providers
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-accent">
                Dashboard
              </Link>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="rounded-lg border-2 border-brand px-4 py-2 font-semibold text-brand hover:bg-brand hover:text-white"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hover:text-accent">
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
