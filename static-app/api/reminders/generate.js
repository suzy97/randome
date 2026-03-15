import { getOrCreateUser, loadAppData } from "../_lib/data.js";
import { error, json, readJson } from "../_lib/http.js";
import { getSupabaseAdmin } from "../_lib/supabase.js";

export async function POST(request) {
  const { deviceId } = await readJson(request);

  if (!deviceId) {
    return error("deviceId is required.");
  }

  try {
    const supabase = getSupabaseAdmin();
    const user = await getOrCreateUser(deviceId);

    const imports = await supabase
      .from("video_imports")
      .select("id")
      .eq("user_id", user.id)
      .order("imported_at", { ascending: false })
      .limit(3);

    if (imports.error) {
      throw imports.error;
    }

    const importIds = (imports.data || []).map((item) => item.id);
    if (!importIds.length) {
      return error("먼저 유튜브 영상을 가져와주세요.");
    }

    const candidateSentences = await supabase
      .from("sentences")
      .select("id, english, starred, seen_count, practiced_count")
      .in("import_id", importIds);

    if (candidateSentences.error) {
      throw candidateSentences.error;
    }

    const ranked = (candidateSentences.data || [])
      .slice()
      .sort((a, b) => {
        const scoreA = (a.starred ? -100 : 0) + a.seen_count + a.practiced_count;
        const scoreB = (b.starred ? -100 : 0) + b.seen_count + b.practiced_count;
        return scoreA - scoreB;
      });

    const topGroup = ranked.slice(0, Math.min(ranked.length, 4));
    const picked = topGroup[Math.floor(Math.random() * topGroup.length)];

    if (!picked) {
      return error("리마인드할 문장을 찾지 못했습니다.");
    }

    const insertedReminder = await supabase
      .from("reminder_logs")
      .insert({
        user_id: user.id,
        sentence_id: picked.id,
      })
      .select("id, sentence_id, delivered_at, opened")
      .single();

    if (insertedReminder.error) {
      throw insertedReminder.error;
    }

    const seenUpdate = await supabase
      .from("sentences")
      .update({ seen_count: picked.seen_count + 1 })
      .eq("id", picked.id);

    if (seenUpdate.error) {
      throw seenUpdate.error;
    }

    const data = await loadAppData(deviceId);
    const sentence = data.imports.flatMap((item) => item.sentences).find((item) => item.id === picked.id);
    const reminder = data.reminders.find((item) => item.id === insertedReminder.data.id);

    return json({
      setupRequired: false,
      ...data,
      reminder,
      sentence,
    });
  } catch (cause) {
    return error("Failed to generate reminder.", 500, String(cause));
  }
}
