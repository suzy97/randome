const sampleCatalog = [
  {
    id: "tiny-habits",
    title: "Tiny Habits Interview",
    sourceHint: "habit",
    sentences: [
      {
        id: "tiny-1",
        english: "If you make it tiny, you're more likely to do it every day.",
        korean: "작게 만들수록 그것을 매일 하게 될 가능성이 더 커진다.",
        pattern: "be more likely to + verb",
        reason: "`be more likely to`는 습관, 공부, 일 루틴에 모두 재사용할 수 있는 핵심 패턴입니다.",
        example: "If I make my study plan tiny, I'm more likely to keep it.",
        cloze: "If you make it tiny, you're more ____ to do it every day.",
        choices: ["likely", "ready", "sure"],
        answer: "likely",
      },
      {
        id: "tiny-2",
        english: "The point is not to memorize everything.",
        korean: "핵심은 모든 것을 외우는 데 있지 않다.",
        pattern: "The point is not to + verb",
        reason: "설명, 발표, 피드백에서 자연스럽게 많이 쓰는 문장 틀입니다.",
        example: "The point is not to sound perfect. It's to stay clear.",
        cloze: "The point is not to ____ everything.",
        choices: ["memorize", "collect", "repeat"],
        answer: "memorize",
      },
      {
        id: "tiny-3",
        english: "Notice what keeps showing up.",
        korean: "반복해서 나타나는 것을 알아차려라.",
        pattern: "what keeps + -ing",
        reason: "회고, 패턴 인식, 문제 정의에 두루 쓰이는 짧고 강한 문장입니다.",
        example: "Notice what keeps slowing your team down.",
        cloze: "Notice what keeps ____ up.",
        choices: ["showing", "making", "turning"],
        answer: "showing",
      },
    ],
  },
  {
    id: "career-talk",
    title: "Career Growth Talk",
    sourceHint: "career",
    sentences: [
      {
        id: "career-1",
        english: "You don't need a perfect plan to start moving.",
        korean: "움직이기 시작하는 데 완벽한 계획이 필요한 건 아니다.",
        pattern: "You don't need ... to ...",
        reason: "동기부여, 코칭, 자기 대화에서 매우 자주 쓰이는 구조입니다.",
        example: "You don't need more motivation to begin. You need a smaller first step.",
        cloze: "You don't need a perfect plan to start ____.",
        choices: ["moving", "talking", "waiting"],
        answer: "moving",
      },
      {
        id: "career-2",
        english: "The best opportunities often come from consistent visibility.",
        korean: "가장 좋은 기회는 꾸준히 보이는 상태에서 오는 경우가 많다.",
        pattern: "often come from",
        reason: "경력, 마케팅, 인간관계 맥락에서 응용 범위가 넓습니다.",
        example: "Better client work often comes from consistent follow-up.",
        cloze: "The best opportunities often come from consistent ____.",
        choices: ["visibility", "silence", "luck"],
        answer: "visibility",
      },
      {
        id: "career-3",
        english: "Make it easy for people to understand what you do.",
        korean: "사람들이 당신이 하는 일을 쉽게 이해할 수 있게 하라.",
        pattern: "Make it easy for ... to ...",
        reason: "설명력, 커뮤니케이션, 제품 소개에 매우 좋은 기본 구문입니다.",
        example: "Make it easy for users to trust your product.",
        cloze: "Make it easy for people to understand what you ____.",
        choices: ["do", "want", "avoid"],
        answer: "do",
      },
    ],
  },
];

const storageKey = "randome-mvp-state";
const timers = [];

const defaultState = {
  screen: "welcome",
  imports: [],
  activeImportId: null,
  activeSentenceId: null,
  reminderLog: [],
  learningWindowStart: "09:00",
  learningWindowEnd: "21:00",
  dailyReminderCount: 4,
  notificationsPermission: "default",
  practiceResult: null,
};

const state = loadState();
const app = document.getElementById("app");

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function clearTimers() {
  while (timers.length) {
    window.clearTimeout(timers.pop());
  }
}

function getActiveImport() {
  return state.imports.find((item) => item.id === state.activeImportId) || state.imports[0] || null;
}

