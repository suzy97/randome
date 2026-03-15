# Randome Integration Setup

## Goal
Connect the current Vercel app to:
- Supabase for persistent data storage
- Gemini for transcript-based sentence generation

## 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com/dashboard).
2. Click `New project`.
3. Choose your organization.
4. Enter a project name such as `randome-prod`.
5. Set a strong database password.
6. Choose a region close to your users.
7. Wait for the project to finish provisioning.

## 2. Create Database Tables
1. Open the Supabase dashboard.
2. Go to `SQL Editor`.
3. Paste the SQL from [docs/randome-supabase-schema.sql](/Users/musinsa/Documents/makers/docs/randome-supabase-schema.sql).
4. Run the query once.

## 3. Copy Required Supabase Values
From `Project Settings -> API`, copy:
- `Project URL` -> use as `SUPABASE_URL`
- `service_role` key -> use as `SUPABASE_SERVICE_ROLE_KEY`

Use the `service_role` key only on the server side.

## 4. Create Gemini API Key
1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a new API key.
3. Use it as `GEMINI_API_KEY`.

Recommended default model:
- `gemini-2.5-flash`

## 5. Add Vercel Environment Variables
In your Vercel project settings, add:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

Recommended `GEMINI_MODEL` value:
- `gemini-2.5-flash`

## 6. Local Development
Inside [static-app](/Users/musinsa/Documents/makers/static-app):

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` with real values, then run:

```bash
npx vercel dev
```

## 7. Production Notes
- Transcript fetching currently uses the `youtube-transcript` package.
- That package relies on an unofficial YouTube transcript path, so some videos may fail.
- For the first production pass, prefer public videos with English subtitles.

## 8. Current Server Endpoints
- `GET /api/bootstrap`
- `POST /api/import-youtube`
- `POST /api/reminders/generate`
- `POST /api/sentences/seen`
- `POST /api/sentences/practiced`
- `POST /api/sentences/star`
