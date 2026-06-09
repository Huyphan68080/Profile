# TODO - Fix scroll overscroll / 1 wheel = 1 frame

- [x] Update `src/index.css`: disable/soften CSS scroll-snap to prevent conflict with JS snapping.
- [ ] Update `src/App.jsx`: rewrite wheel/touch handling:
  - [x] Introduce lock state so only one frame transition occurs per wheel gesture.

  - [x] Normalize/threshold wheel delta so fast wheel/mouse/trackpad doesn’t skip.
  - [x] Clamp targetTop to exact frame top.
  - [x] Reduce smooth animation duration + easing.
- [x] Ensure touch handling matches wheel behavior (1 swipe => 1 frame).
- [ ] Quick performance check: cancel RAF on new intent; avoid repeated settle/nearest computations while animating.
- [ ] Manual test matrix: mouse wheel gentle/fast, gaming mouse, touchpad scrolling, mobile swipe.


