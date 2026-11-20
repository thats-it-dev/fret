# Spec: Fret

## What it is for
A small PWA for Michael (left-handed) to build fretting and dexterity on the guitar.
He sets a daily practice-time goal, looks up scale reference material (pentatonic and
other scales) rendered on a left-handed fretboard, runs a metronome with timing feedback,
and ramps difficulty over time.

## Behaviour
- Daily goal: the user sets a target in minutes (default 20). The practice card shows the live
  session clock centered at the top, today's progress bar under it, and the Start/Stop button at
  the bottom; when the timer stops, that session's duration is added to today's total.
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
- Metronome: a centered card enabled by a kit switch (not a play button), with the tempo chosen
  without typing: a horizontally swipeable rail of common tempos (40–180) snaps one value to the
  centre and that value is live; the highlighted tempo follows the centre while swiping, and the
  rail shows no scrollbar; tapping a tempo also centers and selects it. The active click
  falls on the first beat of each bar (4/4). Clicks are scheduled on the audio clock (seconds), so
  the beat keeps its tempo even when animation frames lag; on enable the audio context is resumed
  and unlocked inside the gesture (iOS starts it suspended and freezes its clock), and if the
  session still has not opened within a couple of seconds the metronome switches itself back off.
  Timing feedback: after a practice session, show how many beats were played vs target.
- Difficulty: a level (1..N). Higher levels preset the nearest common metronome tempo and widen
  the scale position (more frets spanned); the tempo stays directly swipeable on the metronome
  card. The user can level up when they can hold the current tempo for the whole session.
- Settings sheet: a `<tk-sheet heading="Settings">` opened from a Settings button in the header bar.
  Two-column panel (label left, control right). Persistent settings: level (select),
  left-handed toggle (checkbox), and daily goal in minutes (number input). Changes persist
  to localStorage.
- All state (goal, level, last session) is stored in the browser (localStorage); no backend.

## Design
- Flat design: no border boxes on sections and no section headers; sections are separated by the
  page grid gap only.
- Fretboard: the board background is the page background (`--bg`) and cells never change
  background (in-scale notes read by their dot alone). Grid lines are 2px `--line`: a border frames
  the whole board; vertical fret separators sit on each cell's right edge except the last column
  (`last-col`, where the frame is the edge; in left-handed mode the string labels sit at the right
  edge instead, so no fret cell touches it), horizontal string lines on each row's bottom edge
  except the board's bottom row (`last-row`), and lines along the label axes: the number row carries
  a bottom border and, right-handed, the string labels a right border (left-handed, the last fret
  column's separator is that axis); the corner cell carries the vertical axis (right border
  right-handed; left-handed the last fret-number cell does, so the line stays collinear) and no
  bottom border, so the vertical line is continuous edge to edge and the horizontal line ends into
  it without boxing a square at the corner. Note dots are capped to the cell height so they stay
  circular when the board scrolls at minimum track width. Cells keep a fixed 21:9 aspect ratio (wider than
  tall) at every screen width; tracks are `minmax(40px, 1fr)` so the board fills the page width
  and scrolls horizontally only when the 40px minimums no longer fit.
- Settings uses a `<tk-sheet>` with the kit `.form` two-column grid (label left, control right).

## Data
- Browser localStorage: daily goal minutes, difficulty level, left-handed flag, last completed session time.
- No server, no gateway. Works offline after first load (service worker precache).

## Not in scope
- Audio synthesis of actual note sounds (metronome uses Web Audio click, not sampled notes).
- Multi-user sync, accounts, or cloud storage.
- Right-handed view toggle (Michael is left-handed; the app renders left-handed by default).
