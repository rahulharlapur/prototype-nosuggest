(function () {
  const { videos, channels } = window.NoSuggestData;
  const app = document.querySelector("#app");
  const page = document.body.dataset.wireframePage;
  const topicChoices = [
    { label: "Technology & AI", value: "Technology", icon: "✦" },
    { label: "Sports & Badminton", value: "Badminton", icon: "◈" },
    { label: "Learning", value: "Learning", icon: "▣" },
    { label: "Entertainment", value: "Comedy", icon: "●" },
    { label: "Cooking & Food", value: "Cooking", icon: "◌" },
    { label: "Science & Nature", value: "Science", icon: "◇" },
  ];
  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  const readSaved = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("nosuggest.saved"));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  };
  const writeSaved = (saved) => {
    try {
      localStorage.setItem("nosuggest.saved", JSON.stringify(saved));
    } catch {
      // Saving is optional in the wireframe when storage is unavailable.
    }
  };
  const thumb = (video) =>
    `<div class="thumb youtube-thumb ${video.thumb}" style="background-image:url('${video.thumbnail}')" aria-hidden="true"><span class="duration">${video.youtubeDuration || video.duration}</span></div>`;
  const watchHref = (video) =>
    `wireframe-watch.html?id=${encodeURIComponent(video.id)}`;
  const nav = () =>
    `<header class="topbar"><a class="brand" href="wireframe-feed.html" aria-label="NoSuggest home, Feed"><span class="brand-mark" aria-hidden="true">NS</span><span>NoSuggest</span></a><nav class="nav" aria-label="Primary navigation"><a class="nav-link ${page === "feed" ? "active" : ""}" href="wireframe-feed.html"${page === "feed" ? ' aria-current="page"' : ""}>Feed</a><a class="nav-link" href="subscriptions.html">Channels</a><a class="nav-link ${page === "search" ? "active" : ""}" href="wireframe-search.html"${page === "search" ? ' aria-current="page"' : ""}>Search</a><a class="nav-link" href="saved.html">Saved</a><button class="nav-link nav-settings" type="button" data-settings aria-label="Open Settings">Settings</button><span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Intentional viewing</span></nav></header>`;
  const layout = (content) => {
    app.innerHTML = `<div class="shell">${nav()}<main>${content}</main></div>`;
  };
  const card = (video) => {
    const saved = readSaved().includes(video.id);
    return `<article class="video-card"><a class="video-card-link" href="${watchHref(video)}" aria-label="Watch ${esc(video.title)}">${thumb(video)}<div class="video-card-body"><h3>${esc(video.title)}</h3></div></a><div class="video-card-actions"><button class="btn ${saved ? "selected" : ""}" data-save="${video.id}" aria-pressed="${saved}">${saved ? "Saved" : "Save"}</button></div></article>`;
  };
  function renderFeed() {
    const rows = channels.map((channel) => {
      const uploads = videos.filter((video) => video.channelId === channel.id);
      return `<section class="feed-channel" id="${channel.id}"><div class="feed-channel-heading"><span class="channel-avatar">${channel.initials}</span><div><h2>${esc(channel.name)}</h2><p>${esc(channel.description)}</p></div><a class="link-button" href="subscriptions.html#${channel.id}">View channel</a></div><div class="feed-row">${uploads.map(card).join("")}</div></section>`;
    }).join("");
    layout(`<section class="feed-header"><div><p class="eyebrow">Subscription feed</p><h1>Your Feed</h1><p>Latest uploads from channels you chose to follow, shown newest first. Nothing is ranked or recommended.</p></div><a class="feed-search" href="wireframe-search.html">Search deliberately <span aria-hidden="true">↗</span></a></section>${rows}<section class="explore-section"><div class="section-heading"><div><p class="eyebrow">Make a choice</p><h2>Explore by topic</h2><p class="subtle">Choose what you want to watch.</p></div></div><div class="topic-grid">${topicChoices.map((topic) => `<a class="topic-card" href="wireframe-search.html?topic=${encodeURIComponent(topic.value)}" aria-label="Explore ${esc(topic.label)}"><span class="topic-icon" aria-hidden="true">${topic.icon}</span><span>${esc(topic.label)}</span><span class="topic-arrow" aria-hidden="true">↗</span></a>`).join("")}</div></section>`);
  }
  function renderSearch() {
    layout(`<div class="page-heading"><div><p class="eyebrow">Explicit selection</p><h1>Search without a feed.</h1><p class="subtle">Search by title, channel, or topic. Results only appear when you ask for them.</p></div><a class="btn" href="wireframe-feed.html">Back to feed</a></div><section class="card search-panel"><form class="search-box" id="search-form"><input class="input" id="query" aria-label="Search videos" placeholder="Try “coastal”, Sports, or “small worlds”"><button class="btn primary">Search</button></form><div id="search-results"></div></section>`);
    const query = new URLSearchParams(location.search).get("q") || "";
    document.querySelector("#query").value = query;
    runSearch();
    document.querySelector("#search-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const value = document.querySelector("#query").value.trim();
      history.replaceState({}, "", `wireframe-search.html${value ? `?q=${encodeURIComponent(value)}` : ""}`);
      runSearch();
    });
  }
  function runSearch() {
    const query = document.querySelector("#query").value.toLowerCase();
    const matches = videos.filter((video) =>
      `${video.title} ${video.channel} ${video.creator} ${video.topic}`.toLowerCase().includes(query),
    );
    document.querySelector("#search-results").innerHTML = matches.length
      ? `<p class="subtle" aria-live="polite">${matches.length} result${matches.length === 1 ? "" : "s"}${query ? ` for “${esc(query)}”` : ""}</p><div class="result-list">${matches.map((video) => `<article class="result-card"><a class="result-thumb-link" href="${watchHref(video)}" aria-label="Watch ${esc(video.title)}">${thumb(video)}</a><div><h3>${esc(video.title)}</h3><p>${esc(video.channel)} · ${esc(video.creator)} · ${esc(video.topic)}<br>${esc(video.description)}</p></div><a class="btn primary" href="${watchHref(video)}">Watch</a></article>`).join("")}</div>`
      : `<div class="empty card"><h2>No videos match that search</h2><p class="subtle">Try a different title, channel, or topic.</p></div>`;
  }
  function renderComplete() {
    layout(`<div class="session-card card"><div class="complete-icon">✓</div><p class="eyebrow">Session complete</p><h1>You're all done for now.</h1><p class="subtle">Thanks for ending your viewing session. There is no autoplay queue waiting for you.</p><a class="btn primary" href="wireframe-feed.html">Finish session</a></div>`);
  }
  let wireframePlayer;
  let stoppingOverlayShown = false;
  const stoppingOverlay = () =>
    `<div class="stop-overlay" id="wireframe-stop-dialog" tabindex="-1"><div class="stop-card card wireframe-stop-card"><p class="eyebrow">A NATURAL PAUSE</p><h1>You have reached the end.</h1><p class="subtle">There is no next video waiting. Choose what feels right for this session.</p><div class="choice-grid"><a class="choice" href="wireframe-session-complete.html"><span class="arrow" aria-hidden="true">→</span><strong>Finish session</strong><span>Close this viewing session and take a break.</span></a><button class="choice" type="button" data-keep-watching><span class="arrow" aria-hidden="true">→</span><strong>Keep watching</strong><span>Continue watching this video.</span></button></div></div></div>`;
  function renderWatch() {
    const params = new URLSearchParams(location.search);
    const video = videos.find(
      (item) => item.id === (params.get("id") || params.get("video")),
    ) || videos[0];
    layout(`<section><div class="page-heading"><div><p class="eyebrow">Focused viewing · YouTube sample</p><h1>Stay with one video.</h1><p class="subtle">The embedded video is supplied by YouTube. NoSuggest does not autoplay or add a recommendation sidebar.</p></div><a class="btn" href="wireframe-search.html">Choose another video</a></div><article class="player-card card"><div class="video-stage" aria-label="YouTube video player"><span class="stage-label">YouTube embed · no autoplay</span><div class="youtube-player"><iframe id="wireframe-youtube-player" src="https://www.youtube.com/embed/${encodeURIComponent(video.youtubeId)}?enablejsapi=1&origin=${encodeURIComponent(location.origin)}" title="${esc(video.youtubeTitle || video.title)}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div><div class="video-info"><h2>${esc(video.title)}</h2><div class="video-meta"><span class="avatar">${video.avatar}</span><strong>${esc(video.creator)}</strong><span>·</span><span>${esc(video.channel)}</span><span>·</span><span>${esc(video.duration)}</span></div><p class="subtle">${esc(video.description)}</p></div></article></section>`);
    stoppingOverlayShown = false;
    initialiseYouTube();
  }
  function initialiseYouTube() {
    const frame = document.querySelector("#wireframe-youtube-player");
    if (!frame) return;
    const showStoppingOverlay = () => {
      if (stoppingOverlayShown || document.querySelector("#wireframe-stop-dialog")) return;
      stoppingOverlayShown = true;
      document.querySelector("#app").insertAdjacentHTML("beforeend", stoppingOverlay());
      document.querySelector("#wireframe-stop-dialog").focus();
    };
    const createPlayer = () => {
      if (wireframePlayer || !window.YT?.Player) return;
      wireframePlayer = new window.YT.Player(frame, {
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) showStoppingOverlay();
          },
          onError: () => frame.closest(".youtube-player")?.classList.add("api-unavailable"),
        },
      });
    };
    if (window.YT?.Player) {
      createPlayer();
      return;
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      createPlayer();
    };
    if (!document.querySelector("script[data-youtube-api]")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.youtubeApi = "true";
      document.head.appendChild(script);
    }
  }
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-keep-watching]")) {
      document.querySelector("#wireframe-stop-dialog")?.remove();
      return;
    }
    const save = event.target.closest("[data-save]");
    if (save) {
      const saved = readSaved();
      const next = saved.includes(save.dataset.save)
        ? saved.filter((id) => id !== save.dataset.save)
        : [...saved, save.dataset.save];
      writeSaved(next);
      renderFeed();
    }
    if (event.target.closest("[data-settings]")) {
      window.alert("Settings are not needed for this focused prototype.");
    }
  });
  if (page === "feed") renderFeed();
  else if (page === "search") renderSearch();
  else if (page === "watch") renderWatch();
  else renderComplete();
})();
