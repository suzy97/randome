const screens = [
  { id: "welcome", label: "Intro" },
  { id: "import", label: "Import" },
  { id: "processing", label: "Process" },
  { id: "home", label: "Home" },
  { id: "push", label: "Push" },
  { id: "card", label: "Card" },
  { id: "practice", label: "Practice" },
  { id: "library", label: "Library" },
];

const screenContainer = document.getElementById("screen");
const jumpContainer = document.getElementById("screen-jumps");

function renderJumpChips(activeId) {
  jumpContainer.innerHTML = "";

  screens.forEach((screen) => {
    const button = document.createElement("button");
    button.className = `jump-chip${screen.id === activeId ? " active" : ""}`;
    button.textContent = screen.label;
    button.type = "button";
    button.addEventListener("click", () => renderScreen(screen.id));
    jumpContainer.appendChild(button);
  });
}

function wirePracticeChoices() {
  const feedback = screenContainer.querySelector("#practice-feedback");
  if (!feedback) {
    return;
  }

  const title = feedback.querySelector("strong");
  const body = feedback.querySelector("p");

  screenContainer.querySelectorAll(".choice-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const isCorrect = chip.dataset.correct === "true";

      screenContainer.querySelectorAll(".choice-chip").forEach((button) => {
        button.classList.remove("correct", "wrong");
      });

      feedback.classList.remove("is-correct", "is-wrong");

      if (isCorrect) {
        chip.classList.add("correct");
        feedback.classList.add("is-correct");
        title.textContent = "좋아요. `be more likely to`가 가장 자연스럽습니다.";
        body.textContent =
          "`likely`는 가능성을 말할 때 쓰고, 이 문장에서는 습관 형성을 설명하는 핵심 패턴으로 반복 학습 가치가 큽니다.";
      } else {
        chip.classList.add("wrong");
        feedback.classList.add("is-wrong");
        title.textContent = "이 표현은 어색합니다. 정답은 `likely`예요.";
        body.textContent =
          "`sure`나 `ready`는 문맥상 가능성의 증가를 정확히 전달하지 못합니다. 이 문장은 `be more likely to + 동사` 패턴을 익히는 데 초점이 있습니다.";
      }
    });
  });
}

function wireScreenActions() {
  screenContainer.querySelectorAll("[data-next]").forEach((element) => {
    element.addEventListener("click", () => {
      renderScreen(element.dataset.next);
    });
  });

  screenContainer.querySelectorAll(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      pill.classList.toggle("selected");
    });
  });

  wirePracticeChoices();
}

function renderScreen(screenId) {
  const template = document.getElementById(`screen-${screenId}`);
  if (!template) {
    return;
  }

  screenContainer.innerHTML = "";
  screenContainer.appendChild(template.content.cloneNode(true));
  renderJumpChips(screenId);
  wireScreenActions();
}

renderScreen("welcome");