function getActiveSentence() {
  const activeImport = getActiveImport();
  if (!activeImport) return null;

  return (
    activeImport.sentences.find((sentence) => sentence.id === state.activeSentenceId) ||
    activeImport.sentences[0] ||
    null
  );
}

function setScreen(screen, sentenceId = null) {
  state.screen = screen;
  if (sentenceId) {
    state.activeSentenceId = sentenceId;
  }
  saveState();
  render();
}

function inferCatalogFromUrl(url) {
  const lower = url.toLowerCase();
  return (
    sampleCatalog.find((item) => lower.includes(item.sourceHint)) ||
    sampleCatalog.find((item) => lower.includes(item.id)) ||
    sampleCatalog[0]
  );
}

function createImportFromUrl(url) {
  const source = inferCatalogFromUrl(url);
  const importId = uid("import");
  const importedAt = new Date().toISOString();

  return {
    id: importId,
    url,
    title: source.title,
    importedAt,
    reminderCount: state.dailyReminderCount,
    windowStart: state.learningWindowStart,
    windowEnd: state.learningWindowEnd,
    sentences: source.sentences.map((sentence) => ({
      ...sentence,
      id: uid(sentence.id),
      sourceTitle: source.title,
      seenCount: 0,
      practicedCount: 0,
      starred: false,
    })),
  };
}

function nextQueuePreview(activeImport) {
  if (!activeImport) return [];
  return activeImport.sentences.slice(0, Math.min(activeImport.sentences.length, state.dailyReminderCount));
}

function markSentenceSeen(sentenceId) {
  state.imports = state.imports.map((item) => ({
    ...item,
    sentences: item.sentences.map((sentence) =>
      sentence.id === sentenceId ? { ...sentence, seenCount: sentence.seenCount + 1 } : sentence
    ),
  }));
  saveState();
}

function markSentencePracticed(sentenceId) {
  state.imports = state.imports.map((item) => ({
    ...item,
    sentences: item.sentences.map((sentence) =>
      sentence.id === sentenceId
        ? { ...sentence, practicedCount: sentence.practicedCount + 1 }
        : sentence
    ),
  }));
  saveState();
}

function toggleStar(sentenceId) {
  state.imports = state.imports.map((item) => ({
    ...item,
    sentences: item.sentences.map((sentence) =>
      sentence.id === sentenceId ? { ...sentence, starred: !sentence.starred } : sentence
    ),
  }));
  saveState();
  render();
}

function pushReminder(sentence) {
  const reminder = {
    id: uid("reminder"),
    sentenceId: sentence.id,
    title: "오늘 한 문장만 다시 떠올려볼까요?",
    preview: sentence.english,
    createdAt: new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unread: true,
  };

  state.reminderLog = [reminder, ...state.reminderLog];
  state.activeSentenceId = sentence.id;
  saveState();
  markSentenceSeen(sentence.id);

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Randome", {
      body: sentence.english,
    });
  }

  render();
}

function scheduleDemoReminders() {
  clearTimers();

  const activeImport = getActiveImport();
  if (!activeImport) {
    return;
  }

  const queue = nextQueuePreview(activeImport);
  const delays = [5000, 15000, 30000];

  queue.slice(0, delays.length).forEach((sentence, index) => {
    const timer = window.setTimeout(() => {
      pushReminder(sentence);
    }, delays[index]);
    timers.push(timer);
  });
}

function requestNotificationsAndStart() {
  if (!("Notification" in window)) {
    scheduleDemoReminders();
    return;
  }

  Notification.requestPermission().then((permission) => {
    state.notificationsPermission = permission;
    saveState();
    scheduleDemoReminders();
    render();
  });
}

function renderScreen(content) {
  app.innerHTML = `<section class="screen">${content}</section>`;
}

