# Randome PRD

## Document Info
- Product: `Randome` (working title)
- Status: `Draft`
- Updated: `2026-03-15`
- Repository: `https://github.com/suzy97/WayUp`

## 1. Executive Summary
Randome is a mobile learning service that turns YouTube videos the user already wants to watch into a personal sentence reinforcement loop. The user pastes a YouTube URL, Randome extracts English transcript lines, selects reusable high-value sentences, adds Korean translations, and sends a small number of random push notifications during the day. When the user opens the app, they do not just reread the sentence. They actively use it through guided recall, fill-in-the-blank practice, and example completion.

The product hypothesis is that many Korean learners already consume useful English content on YouTube, but those expressions never become usable language because there is no product that repeatedly resurfaces personally relevant sentences in small moments throughout the day.

The MVP should focus on five things:
- convert a YouTube URL into reusable sentence cards
- rank and store sentences that are worth remembering
- deliver random-but-bounded daily push notifications
- show original English plus Korean translation instantly
- convert passive recognition into active recall inside the app

Randome should not try to be a full English curriculum or a generic flashcard app. Its core value is lightweight repetition of personally meaningful English from content the user already chose.

## 2. Problem Definition

### 2-1. User Problem
Intermediate English learners regularly watch YouTube videos in English, understand enough to feel motivated, and even notice phrases they want to remember. But after the video ends, almost all of those useful sentences disappear. The learner does not revisit them at the right moment, does not use them in a new sentence, and therefore does not retain them.

### 2-2. Pain Points
- useful English is trapped inside long videos and never turned into a reviewable unit
- existing English apps push generic textbook sentences instead of phrases the learner personally cared about
- saving a YouTube link or subtitle file does not create repetition by itself
- passive rereading creates recognition, but not recall or production
- learners have spare moments throughout the day, but no system surfaces the right sentence at those moments
- many apps ask for too much time at once, which creates dropout

### 2-3. Why Current Alternatives Fail
- YouTube itself is optimized for watching, not extracting and reinforcing language
- note-taking tools capture sentences, but they do not schedule lightweight repetition
- flashcard apps require manual card creation, which is high-friction
- generic language apps are structured, but not personalized to the learner's interests

### 2-4. Product Opportunity
Randome sits at the intersection of `content consumption`, `language acquisition`, and `push-based habit formation`.
- more personal than a generic English curriculum
- lower effort than building cards manually
- more actionable than saving subtitles in notes
- more effective than passive translation-only review because the app asks the learner to think

### 2-5. Core User Insight
The learner does not need more English content. The learner needs a system that repeatedly brings back the most useful sentences from content they already chose, then nudges them to actively use those sentences in tiny time windows.

### 2-6. Key Hypotheses
- if the source content is user-chosen, open rate and retention will be higher than with generic content
- if only high-value reusable sentences are selected, users will perceive the product as smart rather than noisy
- if push timing is random within a user-approved daytime window, the reminders will feel fresh and interrupt autopilot moments
- if each reminder can turn into a 30 to 90 second active recall task, sentence retention will improve
- if Korean translation is always available but not the only interaction, learners will feel supported without becoming translation-dependent

## 3. Product Principles
- Start from the learner's curiosity, not the curriculum's structure.
- Do not flood the user with too many sentences.
- Prioritize reusable spoken/written English over obscure transcript lines.
- Make every interaction completable in under 2 minutes.
- Support understanding immediately, then gently push recall.
- Personal relevance beats syllabus completeness in the MVP.

## 4. Target Users

### Primary
- Korean-speaking intermediate English learners
- users who already watch English YouTube for self-improvement, interviews, business, tech, study, or lifestyle
- users who want to sound more natural using real sentences, not isolated vocabulary

### Secondary
- upper-beginner learners who need Korean support to stay engaged
- advanced learners who want a personal phrase bank from niche content
- professionals collecting English expressions for work presentations, meetings, or interviews

## 5. Jobs To Be Done

