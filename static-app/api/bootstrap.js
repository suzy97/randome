import { getMissingEnvKeys } from "./_lib/env.js";
import { loadAppData } from "./_lib/data.js";
import { error, json } from "./_lib/http.js";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");

  if (!deviceId) {
    return error("deviceId is required.");
  }

  const missing = getMissingEnvKeys();

  if (missing.length) {
    return json({
      setupRequired: true,
      missingEnv: missing,
      imports: [],
      reminders: [],
    });
  }

  try {
    const data = await loadAppData(deviceId);
    return json({
      setupRequired: false,
      ...data,
    });
  } catch (cause) {
    return error("Failed to load app data from Supabase.", 500, String(cause));
  }
}
