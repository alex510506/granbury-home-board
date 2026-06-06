import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: trades } = await supabase
    .from("trades")
    .select("id, name, slug")
    .order("name");

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand px-4 py-16 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
          Home Services in Hood County
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl">
          Post what you need done. Local pros send you quotes. Compare side by
          side and pick who&apos;s right for the job.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/requests/new"
            className="rounded-lg bg-accent px-8 py-4 text-xl font-bold text-white hover:bg-accent-light"
          >
            Post a Job — It&apos;s Free
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg border-2 border-white px-8 py-4 text-xl font-bold hover:bg-white hover:text-brand"
          >
            Join as a Pro
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Post Your Job",
              desc: "Tell us what you need — plumbing, painting, HVAC, you name it. Add photos if you like.",
            },
            {
              step: "2",
              title: "Get Quotes",
              desc: "Local pros see your request and send their price and message directly to you.",
            },
            {
              step: "3",
              title: "Pick Your Pro",
              desc: "Compare quotes side by side. Choose the one that fits your budget and schedule.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
                {item.step}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
              <p className="text-lg text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trades grid */}
      <section className="bg-surface px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Services Available
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(trades ?? []).map((trade) => (
              <Link
                key={trade.id}
                href={`/requests?trade=${trade.slug}`}
                className="rounded-lg border border-gray-200 bg-white px-4 py-4 text-center text-lg font-medium hover:border-brand hover:shadow"
              >
                {trade.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
