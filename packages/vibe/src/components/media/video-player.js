// ─── Video Player ─────────────────────────────────────────
// Ported from uploopjs examples/videoplayer/main.js
//
// Module-scoped video singleton survives innerHTML re-renders.
// All features: play/pause, prev/next track, progress bar with
// click-seek, volume slider + mute toggle, playback speed
// selector, seek forward/back 10s, playlist with track info,
// info dialog with description.

import { component } from '@uploop/html'

// ─── Public Domain Video Playlist ──────────────────────────
// Served by test-videos.co.uk — freely distributable, no API key.
// Using 720p / 2MB clips for fast streaming.

const PLAYLIST = [
  {
    id: "bbb",
    title: "Big Buck Bunny",
    description:
      "A giant rabbit takes revenge on three bullying rodents in this award-winning open movie by the Blender Foundation. 60 fps, stunning 3D animation.",
    duration: "0:10",
    year: 2008,
    director: "Sacha Goedegebure",
    genre: "Animation \u00b7 Comedy",
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
  },
  {
    id: "jellyfish",
    title: "Jellyfish",
    description:
      "Mesmerising macro footage of jellyfish drifting through deep blue water. A calming, high-detail nature clip from jell.yfish.us.",
    duration: "0:10",
    year: 2014,
    director: "Jell.yfish.us",
    genre: "Nature \u00b7 Macro",
    src: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4",
  },
  {
    id: "sintel",
    title: "Sintel",
    description:
      "A young girl named Sintel searches for a baby dragon she once rescued. A breathtaking Blender Foundation open movie set in a fantasy world.",
    duration: "0:10",
    year: 2010,
    director: "Colin Levy",
    genre: "Fantasy \u00b7 Adventure",
    src: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4",
  },
];

// ─── Helpers ──────────────────────────────────────────────

