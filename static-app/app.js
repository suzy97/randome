const storageKey = "randome-app-state";
const deviceKey = "randome-device-id";
const timers = [];

const defaultState = {
  screen: "welcome",
  imports: [],
  reminders: [],
  activeImportId: null,
  activeSentenceId: null,
  learningWindowStart: "09:00",
  learningWindowEnd: "21:00",
  dailyReminderCount: 4,
  notificationsPermission: "default",
  loading: false,
  error: "",
  info: "",
  setupRequired: false,
  ready: false,
};

const state = loadState();
const app = document.getElementById("app");

bootstrap();

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      screen: state.screen,
      activeImportId: state.activeImportId,
      activeSentenceId: state.activeSentenceId,
      learningWindowStart: state.learningWindowStart,
      learningWindowEnd: state.learningWindowEnd,
      dailyReminderCount: state.dailyReminderCount,
      notificationsPermission: state.notificationsPermission,
    })
  );
}

function getDeviceId() {
  let deviceId = localStorage.getItem(deviceKey);
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(deviceKey, deviceId);
  }
  return deviceId;
}

function clearTimers() {
  while (timers.length) {
    window.clearTimeout(timers.pop());
  }
}

async function bootstrap() {
  state.loading = true;
  state.error = "";
  render();

  try {
    const data = await api(`/api/bootstrap?deviceId=${encodeURIComponent(getDeviceId())}`);
    syncStateFromServer(data);
    state.ready = true;
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

function syncStateFromServer(data) {
  state.imports = data.imports || [];
  state.reminders = data.reminders || [];
  state.setupRequired = Boolean(data.setupRequired);

  if (!state.imports.length) {
    state.activeImportId = null;
    state.activeSentenceId = null;
    state.screen = state.screen === "welcome" ? "welcome" : "import";
    saveState();
    return;
  }

  const activeImport =
    state.imports.find((item) => item.id === state.activeImportId) || state.imports[0];
  state.activeImportId = activeImport.id;

  const activeSentence =
    activeImport.sentences.find((sentence) => sentence.id === state.activeSentenceId) ||
    activeImport.sentences[0] ||
    null;

  state.activeSentenceId = activeSentence ? activeSentence.id : null;

  if (state.screen === "welcome") {
    state.screen = "home";
  }

  saveState();
}

function getActiveImport() {
  return state.imports.find((item) => item.id === state.activeImportId) || null;
}

function getActiveSentence() {
  const activeImport = getActiveImport();
  if (!activeImport) return null;
  return activeImport.sentences.find((sentence) => sentence.id === state.activeSentenceId) || null;
}

function setScreen(screen, sentenceId = null) {
  state.screen = screen;
  if (sentenceId) {
    state.activeSentenceId = sentenceId;
  }
  saveState();
  render();
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || "요청 처리 중 문제가 발생했습니다.");
  }

  return payload;
}

async function createImport() {
  const url = document.getElementById("youtube-url").value.trim();
  const learningWindowStart = document.getElementById("window-start").value;
  const learningWindowEnd = document.getElementById("window-end").value;
  const dailyReminderCount = parseInt(document.getElementById("daily-count").value, 10);

  state.loading = true;
  state.error = "";
  state.info = "";
  state.learningWindowStart = learningWindowStart;
  state.learningWindowEnd = learningWindowEnd;
  state.dailyReminderCount = dailyReminderCount;
  render();

  try {
    const data = await api("/api/import-youtube", {
      method: "POST",
      body: JSON.stringify({
        deviceId: getDeviceId(),
        url,
        learningWindowStart,
        learningWindowEnd,
        dailyReminderCount,
      }),
    });

    syncStateFromServer(data);
    state.info = "유튜브 자막을 분석해 문장을 저장했습니다.";
    state.screen = "summary";
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
    render();
  }
}

async function refreshFromServer() {
  const data = await api(`/api/bootstrap?deviceId=${encodeURIComponent(getDeviceId())}`);
  syncStateFromServer(data);
}

async function markSeen(sentenceId) {
  await api("/api/sentences/seen", {
    method: "POST",
    body: JSON.stringify({ sentenceId }),
  });
  await refreshFromServer();
}

async function markPracticed(sentenceId) {
  await api("/api/sentences/practiced", {
    method: "POST",
    body: JSON.stringify({ sentenceId }),
  });
  await refreshFromServer();
}