### Functional Job
When I watch an English YouTube video that contains expressions I want, help me turn those lines into a personal daily review flow without manual card-making.

### Emotional Job
Help me feel that the English I consume is actually staying in my head instead of disappearing.

### Social Job
Help me use natural English phrases in conversation, writing, or work without sounding translated word-for-word.

## 6. MVP Scope

### In Scope
- onboarding and push permission request
- YouTube URL input
- English transcript fetch for supported videos
- sentence extraction and scoring
- Korean translation generation
- sentence library per imported video
- daily push scheduling with random timing inside a configured window
- push deep link into sentence detail
- guided practice:
  - meaning check
  - fill-in-the-blank
  - example completion
- simple progress tracking:
  - sentences seen today
  - practices completed
  - saved expressions

### Out of Scope
- full subtitle editor
- user-generated manual flashcard authoring
- grammar lectures or long-form lessons
- social sharing/community
- speech recognition scoring
- browser extension or desktop ingestion
- importing non-YouTube sources in MVP

## 7. Customer Problem Statement
Users who consume English YouTube content have high motivation at the moment of watching, but no lightweight system converts that motivation into repeated exposure and active recall. As a result, useful sentences are forgotten before they become usable language.

### Success Condition
Within one day of importing a YouTube URL, the user should receive several valuable sentence reminders and complete at least one active practice flow using a sentence they actually care about.

## 8. Content Policy

### 8-1. Video Eligibility
- the MVP accepts public or accessible YouTube URLs
- the video must have English transcript availability, either human-made or auto-generated
- if transcript quality is too poor, the app should explain that the video is unsupported

### 8-2. Sentence Selection Policy
- prioritize sentences that are:
  - semantically complete
  - reusable in daily speaking or writing
  - not overly dependent on previous context
  - not too long for push notifications
- avoid:
  - fragmented subtitle lines
  - proper-noun-heavy lines with little transfer value
  - filler lines such as greetings or sponsor segments

### 8-3. Translation Policy
- every saved sentence must include Korean translation
- translations should optimize for clarity and natural Korean meaning
- literalness is secondary to learning usefulness

### 8-4. Practice Generation Policy
- every sentence should generate at least one active task
- preferred task types:
  - fill in a missing keyword
  - complete a partial example using the same pattern
  - choose the best paraphrase or usage
- tasks should reinforce the sentence structure, not just isolated vocabulary

## 9. Notification Policy

### 9-1. Scheduling
- users set a learning window such as `09:00-21:00`
- the system sends 3 to 5 pushes per day in MVP
- push times are randomized within the active window
- pushes should not cluster too closely together

### 9-2. Prioritization
- newer imported videos receive higher initial exposure
- sentences with fewer completed practices are prioritized
- users can star sentences to increase repetition weight

### 9-3. Tone
- notification copy should feel light and invitational
- examples:
  - `오늘 한 문장만 다시 떠올려볼까요?`
  - `방금 20초면 복습할 수 있는 문장이 도착했어요`

### 9-4. Guardrails
- hard cap at 5 pushes per day
- if the user ignores all pushes for 3 days, reduce frequency automatically
- users must be able to pause pushes per imported video or globally

## 10. Functional Spec

| No. | Requirement | Screen / System | Priority | Expected Result |
|---|---|---|---|---|
| 1 | The user can paste a YouTube URL and submit it for transcript analysis. | Import | P0 | Low-friction content ingestion |
| 2 | The system extracts English transcript lines, selects useful sentences, translates them into Korean, and stores them by source video. | Processing pipeline, library | P0 | Personal sentence database creation |
| 3 | The home screen shows today's sentence queue, imported videos, and the next push window. | Home | P0 | Clear daily learning state |
| 4 | The system sends randomized push notifications within the configured time window and deep-links into a sentence card. | Push, deep link | P0 | Repeated exposure throughout the day |
| 5 | Each sentence card shows original sentence, Korean translation, why it was selected, and quick actions like save or practice. | Sentence card | P0 | Fast comprehension plus motivation |
| 6 | The app provides a guided practice flow that requires the user to recall or complete part of the sentence. | Practice | P0 | Shift from recognition to active recall |
| 7 | Users can browse imported videos and saved sentence cards later. | Library | P1 | Long-term reuse |
| 8 | The app tracks simple engagement metrics such as views, practices, and saved expressions. | Progress | P1 | Early retention feedback |

