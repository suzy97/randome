import { generateLearningPack } from "./_lib/gemini.js";
import { getOrCreateUser, loadAppData } from "./_lib/data.js";
import { error, json, readJson } from "./_lib/http.js";
import { getSupabaseAdmin } from "./_lib/supabase.js";
import { extractVideoId, getTranscript, transcriptToPromptText } from "./_lib/youtube.js";

export async function POST(request) {
  const body = await readJson(request);
  const {
    deviceId,
    url,
    learningWindowStart = "09:00",
    learningWindowEnd = "21:00",
    dailyReminderCount = 4,
  } = body;

  if (!deviceId || !url) {
    return error("deviceId and url are required.");
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return error("올바른 유튜브 URL을 입력해주세요.");
  }

  try {
    const transcriptItems = await getTranscript(url);
    const transcriptText = transcriptToPromptText(transcriptItems);

    if (!transcriptText) {
      return error("자막에서 텍스트를 추출하지 못했습니다.");
    }

    const learningPack = await generateLearningPack({ url, transcriptText });
    const supabase = getSupabaseAdmin();
    const user = await getOrCreateUser(deviceId);

    const insertedImport = await supabase
      .from("video_imports")
      .insert({
        user_id: user.id,
        youtube_url: url,
        youtube_video_id: videoId,
        source_title: learningPack.sourceTitle,
        transcript_text: transcriptText,
        learning_window_start: learningWindowStart,
        learning_window_end: learningWindowEnd,
        daily_reminder_count: dailyReminderCount,
      })
      .select("id")
      .single();

    if (insertedImport.error) {
      throw insertedImport.error;
    }

    const insertedSentences = await supabase.from("sentences").insert(
      learningPack.sentences.map((sentence) => ({
        import_id: insertedImport.data.id,
        english: sentence.english,
        korean: sentence.korean,
        pattern: sentence.pattern,
        reason: sentence.reason,
        example: sentence.example,
        cloze: sentence.cloze,
        choices: sentence.choices,
        answer: sentence.answer,
      }))
    );

    if (insertedSentences.error) {
      throw insertedSentences.error;
    }

    const data = await loadAppData(deviceId);

    return json({
      setupRequired: false,
      ...data,
    });
  } catch (cause) {
    return error("유튜브 자막 분석 또는 저장에 실패했습니다.", 500, String(cause));
  }
}
