# Randome Same-Day MVP Launch Guide

## Goal
Open a testable MVP today that proves one loop:

`YouTube URL input -> sentence extraction -> Korean translation -> random reminder -> active practice`

## Fastest Launch Shape
For today, the fastest realistic launch is a `web MVP`, not a full native app.

Why:
- no App Store review delay
- no APNs / FCM production setup required on day one
- users can test immediately with a link
- browser notifications are enough to validate reminder behavior in early testing

## Today's MVP Scope

### Must Ship Today
- one URL input flow
- one imported video turned into 3 to 10 useful sentence cards
- English original + Korean translation
- one-tap sentence detail
- one short practice interaction per sentence
- browser-based reminder simulation or notification
- simple library for revisiting sentences

### Can Be Faked Today
- transcript extraction can start with sample/demo mapping or manual admin preprocessing
- random push timing can be simulated in browser for the alpha
- sentence scoring can be rule-based or manually curated for the first users

### Do Not Build Today
- native mobile push pipeline
- App Store / Play Store packaging
- fully automated transcript ingestion for every edge case
- spaced repetition engine
- social or auth complexity

## Recommended Day-1 Stack

### Frontend
- static web app
- localStorage for state
- deploy on Vercel or Netlify

### Data
- for today's alpha:
  - local mock data or manually curated sentence JSON
- for the next step:
  - Supabase for imports, sentences, practice logs

### AI / Content Processing
- first pass:
  - manually curated sentence extraction for 3 to 5 demo videos
- next pass:
  - backend worker using transcript input + LLM ranking/translation

## Operational Plan For Today

### Phase 1
- deploy the current web MVP
- test one demo URL end-to-end yourself
- verify reminder log and practice flow

### Phase 2
- invite 3 to 5 testers
- ask them to:
  - import one video
  - open at least one reminder
  - complete one practice
  - answer whether the sentence felt worth remembering

### Phase 3
- capture feedback in a simple sheet:
  - imported URL
  - sentence quality score
  - reminder usefulness score
  - practice difficulty score
  - would-use-again yes/no

## Success Criteria For Today's Test
- testers understand the product in under 30 seconds
- at least 1 imported video feels personally valuable
- at least 1 sentence is described as "I would actually use this"
- reminder feels helpful, not spammy
- practice feels quick enough to do during a small break

## What To Build Next After Today's Test

### Priority 1
- real backend ingestion
- transcript fetch
- sentence ranking
- Korean translation generation
- persisted sentence library

### Priority 2
- Expo mobile app shell
- real push notifications
- user auth
- settings for reminder window and frequency

## Accounts Needed To Move From Web MVP To Real Product

### Needed Today For Public Test Link
- GitHub repository access
- Vercel or Netlify account for deploy

### Needed This Week For Real Data Storage
- Supabase account and project

### Needed This Week For AI Processing
- OpenAI API key

### Needed When You Want Real Mobile Push
- Expo account
- Firebase project
- Apple Developer account

## Information I Need From You

### If You Want Me To Push This To A Live Test URL
- GitHub repo URL for this project
- whether to use Vercel or Netlify
- deployment access or whether you want deployment instructions only

### If You Want The Next Version To Use Real AI And Storage
- OpenAI API key or confirmation that you will add it later
- Supabase project URL and anon key

### If You Want Real Mobile Push Next
- Expo project preference: yes or no
- iOS only vs iOS + Android

## Recommended Decision
For today, launch the web MVP first, test the learning loop, and postpone native push until the core sentence quality and reminder usefulness are validated.
