import { error, json, readJson } from "../_lib/http.js";
import { getSupabaseAdmin } from "../_lib/supabase.js";

export async function POST(request) {
  const { sentenceId } = await readJson(request);

  if (!sentenceId) {
    return error("sentenceId is required.");
  }

  try {
    const supabase = getSupabaseAdmin();

    const current = await supabase
      .from("sentences")
      .select("starred")
      .eq("id", sentenceId)
      .single();

    if (current.error) {
      throw current.error;
    }

    const updated = await supabase
      .from("sentences")
      .update({ starred: !current.data.starred })
      .eq("id", sentenceId)
      .select("id, starred")
      .single();

    if (updated.error) {
      throw updated.error;
    }

    return json({ sentence: updated.data });
  } catch (cause) {
    return error("Failed to toggle star.", 500, String(cause));
  }
}
