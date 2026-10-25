# NoSuggest

NoSuggest is a small static HTML/CSS/JavaScript prototype for intentional
video viewing. It provides a home feed, search, channel subscriptions, saved
videos, and a focused watch page using a manually maintained catalogue of
public YouTube videos.

## Prerequisites

- A modern web browser.
- Python 3, for the simple local web server below.
- Internet access if you want YouTube thumbnails and embedded videos to load.

No npm installation, database, backend, or environment variables are required.

## Run locally

1. Open a terminal in this project folder (the folder containing `index.html`).
2. Start Python's built-in web server:

   ```bash
   python3 -m http.server 8000
   ```

3. Open <http://localhost:8000/index.html> in your browser.
4. Keep the terminal open while using the application. Press `Ctrl+C` to stop
   the server.

Using a local server is recommended because the pages load JavaScript files
and relative assets. If port `8000` is already in use, choose another port,
for example `python3 -m http.server 8766`, and open the matching port in the
browser.

## Main files and pages

- `index.html` — home/feed page.
- `search.html` — search videos by title, channel, creator, or topic.
- `subscriptions.html` — manage subscribed channels.
- `saved.html` — view videos saved in this browser.
- `watch.html` — focused watch page for the selected video.
- `session-complete.html` — end-of-session page.
- `css/styles.css` — shared layout and visual styling.
- `js/data.js` — manually maintained video and channel data.
- `js/app.js` — renders the pages and handles application interactions.
- `DESIGN_NOTES.md` — design rationale for the NoSuggest prototype.

Saved videos, subscriptions, comments, reactions, and viewing time are stored
locally in the browser; there is no database or server-side account.