async function toggleStar(sentenceId) {
  await api("/api/sentences/star", {
    method: "POST",
    body: JSON.stringify({ sentenceId }),
  });
  await refreshFromServer();
  render();
}

async function generateReminder() {
  const data = await api("/api/reminders/generate", {
    method: "POST",
    body: JSON.stringify({ deviceId: getDeviceId() }),
  });

  syncStateFromServer(data);

  if (data.reminder && data.sentence && "Notification" in window && Notification.permission === "granted") {
    new Notification("Randome", {
      body: data.sentence.english,
    });
  }

  if (data.sentence) {
    state.activeSentenceId = data.sentence.id;
  }

  state.info = "새 랜덤 리마인드가 생성되었습니다.";
  render();
}

function scheduleReminderBurst() {
  clearTimers();
  const delays = [5000, 15000, 30000];

  delays.forEach((delay) => {
    const timer = window.setTimeout(async () => {
      try {
        await generateReminder();
      } catch (error) {
        state.error = error.message;
        render();
      }
    }, delay);

    timers.push(timer);
  });

  state.info = "5초, 15초, 30초 후에 리마인드를 생성합니다.";
  render();
}

async function requestNotificationsAndStart() {
  if (!("Notification" in window)) {
    scheduleReminderBurst();
    return;
  }

  const permission = await Notification.requestPermission();
  state.notificationsPermission = permission;
  saveState();
  scheduleReminderBurst();
}

function render() {
  if (state.loading && !state.ready) {
    return renderScreen(`
      <div class="stack-lg">
        <div class="card stack-sm">
          <p class="screen-kicker">Loading</p>
          <h1 class="title-lg">앱 상태를 불러오는 중입니다</h1>
          <p class="body">Supabase에 저장된 문장과 리마인드를 불러오고 있습니다.</p>
        </div>
      </div>
    `);
  }

  if (state.screen === "welcome") return renderWelcome();
  if (state.screen === "import") return renderImport();
  if (state.screen === "summary") return renderSummary();
  if (state.screen === "home") return renderHome();
  if (state.screen === "sentence") return renderSentence();
  if (state.screen === "practice") return renderPractice();
  if (state.screen === "library") return renderLibrary();
  renderWelcome();
}

function renderScreen(content) {
  app.innerHTML = `<section class="screen">${renderAlerts()}${content}</section>`;
}

function renderAlerts() {
  const items = [];

  if (state.error) {
    items.push(`
      <div class="alert alert-error">
        <strong>오류</strong>
        <p>${escapeHtml(state.error)}</p>
      </div>
    `);
  }

  if (state.info) {
    items.push(`
      <div class="alert alert-info">
        <strong>안내</strong>
        <p>${escapeHtml(state.info)}</p>
      </div>
    `);
  }

  if (state.setupRequired) {
    items.push(`
      <div class="alert alert-warning">
        <strong>설정 필요</strong>
        <p>Supabase 또는 Gemini 환경변수가 아직 설정되지 않았습니다. 문서의 설정 순서를 먼저 완료해주세요.</p>
      </div>
    `);
  }

  return items.join("");
}

function renderWelcome() {
  renderScreen(`
    <div class="stack-xl">
      <div class="hero-card stack-lg">
        <div class="hero-orb"></div>
        <div class="stack-sm">
          <p class="eyebrow">Randome + Gemini + Supabase</p>
          <h1 class="title-xl">유튜브 자막에서<br />실제 문장을 저장합니다</h1>
          <p class="body-sm">
            이제 샘플 문장이 아니라, 유튜브 자막을 가져와 Gemini로 문장·해석·연습을 만들고
            Supabase에 실제로 저장하는 버전입니다.
          </p>
        </div>
      </div>

      <div class="card stack-sm">
        <p class="screen-kicker">이번 버전에서 되는 것</p>
        <h2 class="title-md">URL 입력 -> 자막 추출 -> Gemini 생성 -> DB 저장</h2>
        <p class="body">
          한 번 가져온 영상과 문장은 새로고침 후에도 남아 있습니다. 리마인드와 연습 기록도 함께 저장됩니다.
        </p>
      </div>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="start-import">유튜브 가져오기</button>
        <button class="btn btn-secondary" data-action="go-home">저장된 문장 보기</button>
      </div>
    </div>
  `);

  bind("[data-action='start-import']", () => setScreen("import"));
  bind("[data-action='go-home']", () => setScreen("home"));
}

