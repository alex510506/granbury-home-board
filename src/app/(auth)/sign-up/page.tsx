import { SignUpForm } from "./form";

export const metadata = { title: "Sign Up — Granbury Home Board" };

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Create Your Account</h1>
      <p className="mb-8 text-lg text-muted">
        Join Granbury Home Board to post jobs or send quotes.
      </p>
      <SignUpForm />
    </div>
  );
}
