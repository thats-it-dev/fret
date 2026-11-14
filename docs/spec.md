# Spec: Fret

## What it is for
A small PWA for Michael (left-handed) to build fretting and dexterity on the guitar.
He sets a daily practice-time goal, looks up scale reference material (pentatonic and
other scales) rendered on a left-handed fretboard, runs a metronome with timing feedback,
and ramps difficulty over time.

## Behaviour
- Daily goal: the user sets a target in minutes (default 20). The practice screen shows
  a live timer; when the timer stops, that session's duration is added to today's total.
- Fretboard: renders a 6-string fretboard showing only the current position window
  (`positionWidth` frets starting at the chosen start fret). Strings ordered 1st (high E)
  on top to 6th (low E) on bottom. Nut is drawn on the right edge. Each scale note shows
  a circular dot with its note name; the root (degree 1) uses amber (primary) fill.
  Out-of-scale cells render blank.
- Left-handed mode: mirrors the fretboard on the x-axis (nut on the left edge, fret numbers increase right-to-left). String labels are on the right side instead of the left. Toggled from the Settings dialog; persisted in localStorage.
- Open in-scale notes render as small dots without any finger or degree label. When
  `startFret=0` the open-string column is not shown on the board.
- Scales: provides pentatonic (major & minor), major, natural minor, and blues. Each is
  available per root note and per starting fret.
- Metronome: tempo in BPM, play/stop, optional accent on the first beat of each bar (4/4).
  Timing feedback: after a practice session, show how many beats were played vs target.
- Difficulty: a level (1..N). Higher levels raise the metronome BPM and widen the scale
  position (more frets spanned). The user can level up when they can hold the current
  tempo for the whole session.
- Settings modal (keeb-style): a `<dialog>` opened from a Settings button in the header bar.
  Two-column panel (label left, control right). Persistent settings: level (select),
  left-handed toggle (checkbox), and daily goal in minutes (number input). Changes persist
  to localStorage.
- All state (goal, level, last session) is stored in the browser (localStorage); no backend.

## Design
- Flat design: no border boxes on sections; sections are separated by the page grid gap only.
- Fretboard grid lines come from the container background + 1px gap, not cell borders.
- Settings uses a keeb-style `<dialog>` modal with `.modal-head` and a two-column `.panel` grid.

## Data
- Browser localStorage: daily goal minutes, difficulty level, left-handed flag, last completed session time.
- No server, no gateway. Works offline after first load (service worker precache).

## Not in scope
- Audio synthesis of actual note sounds (metronome uses Web Audio click, not sampled notes).
- Multi-user sync, accounts, or cloud storage.
- Right-handed view toggle (Michael is left-handed; the app renders left-handed by default).
