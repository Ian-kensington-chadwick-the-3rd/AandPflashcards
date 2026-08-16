(function () {
  "use strict";

  const STORAGE_PREFIX = "physicsFlashcards:progress:";
  const THEME_KEY = "physicsFlashcards:theme";

  // ---------- DOM references ----------
  const homeScreen = document.getElementById("home-screen");
  const studyScreen = document.getElementById("study-screen");
  const completeScreen = document.getElementById("complete-screen");

  const subjectGrid = document.getElementById("subject-grid");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeLabel = document.getElementById("theme-label");

  const backBtn = document.getElementById("back-btn");
  const resetBtn = document.getElementById("reset-btn");
  const studySubjectTitle = document.getElementById("study-subject-title");
  const studySubjectSource = document.getElementById("study-subject-source");

  const progressFill = document.getElementById("progress-fill");
  const progressCount = document.getElementById("progress-count");
  const progressPct = document.getElementById("progress-pct");

  const flashcard = document.getElementById("flashcard");
  const frontSectionBadge = document.getElementById("front-section-badge");
  const frontText = document.getElementById("front-text");
  const backText = document.getElementById("back-text");

  const prevBtn = document.getElementById("prev-btn");
  const flipBtn = document.getElementById("flip-btn");
  const nextBtn = document.getElementById("next-btn");
  const shuffleToggle = document.getElementById("shuffle-toggle");
  const sectionContext = document.getElementById("section-context");

  const completeRestartBtn = document.getElementById("complete-restart-btn");
  const completeHomeBtn = document.getElementById("complete-home-btn");

  // ---------- State ----------
  let currentSubject = null;
  let order = [];
  let pos = 0;
  let flipped = false;

  // ---------- Theme ----------
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setTheme(isDark ? "dark" : "light");
  }

  function setTheme(mode) {
    if (mode === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeIcon.textContent = "☀️";
      themeLabel.textContent = "Light mode";
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeIcon.textContent = "🌙";
      themeLabel.textContent = "Dark mode";
    }
    localStorage.setItem(THEME_KEY, mode);
  }

  themeToggle.addEventListener("click", function () {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark");
  });

  // ---------- Progress storage ----------
  function loadProgress(subjectId) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + subjectId);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed.pos !== "number" || !Array.isArray(parsed.order)) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveProgress() {
    const data = { pos: pos, order: order, shuffled: shuffleToggle.checked };
    localStorage.setItem(STORAGE_PREFIX + currentSubject.id, JSON.stringify(data));
  }

  function clearProgress(subjectId) {
    localStorage.removeItem(STORAGE_PREFIX + subjectId);
  }

  function sequentialOrder(count) {
    const arr = new Array(count);
    for (let i = 0; i < count; i++) arr[i] = i;
    return arr;
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // ---------- Home screen ----------
  function renderHome() {
    subjectGrid.innerHTML = "";
    SUBJECTS.forEach(function (subject) {
      const total = subject.cards.length;
      const saved = loadProgress(subject.id);
      const studied = saved ? Math.min(saved.pos, total) : 0;
      const pct = total > 0 ? Math.round((studied / total) * 100) : 0;

      const card = document.createElement("button");
      card.className = "subject-card";
      card.type = "button";
      card.innerHTML =
        '<h3>' + escapeHtml(subject.title) + '</h3>' +
        '<p class="subject-desc">' + escapeHtml(subject.description) + '</p>' +
        '<p class="subject-source">' + escapeHtml(subject.source) + '</p>' +
        '<div class="subject-progress-wrap">' +
          '<div class="subject-progress-track"><div class="subject-progress-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="subject-progress-label"><span>' + studied + ' / ' + total + ' studied</span><span>' + pct + '%</span></div>' +
        '</div>';
      card.addEventListener("click", function () {
        openSubject(subject);
      });
      subjectGrid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Study screen ----------
  function openSubject(subject) {
    currentSubject = subject;
    const total = subject.cards.length;
    const saved = loadProgress(subject.id);

    if (saved && saved.order.length === total) {
      order = saved.order;
      pos = Math.min(saved.pos, total);
      shuffleToggle.checked = !!saved.shuffled;
    } else {
      order = sequentialOrder(total);
      pos = 0;
      shuffleToggle.checked = false;
    }

    studySubjectTitle.textContent = subject.title;
    studySubjectSource.textContent = subject.source;

    showScreen("study");
    render();
  }

  function currentCard() {
    if (pos >= order.length) return null;
    return currentSubject.cards[order[pos]];
  }

  function render() {
    const total = order.length;

    if (pos >= total) {
      showScreen("complete");
      return;
    }

    const card = currentCard();
    flipped = false;
    flashcard.classList.remove("flipped");

    frontSectionBadge.textContent = card.section;
    frontText.textContent = card.question;
    backText.textContent = card.answer;
    sectionContext.textContent = card.section + " · p. " + card.page;

    const displayPos = pos + 1;
    progressCount.textContent = displayPos + " / " + total;
    const pct = Math.round((displayPos / total) * 100);
    progressFill.style.width = pct + "%";
    progressPct.textContent = pct + "%";

    prevBtn.disabled = pos === 0;
    nextBtn.textContent = pos === total - 1 ? "Finish ✓" : "Next →";

    saveProgress();
  }

  function toggleFlip() {
    flipped = !flipped;
    flashcard.classList.toggle("flipped", flipped);
  }

  function goNext() {
    if (pos < order.length) {
      pos++;
      render();
    }
  }

  function goPrev() {
    if (pos > 0) {
      pos--;
      render();
    }
  }

  function resetSubject() {
    if (!currentSubject) return;
    clearProgress(currentSubject.id);
    order = sequentialOrder(currentSubject.cards.length);
    pos = 0;
    shuffleToggle.checked = false;
    showScreen("study");
    render();
  }

  shuffleToggle.addEventListener("change", function () {
    if (!currentSubject) return;
    const total = currentSubject.cards.length;
    order = shuffleToggle.checked ? shuffleArray(sequentialOrder(total)) : sequentialOrder(total);
    pos = 0;
    render();
  });

  flashcard.addEventListener("click", toggleFlip);
  flashcard.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      toggleFlip();
    }
  });

  flipBtn.addEventListener("click", toggleFlip);
  nextBtn.addEventListener("click", goNext);
  prevBtn.addEventListener("click", goPrev);
  resetBtn.addEventListener("click", function () {
    if (window.confirm("Reset progress for " + currentSubject.title + "? This starts the deck over from card 1.")) {
      resetSubject();
    }
  });

  backBtn.addEventListener("click", function () {
    showScreen("home");
  });

  completeRestartBtn.addEventListener("click", function () {
    resetSubject();
  });

  completeHomeBtn.addEventListener("click", function () {
    showScreen("home");
  });

  document.addEventListener("keydown", function (e) {
    if (studyScreen.classList.contains("hidden")) return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

    if (e.code === "ArrowRight") {
      goNext();
    } else if (e.code === "ArrowLeft") {
      goPrev();
    } else if (e.code === "Space" && document.activeElement !== flashcard) {
      e.preventDefault();
      toggleFlip();
    }
  });

  // ---------- Screen switching ----------
  function showScreen(name) {
    homeScreen.classList.toggle("hidden", name !== "home");
    studyScreen.classList.toggle("hidden", name !== "study");
    completeScreen.classList.toggle("hidden", name !== "complete");
    if (name === "home") {
      renderHome();
    }
    window.scrollTo(0, 0);
  }

  // ---------- Init ----------
  initTheme();
  showScreen("home");
})();
