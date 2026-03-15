import { fetchTranscript } from "youtube-transcript";

export function extractVideoId(url) {
  try {
    const parsed = new URL(url);
    const shortId = parsed.hostname.includes("youtu.be")
      ? parsed.pathname.replace("/", "")
      : parsed.searchParams.get("v");

    if (shortId) {
      return shortId;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getTranscript(url) {
  const items = await fetchTranscript(url, { lang: "en" });

  if (!items || !items.length) {
    throw new Error("이 유튜브 영상에서 영어 자막을 가져오지 못했습니다.");
  }

  return items;
}

export function transcriptToPromptText(items) {
  const joined = items
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (joined.length <= 28000) {
    return joined;
  }

  return `${joined.slice(0, 28000)}...`;
}
