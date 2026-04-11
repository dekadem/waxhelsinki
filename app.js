/** Default mix artwork: responsive srcset so pages do not download 3000×3000 for ~744px slots. */
const COVER_ART = {
  src: "./cover-1600x1600.jpg",
  srcset:
    "./cover-300x300.jpg 300w, ./cover-800x800.jpg 800w, ./cover-1600x1600.jpg 1600w, ./cover-3000x3000.jpg 3000w",
  sizesGrid:
    "(max-width: 480px) 100vw, (max-width: 820px) calc(50vw - 48px), (max-width: 1180px) calc(33.33vw - 48px), 360px",
  sizesMixPage: "(max-width: 520px) 100vw, min(920px, calc(100vw - 40px))",
};

function isDefaultCoverArt(url) {
  return url === "./cover.jpg";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUrl(value) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (/^https?:\/\/[^\s]+$/i.test(url)) return encodeURI(url);
  if (/^(?:\.\/|\/)[^\s]+$/.test(url)) return encodeURI(url);
  return "";
}

function sanitizeMixId(value) {
  const id = String(value ?? "").trim();
  return encodeURIComponent(id);
}

function parseMixIdFromPath(pathname) {
  const match = String(pathname || "").match(/\/(mix-\d+)\.html$/i);
  return match ? match[1].toLowerCase() : "";
}

function getMixHref(mixId) {
  return `./${sanitizeMixId(mixId)}.html`;
}

function mixCardHtml(mix, fetchPriority) {
  const safeId = sanitizeMixId(mix.id) || "mix";
  const safeHref = getMixHref(safeId);
  const safeTitle = escapeHtml(mix.title);
  const safeDuration = escapeHtml(mix.duration);
  const safeDescription = escapeHtml(mix.description);
  const safeArtAlt = escapeHtml(mix.artAlt);
  const safeArtUrl = sanitizeUrl(mix.artUrl);
  const fpValue = fetchPriority === "high" || fetchPriority === "low" ? fetchPriority : "auto";
  const fp = ` fetchpriority="${fpValue}"`;
  const img = isDefaultCoverArt(mix.artUrl)
    ? `<img src="${COVER_ART.src}" srcset="${COVER_ART.srcset}" sizes="${COVER_ART.sizesGrid}" alt="${safeArtAlt}" width="1600" height="1600"${fp} />`
    : `<img src="${safeArtUrl}" alt="${safeArtAlt}"${fp} />`;
  return `
      <article class="mix-card">
        <a href="${safeHref}" class="mix-card-link">
          <div class="mix-art">
            ${img}
          </div>
        </a>
        <div class="mix-meta">
          <h3><a href="${safeHref}" class="mix-card-link">${safeTitle}</a></h3>
          <span class="mix-duration">${safeDuration}</span>
        </div>
        <p class="mix-desc">${safeDescription}</p>
        <button class="play-mix-btn" type="button" data-play-mix-id="${escapeHtml(mix.id)}" aria-label="Play ${safeTitle}">
          ▶ Play in player
        </button>
        <a class="feed-link" href="${safeHref}">Open mix page</a>
      </article>
    `;
}

let MIXES = [];

const PLAYER_STATE_KEY = "waxhelsinki-player-state-v1";
let globalPlayer = null;

function throttle(fn, wait) {
  let lastCall = 0;
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke(time) {
    lastCall = time;
    const args = lastArgs;
    const context = lastThis;
    lastArgs = null;
    lastThis = null;
    fn.apply(context, args);
  }

  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - lastCall);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      invoke(now);
      return;
    }

    if (!timerId) {
      timerId = setTimeout(() => {
        timerId = null;
        invoke(Date.now());
      }, remaining);
    }
  };
}

function getMixById(mixId) {
  return MIXES.find((item) => item.id === mixId) || null;
}

function getLatestMix() {
  return MIXES[0] || null;
}

function getNextMixId(mixId) {
  const index = MIXES.findIndex((item) => item.id === mixId);
  if (index < 0 || index + 1 >= MIXES.length) return "";
  return MIXES[index + 1].id;
}

