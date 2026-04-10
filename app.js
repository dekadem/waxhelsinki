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

function mixCardHtml(mix, fetchPriority) {
  const safeId = sanitizeMixId(mix.id) || "mix";
  const safeHref = `./${safeId}.html`;
  const safeTitle = escapeHtml(mix.title);
  const safeDuration = escapeHtml(mix.duration);
  const safeDescription = escapeHtml(mix.description);
  const safeArtAlt = escapeHtml(mix.artAlt);
  const safeArtUrl = sanitizeUrl(mix.artUrl);
  const safeAudioUrl = sanitizeUrl(mix.audioUrl);
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
        <audio controls preload="none">
          <source src="${safeAudioUrl}" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <a class="feed-link" href="${safeHref}" style="width:max-content;">Open mix page</a>
      </article>
    `;
}

const MIXES = [
  {
    id: "mix-010",
    title: "Mix 010",
    duration: "1:40:12",
    description: "Elmo & Konstantin live at Beatroot: rolling techno house with raw club energy.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/beatroot_2010-03-27.m4a",
    artUrl: "./cover.jpg",
    artAlt: "Mix 010 artwork",
  },
  {
    id: "mix-009",
    title: "Mix 009",
    duration: "48:51",
    description: "Studio Mix p3 by Elmo & Konstantin: punchy house rollers and deep techno flow.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/studiomix-2014-12-19-p3.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 009 artwork",
  },
  {
    id: "mix-008",
    title: "Mix 008",
    duration: "2:15:04",
    description: "Studio Mix p2 by Elmo & Konstantin: long-form techno house pressure and dubby textures.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/studiomix-2014-12-19-p2.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 008 artwork",
  },
  {
    id: "mix-007",
    title: "Mix 007",
    duration: "1:35:46",
    description: "Studio Mix p1 by Elmo & Konstantin: deep techno and house pressure.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/studiomix-2014-12-19-p1.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 007 artwork",
  },
  {
    id: "mix-006",
    title: "Mix 006",
    duration: "1:12:58",
    description: "Driving late-night techno house with rolling drums and hypnotic bass by Elmo.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/6.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 006 artwork",
  },
  {
    id: "mix-005",
    title: "Mix 005",
    duration: "52:24",
    description: "Warm, groove-led house cuts with crisp techno edges and swing by Elmo.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/5.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 005 artwork",
  },
  {
    id: "mix-004",
    title: "Mix 004",
    duration: "2:15:03",
    description: "Long-form warehouse trip through deep techno and minimal house by Elmo & Konstantin.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/4.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 004 artwork",
  },
  {
    id: "mix-003",
    title: "Mix 003",
    duration: "2:15:04",
    description: "Dark, percussive techno house journey with dubbed textures by Elmo & Konstantin.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/3.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 003 artwork",
  },
  {
    id: "mix-002",
    title: "Mix 002",
    duration: "48:51",
    description: "Hypnotic techno house blend with soulful chords and heads-down energy by Elmo & Konstantin.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/2.mp3",
    artUrl: "./konstantin_elmo.jpeg",
    artAlt: "Mix 002 artwork featuring Konstantin and Elmo",
  },
  {
    id: "mix-001",
    title: "Mix 001",
    duration: "55:17",
    description: "Foundational Wax Helsinki set: classic house rhythms and raw techno pulse by Elmo.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/1.mp3",
    artUrl: "./cover.jpg",
    artAlt: "Mix 001 artwork",
  },
];

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

function renderMixPage() {
  const root = document.getElementById("mix-page");
  if (!root) return;

  const mixId = root.dataset.mixId;
  const mix = MIXES.find((item) => item.id === mixId);
  if (!mix) return;

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
  const source = document.getElementById("mix-audio-source");
  if (audioEl && source) {
    const url = sanitizeUrl(mix.audioUrl);
    const runWhenIdle =
      typeof requestIdleCallback === "function"
        ? (cb) => requestIdleCallback(cb, { timeout: 2000 })
        : (cb) => setTimeout(cb, 1);
    runWhenIdle(() => {
      source.src = url;
      audioEl.load();
    });
  }
}

void renderHome().catch(() => {});
renderMixPage();
