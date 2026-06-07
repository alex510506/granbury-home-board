"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function signUp(
  _prev: { error: string },
  formData: FormData
) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const zip = formData.get("zip") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !fullName || !zip || !role) {
    return { error: "All fields are required." };
  }

  if (!["homeowner", "provider"].includes(role)) {
    return { error: "Invalid role." };
  }

  if (!/^\d{5}$/.test(zip)) {
    return { error: "Enter a valid 5-digit ZIP code." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, zip },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Use service role client to bypass RLS — the user session isn't
    // established on the server yet right after signUp.
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: profileError } = await admin.from("profiles").insert({
      id: data.user.id,
      role,
      full_name: fullName,
      zip,
    });

    if (profileError) {
      return { error: "Account created but profile setup failed. Please sign in and try again." };
    }
  }

  redirect("/dashboard");
}

export async function signIn(
  _prev: { error: string },
  formData: FormData
) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/dashboard");
}