/** Format seconds \u2192 m:ss */
const fmt = (t) => {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

/** Format seconds \u2192 m:ss or h:mm:ss for long videos */
const fmtLong = (t) => {
  if (!t || !isFinite(t)) return "0:00";
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ─── Persistent Video Element ─────────────────────────────
let _videoEl = null;

function getVideo() {
  if (_videoEl) return _videoEl;
  _videoEl = document.createElement("video");
  _videoEl.preload = "metadata";
  _videoEl.playsInline = true;
  _videoEl.style.width = "100%";
  _videoEl.style.display = "block";
  _videoEl.style.borderRadius = "12px";
  _videoEl.style.background = "#000";
  _videoEl.style.outline = "none";
  return _videoEl;
}

// ─── Component ────────────────────────────────────────────

export const VideoPlayer = component('VibeVideoPlayer', {
  state: {
    playing: false,
    volume: 0.8,
    muted: false,
    currentTime: 0,
    duration: 0,
    trackIndex: 0,
    showInfo: false,
    playbackRate: 1,
  },

  update: {
    togglePlay: (s) => {
      const vid = getVideo();
      if (s.playing) vid.pause();
      else vid.play().catch(() => {});
      return { ...s, playing: !s.playing };
    },

    setVolume: (s, v) => {
      const vol = parseFloat(v);
      const vid = getVideo();
      vid.volume = vol;
      vid.muted = vol === 0;
      return { ...s, volume: vol, muted: vol === 0 };
    },

    toggleMute: (s) => {
      const vid = getVideo();
      vid.muted = !s.muted;
      return { ...s, muted: !s.muted };
    },

    setTime: (s, t) => {
      const time = parseFloat(t);
      const vid = getVideo();
      if (isFinite(time) && isFinite(vid.duration)) vid.currentTime = time;
      return { ...s, currentTime: time };
    },

    timeUpdate: (s, t) => ({
      ...s,
      currentTime: t,
      duration: getVideo().duration || s.duration,
    }),

    metadataLoaded: (s) => ({
      ...s,
      duration: getVideo().duration || s.duration,
    }),

    trackEnded: (s) => {
      const next = (s.trackIndex + 1) % PLAYLIST.length;
      const vid = getVideo();
      vid.src = PLAYLIST[next].src;
      vid.play().catch(() => {});
      return { ...s, trackIndex: next, playing: true, currentTime: 0 };
    },

    selectTrack: (s, idx) => {
      if (idx === s.trackIndex) return s;
      const vid = getVideo();
      vid.src = PLAYLIST[idx].src;
      vid.play().catch(() => {});
      return { ...s, trackIndex: idx, playing: true, currentTime: 0 };
    },

    prevTrack: (s) => {
      const prev = (s.trackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
      const vid = getVideo();
      vid.src = PLAYLIST[prev].src;
      vid.play().catch(() => {});
      return { ...s, trackIndex: prev, playing: true, currentTime: 0 };
    },

    nextTrack: (s) => {
      const next = (s.trackIndex + 1) % PLAYLIST.length;
      const vid = getVideo();
      vid.src = PLAYLIST[next].src;
      vid.play().catch(() => {});
      return { ...s, trackIndex: next, playing: true, currentTime: 0 };
    },

    seekFwd: (s) => {
      const vid = getVideo();
      vid.currentTime = Math.min(vid.duration, vid.currentTime + 10);
      return { ...s, currentTime: vid.currentTime };
    },

    seekBack: (s) => {
      const vid = getVideo();
      vid.currentTime = Math.max(0, vid.currentTime - 10);
      return { ...s, currentTime: vid.currentTime };
    },

    setRate: (s, rate) => {
      const r = parseFloat(rate);
      const vid = getVideo();
      vid.playbackRate = r;
      return { ...s, playbackRate: r };
    },

    toggleInfo: (s) => ({ ...s, showInfo: !s.showInfo }),

    videoPlaying: (s) => ({ ...s, playing: true }),
    videoPaused: (s) => ({ ...s, playing: false }),
  },

  view(state) {
    const pct =
      state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
    const track = PLAYLIST[state.trackIndex];
    const esc = (x) => String(x||'').replace(/&/g, '&amp;').replace(/</g, '&lt;');

    const volMuteIcon = state.muted || state.volume === 0
      ? "\uD83D\uDD07" : state.volume < 0.5 ? "\uD83D\uDD09" : "\uD83D\uDD0A";

    const playIcon = state.playing
      ? '\u23F8' : '\u25B6';

    // Shared inline style snippets
    const btnStyle = "display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.08);border:none;border-radius:8px;color:rgba(255,255,255,0.85);cursor:pointer;font-size:1rem;padding:0.45rem;transition:all 0.2s;";
    const accentBg = "background:linear-gradient(135deg,#646cff,#e83e8c);";
    const playBtnStyle = "width:48px;height:48px;display:flex;align-items:center;justify-content:center;border:none;border-radius:50%;color:white;font-size:1.3rem;cursor:pointer;box-shadow:0 4px 20px rgba(100,108,255,0.4);transition:all 0.25s;" + accentBg;

    const playlistItems = PLAYLIST.map((t, i) => {
      const active = i === state.trackIndex;
      const bg = active ? "background:rgba(100,108,255,0.15);border:1px solid rgba(100,108,255,0.25);" : "background:transparent;border:1px solid transparent;";
      const dotColor = active ? (state.playing ? "#4f8" : "#fff") : "transparent";
      return `<div data-up-event="click:selectTrack" data-track-index="${i}" style="display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.65rem;border-radius:10px;cursor:pointer;transition:all 0.2s;${bg}">
        <div style="width:48px;height:32px;border-radius:6px;overflow:hidden;flex-shrink:0;background:#0a0a14;position:relative;">
          <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.9rem;opacity:0.25;">\uD83C\uDFAC</div>
          ${active ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:50%;background:${dotColor};"></div></div>` : ''}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.82rem;font-weight:${active ? '700' : '500'};color:${active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.7)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(t.title)}</div>
          <div style="font-size:0.68rem;opacity:0.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(t.duration)} \u00b7 ${esc(t.genre)}</div>
        </div>
        <span style="font-size:0.65rem;opacity:0.4;flex-shrink:0;">${esc(t.duration)}</span>
      </div>`;
    }).join('');

    const dialogHtml = state.showInfo
      ? `<div class="vibe-videoplayer-dialog-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:1000;" data-up-event="click:toggleInfo">
          <div style="background:#1a1a2e;border-radius:16px;padding:1.5rem;max-width:440px;width:90vw;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);position:relative;" data-up-event-stop>
            <button data-up-event="click:toggleInfo" style="${btnStyle}position:absolute;top:0.75rem;right:0.75rem;">\u2715</button>
            <div style="width:100%;height:140px;border-radius:10px;overflow:hidden;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;font-size:2.5rem;${accentBg}">\uD83C\uDFAC</div>
            <h2 style="margin:0;font-size:1.2rem;font-weight:800;">${esc(track.title)}</h2>
            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.6rem;">
              <span style="font-size:0.68rem;background:rgba(100,108,255,0.2);color:#a5b4fc;border-radius:999px;padding:0.15rem 0.6rem;">${esc(track.genre)}</span>
              <span style="font-size:0.68rem;background:rgba(232,62,140,0.15);color:#f5a0c8;border-radius:999px;padding:0.15rem 0.6rem;">${esc(track.year)}</span>
              <span style="font-size:0.68rem;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);border-radius:999px;padding:0.15rem 0.6rem;">${esc(track.duration)}</span>
            </div>
            <p style="font-size:0.82rem;opacity:0.65;margin-top:0.75rem;line-height:1.55;">${esc(track.description)}</p>
            <div style="font-size:0.72rem;opacity:0.4;margin-top:0.6rem;">Directed by <strong style="color:rgba(255,255,255,0.6);">${esc(track.director)}</strong></div>
          </div>
        </div>`
      : '';

    return `<div class="vibe-videoplayer" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:820px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.3);color:rgba(255,255,255,0.9);background:linear-gradient(160deg,#0f0f1a,#1a1a2e,#16213e);">
      <!-- Video Display Slot -->
      <div id="video-slot" style="position:relative;background:#000;"></div>

      <!-- Now Playing Bar -->
      <div style="padding:0.85rem 1.2rem 0.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.95rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(track.title)}</div>
            <div style="font-size:0.72rem;opacity:0.5;margin-top:0.1rem;">${esc(track.genre)} \u00b7 ${esc(track.year)}</div>
          </div>
          <button data-up-event="click:toggleInfo" style="${btnStyle}font-size:1.1rem;" title="Video Info">\u2139</button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div style="padding:0 1.2rem 0.5rem;">
        <div style="display:flex;align-items:center;gap:0.6rem;">
          <span style="font-size:0.68rem;opacity:0.5;min-width:40px;text-align:right;">${fmt(state.currentTime)}</span>
          <div id="vp-progress-track" style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:3px;cursor:pointer;position:relative;">
            <div style="height:100%;width:${pct}%;border-radius:3px;transition:width 0.1s linear;position:relative;${accentBg}">
              <div style="position:absolute;right:-6px;top:-4px;width:13px;height:13px;border-radius:50%;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.15s;"></div>
            </div>
          </div>
          <span style="font-size:0.68rem;opacity:0.5;min-width:40px;">${fmtLong(state.duration)}</span>
        </div>
      </div>

      <!-- Controls -->
      <div style="display:flex;align-items:center;justify-content:center;gap:0.4rem;padding:0.35rem 1.2rem 0.85rem;flex-wrap:wrap;">
        <button data-up-event="click:seekBack" style="${btnStyle}font-size:0.85rem;" title="Back 10s">\u21BA</button>
        <button data-up-event="click:prevTrack" style="${btnStyle}" title="Previous">\u23EE</button>
        <button data-up-event="click:togglePlay" style="${playBtnStyle}">
          <span style="font-size:${state.playing ? '1.2rem' : '1.4rem'};${state.playing ? '' : 'margin-left:3px;'}">${playIcon}</span>
        </button>
        <button data-up-event="click:nextTrack" style="${btnStyle}" title="Next">\u23ED</button>
        <button data-up-event="click:seekFwd" style="${btnStyle}font-size:0.85rem;" title="Forward 10s">\u21BB</button>
        <span style="color:rgba(255,255,255,0.15);margin:0 0.25rem;user-select:none;">\u2502</span>
        <button data-up-event="click:toggleMute" style="${btnStyle}" title="${state.muted ? 'Unmute' : 'Mute'}">${volMuteIcon}</button>
        <input id="vp-volume-slider" type="range" min="0" max="1" step="0.05" value="${state.muted ? 0 : state.volume}" style="width:70px;accent-color:#646cff;cursor:pointer;" />
        <span style="color:rgba(255,255,255,0.15);margin:0 0.25rem;user-select:none;">\u2502</span>
        <select id="vp-speed-select" style="background:rgba(255,255,255,0.08);border:none;border-radius:8px;color:rgba(255,255,255,0.85);padding:0.35rem 0.45rem;font-size:0.75rem;cursor:pointer;font-family:inherit;">
          ${[0.5, 0.75, 1, 1.25, 1.5, 2].map(r =>
            `<option value="${r}" ${state.playbackRate === r ? 'selected' : ''} style="background:#1a1a2e;color:white;">${r === 1 ? '1\u00D7' : r + '\u00D7'}</option>`
          ).join('')}
        </select>
      </div>

      <!-- Playlist -->
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding:0.75rem 1.2rem 1rem;">
        <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.6rem;">
          <span style="font-size:0.75rem;opacity:0.5;text-transform:uppercase;letter-spacing:0.06em;">Playlist</span>
          <span style="font-size:0.65rem;opacity:0.35;background:rgba(255,255,255,0.08);border-radius:999px;padding:0.1rem 0.5rem;">${PLAYLIST.length}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:2px;max-height:320px;overflow-y:auto;">
          ${playlistItems}
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:0.5rem 1.2rem 1rem;text-align:center;font-size:0.65rem;opacity:0.3;">
        Built with <span style="color:#646cff;">@uploop/html</span> \u00b7 Public domain videos
      </div>
      ${dialogHtml}
    </div>`;
  },

  mount(el, ctx) {
    const video = getVideo();
    const send = (ev, val) => VideoPlayer.loop.send(ev, val);

    // Load initial track
    video.src = PLAYLIST[0].src;
    video.volume = 0.8;

    // Register video as a persistent resource so it survives innerHTML wipes
    ctx.registerResource("video", {
      save: () => {
        if (video.parentNode) video.parentNode.removeChild(video);
        return true;
      },
      restore: (_saved, root) => {
        const slot = root.querySelector("#video-slot");
        if (slot) slot.appendChild(video);
      },
    });

    // ── Video event listeners ──
    const onTime = () => send("timeUpdate", video.currentTime);
    const onMeta = () => send("metadataLoaded");
    const onEnded = () => send("trackEnded");
    const onPlay = () => send("videoPlaying");
    const onPause = () => send("videoPaused");

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    // ── Progress bar click-seek ──
    const progressTrack = el.querySelector("#vp-progress-track");
    const onProgressClick = (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const state = VideoPlayer.loop.get();
      send("setTime", ratio * state.duration);
    };
    if (progressTrack) progressTrack.addEventListener("click", onProgressClick);

    // ── Volume slider ──
    const volSlider = el.querySelector("#vp-volume-slider");
    const onVolInput = (e) => send("setVolume", e.target.value);
    if (volSlider) volSlider.addEventListener("input", onVolInput);

    // ── Speed selector ──
    const speedSel = el.querySelector("#vp-speed-select");
    const onSpeedChange = (e) => send("setRate", e.target.value);
    if (speedSel) speedSel.addEventListener("change", onSpeedChange);

    // ── Playlist track selection (data-up-event passes index) ──
    const onPlaylistClick = (e) => {
      const item = e.target.closest('[data-track-index]');
      if (!item) return;
      const idx = parseInt(item.getAttribute('data-track-index'), 10);
      send("selectTrack", idx);
    };
    const playlistContainer = el.querySelector('[style*="flex-direction:column"][style*="max-height:320px"]');
    if (playlistContainer) playlistContainer.addEventListener("click", onPlaylistClick);

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      if (progressTrack) progressTrack.removeEventListener("click", onProgressClick);
      if (volSlider) volSlider.removeEventListener("input", onVolInput);
      if (speedSel) speedSel.removeEventListener("change", onSpeedChange);
      if (playlistContainer) playlistContainer.removeEventListener("click", onPlaylistClick);
      video.pause();
      video.removeAttribute("src");
    };
  },
});

export default VideoPlayer;
