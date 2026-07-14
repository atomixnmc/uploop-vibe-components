// ─── Media: Image, Video, Audio, Figure, AvatarGroup, Carousel, AudioPlayer, VideoPlayer, Paint ─────────

import { component } from '@uploop/html'
export { ImageCarousel } from './carousel.js'
export { AudioPlayer } from './audio-player.js'
export { VideoPlayer } from './video-player.js'
export { Paint } from './paint.js'

export const Image = component('VibeImage', {
  state: { src: '', alt: '', fit: 'cover', radius: 'md', width: 'auto', height: 'auto', fallback: '', caption: '', loading: 'lazy' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<div class="vibe-image" style="display:inline-block;${s.width !== 'auto' ? `width:${s.width};` : ''}${s.height !== 'auto' ? `height:${s.height};` : ''}">
      <img src="${esc(s.src)}" alt="${esc(s.alt)}" loading="${s.loading}" style="
        width:100%; height:100%; object-fit:${s.fit}; border-radius:var(--vibe-radius-${s.radius});
      " onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
      ${s.fallback ? `<div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:var(--vibe-color-neutral100);border-radius:var(--vibe-radius-${s.radius});color:var(--vibe-color-muted);font-size:0.85rem;">${esc(s.fallback)}</div>` : ''}
      ${s.caption ? `<figcaption style="margin-top:0.375rem;font-size:0.78rem;color:var(--vibe-color-mutedFg);text-align:center;">${esc(s.caption)}</figcaption>` : ''}
    </div>`
  }
})

export const Video = component('VibeVideo', {
  state: { src: '', poster: '', controls: true, autoplay: false, loop: false, muted: false, width: '100%', radius: 'md' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    return `<div class="vibe-video" style="width:${s.width};">
      <video src="${s.src}" ${s.poster ? `poster="${s.poster}"` : ''} ${s.controls ? 'controls' : ''} ${s.autoplay ? 'autoplay' : ''} ${s.loop ? 'loop' : ''} ${s.muted ? 'muted' : ''} style="
        width:100%; border-radius:var(--vibe-radius-${s.radius}); display:block;
      "></video>
    </div>`
  }
})

export const Audio = component('VibeAudio', {
  state: { src: '', controls: true, autoplay: false, loop: false },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    return `<div class="vibe-audio" style="width:100%;">
      <audio src="${s.src}" ${s.controls ? 'controls' : ''} ${s.autoplay ? 'autoplay' : ''} ${s.loop ? 'loop' : ''} style="width:100%;"></audio>
    </div>`
  }
})

export const Figure = component('VibeFigure', {
  state: { src: '', alt: '', caption: '', fit: 'cover', radius: 'md', width: '100%' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    return `<figure class="vibe-figure" style="margin:0;width:${s.width};">
      <img src="${esc(s.src)}" alt="${esc(s.alt)}" style="width:100%;object-fit:${s.fit};border-radius:var(--vibe-radius-${s.radius});display:block;" />
      ${s.caption ? `<figcaption style="margin-top:0.5rem;font-size:0.82rem;color:var(--vibe-color-mutedFg);text-align:center;">${esc(s.caption)}</figcaption>` : ''}
    </figure>`
  }
})

export const AvatarGroup = component('VibeAvatarGroup', {
  state: { avatars: [], max: 5, size: 'md', spacing: 'overlap' },
  update: { configure: (s, p) => ({ ...s, ...p }) },
  view(s) {
    const avs = Array.isArray(s.avatars) ? s.avatars : []
    const visible = avs.slice(0, s.max)
    const remaining = avs.length - s.max
    const esc = (x) => String(x||'').replace(/&/g, '&amp;')
    const szMap = { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem', xl: '3.75rem' }
    const sz = szMap[s.size] || szMap.md
    const overlap = s.spacing === 'overlap' ? '-0.5rem' : '0.25rem'
    return `<div class="vibe-avatar-group" style="display:inline-flex;flex-direction:row-reverse;justify-content:flex-end;">
      ${remaining > 0 ? `<span style="
        width:${sz};height:${sz};border-radius:var(--vibe-radius-full);
        background:var(--vibe-color-neutral300);color:var(--vibe-color-mutedFg);
        display:inline-flex;align-items:center;justify-content:center;
        font-size:calc(${sz} * 0.33);font-weight:var(--vibe-font-weight-semibold);
        border:2px solid var(--vibe-color-bg);margin-left:${overlap};
      ">+${remaining}</span>` : ''}
      ${visible.reverse().map(a => `<span style="
        width:${sz};height:${sz};border-radius:var(--vibe-radius-full);
        background:var(--vibe-color-neutral200);overflow:hidden;
        display:inline-flex;align-items:center;justify-content:center;
        border:2px solid var(--vibe-color-bg);margin-left:${overlap};
        font-size:calc(${sz} * 0.35);font-weight:var(--vibe-font-weight-semibold);
        color:var(--vibe-color-neutral600);
      ">
        ${a.src ? `<img src="${esc(a.src)}" alt="${esc(a.name||'')}" style="width:100%;height:100%;object-fit:cover;" />` : (a.name||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
      </span>`).join('')}
    </div>`
  }
})
