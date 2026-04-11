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
        <a href="${safeHref}" style="text-decoration:none;color:inherit;">
          <div class="mix-art">
            ${img}
          </div>
        </a>
        <div class="mix-meta">
          <h3><a href="${safeHref}" style="color:inherit;text-decoration:none;">${safeTitle}</a></h3>
          <span class="mix-duration">${safeDuration}</span>
        </div>
        <p class="mix-desc">${safeDescription}</p>
        <button class="play-mix-btn" type="button" data-play-mix-id="${escapeHtml(mix.id)}" aria-label="Play ${safeTitle}">
          ▶ Play in player
        </button>
        <a class="feed-link" href="${safeHref}" style="width:max-content;">Open mix page</a>
      </article>
    `;
}

const MIXES = [
  {
    id: "mix-023",
    title: "WAXMIX 023",
    duration: "57:47",
    description: "Elmo solo mix: deep house and minimal grooves with warm bass and late-night flow.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/waxmix-023.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 023 artwork",
  },
  {
    id: "mix-022",
    title: "WAXMIX 022",
    duration: "1:23:00",
    description: "Elmo solo session: deep minimal house grooves with crisp percussion and steady club momentum.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/waxmix-022.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 022 artwork",
  },
  {
    id: "mix-021",
    title: "WAXMIX 021",
    duration: "2:07:39",
    description: "Elmo & Konstantin live at WAX OFF party in Helsinki: raw, driving house pressure and late-night energy.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/wax-off-helsinki-2013.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 021 artwork",
  },
  {
    id: "mix-020",
    title: "WAXMIX 020",
    duration: "2:10:28",
    description: "Extended minimal house set by Elmo: hypnotic loops, deep bass pressure, and steady late-night drive.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/waxmix-020.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 020 artwork",
  },
  {
    id: "mix-019",
    title: "WAXMIX 019",
    duration: "1:43:04",
    description: "Minimal house session by Elmo: tight grooves, rolling bass, and late-night club momentum.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/elmo-mix-wappu-aatto-2013.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 019 artwork",
  },
  {
    id: "mix-018",
    title: "WAXMIX 018",
    duration: "53:33",
    description: "Chill-out summer blend by Elmo: laidback soul, mellow hiphop, and easy sunset grooves.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/letkee-kesa-2008-mix.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 018 artwork",
  },
  {
    id: "mix-017",
    title: "WAXMIX 017",
    duration: "1:15:03",
    description: "Elmo house vibes: warm grooves, rolling basslines, and late-night floor energy.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/stelmo-2008-10-11.mp3",
    artUrl: "./imgs/556023385_24590412430569185_3278474231309641193_n.jpg",
    artAlt: "WAXMIX 017 artwork",
  },
  {
    id: "mix-016",
    title: "WAXMIX 016",
    duration: "1:11:03",
    description: "Elmo with a stripped-back minimal house flow and late-night groove tension.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/dj-set-2008-11-11.mp3",
    artUrl: "./imgs/555641797_24591161667160928_6907699687191442456_n.jpg",
    artAlt: "WAXMIX 016 artwork",
  },
  {
    id: "mix-015",
    title: "WAXMIX 015",
    duration: "42:51",
    description: "Elmo live at Bar Loop: a warm, deep house ride with late-night swing.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/bar-loop-2008-06-11-pt-1-2.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 015 artwork",
  },
  {
    id: "mix-014",
    title: "WAXMIX 014",
    duration: "53:36",
    description: "Elmo & Konstantin live at Bar Loop.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/live-bar-loop-2008-06-11.mp3",
    artUrl: "./imgs/553414165_24591188187158276_8482474541081609932_n.jpg",
    artAlt: "WAXMIX 014 artwork",
  },
  {
    id: "mix-013",
    title: "WAXMIX 013",
    duration: "1:19:58",
    description: "Elmo & Konstantin at Loop.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/dj-set-loop-2010-05-28.mp3",
    artUrl: "./imgs/462619689_8457186587651693_5232784768525424538_n.jpg",
    artAlt: "WAXMIX 013 artwork",
  },
  {
    id: "mix-012",
    title: "WAXMIX 012",
    duration: "1:34:51",
    description: "Elmo & Konstantin at Loop: a chilled, late-night techno house drift.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/line-2009-11-06-loop.mp3",
    artUrl: "./imgs/496845150_9722340374469635_8656441767417272112_n.jpg",
    artAlt: "WAXMIX 012 artwork",
  },
  {
    id: "mix-011",
    title: "WAXMIX 011",
    duration: "2:04:52",
    description: "At Beatroot by Elmo & Konstantin: deep warehouse techno house session.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/at-beatroot-2008-11-15.mp3",
    artUrl: "./konstantin_elmo.jpeg",
    artAlt: "WAXMIX 011 artwork featuring Konstantin and Elmo",
  },
  {
    id: "mix-010",
    title: "WAXMIX 010",
    duration: "1:40:12",
    description: "Elmo & Konstantin live at Beatroot: rolling techno house with raw club energy.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/beatroot_2010-03-27.m4a",
    artUrl: "./imgs/556226484_24582068094736952_2929117247685238373_n.jpg",
    artAlt: "WAXMIX 010 artwork",
  },
  {
    id: "mix-009",
    title: "WAXMIX 009",
    duration: "48:51",
    description: "Studio Mix p3 by Elmo & Konstantin: punchy house rollers and deep techno flow.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/studiomix-2014-12-19-p3.mp3",
    artUrl: "./imgs/556023385_24590412430569185_3278474231309641193_n.jpg",
    artAlt: "WAXMIX 009 artwork",
  },
  {
    id: "mix-008",
    title: "WAXMIX 008",
    duration: "2:15:04",
    description: "Studio Mix p2 by Elmo & Konstantin: long-form techno house pressure and dubby textures.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/studiomix-2014-12-19-p2.mp3",
    artUrl: "./imgs/555641797_24591161667160928_6907699687191442456_n.jpg",
    artAlt: "WAXMIX 008 artwork",
  },
  {
    id: "mix-007",
    title: "WAXMIX 007",
    duration: "1:35:46",
    description: "Studio Mix p1 by Elmo & Konstantin: deep techno and house pressure.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/studiomix-2014-12-19-p1.mp3",
    artUrl: "./imgs/555535363_24590761573867604_4537699491397861058_n.jpg",
    artAlt: "WAXMIX 007 artwork",
  },
  {
    id: "mix-006",
    title: "WAXMIX 006",
    duration: "1:12:58",
    description: "Driving late-night techno house with rolling drums and hypnotic bass by Elmo.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/6.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 006 artwork",
  },
  {
    id: "mix-005",
    title: "WAXMIX 005",
    duration: "52:24",
    description: "Warm, groove-led house cuts with crisp techno edges and swing by Elmo.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/5.mp3",
    artUrl: "./cover.jpg",
    artAlt: "WAXMIX 005 artwork",
  },
  {
    id: "mix-004",
    title: "WAXMIX 004",
    duration: "2:15:03",
    description: "Long-form warehouse trip through deep techno and minimal house by Elmo & Konstantin.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/4.mp3",
    artUrl: "./imgs/553414165_24591188187158276_8482474541081609932_n.jpg",
    artAlt: "WAXMIX 004 artwork",
  },
  {
    id: "mix-003",
    title: "WAXMIX 003",
    duration: "2:15:04",
    description: "Dark, percussive techno house journey with dubbed textures by Elmo & Konstantin.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/3.mp3",
    artUrl: "./imgs/553371180_24561622720114823_9073916947826008228_n.jpg",
    artAlt: "WAXMIX 003 artwork",
  },
  {
    id: "mix-002",
    title: "WAXMIX 002",
    duration: "48:51",
    description: "Hypnotic techno house blend with soulful chords and heads-down energy by Elmo & Konstantin.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/2.mp3",
    artUrl: "./konstantin_elmo.jpeg",
    artAlt: "WAXMIX 002 artwork featuring Konstantin and Elmo",
  },
  {
    id: "mix-001",
    title: "WAXMIX 001",
    duration: "55:17",
    description: "Foundational Wax Helsinki set: classic house rhythms and raw techno pulse by Elmo.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/1.mp3",
    artUrl: "./imgs/514248286_24588114450798983_173266012237871663_n.jpg",
    artAlt: "WAXMIX 001 artwork",
  },
];

const PLAYER_STATE_KEY = "waxhelsinki-player-state-v1";
let globalPlayer = null;

function throttle(fn, wait) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

function ensurePlayerStyles() {
  if (document.getElementById("global-player-styles")) return;
  const style = document.createElement("style");
  style.id = "global-player-styles";
  style.textContent = `
    .play-mix-btn {
      width: max-content;
      border: 1px solid rgba(253, 228, 0, 0.5);
      color: #fde400;
      background: transparent;
      padding: 8px 12px;
      text-transform: uppercase;
      font-family: "Space Grotesk", Arial, sans-serif;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
    }
    .play-mix-btn:hover { border-color: #fde400; }
    .player .player-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .player .player-label { opacity: 0.65; }
    .player .player-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player .player-audio { max-width: 520px; width: 100%; }
    @media (max-width: 820px) {
      .player .player-row { flex-direction: column; align-items: stretch; gap: 10px; }
      .player .player-audio { max-width: none; }
    }
  `;
  document.head.appendChild(style);
}

function getMixById(mixId) {
  return MIXES.find((item) => item.id === mixId) || null;
}

function getNextMixId(mixId) {
  const index = MIXES.findIndex((item) => item.id === mixId);
  if (index < 0 || index + 1 >= MIXES.length) return "";
  return MIXES[index + 1].id;
}

function readPlayerState() {
  try {
    const raw = sessionStorage.getItem(PLAYER_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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

function ensureGlobalPlayer() {
  ensurePlayerStyles();
  if (globalPlayer) return globalPlayer;
  let container = document.querySelector('[data-global-player="true"]');
  if (!container) {
    container = document.createElement("div");
    container.setAttribute("data-global-player", "true");
    container.className = "player";
    container.innerHTML = `
      <div class="player-row">
        <div class="player-meta">
          <span class="player-label">Now playing</span>
          <strong class="player-title">Select a mix</strong>
        </div>
        <audio class="player-audio" controls preload="none"></audio>
      </div>
    `;
    document.body.appendChild(container);
  }
  const title = container.querySelector(".player-title");
  const audio = container.querySelector(".player-audio");
  globalPlayer = { container, title, audio, currentMixId: "" };

  audio.addEventListener("ended", () => {
    const nextMixId = getNextMixId(globalPlayer.currentMixId);
    if (!nextMixId) return;
    void playMixById(nextMixId, { autoplay: true, resetTime: true });
  });
  audio.addEventListener("timeupdate", throttle(writePlayerState, 5000));
  audio.addEventListener("pause", writePlayerState);
  audio.addEventListener("play", writePlayerState);
  audio.addEventListener("loadedmetadata", writePlayerState);

  return globalPlayer;
}

async function playMixById(mixId, options = {}) {
  const player = ensureGlobalPlayer();
  const mix = getMixById(mixId);
  if (!mix || !player.audio) return;
  const sourceUrl = sanitizeUrl(mix.audioUrl);
  const isNewTrack = player.currentMixId !== mix.id || player.audio.src !== new URL(sourceUrl, location.href).toString();
  if (isNewTrack) {
    player.currentMixId = mix.id;
    player.title.textContent = mix.title;
    player.audio.src = sourceUrl;
    player.audio.load();
  }
  if (options.resetTime) {
    player.audio.currentTime = 0;
  } else if (Number.isFinite(options.startTime) && options.startTime > 0) {
    player.audio.currentTime = options.startTime;
  }
  if (options.autoplay !== false) {
    try {
      await player.audio.play();
    } catch {
      // autoplay may be blocked without gesture
    }
  }
}

function bindPlayButtons() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-play-mix-id]");
    if (!button) return;
    const mixId = button.getAttribute("data-play-mix-id");
    if (!mixId) return;
    event.preventDefault();
    void playMixById(mixId, { autoplay: true, resetTime: true });
  });
}

function restorePlayerState() {
  const saved = readPlayerState();
  if (!saved?.mixId) return;
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

  const staticLcp = grid.querySelector("article[data-static-lcp]");
  const list = staticLcp ? MIXES.slice(1) : MIXES;
  for (let i = 0; i < list.length; i++) {
    const mix = list[i];
    const fetchPriority = staticLcp || i > 0 ? "low" : "high";
    grid.insertAdjacentHTML("beforeend", mixCardHtml(mix, fetchPriority));
    if (i < list.length - 1) await yieldToMain();
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
    ? `<a href="${getMixHref(prevMix.id)}" style="color:#fde400;text-decoration:none;">Prev</a>`
    : `<span style="opacity:.45;">Prev</span>`;
  const nextLink = nextMix
    ? `<a href="${getMixHref(nextMix.id)}" style="color:#fde400;text-decoration:none;">Next</a>`
    : `<span style="opacity:.45;">Next</span>`;

  const pageLinks = MIXES.map((item) => {
    const href = getMixHref(item.id);
    const active = item.id === mixId;
    if (active) {
      return `<span style="opacity:.8;">${escapeHtml(item.title)}</span>`;
    }
    return `<a href="${href}" style="color:#fde400;text-decoration:none;">${escapeHtml(item.title)}</a>`;
  }).join(" · ");

  let nav = root.querySelector('[data-mix-page-nav="true"]');
  if (!nav) {
    nav = document.createElement("div");
    nav.setAttribute("data-mix-page-nav", "true");
    nav.style.marginTop = "22px";
    nav.style.paddingTop = "16px";
    nav.style.borderTop = "1px solid rgba(253,228,0,.25)";
    root.appendChild(nav);
  }

  nav.innerHTML = `
    <div style="display:flex;gap:14px;align-items:center;font-family:'Space Grotesk',Arial,sans-serif;text-transform:uppercase;">
      ${prevLink}
      <span style="opacity:.45;">|</span>
      ${nextLink}
    </div>
    <div style="margin-top:10px;font-size:12px;opacity:.8;">
      <strong style="font-family:'Space Grotesk',Arial,sans-serif;text-transform:uppercase;">Pages below content:</strong>
      <a href="${absoluteCurrentUrl}" style="color:#fde400;text-decoration:none;">${absoluteCurrentUrl}</a>
    </div>
    <div style="margin-top:8px;font-size:14px;line-height:1.5;">
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

function applyRoute(pathname, replaceState) {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("popstate", () => {
    applyRoute(location.pathname, true);
  });
}

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