function renderWelcome() {
  renderScreen(`
    <div class="stack-xl">
      <div class="hero-card stack-lg">
        <div class="hero-orb"></div>
        <div class="stack-sm">
          <p class="eyebrow">Randome MVP</p>
          <h1 class="title-xl">유튜브 한 편이<br />오늘의 영어 루프가 됩니다</h1>
          <p class="body-sm">
            URL만 넣으면 문장 추출, 한국어 해석, 랜덤 리마인드, 짧은 연습까지
            한 번에 이어지는 오늘 테스트용 MVP입니다.
          </p>
        </div>
      </div>

      <div class="card stack-sm">
        <p class="screen-kicker">오늘 테스트 가능한 범위</p>
        <h2 class="title-md">URL 입력 -> 문장 생성 -> 알림 -> 연습</h2>
        <p class="body">
          이 버전은 브라우저에서 바로 확인할 수 있고, 실제 푸시 대신 브라우저
          알림과 앱 내 리마인드 로그로 랜덤 복습 흐름을 검증합니다.
        </p>
      </div>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="start-import">바로 테스트 시작</button>
        <button class="btn btn-secondary" data-action="open-home">데모 홈 보기</button>
      </div>
    </div>
  `);

  bind("[data-action='start-import']", () => setScreen("import"));
  bind("[data-action='open-home']", () => {
    if (!state.imports.length) {
      const demoImport = createImportFromUrl("https://youtube.com/watch?v=tiny-habits");
      state.imports = [demoImport];
      state.activeImportId = demoImport.id;
      state.activeSentenceId = demoImport.sentences[0].id;
      saveState();
    }
    setScreen("home");
  });
}

function renderImport() {
  renderScreen(`
    <div class="stack-lg">
      <div class="stack-sm">
        <p class="screen-kicker">Step 1</p>
        <h1 class="title-lg">유튜브 URL을 넣고<br />오늘의 문장을 만드세요</h1>
        <p class="body">
          오늘 테스트용 버전은 URL을 기반으로 샘플 문장 세트를 생성합니다.
          실제 서비스에서는 여기서 자막을 읽고 문장을 선별하게 됩니다.
        </p>
      </div>

      <div class="input-card stack-sm">
        <label for="youtube-url">YouTube URL</label>
        <input
          class="text-input"
          id="youtube-url"
          value="https://www.youtube.com/watch?v=tiny-habits-talk"
        />
      </div>

      <div class="helper-grid">
        <div class="input-card stack-sm">
          <label for="window-start">학습 시작 시간</label>
          <input class="text-input" id="window-start" type="time" value="${state.learningWindowStart}" />
        </div>
        <div class="input-card stack-sm">
          <label for="window-end">학습 종료 시간</label>
          <input class="text-input" id="window-end" type="time" value="${state.learningWindowEnd}" />
        </div>
        <div class="input-card stack-sm">
          <label for="daily-count">하루 리마인드 수</label>
          <select class="select-input" id="daily-count">
            ${[3, 4, 5]
              .map(
                (count) =>
                  `<option value="${count}" ${state.dailyReminderCount === count ? "selected" : ""}>${count}회</option>`
              )
              .join("")}
          </select>
        </div>
      </div>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="analyze-url">문장 생성하기</button>
        <button class="btn btn-secondary" data-action="back-welcome">이전</button>
      </div>
    </div>
  `);

  bind("[data-action='back-welcome']", () => setScreen("welcome"));
  bind("[data-action='analyze-url']", () => {
    const url = document.getElementById("youtube-url").value.trim();
    const windowStart = document.getElementById("window-start").value;
    const windowEnd = document.getElementById("window-end").value;
    const dailyCount = parseInt(document.getElementById("daily-count").value, 10);

    state.learningWindowStart = windowStart;
    state.learningWindowEnd = windowEnd;
    state.dailyReminderCount = dailyCount;

    const createdImport = createImportFromUrl(url);
    state.imports = [createdImport, ...state.imports];
    state.activeImportId = createdImport.id;
    state.activeSentenceId = createdImport.sentences[0].id;
    saveState();
    setScreen("summary");
  });
}

