# Hero b-roll

Drop the hero background video here. The homepage picks it up automatically
(assets/hero-video.js checks for the file on load). Nothing else to wire.

- `hero.mp4` (required): H.264 MP4, 1920x1080 or 1280x720, 8 to 15 seconds,
  seamless loop, no audio track, 4 to 8 MB. Keep motion slow: a crew on a
  reel, a bore rig, a splice tray, not a walk-through.
- `hero-mobile.mp4` (optional): 720x1280 portrait crop, under 3 MB. Used on
  screens 820px and narrower when present; otherwise hero.mp4 is used.
- `hero-poster.jpg` (optional): first frame, 1920x1080, under 200 KB. Shown
  while the video loads and on prefers-reduced-motion.

Reduced motion and Save-Data users never get the video. The video is muted,
loops, pauses when the hero scrolls out of view, and sits under a navy tint
so the headline stays readable.
