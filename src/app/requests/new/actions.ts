"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notifyProviderNewRequest } from "@/lib/notifications";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function createRequest(
  _prev: { error: string },
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const tradeId = Number(formData.get("trade_id"));
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const zip = formData.get("zip") as string;
  const photos = formData.getAll("photos") as File[];

  if (!tradeId || !title || !description || !zip) {
    return { error: "Please fill in all required fields." };
  }

  if (!/^\d{5}$/.test(zip)) {
    return { error: "Enter a valid 5-digit ZIP code." };
  }

  if (title.length > 100) {
    return { error: "Title must be 100 characters or less." };
  }

  // Create the request
  const { data: request, error } = await supabase
    .from("requests")
    .insert({
      profile_id: user.id,
      trade_id: tradeId,
      title,
      description,
      zip,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Failed to create request. Please try again." };
  }

  // Upload photos
  const validPhotos = photos.filter(
    (f) => f.size > 0 && f.size <= MAX_FILE_SIZE && ALLOWED_TYPES.includes(f.type)
  );

  for (const photo of validPhotos.slice(0, 5)) {
    const ext = photo.name.split(".").pop() ?? "jpg";
    const path = `requests/${request.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, photo, { contentType: photo.type });

    if (!uploadError) {
      await supabase.from("request_photos").insert({
        request_id: request.id,
        storage_path: path,
      });
    }
  }

  // Notify relevant providers
  notifyProviderNewRequest(tradeId, title, zip);

  redirect(`/requests/${request.id}`);
}
