const MIXES = [
  {
    id: "mix-002",
    title: "Mix 002",
    duration: "48:51",
    description: "Second wax helsinki mix. by Elmo & Konstantin.",
    audioUrl: "https://pub-49beae77ee4c444ba04415fd545073df.r2.dev/2.mp3",
    artUrl: "./konstantin_elmo.jpeg",
    artAlt: "Mix 002 artwork featuring Konstantin and Elmo",
  },
  {
    id: "mix-001",
    title: "Mix 001",
    duration: "55:17",
    description: "First wax helsinki mix. by Elmo.",
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
          <h3>${mix.title}</h3>
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
