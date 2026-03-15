import { getSupabaseAdmin } from "./supabase.js";

export async function getOrCreateUser(deviceId) {
  const supabase = getSupabaseAdmin();

  const existing = await supabase
    .from("app_users")
    .select("id, device_id, timezone, locale, created_at")
    .eq("device_id", deviceId)
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    return existing.data;
  }

  const inserted = await supabase
    .from("app_users")
    .insert({
      device_id: deviceId,
    })
    .select("id, device_id, timezone, locale, created_at")
    .single();

  if (inserted.error) {
    throw inserted.error;
  }

  return inserted.data;
}

export async function loadAppData(deviceId) {
  const supabase = getSupabaseAdmin();
  const user = await getOrCreateUser(deviceId);

  const [importsResult, remindersResult] = await Promise.all([
    supabase
      .from("video_imports")
      .select(
        "id, user_id, youtube_url, youtube_video_id, source_title, transcript_text, learning_window_start, learning_window_end, daily_reminder_count, imported_at"
      )
      .eq("user_id", user.id)
      .order("imported_at", { ascending: false }),
    supabase
      .from("reminder_logs")
      .select("id, sentence_id, delivered_at, opened")
      .eq("user_id", user.id)
      .order("delivered_at", { ascending: false })
      .limit(12),
  ]);

  if (importsResult.error) throw importsResult.error;
  if (remindersResult.error) throw remindersResult.error;

  const importIds = new Set((importsResult.data || []).map((item) => item.id));
  let sentenceRows = [];

  if (importIds.size) {
    const sentencesResult = await supabase
      .from("sentences")
      .select(
        "id, import_id, english, korean, pattern, reason, example, cloze, choices, answer, seen_count, practiced_count, starred, created_at"
      )
      .in("import_id", Array.from(importIds))
      .order("created_at", { ascending: true });

    if (sentencesResult.error) throw sentencesResult.error;
    sentenceRows = sentencesResult.data || [];
  }

  const sentenceMap = new Map();

  const sentencesByImport = sentenceRows.reduce((acc, sentence) => {
    if (!importIds.has(sentence.import_id)) {
      return acc;
    }

    sentenceMap.set(sentence.id, sentence);

    if (!acc[sentence.import_id]) {
      acc[sentence.import_id] = [];
    }

    acc[sentence.import_id].push({
      id: sentence.id,
      english: sentence.english,
      korean: sentence.korean,
      pattern: sentence.pattern,
      reason: sentence.reason,
      example: sentence.example,
      cloze: sentence.cloze,
      choices: Array.isArray(sentence.choices) ? sentence.choices : [],
      answer: sentence.answer,
      seenCount: sentence.seen_count,
      practicedCount: sentence.practiced_count,
      starred: sentence.starred,
    });

    return acc;
  }, {});

  return {
    user,
    imports: (importsResult.data || []).map((item) => ({
      id: item.id,
      youtubeUrl: item.youtube_url,
      youtubeVideoId: item.youtube_video_id,
      sourceTitle: item.source_title,
      learningWindowStart: item.learning_window_start?.slice(0, 5),
      learningWindowEnd: item.learning_window_end?.slice(0, 5),
      dailyReminderCount: item.daily_reminder_count,
      importedAt: item.imported_at,
      sentences: sentencesByImport[item.id] || [],
    })),
    reminders: (remindersResult.data || []).map((reminder) => ({
      id: reminder.id,
      sentenceId: reminder.sentence_id,
      title: "오늘 한 문장만 다시 떠올려볼까요?",
      preview: sentenceMap.get(reminder.sentence_id)?.english || "문장 미리보기 없음",
      deliveredAt: reminder.delivered_at,
      deliveredAtLabel: new Date(reminder.delivered_at).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      opened: reminder.opened,
    })),
  };
}