function renderSummary() {
  const activeImport = getActiveImport();
  const preview = nextQueuePreview(activeImport);

  renderScreen(`
    <div class="stack-lg">
      <div class="card stack-sm">
        <p class="screen-kicker">Processing Result</p>
        <h1 class="title-lg">${activeImport.title}</h1>
        <p class="body">
          오늘 테스트용으로 핵심 문장 ${activeImport.sentences.length}개와 연습 패턴을
          만들었습니다.
        </p>
      </div>

      <div class="metric-grid">
        <div class="metric-card">
          <span class="label">문장 수</span>
          <strong class="metric-value">${activeImport.sentences.length}</strong>
        </div>
        <div class="metric-card">
          <span class="label">리마인드</span>
          <strong class="metric-value">${activeImport.reminderCount}</strong>
        </div>
        <div class="metric-card">
          <span class="label">윈도우</span>
          <strong class="metric-value">${activeImport.windowStart}</strong>
        </div>
      </div>

      <div class="stack-sm">
        ${preview
          .map(
            (sentence) => `
              <article class="sentence-card stack-sm">
                <span class="sentence-tag">Preview</span>
                <p class="sentence-original">${sentence.english}</p>
                <p class="sentence-translation">${sentence.korean}</p>
              </article>
            `
          )
          .join("")}
      </div>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="go-home">홈으로 이동</button>
        <button class="btn btn-soft" data-action="open-first-sentence">첫 문장 바로 보기</button>
      </div>
    </div>
  `);

  bind("[data-action='go-home']", () => setScreen("home"));
  bind("[data-action='open-first-sentence']", () => setScreen("sentence", activeImport.sentences[0].id));
}

