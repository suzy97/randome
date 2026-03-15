export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...init.headers,
    },
    status: init.status || 200,
  });
}

export function error(message, status = 400, details = null) {
  return json(
    {
      error: message,
      details,
    },
    { status }
  );
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