function renderImport() {
  renderScreen(`
    <div class="stack-lg">
      <div class="stack-sm">
        <p class="screen-kicker">Import</p>
        <h1 class="title-lg">유튜브 URL을 넣으면<br />Gemini가 문장을 만듭니다</h1>
        <p class="body">
          영어 자막이 있는 유튜브 영상을 넣으면, 자막을 읽어 재사용 가치가 큰 문장을 선택하고
          한국어 해석과 연습 문제까지 생성합니다.
        </p>
      </div>

      <div class="input-card stack-sm">
        <label for="youtube-url">YouTube URL</label>
        <input
          class="text-input"
          id="youtube-url"
          value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
        <button class="btn btn-primary" data-action="create-import">문장 생성하고 저장</button>
        <button class="btn btn-secondary" data-action="back-welcome">이전</button>
      </div>
    </div>
  `);

  bind("[data-action='create-import']", createImport);
  bind("[data-action='back-welcome']", () => setScreen("welcome"));
}

function renderSummary() {
  const activeImport = getActiveImport();
  const preview = activeImport ? activeImport.sentences.slice(0, 3) : [];

  renderScreen(`
    <div class="stack-lg">
      <div class="card stack-sm">
        <p class="screen-kicker">Saved</p>
        <h1 class="title-lg">${activeImport ? escapeHtml(activeImport.sourceTitle) : "문장 저장 완료"}</h1>
        <p class="body">
          Gemini가 ${activeImport ? activeImport.sentences.length : 0}개의 문장을 생성했고, Supabase에 저장했습니다.
        </p>
      </div>

      <div class="metric-grid">
        <div class="metric-card">
          <span class="label">저장 문장</span>
          <strong class="metric-value">${activeImport ? activeImport.sentences.length : 0}</strong>
        </div>
        <div class="metric-card">
          <span class="label">리마인드</span>
          <strong class="metric-value">${activeImport ? activeImport.dailyReminderCount : 0}</strong>
        </div>
        <div class="metric-card">
          <span class="label">윈도우</span>
          <strong class="metric-value">${activeImport ? activeImport.learningWindowStart : "--:--"}</strong>
        </div>
      </div>

      <div class="stack-sm">
        ${preview
          .map(
            (sentence) => `
              <article class="sentence-card stack-sm">
                <span class="sentence-tag">Preview</span>
                <p class="sentence-original">${escapeHtml(sentence.english)}</p>
                <p class="sentence-translation">${escapeHtml(sentence.korean)}</p>
              </article>
            `
          )
          .join("")}
      </div>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="summary-home">홈으로</button>
        <button class="btn btn-secondary" data-action="summary-first">첫 문장 보기</button>
      </div>
    </div>
  `);

  bind("[data-action='summary-home']", () => setScreen("home"));
  bind("[data-action='summary-first']", () => {
    if (activeImport && activeImport.sentences[0]) {
      setScreen("sentence", activeImport.sentences[0].id);
    }
  });
}