function renderHome() {
  const activeImport = getActiveImport();
  const preview = nextQueuePreview(activeImport);
  const notificationLabel =
    state.notificationsPermission === "granted" ? "알림 허용됨" : "브라우저 알림 요청 가능";

  renderScreen(`
    <div class="stack-lg">
      <div class="space-row">
        <div class="stack-xs">
          <p class="screen-kicker">Today</p>
          <h1 class="title-lg">오늘의 Randome 루프</h1>
        </div>
        <span class="status-chip">${notificationLabel}</span>
      </div>

      ${
        activeImport
          ? `
            <div class="hero-card stack-md">
              <div class="stack-xs">
                <p class="eyebrow">Latest Import</p>
                <h2 class="title-md">${activeImport.title}</h2>
                <p class="body-sm">
                  ${activeImport.windowStart} - ${activeImport.windowEnd} 사이에
                  ${activeImport.reminderCount}번 리마인드
                </p>
              </div>
              <div class="metric-grid">
                <div class="metric-card">
                  <span class="label">문장</span>
                  <strong class="metric-value">${activeImport.sentences.length}</strong>
                </div>
                <div class="metric-card">
                  <span class="label">열람</span>
                  <strong class="metric-value">${activeImport.sentences.reduce(
                    (sum, sentence) => sum + sentence.seenCount,
                    0
                  )}</strong>
                </div>
                <div class="metric-card">
                  <span class="label">연습</span>
                  <strong class="metric-value">${activeImport.sentences.reduce(
                    (sum, sentence) => sum + sentence.practicedCount,
                    0
                  )}</strong>
                </div>
              </div>
            </div>
          `
          : `
            <div class="empty-card stack-sm">
              <h2 class="title-md">아직 가져온 영상이 없습니다</h2>
              <p class="body">URL 하나만 넣으면 오늘 테스트를 바로 시작할 수 있습니다.</p>
              <button class="btn btn-primary" data-action="go-import-empty">URL 넣기</button>
            </div>
          `
      }

      ${
        activeImport
          ? `
            <div class="stack-sm">
              <button class="btn btn-primary" data-action="start-demo-reminders">30초 데모 리마인드 시작</button>
              <button class="btn btn-secondary" data-action="open-active-sentence">지금 문장 보기</button>
            </div>

            <div class="card stack-sm">
              <div class="space-row">
                <div class="stack-xs">
                  <p class="section-note">Today Queue</p>
                  <h2 class="title-sm">오늘 먼저 뜰 문장</h2>
                </div>
                <button class="link-btn" data-action="open-library-link">보관함</button>
              </div>
              <div class="library-list">
                ${preview
                  .map(
                    (sentence) => `
                      <article class="library-item stack-xs">
                        <p class="sentence-original" style="font-size:22px;">${sentence.english}</p>
                        <p class="sentence-translation">${sentence.korean}</p>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }

      <div class="tabs">
        <button class="tab-btn active">홈</button>
        <button class="tab-btn" data-action="open-library-tab">보관함</button>
        <button class="tab-btn" data-action="open-import-tab">가져오기</button>
      </div>
    </div>
  `);

  bind("[data-action='go-import-empty']", () => setScreen("import"));
  bind("[data-action='start-demo-reminders']", requestNotificationsAndStart);
  bind("[data-action='open-active-sentence']", () => {
    const activeSentence = getActiveSentence();
    if (activeSentence) setScreen("sentence", activeSentence.id);
  });
  bind("[data-action='open-library-link']", () => setScreen("library"));
  bind("[data-action='open-library-tab']", () => setScreen("library"));
  bind("[data-action='open-import-tab']", () => setScreen("import"));
}

function renderSentence() {
  const sentence = getActiveSentence();

  if (!sentence) {
    setScreen("home");
    return;
  }

  renderScreen(`
    <div class="stack-lg">
      <div class="space-row">
        <button class="pill" data-action="back-home">홈</button>
        <button class="pill ${sentence.starred ? "active" : ""}" data-action="toggle-star">
          ${sentence.starred ? "별표됨" : "별표"}
        </button>
      </div>

      <article class="sentence-card stack-md">
        <div class="stack-xs">
          <p class="screen-kicker">Sentence Card</p>
          <h1 class="sentence-original">${sentence.english}</h1>
          <p class="sentence-translation">${sentence.korean}</p>
        </div>

        <div class="sentence-note stack-xs">
          <span class="label">핵심 패턴</span>
          <strong>${sentence.pattern}</strong>
          <p class="body-sm">${sentence.reason}</p>
        </div>

        <div class="sentence-note stack-xs">
          <span class="label">응용 예문</span>
          <strong>${sentence.example}</strong>
        </div>
      </article>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="open-practice">이 문장으로 연습하기</button>
        <button class="btn btn-secondary" data-action="open-library">보관함으로</button>
      </div>
    </div>
  `);

  bind("[data-action='back-home']", () => setScreen("home"));
  bind("[data-action='toggle-star']", () => toggleStar(sentence.id));
  bind("[data-action='open-practice']", () => setScreen("practice", sentence.id));
  bind("[data-action='open-library']", () => setScreen("library"));
}

function renderPractice() {
  const sentence = getActiveSentence();

  if (!sentence) {
    setScreen("home");
    return;
  }

  renderScreen(`
    <div class="stack-lg">
      <div class="space-row">
        <button class="pill" data-action="back-sentence">문장</button>
        <span class="status-chip">20초 복습</span>
      </div>

      <div class="practice-card stack-md">
        <div class="stack-xs">
          <p class="screen-kicker">Practice</p>
          <h1 class="title-lg">빈칸을 채워보세요</h1>
          <p class="body">${sentence.cloze}</p>
        </div>

        <div class="choice-row">
          ${sentence.choices
            .map((choice) => `<button class="choice-btn" data-choice="${choice}">${choice}</button>`)
            .join("")}
        </div>
      </div>

      <div class="feedback-box stack-xs" id="feedback-box">
        <span class="label">피드백</span>
        <strong>아직 답을 선택하지 않았습니다.</strong>
        <p class="body-sm">정답을 누르면 왜 이 구문이 중요한지 바로 설명합니다.</p>
      </div>

      <div class="card stack-xs">
        <span class="label">직접 이어 써보기</span>
        <strong>${sentence.example}</strong>
        <p class="body-sm">같은 패턴으로 내 상황 문장을 하나 말해보면 기억에 더 오래 남습니다.</p>
      </div>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="complete-practice">연습 완료</button>
        <button class="btn btn-secondary" data-action="back-library">보관함 가기</button>
      </div>
    </div>
  `);

  bind("[data-action='back-sentence']", () => setScreen("sentence", sentence.id));
  bind("[data-action='back-library']", () => setScreen("library"));
  bind("[data-action='complete-practice']", () => {
    markSentencePracticed(sentence.id);
    setScreen("library");
  });

  bindAll("[data-choice]", (button) => {
    const feedbackBox = document.getElementById("feedback-box");
    const picked = button.dataset.choice;
    const correct = picked === sentence.answer;

    document.querySelectorAll("[data-choice]").forEach((choiceButton) => {
      choiceButton.classList.remove("correct", "wrong");
      if (choiceButton.dataset.choice === sentence.answer) {
        choiceButton.classList.add("correct");
      } else if (choiceButton.dataset.choice === picked && !correct) {
        choiceButton.classList.add("wrong");
      }
    });

    feedbackBox.classList.remove("correct", "wrong");
    feedbackBox.classList.add(correct ? "correct" : "wrong");
    feedbackBox.innerHTML = `
      <span class="label">피드백</span>
      <strong>${correct ? "좋아요. 정답입니다." : `정답은 ${sentence.answer} 입니다.`}</strong>
      <p class="body-sm">${sentence.reason}</p>
    `;

    state.practiceResult = { sentenceId: sentence.id, correct };
    saveState();
  });
}

function renderLibrary() {
  const activeImport = getActiveImport();
  const reminders = state.reminderLog;

  renderScreen(`
    <div class="stack-lg">
      <div class="space-row">
        <div class="stack-xs">
          <p class="screen-kicker">Library</p>
          <h1 class="title-lg">문장 보관함</h1>
        </div>
        <button class="pill" data-action="back-home-library">홈</button>
      </div>

      ${
        activeImport
          ? `
            <div class="card stack-sm">
              <p class="section-note">Source Video</p>
              <h2 class="title-md">${activeImport.title}</h2>
              <p class="body-sm">${activeImport.url}</p>
            </div>

            <div class="library-list">
              ${activeImport.sentences
                .map(
                  (sentence) => `
                    <article class="library-item stack-sm">
                      <div class="stack-xs">
                        <div class="space-row">
                          <span class="sentence-tag">${sentence.starred ? "Starred" : "Sentence"}</span>
                          <span class="caption">seen ${sentence.seenCount} · practiced ${sentence.practicedCount}</span>
                        </div>
                        <p class="sentence-original" style="font-size:23px;">${sentence.english}</p>
                        <p class="sentence-translation">${sentence.korean}</p>
                      </div>
                      <div class="tab-row">
                        <button class="pill" data-open-sentence="${sentence.id}">보기</button>
                        <button class="pill" data-open-practice="${sentence.id}">연습</button>
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>

            <div class="card stack-sm">
              <div class="space-row">
                <div class="stack-xs">
                  <p class="section-note">Reminder Log</p>
                  <h2 class="title-sm">오늘 발생한 리마인드</h2>
                </div>
                <button class="link-btn" data-action="clear-reminders">초기화</button>
              </div>

              <div class="reminder-list">
                ${
                  reminders.length
                    ? reminders
                        .map(
                          (reminder) => `
                            <article class="reminder-card ${reminder.unread ? "unread" : ""} stack-xs">
                              <div class="space-row">
                                <strong>${reminder.title}</strong>
                                <span class="caption">${reminder.createdAt}</span>
                              </div>
                              <p class="body-sm">${reminder.preview}</p>
                            </article>
                          `
                        )
                        .join("")
                    : `
                      <div class="empty-card stack-xs">
                        <strong>아직 리마인드가 없습니다</strong>
                        <p class="body-sm">홈에서 30초 데모 리마인드를 시작하면 여기에 쌓입니다.</p>
                      </div>
                    `
                }
              </div>
            </div>
          `
          : `
            <div class="empty-card stack-sm">
              <h2 class="title-md">보관할 영상이 아직 없습니다</h2>
              <button class="btn btn-primary" data-action="go-import-library-empty">URL 넣기</button>
            </div>
          `
      }
    </div>
  `);

  bind("[data-action='back-home-library']", () => setScreen("home"));
  bind("[data-action='go-import-library-empty']", () => setScreen("import"));
  bind("[data-action='clear-reminders']", () => {
    state.reminderLog = [];
    saveState();
    render();
  });
  bindAll("[data-open-sentence]", (button) => setScreen("sentence", button.dataset.openSentence));
  bindAll("[data-open-practice]", (button) => setScreen("practice", button.dataset.openPractice));
}

function render() {
  if (state.screen === "welcome") return renderWelcome();
  if (state.screen === "import") return renderImport();
  if (state.screen === "summary") return renderSummary();
  if (state.screen === "home") return renderHome();
  if (state.screen === "sentence") return renderSentence();
  if (state.screen === "practice") return renderPractice();
  if (state.screen === "library") return renderLibrary();
  renderWelcome();
}

function bind(selector, handler) {
  const node = document.querySelector(selector);
  if (node) node.addEventListener("click", handler);
}

function bindAll(selector, handler) {
  document.querySelectorAll(selector).forEach((node) => {
    node.addEventListener("click", () => handler(node));
  });
}

render();

window.addEventListener("beforeunload", clearTimers);