function getPreviousMixId(mixId) {
  const index = MIXES.findIndex((item) => item.id === mixId);
  if (index <= 0) return "";
  return MIXES[index - 1].id;
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const rounded = Math.floor(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function readPlayerState() {
  try {
    const raw = sessionStorage.getItem(PLAYER_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    const mixId = typeof parsed.mixId === "string" ? parsed.mixId.trim() : "";
    const time = parsed.time;
    const wasPlaying = parsed.wasPlaying;
    if (!mixId) return null;
    if (typeof time !== "number" || !Number.isFinite(time) || time < 0) return null;
    if (typeof wasPlaying !== "boolean") return null;

    return { mixId, time, wasPlaying };
  } catch {
    return null;
  }
}

function writePlayerState() {
  if (!globalPlayer?.audio) return;
  const state = {
    mixId: globalPlayer.currentMixId || "",
    time: Number(globalPlayer.audio.currentTime || 0),
    wasPlaying: !globalPlayer.audio.paused && !globalPlayer.audio.ended,
  };
  try {
    sessionStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

function updatePlayerUi() {
  if (!globalPlayer?.audio) return;
  const { audio, playButton, progressFill, timeValue, volumeButton, volumeSlider } = globalPlayer;
  const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
  const currentTime = Number.isFinite(audio.currentTime) && audio.currentTime > 0 ? audio.currentTime : 0;
  const ratio = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  if (playButton) {
    const isPaused = audio.paused || audio.ended;
    playButton.textContent = isPaused ? "▶" : "❚❚";
    playButton.setAttribute("aria-label", isPaused ? "Play current mix" : "Pause current mix");
  }
  if (progressFill) {
    progressFill.style.transform = `scaleX(${ratio})`;
  }
  if (timeValue) {
    timeValue.textContent = `${formatTime(currentTime)} / ${duration > 0 ? formatTime(duration) : "--:--"}`;
  }
  if (volumeSlider) {
    const effectiveVolume = audio.muted ? 0 : Math.round((Number(audio.volume) || 0) * 100);
    volumeSlider.value = String(effectiveVolume);
  }
  if (volumeButton) {
    const effectiveVolume = audio.muted ? 0 : Number(audio.volume) || 0;
    const icon = effectiveVolume <= 0 ? "🔇" : effectiveVolume < 0.5 ? "🔉" : "🔊";
    const label = effectiveVolume <= 0 ? "Unmute audio" : "Mute audio";
    volumeButton.textContent = icon;
    volumeButton.setAttribute("aria-label", label);
  }
}

function ensureGlobalPlayer() {
  if (globalPlayer) return globalPlayer;
  const latestMix = getLatestMix();
  const defaultTitle = latestMix ? escapeHtml(latestMix.title) : "Select a mix";
  let container = document.querySelector('[data-global-player="true"]');
  if (!container) {
    container = document.createElement("div");
    container.setAttribute("data-global-player", "true");
    container.className = "player";
    container.innerHTML = `
      <div class="player-row">
        <div class="player-controls" role="group" aria-label="Playback controls">
          <button class="player-btn player-prev" type="button" aria-label="Play previous mix">|◀</button>
          <button class="player-btn player-play" type="button" aria-label="Play current mix">▶</button>
          <button class="player-btn player-next" type="button" aria-label="Play next mix">▶|</button>
        </div>
        <div class="player-main">
          <div class="player-topline">
            <strong class="player-title">Now playing: ${defaultTitle}</strong>
            <div class="player-right">
              <span class="player-time">0:00 / --:--</span>
              <div class="player-volume">
                <button class="player-volume-btn" type="button" aria-label="Mute audio">🔊</button>
                <input class="player-volume-slider" type="range" min="0" max="100" step="1" value="100" aria-label="Volume" />
              </div>
            </div>
          </div>
          <button class="player-progress" type="button" aria-label="Seek playback position">
            <span class="player-progress-fill"></span>
          </button>
        </div>
        <audio class="player-audio" controls preload="none"></audio>
      </div>
    `;
    document.body.appendChild(container);
  }
  const title = container.querySelector(".player-title");
  const audio = container.querySelector(".player-audio");
  const playButton = container.querySelector(".player-play");
  const prevButton = container.querySelector(".player-prev");
  const nextButton = container.querySelector(".player-next");
  const progressButton = container.querySelector(".player-progress");
  const progressFill = container.querySelector(".player-progress-fill");
  const timeValue = container.querySelector(".player-time");
  const volumeButton = container.querySelector(".player-volume-btn");
  const volumeSlider = container.querySelector(".player-volume-slider");
  const preselectedMixId = latestMix ? latestMix.id : "";
  globalPlayer = {
    container,
    title,
    audio,
    playButton,
    prevButton,
    nextButton,
    progressButton,
    progressFill,
    timeValue,
    volumeButton,
    volumeSlider,
    lastVolume: 1,
    currentMixId: preselectedMixId,
    pendingSeekHandler: null,
  };
  if (latestMix && title) {
    title.textContent = `Now playing: ${latestMix.title}`;
  }
  if (latestMix && audio && !audio.src) {
    audio.src = sanitizeUrl(latestMix.audioUrl);
  }
  if (volumeSlider) {
    volumeSlider.value = String(Math.round((Number(audio.volume) || 1) * 100));
  }

  volumeSlider?.addEventListener("input", () => {
    const nextVolume = Math.min(1, Math.max(0, Number(volumeSlider.value) / 100));
    audio.volume = nextVolume;
    if (nextVolume > 0) {
      globalPlayer.lastVolume = nextVolume;
      audio.muted = false;
    } else {
      audio.muted = true;
    }
    updatePlayerUi();
  });
  volumeButton?.addEventListener("click", () => {
    const isMuted = audio.muted || audio.volume <= 0;
    if (isMuted) {
      const restored = Math.min(1, Math.max(0.05, Number(globalPlayer.lastVolume) || 0.7));
      audio.volume = restored;
      audio.muted = false;
    } else {
      globalPlayer.lastVolume = audio.volume > 0 ? audio.volume : globalPlayer.lastVolume;
      audio.muted = true;
    }
    updatePlayerUi();
  });

  prevButton?.addEventListener("click", () => {
    const previousMixId = getPreviousMixId(globalPlayer.currentMixId);
    if (!previousMixId) return;
    void playMixById(previousMixId, { autoplay: true, resetTime: true });
  });
  nextButton?.addEventListener("click", () => {
    const nextMixId = getNextMixId(globalPlayer.currentMixId);
    if (!nextMixId) return;
    void playMixById(nextMixId, { autoplay: true, resetTime: true });
  });
  playButton?.addEventListener("click", async () => {
    if (audio.paused || audio.ended) {
      try {
        await audio.play();
      } catch {
        // autoplay may be blocked without gesture
      }
    } else {
      audio.pause();
    }
    updatePlayerUi();
  });
  if (progressButton) {
    let isSeeking = false;

    const seekToClientX = (clientX) => {
      const duration = Number(audio.duration);
      if (!Number.isFinite(duration) || duration <= 0) return;
      const rect = progressButton.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      audio.currentTime = duration * ratio;
      updatePlayerUi();
    };

    progressButton.addEventListener("pointerdown", (event) => {
      isSeeking = true;
      event.preventDefault();
      progressButton.setPointerCapture(event.pointerId);
      seekToClientX(event.clientX);
    });

    progressButton.addEventListener("pointermove", (event) => {
      if (!isSeeking) return;
      event.preventDefault();
      seekToClientX(event.clientX);
    });

    const endSeeking = (event) => {
      if (!isSeeking) return;
      isSeeking = false;
      event.preventDefault();
      if (progressButton.hasPointerCapture(event.pointerId)) {
        progressButton.releasePointerCapture(event.pointerId);
      }
      seekToClientX(event.clientX);
      writePlayerState();
      updatePlayerUi();
    };

    progressButton.addEventListener("pointerup", endSeeking);
    progressButton.addEventListener("pointercancel", endSeeking);
  }

  audio.addEventListener("ended", () => {
    const nextMixId = getNextMixId(globalPlayer.currentMixId);
    if (!nextMixId) return;
    void playMixById(nextMixId, { autoplay: true, resetTime: true });
  });
  audio.addEventListener("timeupdate", updatePlayerUi);
  audio.addEventListener("timeupdate", throttle(writePlayerState, 5000));
  audio.addEventListener("pause", updatePlayerUi);
  audio.addEventListener("play", updatePlayerUi);
  audio.addEventListener("loadedmetadata", updatePlayerUi);
  audio.addEventListener("volumechange", updatePlayerUi);
  audio.addEventListener("pause", writePlayerState);
  audio.addEventListener("play", writePlayerState);
  audio.addEventListener("loadedmetadata", writePlayerState);

  updatePlayerUi();

  return globalPlayer;
}

async function playMixById(mixId, options = {}) {
  const player = ensureGlobalPlayer();
  const mix = getMixById(mixId);
  if (!mix || !player.audio) return;
  if (player.pendingSeekHandler) {
    player.audio.removeEventListener("loadedmetadata", player.pendingSeekHandler);
    player.pendingSeekHandler = null;
  }
  const sourceUrl = sanitizeUrl(mix.audioUrl);
  const isNewTrack = player.currentMixId !== mix.id || player.audio.src !== new URL(sourceUrl, location.href).toString();
  if (isNewTrack) {
    player.currentMixId = mix.id;
    player.title.textContent = `Now playing: ${mix.title}`;
    player.audio.src = sourceUrl;
    player.audio.load();
  }
  const targetTime = options.resetTime ? 0 : Number.isFinite(options.startTime) && options.startTime > 0 ? options.startTime : null;
  if (targetTime !== null) {
    if (isNewTrack && player.audio.readyState < HTMLMediaElement.HAVE_METADATA) {
      const expectedMixId = mix.id;
      const applyDeferredSeek = () => {
        player.pendingSeekHandler = null;
        if (player.currentMixId !== expectedMixId) return;
        player.audio.currentTime = targetTime;
        writePlayerState();
      };
      player.pendingSeekHandler = applyDeferredSeek;
      player.audio.addEventListener("loadedmetadata", applyDeferredSeek, { once: true });
    } else {
      player.audio.currentTime = targetTime;
    }
  }
  if (options.autoplay !== false) {
    try {
      await player.audio.play();
    } catch {
      // autoplay may be blocked without gesture
    }
  }
  updatePlayerUi();
}

function bindPlayButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-play-mix-id]");
    const latestTrigger = event.target.closest("[data-play-latest='true']");
    if (!button && !latestTrigger) return;
    const mixId =
      button?.getAttribute("data-play-mix-id") ||
      getLatestMix()?.id ||
      "";
    if (!mixId) return;
    event.preventDefault();
    void playMixById(mixId, { autoplay: true, resetTime: true });
  });
}

function restorePlayerState() {
  const saved = readPlayerState();
  if (!saved) return;
  void playMixById(saved.mixId, {
    autoplay: saved.wasPlaying === true,
    startTime: Number(saved.time || 0),
  });
}

function yieldToMain() {
  return new Promise((resolve) => {
    if (typeof scheduler !== "undefined" && typeof scheduler.yield === "function") {
      scheduler.yield().then(resolve);
    } else {
      requestAnimationFrame(() => resolve());
    }
  });
}

async function renderHome() {
  const grid = document.getElementById("mix-grid");
  if (!grid) return;

  for (let i = 0; i < MIXES.length; i++) {
    const fetchPriority = i === 0 ? "high" : "low";
    grid.insertAdjacentHTML("beforeend", mixCardHtml(MIXES[i], fetchPriority));
    if (i < MIXES.length - 1) await yieldToMain();
  }
}

function renderMixPageNavigation(mixId) {
  const root = document.getElementById("mix-page");
  if (!root) return;

  const currentIndex = MIXES.findIndex((item) => item.id === mixId);
  if (currentIndex < 0) return;

  const prevMix = MIXES[currentIndex + 1] || null;
  const nextMix = MIXES[currentIndex - 1] || null;
  const absoluteCurrentUrl = new URL(getMixHref(mixId), location.origin).toString();

  const prevLink = prevMix
    ? `<a href="${getMixHref(prevMix.id)}" class="mix-nav-link">Prev</a>`
    : `<span class="mix-nav-disabled">Prev</span>`;
  const nextLink = nextMix
    ? `<a href="${getMixHref(nextMix.id)}" class="mix-nav-link">Next</a>`
    : `<span class="mix-nav-disabled">Next</span>`;

  const pageLinks = MIXES.map((item) => {
    const href = getMixHref(item.id);
    if (item.id === mixId) {
      return `<span class="active">${escapeHtml(item.title)}</span>`;
    }
    return `<a href="${href}">${escapeHtml(item.title)}</a>`;
  }).join(" · ");

  let nav = root.querySelector('[data-mix-page-nav="true"]');
  if (!nav) {
    nav = document.createElement("div");
    nav.setAttribute("data-mix-page-nav", "true");
    nav.className = "mix-nav";
    root.appendChild(nav);
  }

  nav.innerHTML = `
    <div class="mix-nav-arrows">
      ${prevLink}
      <span class="mix-nav-sep">|</span>
      ${nextLink}
    </div>
    <div class="mix-nav-canonical">
      <strong>Pages below content:</strong>
      <a href="${absoluteCurrentUrl}">${absoluteCurrentUrl}</a>
    </div>
    <div class="mix-nav-pages">
      ${pageLinks}
    </div>
  `;
}

function renderMixPageById(mixId) {
  const root = document.getElementById("mix-page");
  if (!root || !mixId) return false;

  const mix = MIXES.find((item) => item.id === mixId);
  if (!mix) return false;

  document.getElementById("mix-title").textContent = mix.title;
  document.getElementById("mix-duration").textContent = mix.duration;
  document.getElementById("mix-description").textContent = mix.description;
  const art = document.getElementById("mix-art");
  if (art) {
    art.fetchPriority = "high";
    art.alt = mix.artAlt;
    if (isDefaultCoverArt(mix.artUrl)) {
      art.src = COVER_ART.src;
      art.srcset = COVER_ART.srcset;
      art.sizes = COVER_ART.sizesMixPage;
      art.width = 1600;
      art.height = 1600;
    } else {
      art.src = sanitizeUrl(mix.artUrl);
      art.removeAttribute("srcset");
      art.removeAttribute("sizes");
      art.removeAttribute("width");
      art.removeAttribute("height");
    }
  }
  const audioEl = document.getElementById("mix-audio");
  let playBtn = document.getElementById("mix-play-btn");
  if (!playBtn && audioEl && audioEl.parentElement) {
    playBtn = document.createElement("button");
    playBtn.id = "mix-play-btn";
    playBtn.className = "play-mix-btn";
    playBtn.type = "button";
    audioEl.insertAdjacentElement("beforebegin", playBtn);
    audioEl.remove();
  }
  if (playBtn) {
    playBtn.setAttribute("data-play-mix-id", mix.id);
    playBtn.textContent = "▶ Play in player";
    playBtn.setAttribute("aria-label", `Play ${mix.title}`);
  }
  renderMixPageNavigation(mixId);
  return true;
}

function setShellVisibility(showMixPage) {
  const hero = document.querySelector(".hero");
  const mixes = document.getElementById("mixes");
  const shell = document.getElementById("mix-page-shell");
  if (!shell) return;

  shell.hidden = !showMixPage;
  if (hero) hero.hidden = showMixPage;
  if (mixes) mixes.hidden = showMixPage;
}

function scrollToMixTitle(behavior = "auto") {
  const title = document.getElementById("mix-title");
  if (!title) return;

  const topbar = document.querySelector(".topbar");
  const topbarOffset = topbar ? topbar.getBoundingClientRect().height : 0;
  const spacing = 12;
  const top = Math.max(window.scrollY + title.getBoundingClientRect().top - topbarOffset - spacing, 0);
  window.scrollTo({ top, behavior });
}

function applyRoute(pathname, replaceState) {
  const scrollBehavior = replaceState ? "auto" : "smooth";
  const mixId = parseMixIdFromPath(pathname);
  if (mixId) {
    const ok = renderMixPageById(mixId);
    if (!ok) {
      setShellVisibility(false);
      document.title = "Not found | wax helsinki";
      if (replaceState) {
        history.replaceState({}, "", "./index.html");
      } else {
        history.pushState({}, "", "./index.html");
      }
      return true;
    }
    setShellVisibility(true);
    const mix = MIXES.find((item) => item.id === mixId);
    if (mix) {
      document.title = `${mix.title} | wax helsinki`;
    }
    scrollToMixTitle(scrollBehavior);
    const normalized = `./${mixId}.html`;
    if (replaceState) {
      history.replaceState({ mixId }, "", normalized);
    } else {
      history.pushState({ mixId }, "", normalized);
    }
    return true;
  }

  setShellVisibility(false);
  document.title = "WAX HELSINKI | Sonic Brutalism";
  window.scrollTo({ top: 0, behavior: scrollBehavior });
  const isHomePath = /\/(?:index\.html)?$/i.test(pathname);
  const currentIsHomePath = /\/(?:index\.html)?$/i.test(location.pathname);
  if (isHomePath && !currentIsHomePath) {
    if (replaceState) {
      history.replaceState({}, "", "./index.html");
    } else {
      history.pushState({}, "", "./index.html");
    }
  } else if (replaceState && !currentIsHomePath) {
    history.replaceState({}, "", "./index.html");
  }
  return true;
}

function handleSpaNavigation() {
  const hasSpaShell = Boolean(document.getElementById("mix-page-shell"));
  if (!hasSpaShell) return;

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    if (link.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return;
    if (/^https?:\/\//i.test(href)) return;

    const url = new URL(href, location.href);
    const sameOrigin = url.origin === location.origin;
    if (!sameOrigin) return;
    const isMix = /\/mix-\d+\.html$/i.test(url.pathname);
    const isHome = /\/(?:index\.html)?$/i.test(url.pathname);
    if (!isMix && !isHome) return;

    event.preventDefault();
    applyRoute(url.pathname, false);
  });

  window.addEventListener("popstate", () => {
    applyRoute(location.pathname, true);
  });
}

(async function init() {
  try {
    const res = await fetch("./mixes.json");
    MIXES = await res.json();
  } catch { /* MIXES stays empty */ }

  void renderHome().catch(() => {});
  handleSpaNavigation();
  ensureGlobalPlayer();
  bindPlayButtons();
  restorePlayerState();
  const root = document.getElementById("mix-page");
  if (root && root.dataset.mixId) {
    renderMixPageById(root.dataset.mixId);
  } else {
    applyRoute(location.pathname, true);
  }
})();