function renderHome() {
  const activeImport = getActiveImport();
  const preview = activeImport ? activeImport.sentences.slice(0, activeImport.dailyReminderCount) : [];
  const notificationsPermission =
    state.notificationsPermission === "granted" ? "브라우저 알림 허용됨" : "브라우저 알림 사용 가능";

  renderScreen(`
    <div class="stack-lg">
      <div class="space-row">
        <div class="stack-xs">
          <p class="screen-kicker">Today</p>
          <h1 class="title-lg">실제 데이터 기반 홈</h1>
        </div>
        <span class="status-chip">${notificationsPermission}</span>
      </div>

      ${
        activeImport
          ? `
            <div class="hero-card stack-md">
              <div class="stack-xs">
                <p class="eyebrow">Latest Import</p>
                <h2 class="title-md">${escapeHtml(activeImport.sourceTitle)}</h2>
                <p class="body-sm">
                  ${activeImport.learningWindowStart} - ${activeImport.learningWindowEnd},
                  하루 ${activeImport.dailyReminderCount}회
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

            <div class="stack-sm">
              <button class="btn btn-primary" data-action="start-reminders">30초 테스트 리마인드 시작</button>
              <button class="btn btn-secondary" data-action="single-reminder">지금 랜덤 리마인드 1개</button>
            </div>

            <div class="card stack-sm">
              <div class="space-row">
                <div class="stack-xs">
                  <p class="section-note">Today Queue</p>
                  <h2 class="title-sm">이번 영상 핵심 문장</h2>
                </div>
                <button class="link-btn" data-action="open-library">보관함</button>
              </div>
              <div class="library-list">
                ${preview
                  .map(
                    (sentence) => `
                      <article class="library-item stack-xs">
                        <p class="sentence-original sentence-small">${escapeHtml(sentence.english)}</p>
                        <p class="sentence-translation">${escapeHtml(sentence.korean)}</p>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
          : `
            <div class="empty-card stack-sm">
              <h2 class="title-md">아직 저장된 영상이 없습니다</h2>
              <p class="body">Supabase에 데이터를 저장하려면 먼저 유튜브 URL을 가져와야 합니다.</p>
              <button class="btn btn-primary" data-action="empty-import">유튜브 가져오기</button>
            </div>
          `
      }

      <div class="tabs">
        <button class="tab-btn active">홈</button>
        <button class="tab-btn" data-action="tab-library">보관함</button>
        <button class="tab-btn" data-action="tab-import">가져오기</button>
      </div>
    </div>
  `);

  bind("[data-action='empty-import']", () => setScreen("import"));
  bind("[data-action='start-reminders']", requestNotificationsAndStart);
  bind("[data-action='single-reminder']", async () => {
    try {
      await generateReminder();
    } catch (error) {
      state.error = error.message;
      render();
    }
  });
  bind("[data-action='open-library']", () => setScreen("library"));
  bind("[data-action='tab-library']", () => setScreen("library"));
  bind("[data-action='tab-import']", () => setScreen("import"));
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
        <button class="pill" data-action="sentence-home">홈</button>
        <button class="pill ${sentence.starred ? "active" : ""}" data-action="sentence-star">
          ${sentence.starred ? "별표됨" : "별표"}
        </button>
      </div>

      <article class="sentence-card stack-md">
        <div class="stack-xs">
          <p class="screen-kicker">Sentence Card</p>
          <h1 class="sentence-original">${escapeHtml(sentence.english)}</h1>
          <p class="sentence-translation">${escapeHtml(sentence.korean)}</p>
        </div>

        <div class="sentence-note stack-xs">
          <span class="label">핵심 패턴</span>
          <strong>${escapeHtml(sentence.pattern)}</strong>
          <p class="body-sm">${escapeHtml(sentence.reason)}</p>
        </div>

        <div class="sentence-note stack-xs">
          <span class="label">응용 예문</span>
          <strong>${escapeHtml(sentence.example)}</strong>
        </div>

        <div class="sentence-note stack-xs">
          <span class="label">사용 기록</span>
          <p class="body-sm">열람 ${sentence.seenCount}회 · 연습 ${sentence.practicedCount}회</p>
        </div>
      </article>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="sentence-practice">이 문장 연습하기</button>
        <button class="btn btn-secondary" data-action="sentence-library">보관함</button>
      </div>
    </div>
  `);

  bind("[data-action='sentence-home']", () => setScreen("home"));
  bind("[data-action='sentence-star']", async () => {
    try {
      await toggleStar(sentence.id);
    } catch (error) {
      state.error = error.message;
      render();
    }
  });
  bind("[data-action='sentence-practice']", async () => {
    try {
      await markSeen(sentence.id);
      setScreen("practice", sentence.id);
    } catch (error) {
      state.error = error.message;
      render();
    }
  });
  bind("[data-action='sentence-library']", () => setScreen("library"));
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
        <button class="pill" data-action="practice-back">문장</button>
        <span class="status-chip">짧은 능동 복습</span>
      </div>

      <div class="practice-card stack-md">
        <div class="stack-xs">
          <p class="screen-kicker">Practice</p>
          <h1 class="title-lg">빈칸을 채워보세요</h1>
          <p class="body">${escapeHtml(sentence.cloze)}</p>
        </div>

        <div class="choice-row">
          ${sentence.choices
            .map((choice) => `<button class="choice-btn" data-choice="${escapeAttribute(choice)}">${escapeHtml(choice)}</button>`)
            .join("")}
        </div>
      </div>

      <div class="feedback-box stack-xs" id="feedback-box">
        <span class="label">피드백</span>
        <strong>답을 선택하면 바로 설명합니다.</strong>
        <p class="body-sm">${escapeHtml(sentence.reason)}</p>
      </div>

      <div class="card stack-xs">
        <span class="label">직접 이어 쓰기</span>
        <strong>${escapeHtml(sentence.example)}</strong>
        <p class="body-sm">같은 패턴으로 내 상황 문장을 한 번 더 떠올려보세요.</p>
      </div>

      <div class="stack-sm">
        <button class="btn btn-primary" data-action="practice-complete">연습 완료</button>
        <button class="btn btn-secondary" data-action="practice-library">보관함</button>
      </div>
    </div>
  `);

  bind("[data-action='practice-back']", () => setScreen("sentence", sentence.id));
  bind("[data-action='practice-library']", () => setScreen("library"));
  bind("[data-action='practice-complete']", async () => {
    try {
      await markPracticed(sentence.id);
      state.info = "연습 결과를 저장했습니다.";
      setScreen("library");
    } catch (error) {
      state.error = error.message;
      render();
    }
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
      <strong>${correct ? "좋아요. 정답입니다." : `정답은 ${escapeHtml(sentence.answer)} 입니다.`}</strong>
      <p class="body-sm">${escapeHtml(sentence.reason)}</p>
    `;
  });
}

function renderLibrary() {
  const activeImport = getActiveImport();

  renderScreen(`
    <div class="stack-lg">
      <div class="space-row">
        <div class="stack-xs">
          <p class="screen-kicker">Library</p>
          <h1 class="title-lg">저장된 영상과 문장</h1>
        </div>
        <button class="pill" data-action="library-home">홈</button>
      </div>

      ${
        activeImport
          ? `
            <div class="card stack-sm">
              <p class="section-note">Source Video</p>
              <h2 class="title-md">${escapeHtml(activeImport.sourceTitle)}</h2>
              <p class="body-sm">${escapeHtml(activeImport.youtubeUrl)}</p>
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
                        <p class="sentence-original sentence-small">${escapeHtml(sentence.english)}</p>
                        <p class="sentence-translation">${escapeHtml(sentence.korean)}</p>
                      </div>
                      <div class="tab-row">
                        <button class="pill" data-sentence="${sentence.id}">보기</button>
                        <button class="pill" data-practice="${sentence.id}">연습</button>
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
                  <h2 class="title-sm">DB에 저장된 리마인드</h2>
                </div>
              </div>
              <div class="reminder-list">
                ${
                  state.reminders.length
                    ? state.reminders
                        .map(
                          (reminder) => `
                            <article class="reminder-card stack-xs">
                              <div class="space-row">
                                <strong>${escapeHtml(reminder.title)}</strong>
                                <span class="caption">${escapeHtml(reminder.deliveredAtLabel)}</span>
                              </div>
                              <p class="body-sm">${escapeHtml(reminder.preview)}</p>
                            </article>
                          `
                        )
                        .join("")
                    : `
                      <div class="empty-card stack-xs">
                        <strong>리마인드가 아직 없습니다</strong>
                        <p class="body-sm">홈에서 랜덤 리마인드를 생성하면 이곳에 기록됩니다.</p>
                      </div>
                    `
                }
              </div>
            </div>
          `
          : `
            <div class="empty-card stack-sm">
              <h2 class="title-md">저장된 영상이 없습니다</h2>
              <button class="btn btn-primary" data-action="library-import">가져오기</button>
            </div>
          `
      }
    </div>
  `);

  bind("[data-action='library-home']", () => setScreen("home"));
  bind("[data-action='library-import']", () => setScreen("import"));
  bindAll("[data-sentence]", (button) => setScreen("sentence", button.dataset.sentence));
  bindAll("[data-practice]", (button) => setScreen("practice", button.dataset.practice));
}

function bind(selector, handler) {
  const element = document.querySelector(selector);
  if (element) {
    element.addEventListener("click", handler);
  }
}

function bindAll(selector, handler) {
  document.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("click", () => handler(element));
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

window.addEventListener("beforeunload", clearTimers);