## 11. Screen-Level Detailed Policy

### 11-1. Onboarding / Welcome
Purpose:
- explain the product in one sentence
- secure notification permission with clear value

Rules:
- explain that the product uses user-provided YouTube content
- clarify that pushes are limited and user-controlled

### 11-2. URL Import
Purpose:
- capture the source video with minimal friction

Rules:
- one URL field should be enough for the first import
- show supported examples and transcript requirement
- after submit, provide visible processing progress

### 11-3. Processing Result
Purpose:
- prove immediate value after import

Rules:
- show number of extracted candidate lines
- show number of final saved sentences
- preview 2 to 3 selected sentences

### 11-4. Home
Purpose:
- anchor the daily learning loop

Rules:
- show:
  - today's push count
  - next likely reminder window
  - newest imported source
  - one primary CTA to review now

### 11-5. Push Entry
Purpose:
- create a one-tap return to learning

Rules:
- push must contain a short sentence fragment or hook
- opening from push lands directly on the relevant sentence card

### 11-6. Sentence Card
Purpose:
- deliver immediate understanding and a reason to continue

Rules:
- always show:
  - English original
  - Korean translation
  - source video title
- may additionally show:
  - keyword highlight
  - phrase note
  - similar example

### 11-7. Practice
Purpose:
- require the learner to think, not just look

Rules:
- first task must be completable in under 30 seconds
- feedback should explain why the answer fits
- allow `다시 보기` and `다음 문장` actions

### 11-8. Library
Purpose:
- turn temporary reminders into a durable personal phrase bank

Rules:
- group by imported video
- support filters:
  - today
  - starred
  - practiced
  - not yet practiced

## 12. User Flow

### 12-1. First-Time User Flow
1. open app
2. read value proposition
3. allow notifications or defer
4. paste a YouTube URL
5. wait for transcript analysis
6. preview selected sentences
7. land on home with today's queue

### 12-2. Daily Reinforcement Flow
1. system schedules random pushes inside the active window
2. user taps a push
3. sentence card opens
4. user reads English and Korean
5. user starts a short practice
6. user completes the task
7. sentence is marked as seen/practiced

### 12-3. Library Revisit Flow
1. user opens app directly
2. enters library
3. selects an imported video
4. reviews starred or unpracticed sentences
5. launches another practice

## 13. Success Metrics

### North Star
- weekly number of `practiced sentence sessions per active user`

### Core MVP Metrics
- URL import completion rate
- successful transcript processing rate
- average number of saved sentences per import
- push open rate
- practice start rate after push open
- practice completion rate
- day-7 retention
- percentage of imported users who return to library

## 14. Risks and Open Questions

### Risks
- transcript quality varies significantly by video
- sentence scoring quality may initially feel inconsistent
- too many pushes may feel spammy even if content is personalized
- copyright and transcript handling must avoid redistributing full subtitle content beyond product need

### Open Questions
- should the first MVP allow users to edit or hide low-quality extracted sentences?
- should the system emphasize sentence-level repetition or phrase-pattern repetition more strongly?
- should practice difficulty adapt to learner level from day one or only after enough behavior data?
- should translation be shown immediately by default or revealed after a brief recall attempt?

## 15. MVP Recommendation
For the first build, optimize for `one imported video -> 10 to 20 high-quality sentences -> 1 day of lightweight repetition -> 1 active practice conversion`. If that loop feels valuable, then expand into multi-video libraries, smarter ranking, spaced repetition models, and richer practice modes.
