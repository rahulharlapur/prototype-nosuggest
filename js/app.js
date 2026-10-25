(function () {
  const { videos, channels } = window.NoSuggestData;
  const keys = {
    subscriptions: "nosuggest.subscriptions",
    saved: "nosuggest.saved",
    reactions: "nosuggest.reactions",
    comments: "nosuggest.comments",
    progress: "nosuggest.progress",
  };
  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };
  const viewingKey = "nosuggest.viewing-seconds";
  let viewingSeconds = (() => {
    try {
      const value = Number(sessionStorage.getItem(viewingKey));
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch {
      return 0;
    }
  })();
  let viewingStartedAt = 0;
  let viewingInterval;
  let youtubePlaying = false;
  const formatViewingTime = (seconds) => {
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = total % 60;
    return hours
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };
  const updateViewingTime = () =>
    document.querySelectorAll("[data-viewing-time]").forEach((node) => {
      node.textContent = `◷ Viewing time ${formatViewingTime(viewingSeconds)}`;
    });
  const stopViewing = () => {
    if (viewingStartedAt)
      viewingSeconds += (Date.now() - viewingStartedAt) / 1000;
    viewingStartedAt = 0;
    clearInterval(viewingInterval);
    viewingInterval = undefined;
    try {
      sessionStorage.setItem(viewingKey, String(Math.floor(viewingSeconds)));
    } catch {}
    updateViewingTime();
  };
  const startViewing = () => {
    if (document.hidden || viewingStartedAt) return;
    viewingStartedAt = Date.now();
    clearInterval(viewingInterval);
    viewingInterval = setInterval(() => {
      stopViewing();
      startViewing();
    }, 1000);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopViewing();
    else if (youtubePlaying) startViewing();
  });
  window.addEventListener("pagehide", stopViewing);
  const list = (key, fallback) => {
    const value = read(key, fallback);
    return Array.isArray(value) &&
      value.every((item) => typeof item === "string")
      ? value
      : fallback;
  };
  const object = (key, fallback) => {
    const value = read(key, fallback);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : fallback;
  };
  const defaultSubscriptions = ["mkbhd", "bb-ki-vines", "bwf-tv"];
  const storedSubscriptions = list(keys.subscriptions, null);
  const validChannelIds = new Set(channels.map((channel) => channel.id));
  const needsSubscriptionMigration =
    storedSubscriptions === null || storedSubscriptions.includes("field-notes");
  const migratedSubscriptions =
    storedSubscriptions === null ||
    (storedSubscriptions.length === 1 &&
      storedSubscriptions[0] === "field-notes")
      ? defaultSubscriptions
      : storedSubscriptions.filter(
          (id) => id !== "field-notes" && validChannelIds.has(id),
        );
  const seededSubscriptions = needsSubscriptionMigration
    ? migratedSubscriptions
    : storedSubscriptions.filter((id) => validChannelIds.has(id));
  const state = {
    subscriptions: seededSubscriptions,
    saved: list(keys.saved, []),
    reactions: object(keys.reactions, {}),
    comments: object(keys.comments, {}),
    progress: object(keys.progress, {}),
  };
  if (needsSubscriptionMigration)
    write(keys.subscriptions, seededSubscriptions);
  write("nosuggest.subscription-seed-v3", "complete");
  const page = document.body.dataset.page;
  const app = document.querySelector("#app");
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[char],
    );
  const findVideo = (id) =>
    videos.find((video) => video.id === id) || videos[0];
  const params = new URLSearchParams(location.search);
  const current = findVideo(
    params.get("id") ||
      params.get("video") ||
      localStorage.getItem("nosuggest.current") ||
      videos[0].id,
  );
  const topicChoices = [
    { label: "Technology & AI", value: "Technology", icon: "✦" },
    { label: "Sports & Badminton", value: "Badminton", icon: "◈" },
    { label: "Learning", value: "Learning", icon: "▣" },
    { label: "Entertainment", value: "Comedy", icon: "●" },
    { label: "Cooking & Food", value: "Cooking", icon: "◌" },
    { label: "Science & Nature", value: "Science", icon: "◇" },
  ];
  const toast = (message) => {
    let node = document.querySelector(".toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "toast";
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(node.timer);
    node.timer = setTimeout(() => node.classList.remove("show"), 2300);
  };
  function saveState() {
    write(keys.subscriptions, state.subscriptions);
    write(keys.saved, state.saved);
    write(keys.reactions, state.reactions);
    write(keys.comments, state.comments);
    write(keys.progress, state.progress);
  }
  function nav() {
    const feedActive = page === "home" || page === "watch";
    const link = (label, href, active) =>
      `<a class="nav-link ${active ? "active" : ""}" href="${href}"${active ? ' aria-current="page"' : ""}>${label}</a>`;
    return `<header class="topbar"><a class="brand" href="index.html" aria-label="NoSuggest home, Feed"><span class="brand-mark" aria-hidden="true">NS</span><span>NoSuggest</span></a><nav class="nav" aria-label="Primary navigation">${link("Feed", "index.html", feedActive)}${link("Channels", "subscriptions.html", page === "subscriptions")}${link("Search", "search.html", page === "search")}${link("Saved", "saved.html", page === "saved")}<button class="nav-link nav-settings" type="button" data-settings aria-label="Open Settings">Settings</button><span class="viewing-time" data-viewing-time aria-label="Viewing time">◷ Viewing time ${formatViewingTime(viewingSeconds)}</span><span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Intentional viewing</span></nav></header>`;
  }
  const relativeDate = (date) => {
    if (!date) return "";
    const parsed = new Date(`${date}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return "";
    const days = Math.max(
      0,
      Math.floor((Date.now() - parsed.getTime()) / 86400000),
    );
    return days < 1
      ? "Today"
      : days === 1
        ? "Yesterday"
        : days < 7
          ? `${days} days ago`
          : parsed.toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            });
  };
  const thumb = (video) =>
    video.thumbnail
      ? `<div class="thumb youtube-thumb ${video.thumb}" style="background-image:url('${video.thumbnail}')" aria-hidden="true"><span class="duration">${video.youtubeDuration || video.duration}</span></div>`
      : `<div class="thumb ${video.thumb}" aria-hidden="true">${video.thumb ? "◒" : "◌"}<span class="duration">${video.duration}</span></div>`;
  const watchHref = (video) =>
    `watch.html?id=${encodeURIComponent(video.id)}`;
  const card = (video, action = true) => {
    const dateLabel = relativeDate(video.date);
    return `<article class="video-card"><a class="video-card-link" href="${watchHref(video)}" aria-label="Watch ${esc(video.title)}">${thumb(video)}<div class="video-card-body"><h3>${esc(video.title)}</h3>${dateLabel ? `<p>${dateLabel}</p>` : ""}</div></a>${action ? `<div class="video-card-actions"><button class="btn ${state.saved.includes(video.id) ? "selected" : ""}" data-save="${video.id}" aria-pressed="${state.saved.includes(video.id)}">${state.saved.includes(video.id) ? "Saved" : "Save"}</button></div>` : ""}</article>`;
  };
  const empty = (title, text, href = "search.html", label = "Search videos") =>
    `<div class="empty card"><h2>${title}</h2><p class="subtle">${text}</p><a class="btn primary" href="${href}">${label}</a></div>`;
  function layout(content) {
    app.innerHTML = `<div class="shell">${nav()}<main>${content}</main></div>`;
  }
  function renderHome() {
    const subscribed = channels.filter((channel) =>
      state.subscriptions.includes(channel.id),
    );
    const rows = subscribed
      .map((channel) => {
        const uploads = videos
          .filter((video) => video.channelId === channel.id)
          .sort((a, b) =>
            b.date && a.date
              ? b.date.localeCompare(a.date)
              : a.catalogueOrder - b.catalogueOrder,
          );
        return uploads.length
          ? `<section class="feed-channel" id="${channel.id}"><div class="feed-channel-heading"><span class="channel-avatar">${channel.initials}</span><div><h2>${esc(channel.name)}</h2><p>${esc(channel.description)}</p></div><a class="link-button" href="subscriptions.html#${channel.id}">View channel</a></div><div class="feed-row">${uploads.map((video) => card(video)).join("")}</div></section>`
          : "";
      })
      .join("");
    layout(
      `<section class="feed-header"><div><p class="eyebrow">Subscription feed</p><h1>Your Feed</h1><p>Latest uploads from channels you chose to follow, shown newest first. Nothing is ranked or recommended.</p></div><a class="feed-search" href="search.html">Search deliberately <span aria-hidden="true">↗</span></a></section>${rows || `<section class="feed-empty card"><div class="empty-icon">◉</div><h2>Your feed starts with a channel</h2><p>Subscribe to a channel to see its latest uploads here. No suggested videos will be added.</p><a class="btn primary" href="subscriptions.html">Browse Channels</a></section>`}<section class="explore-section"><div class="section-heading"><div><p class="eyebrow">Make a choice</p><h2>Explore by topic</h2><p class="subtle">Choose what you want to watch.</p></div></div><div class="topic-grid">${topicChoices.map((topic) => `<a class="topic-card" href="search.html?topic=${encodeURIComponent(topic.value)}" aria-label="Explore ${esc(topic.label)}"><span class="topic-icon" aria-hidden="true">${topic.icon}</span><span>${esc(topic.label)}</span><span class="topic-arrow" aria-hidden="true">↗</span></a>`).join("")}</div></section>`,
    );
  }
  function renderSearch() {
    layout(
      `<div class="page-heading"><div><p class="eyebrow">Explicit selection</p><h1>Search without a feed.</h1><p class="subtle">Search by title, channel, or topic. Results only appear when you ask for them.</p></div><a class="btn" href="index.html">Back to feed</a></div><section class="card search-panel"><form class="search-box" id="search-form"><input class="input" id="query" aria-label="Search videos" placeholder="Try “coastal”,"sports", or “small worlds”"><button class="btn primary">Search</button></form><div class="filters"><select class="select" id="topic-filter" aria-label="Filter by topic"><option value="">All topics</option>${topicChoices.map((topic) => `<option value="${esc(topic.value)}">${esc(topic.label)}</option>`).join("")}</select><select class="select" id="sort-filter" aria-label="Sort results"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div><div id="search-results"></div></section>`,
    );
    const query = params.get("q") || "";
    const selectedTopic = params.get("topic") || "";
    document.querySelector("#query").value = query;
    document.querySelector("#topic-filter").value = selectedTopic;
    runSearch();
    document
      .querySelector("#search-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const value = document.querySelector("#query").value.trim();
        const selected = document.querySelector("#topic-filter").value;
        const searchParams = new URLSearchParams();
        if (value) searchParams.set("q", value);
        if (selected) searchParams.set("topic", selected);
        history.replaceState({}, "", `search.html${searchParams.toString() ? `?${searchParams}` : ""}`);
        runSearch();
      });
    document
      .querySelector("#topic-filter")
      .addEventListener("change", runSearch);
    document
      .querySelector("#sort-filter")
      .addEventListener("change", runSearch);
  }
  function runSearch() {
    const query = document.querySelector("#query").value.toLowerCase();
    const topic = document.querySelector("#topic-filter").value;
    const order = document.querySelector("#sort-filter").value;
    let matches = videos.filter(
      (video) =>
        `${video.title} ${video.channel} ${video.creator} ${video.topic}`
          .toLowerCase()
          .includes(query) &&
        (!topic || video.topic === topic),
    );
    matches.sort((a, b) =>
      order === "oldest"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date),
    );
    document.querySelector("#search-results").innerHTML = matches.length
      ? `<p class="subtle" aria-live="polite">${matches.length} result${matches.length === 1 ? "" : "s"}${query ? ` for “${esc(query)}”` : ""}</p><div class="result-list">${matches.map((video) => `<article class="result-card"><a class="result-thumb-link" href="${watchHref(video)}" aria-label="Watch ${esc(video.title)}">${thumb(video)}</a><div><h3>${esc(video.title)}</h3><p>${esc(video.channel)} · ${esc(video.creator)} · ${esc(video.topic)}<br>${esc(video.description)}</p></div><a class="btn primary" href="${watchHref(video)}">Watch</a></article>`).join("")}</div>`
      : empty(
          topic
            ? "No curated videos match this topic"
            : "No videos match that search",
          topic
            ? "This local catalogue does not have a video for that topic yet. You can search the full catalogue or choose another topic."
            : "Try a different title, channel, topic, or clear a filter.",
        );
  }
  function renderSubscriptions() {
    const subscribed = channels.filter((channel) =>
      state.subscriptions.includes(channel.id),
    );
    const channelId = location.hash.slice(1);
    const detail = channels.find((channel) => channel.id === channelId);
    if (detail) {
      renderChannelDetail(detail);
      return;
    }
    layout(
      `<div class="page-heading channels-heading"><div><p class="eyebrow">Subscription management</p><h1>Your Channels</h1><p class="subtle">Manage the creators you choose to follow.</p></div><button class="btn primary" type="button" data-open-add>+ Add channel</button></div><div class="channel-summary"><strong>${subscribed.length} channel${subscribed.length === 1 ? "" : "s"} subscribed</strong><span>Only channels you choose appear in your feed.</span></div>${subscribed.length ? `<div class="managed-channel-list">${subscribed.map(channelRow).join("")}</div>` : `<div class="empty card"><h2>No channels subscribed</h2><p class="subtle">Add a channel to create a focused feed of creators you chose.</p><button class="btn primary" type="button" data-open-add>+ Add channel</button></div>`}`,
    );
  }
  function channelRow(channel) {
    return `<article class="managed-channel card"><span class="channel-avatar">${esc(channel.initials)}</span><div class="managed-channel-info"><h2>${esc(channel.name)}</h2><p>${esc(channel.description)}</p></div><div class="managed-channel-actions"><a class="btn" href="subscriptions.html#${encodeURIComponent(channel.id)}">View channel</a><button class="btn unsubscribe" type="button" data-unsubscribe="${esc(channel.id)}" aria-label="Unsubscribe from ${esc(channel.name)}">Unsubscribe</button></div></article>`;
  }
  function renderChannelDetail(channel) {
    const channelVideos = videos
      .filter((video) => video.channelId === channel.id)
      .sort((a, b) =>
        b.date && a.date
          ? b.date.localeCompare(a.date)
          : a.catalogueOrder - b.catalogueOrder,
      );
    layout(
      `<div class="page-heading"><div><p class="eyebrow">Channel details</p><h1>${esc(channel.name)}</h1><p class="subtle">${esc(channel.description)}</p></div><a class="btn" href="subscriptions.html">Back to channels</a></div><section class="channel-detail card"><div class="channel-detail-header"><span class="channel-avatar">${esc(channel.initials)}</span><div><h2>${esc(channel.name)}</h2><p>${channelVideos.length} curated video${channelVideos.length === 1 ? "" : "s"} in the local catalogue.</p></div></div><div class="video-grid">${channelVideos.map((video) => card(video)).join("")}</div></section>`,
    );
  }
  function addChannelModal() {
    const available = channels.filter(
      (channel) => !state.subscriptions.includes(channel.id),
    );
    const existing = document.querySelector("#add-channel-dialog");
    if (existing) existing.remove();
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="modal-backdrop" id="add-channel-dialog"><section class="add-channel-modal card" role="dialog" aria-modal="true" aria-labelledby="add-channel-title"><div class="modal-header"><div><p class="eyebrow">Choose deliberately</p><h2 id="add-channel-title">Add a channel</h2><p class="subtle">Select a creator to add to your subscription feed.</p></div><button class="modal-close" type="button" data-close-add aria-label="Close add channel dialog">×</button></div><label class="sr-only" for="channel-search">Search available channels</label><input class="input" id="channel-search" type="search" placeholder="Search channels" autocomplete="off">${available.length ? `<div class="available-channel-list" data-available-channels>${available.map((channel) => availableChannelRow(channel)).join("")}</div>` : `<div class="modal-empty"><h3>All channels are subscribed</h3><p class="subtle">There are no additional sample channels to add right now.</p></div>`}</section></div>`,
    );
    document.querySelector("#channel-search")?.focus();
  }
  function availableChannelRow(channel) {
    return `<div class="available-channel" data-channel-name="${esc(channel.name.toLowerCase())}"><span class="channel-avatar">${esc(channel.initials)}</span><div><strong>${esc(channel.name)}</strong><p>${esc(channel.description)}</p></div><button class="btn primary" type="button" data-subscribe="${esc(channel.id)}">Subscribe</button></div>`;
  }
  function renderSaved() {
    const saved = videos.filter((video) => state.saved.includes(video.id));
    layout(
      `<div class="page-heading"><div><p class="eyebrow">Your library</p><h1>Saved videos</h1><p class="subtle">A quiet place for videos you intentionally chose to keep.</p></div></div>${saved.length ? `<div class="video-grid">${saved.map((video) => card(video)).join("")}</div>` : empty("Your saved list is empty", "Use Save on a video to keep it here without starting a recommendation loop.")}`,
    );
  }
  function commentsFor(video) {
    return [...(video.comments || []), ...(state.comments[video.id] || [])];
  }
  function player(video) {
    const reaction = state.reactions[video.id] || "";
    const subscribed = state.subscriptions.includes(video.channelId);
    const saved = state.saved.includes(video.id);
    const comments = commentsFor(video);
    const player = video.youtubeId
      ? `<div class="youtube-player"><iframe id="youtube-player" src="https://www.youtube.com/embed/${encodeURIComponent(video.youtubeId)}?enablejsapi=1&origin=${encodeURIComponent(location.origin)}" title="${esc(video.youtubeTitle || video.title)}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
      : `<div class="video-art" aria-hidden="true"></div>`;
    return `<section><div class="page-heading"><div><p class="eyebrow">Focused viewing · YouTube sample</p><h1>Stay with one video.</h1><p class="subtle">The embedded video is supplied by YouTube. NoSuggest does not autoplay or add a recommendation sidebar.</p></div><a class="btn" href="search.html">Choose another video</a></div><article class="player-card card"><div class="video-stage" aria-label="YouTube video player"><span class="stage-label">YouTube embed · no autoplay</span>${player}</div><div class="video-info"><h2>${esc(video.title)}</h2><div class="video-meta"><span class="avatar">${video.avatar}</span><strong>${esc(video.creator)}</strong><span>·</span><span>${esc(video.channel)}</span><span>·</span><span>${video.duration}</span></div><p class="subtle">${esc(video.description)}</p><p class="prototype-disclaimer">Like, Dislike, Save and Comments are local NoSuggest prototype interactions; they do not modify YouTube.</p><div class="watch-actions"><button class="btn ${reaction === "like" ? "selected" : ""}" data-reaction="like" aria-pressed="${reaction === "like"}">♡ Like</button><button class="btn ${reaction === "dislike" ? "selected" : ""}" data-reaction="dislike" aria-pressed="${reaction === "dislike"}">♧ Dislike</button><button class="btn ${saved ? "selected" : ""}" data-save="${video.id}" aria-pressed="${saved}">${saved ? "Saved" : "Save"}</button><button class="btn" data-scroll-comments>Comments <span class="comment-count">${comments.length}</span></button></div></div></article><section class="comments card" id="comments"><div class="comments-header"><div><h2>Comments <span class="comment-count">${comments.length}</span></h2><p class="subtle">Optional local conversation, kept beside the focused player.</p></div></div><form class="comment-form" id="comment-form"><input class="input" id="comment-input" aria-label="Write a comment" placeholder="Share an observation or question…"><button class="btn primary">Post</button></form><div id="comment-list">${commentMarkup(comments)}</div></section></section>`;
  }
  function commentMarkup(comments) {
    return comments.length
      ? comments
          .map(
            (comment) =>
              `<div class="comment"><span class="avatar">${esc(comment.initials || "YOU")}</span><div><div class="comment-name">${esc(comment.name)}</div><p>${esc(comment.text)}</p></div></div>`,
          )
          .join("")
      : '<p class="subtle">No comments yet. Start the conversation if you choose.</p>';
  }
  let watchController;
  let youtubePlayer;
  function renderWatch() {
    stopViewing();
    youtubePlayer?.destroy?.();
    youtubePlayer = null;
    layout(player(current));
    localStorage.setItem("nosuggest.current", current.id);
    bindWatch(current);
  }
  function bindWatch(video) {
    watchController?.abort();
    watchController = new AbortController();
    const showStop = () => {
      youtubePlayer?.pauseVideo?.();
      stopViewing();
      if (!document.querySelector("#stop-dialog")) {
        document
          .querySelector("#app")
          .insertAdjacentHTML("beforeend", stopMarkup(video));
        document.querySelector("#stop-dialog").focus();
      }
    };
    const initialiseYouTube = () => {
      const frame = document.querySelector("#youtube-player");
      if (!frame) return;
      if (!window.YT || !window.YT.Player) {
        frame.closest(".youtube-player").classList.add("api-unavailable");
        return;
      }
      youtubePlayer = new window.YT.Player("youtube-player", {
        events: {
          onStateChange: (event) => {
            youtubePlaying = event.data === window.YT.PlayerState.PLAYING;
            if (youtubePlaying) startViewing();
            else stopViewing();
            if (event.data === window.YT.PlayerState.ENDED) showStop();
          },
          onError: () => {
            youtubePlaying = false;
            stopViewing();
          },
        },
      });
    };
    if (video.youtubeId) {
      if (window.YT && window.YT.Player) initialiseYouTube();
      else {
        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previousReady?.();
          initialiseYouTube();
        };
        if (!document.querySelector("script[data-youtube-api]")) {
          const script = document.createElement("script");
          script.src = "https://www.youtube.com/iframe_api";
          script.async = true;
          script.dataset.youtubeApi = "true";
          document.head.appendChild(script);
        }
        setTimeout(() => {
          if (!youtubePlayer && document.querySelector("#youtube-player")) {
            stopViewing();
            document
              .querySelector("#youtube-player")
              .closest(".youtube-player")
              .classList.add("api-unavailable");
          }
        }, 8000);
      }
    }
    let playing = false;
    const setPlay = (value) => {
      playing = value;
      document.querySelectorAll("[data-play]").forEach((button) => {
        button.textContent = value ? "Ⅱ" : "▶";
        button.setAttribute(
          "aria-label",
          value ? "Pause simulated video" : "Play simulated video",
        );
        button.classList.toggle("is-playing", value);
      });
    };
    document.addEventListener(
      "click",
      function handler(event) {
        const reaction = event.target.closest("[data-reaction]");
        if (reaction) {
          state.reactions[video.id] =
            state.reactions[video.id] === reaction.dataset.reaction
              ? ""
              : reaction.dataset.reaction;
          saveState();
          renderWatch();
          toast(
            state.reactions[video.id]
              ? `${reaction.dataset.reaction === "like" ? "Like" : "Dislike"} saved`
              : "Reaction removed",
          );
          return;
        }
        const save = event.target.closest("[data-save]");
        if (save) {
          state.saved = state.saved.includes(video.id)
            ? state.saved.filter((id) => id !== video.id)
            : [...state.saved, video.id];
          saveState();
          renderWatch();
          toast(
            state.saved.includes(video.id)
              ? "Saved for later"
              : "Removed from saved",
          );
          return;
        }
        if (event.target.closest("[data-scroll-comments]")) {
          document
            .querySelector("#comments")
            .scrollIntoView({ behavior: "smooth" });
          document.querySelector("#comment-input").focus();
          return;
        }
        if (event.target.closest("[data-close-stop]"))
          document.querySelector("#stop-dialog")?.remove();
      },
      { signal: watchController.signal },
    );
    document.querySelector("#comment-form").addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        const input = document.querySelector("#comment-input");
        const value = input.value.trim();
        if (!value) {
          toast("Write a comment before posting");
          input.focus();
          return;
        }
        state.comments[video.id] = [
          ...(state.comments[video.id] || []),
          { name: "You", initials: "YOU", text: value },
        ];
        saveState();
        renderWatch();
        document
          .querySelector("#comments")
          .scrollIntoView({ behavior: "smooth" });
        toast("Comment posted");
      },
      { signal: watchController.signal },
    );
  }
  function stopMarkup(video) {
    return `<div class="stop-overlay" id="stop-dialog" tabindex="-1"><div class="stop-card card"><p class="eyebrow">A natural pause</p><h1>You have reached the end.</h1><p class="subtle">There is no next video waiting. Choose what feels right for this session.</p><div class="choice-grid"><a class="choice" href="session-complete.html"><span class="arrow">→</span><strong>Finish session</strong><span>Close this viewing session and take a break.</span></a><a class="choice" href="search.html?q=${encodeURIComponent(video.topic)}"><span class="arrow">→</span><strong>Explore this topic</strong><span>Search deliberately for another video in ${esc(video.topic)}.</span></a><a class="choice" href="search.html"><span class="arrow">→</span><strong>Choose another video</strong><span>Make a specific selection from the video library.</span></a><button class="btn" data-close-stop>Keep watching</button></div></div></div>`;
  }
  function renderComplete() {
    layout(
      `<div class="session-card card"><div class="complete-icon">✓</div><p class="eyebrow">Session complete</p><h1>You’re all done for now.</h1><p class="subtle">Thanks for making a deliberate choice about your viewing time. There is no autoplay queue waiting for you.</p><a class="btn primary" href="index.html">Return home</a></div>`,
    );
  }
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-add]")) {
      addChannelModal();
      return;
    }
    if (
      event.target.closest("[data-close-add]") ||
      event.target.classList.contains("modal-backdrop")
    ) {
      document.querySelector("#add-channel-dialog")?.remove();
      return;
    }
    const save = event.target.closest("[data-save]");
    if (save && page !== "watch") {
      event.preventDefault();
      event.stopPropagation();
      state.saved = state.saved.includes(save.dataset.save)
        ? state.saved.filter((id) => id !== save.dataset.save)
        : [...state.saved, save.dataset.save];
      saveState();
      page === "home" ? renderHome() : renderSaved();
      toast(
        state.saved.includes(save.dataset.save)
          ? "Saved for later"
          : "Removed from saved",
      );
    }
    const sub = event.target.closest("[data-subscribe]");
    if (sub) {
      if (state.subscriptions.includes(sub.dataset.subscribe)) return;
      document.querySelector("#add-channel-dialog")?.remove();
      state.subscriptions = state.subscriptions.includes(sub.dataset.subscribe)
        ? state.subscriptions.filter((id) => id !== sub.dataset.subscribe)
        : [...state.subscriptions, sub.dataset.subscribe];
      saveState();
      renderSubscriptions();
      toast("Subscribed");
      return;
    }
    const unsub = event.target.closest("[data-unsubscribe]");
    if (unsub) {
      state.subscriptions = state.subscriptions.filter(
        (id) => id !== unsub.dataset.unsubscribe,
      );
      saveState();
      renderSubscriptions();
      toast("Unsubscribed");
      return;
    }
    const settings = event.target.closest("[data-settings]");
    if (settings) toast("Settings are not needed for this focused prototype");
  });
  document.addEventListener("input", (event) => {
    if (event.target.id !== "channel-search") return;
    const query = event.target.value.trim().toLowerCase();
    document.querySelectorAll("[data-channel-name]").forEach((channel) => {
      channel.hidden = !channel.dataset.channelName.includes(query);
    });
  });
  window.addEventListener("hashchange", () => {
    if (page === "subscriptions") renderSubscriptions();
  });
  if (page === "home") renderHome();
  else if (page === "search") renderSearch();
  else if (page === "subscriptions") renderSubscriptions();
  else if (page === "saved") renderSaved();
  else if (page === "watch") renderWatch();
  else renderComplete();
})();
