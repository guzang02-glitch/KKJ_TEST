const STATE = {
  IDLE: "idle",
  WAITING: "waiting",
  READY: "ready",
  FAIL: "fail",
  RESULT: "result",
};

const RANKING_SIZE = 5;
const MIN_DELAY_MS = 1000;
const MAX_DELAY_MS = 12000;

const screenEl = document.getElementById("screen");
const gameContentEl = document.getElementById("game-content");
const messageEl = document.getElementById("message");
const resultContentEl = document.getElementById("result-content");
const reactionTimeEl = document.getElementById("reaction-time");
const nicknameInput = document.getElementById("nickname");
const saveBtn = document.getElementById("save-btn");
const saveStatusEl = document.getElementById("save-status");
const bestRecordEl = document.getElementById("best-record");
const rankingListEl = document.getElementById("ranking-list");
const retryBtn = document.getElementById("retry-btn");

let state = STATE.IDLE;
let redTimer = null;
let readyStartTime = 0;
let lastReactionMs = 0;

function setState(next) {
  state = next;
  screenEl.className = "screen " + next;
}

function toIdle() {
  clearTimeout(redTimer);
  setState(STATE.IDLE);
  messageEl.textContent = "클릭해서 시작";
  gameContentEl.classList.remove("hidden");
  resultContentEl.classList.add("hidden");
}

function startWaiting() {
  setState(STATE.WAITING);
  messageEl.textContent = "빨간색으로 바뀔 때까지 기다리세요...";
  const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  redTimer = setTimeout(() => {
    setState(STATE.READY);
    messageEl.textContent = "지금 클릭!";
    readyStartTime = performance.now();
  }, delay);
}

function fail() {
  clearTimeout(redTimer);
  setState(STATE.FAIL);
  messageEl.textContent = "너무 빨랐습니다! 클릭하면 다시 시작합니다";
}

async function succeed() {
  lastReactionMs = Math.round(performance.now() - readyStartTime);
  setState(STATE.RESULT);
  gameContentEl.classList.add("hidden");
  resultContentEl.classList.remove("hidden");
  reactionTimeEl.textContent = `반응 속도: ${lastReactionMs} ms`;
  nicknameInput.value = "";
  saveStatusEl.textContent = "";
  await refreshRanking();
}

screenEl.addEventListener("click", () => {
  if (state === STATE.IDLE) {
    startWaiting();
  } else if (state === STATE.WAITING) {
    fail();
  } else if (state === STATE.READY) {
    succeed();
  } else if (state === STATE.FAIL) {
    toIdle();
  }
});

saveBtn.addEventListener("click", async () => {
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    saveStatusEl.textContent = "닉네임을 입력하세요.";
    return;
  }

  saveBtn.disabled = true;
  try {
    await saveScore(lastReactionMs, nickname);
    saveStatusEl.textContent = "기록이 저장되었습니다!";
    await refreshRanking();
  } catch (err) {
    saveStatusEl.textContent = "저장 실패: Firebase 설정을 확인하세요.";
    console.error(err);
  } finally {
    saveBtn.disabled = false;
  }
});

retryBtn.addEventListener("click", () => {
  toIdle();
});

async function refreshRanking() {
  try {
    const top = await getTop(RANKING_SIZE);
    if (top.length > 0) {
      bestRecordEl.textContent = `최고 기록: ${top[0].nickname} - ${top[0].ms} ms`;
    } else {
      bestRecordEl.textContent = "아직 기록이 없습니다.";
    }

    rankingListEl.innerHTML = "";
    top.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.nickname} - ${item.ms} ms`;
      rankingListEl.appendChild(li);
    });
  } catch (err) {
    bestRecordEl.textContent = "랭킹을 불러오지 못했습니다. Firebase 설정을 확인하세요.";
    rankingListEl.innerHTML = "";
    console.error(err);
  }
}
