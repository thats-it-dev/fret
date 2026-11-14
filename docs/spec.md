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
  (`positionWidth` frets starting at the chosen start fret). Left-handed = strings
  ordered so the low E is on top (mirror of the right-handed diagram). Nut is drawn
  on the right edge. Each scale note shows a circular dot with its scale-degree label
  (1, 2, 3, ♭3, 4, 5, ♭5, ♭6, ♭7); root degree uses amber (primary) fill.
- In-scale dots display a finger number (1–4) on the dot. Fingering is per-string, left-to-right: the first in-scale note on a string (the open string when its pitch class is in-scale) gets 1 (index), the next gets 2 (middle), then 3 (ring), 4 (pinky). If more than 4 in-scale notes fall on one string, the count wraps: the 5th also shows 4.
- Scales: provides pentatonic (major & minor), major, natural minor, and blues. Each is
  available per root note and per starting fret.
- Metronome: tempo in BPM, play/stop, optional accent on the first beat of each bar (4/4).
  Timing feedback: after a practice session, show how many beats were played vs target.
- Difficulty: a level (1..N). Higher levels raise the metronome BPM and widen the scale
  position (more frets spanned). The user can level up when they can hold the current
  tempo for the whole session.
- All state (goal, level, last session) is stored in the browser (localStorage); no backend.

## Data
- Browser localStorage: daily goal minutes, difficulty level, last completed session time.
- No server, no gateway. Works offline after first load (service worker precache).

## Not in scope
- Audio synthesis of actual note sounds (metronome uses Web Audio click, not sampled notes).
- Multi-user sync, accounts, or cloud storage.
- Right-handed view toggle (Michael is left-handed; the app renders left-handed by default).
