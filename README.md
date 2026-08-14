# Chaupal Radio — YouTube-powered village listening room

A React + Vite single-page frontend inspired by the supplied reference screenshot, but redesigned around a warm Indian gaon / chaupal atmosphere.

## Included

- Real-time local clock
- Green-dot online listener count with gentle demo fluctuation
- Spotify and YouTube Music playlist buttons
- Configurable provider URLs in `src/data/providers.js`
- YouTube IFrame Player API; no MP3 hosting/downloading
- Previous / play-pause / next controls
- Seek/progress bar and volume control
- Glassy blurred media flyout / playlist
- 5-track playlist structure; first two supplied YouTube IDs are already included
- 15 / 25 / 45 minute focus timer
- Evening/night atmosphere toggle
- Responsive mobile layout
- CSS-built village, trees, fields, charpai and lantern scene

## Run

```bash
npm install
npm run dev
```

Open the local Vite URL, usually `http://localhost:5173/`.

Do not double-click `index.html`; React module imports require an HTTP development server.

## Add your real playlists

Edit `src/data/providers.js`:

```js
spotify: {
  label: "Spotify",
  url: "https://open.spotify.com/playlist/YOUR_PLAYLIST_ID"
}
```

```js
youtubeMusic: {
  label: "YT Music",
  url: "https://music.youtube.com/playlist?list=YOUR_PLAYLIST_ID"
}
```

## Add more YouTube tracks

Edit `src/data/songs.js` and put the video ID in `youtubeId`.

Example:

```js
youtubeId: "dQw4w9WgXcQ"
```

A YouTube video must allow embedding for the in-page player to work.

## Important

The Spotify and YouTube Music buttons are external playlist links. Their services do not expose arbitrary song audio for a custom player through a simple public URL. The in-page player therefore uses the official YouTube embedded-player mechanism.
