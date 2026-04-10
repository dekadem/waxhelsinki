const MIXES = [
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

function renderHome() {
  const grid = document.getElementById("mix-grid");
  if (!grid) return;

  grid.innerHTML = MIXES.map(
    (mix) => `
      <article class="mix-card">
        <a href="./${mix.id}.html" style="text-decoration:none;color:inherit;">
          <div class="mix-art">
            <img src="${mix.artUrl}" alt="${mix.artAlt}" />
          </div>
        </a>
        <div class="mix-meta">
          <h3><a href="./${mix.id}.html" style="color:inherit;text-decoration:none;">${mix.title}</a></h3>
          <span class="mix-duration">${mix.duration}</span>
        </div>
        <p class="mix-desc">${mix.description}</p>
        <audio controls preload="none">
          <source src="${mix.audioUrl}" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <a class="feed-link" href="./${mix.id}.html" style="width:max-content;">Open mix page</a>
      </article>
    `
  ).join("");
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
  art.src = mix.artUrl;
  art.alt = mix.artAlt;
  const source = document.getElementById("mix-audio-source");
  source.src = mix.audioUrl;
  document.getElementById("mix-audio").load();
}

renderHome();
renderMixPage();
