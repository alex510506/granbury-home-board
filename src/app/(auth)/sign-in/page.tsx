import { SignInForm } from "./form";

export const metadata = { title: "Sign In — Granbury Home Board" };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Sign In</h1>
      <p className="mb-8 text-lg text-muted">
        Welcome back to Granbury Home Board.
      </p>
      <SignInForm />
    </div>
  );
}
