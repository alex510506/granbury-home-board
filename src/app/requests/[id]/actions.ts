"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function closeRequest(
  _prev: { error: string; success: boolean },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in.", success: false };

  const requestId = formData.get("request_id") as string;

  if (!requestId) return { error: "Missing request ID.", success: false };

  // Verify ownership
  const { data: request } = await supabase
    .from("requests")
    .select("id, profile_id, status")
    .eq("id", requestId)
    .eq("profile_id", user.id)
    .single();

  if (!request) {
    return { error: "Request not found or you don't have permission.", success: false };
  }

  if (request.status === "closed") {
    return { error: "This request is already closed.", success: false };
  }

  const { error } = await supabase
    .from("requests")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    return { error: "Failed to close request.", success: false };
  }

  revalidatePath(`/requests/${requestId}`);
  return { error: "", success: true };
}
