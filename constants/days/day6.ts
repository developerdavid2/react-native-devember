export const day6Content = `# Day 6 — Voice Memos

Today we built a **WhatsApp-style voice memo recorder and player** with animated waveforms, real-time metering, and a polished playback UI.

---

## What We Built

A full voice recording experience with:

- Record audio with real-time animated waveform visualization
- Animated record button that morphs from circle to square while recording
- Pulsing wave ring around the record button driven by microphone level
- Playback list with 50-bar downsampled waveform per memo
- Waveform color splits blue/gray to show played vs unplayed — like WhatsApp
- Speed toggle (1x → 1.5x → 2x)
- One-at-a-time playback (starting one pauses others)
- Load existing recordings from disk on mount

---

## File Structure

\`\`\`
app/(days)/day6/
└── index.tsx                        ← MemosScreen (record + list)

components/core/day6/
└── memos-list-item.tsx              ← MemoItem (individual playback card)
\`\`\`

---

## Libraries Used

| Library | Purpose |
|---|---|
| \`expo-audio\` | Recording and playback |
| \`expo-file-system/legacy\` | List existing recordings on disk |
| \`react-native-reanimated\` | Record button + wave ring animations |

---

## Data Type

Every memo carries its URI and the raw metering array captured during recording:

\`\`\`tsx
type Memo = {
  uri: string;
  metering: number[]; // one value per ~50ms, range roughly -60 to 0 dB
};
\`\`\`

Metering is captured live during recording and stored alongside the URI.
Old recordings loaded from disk have \`metering: []\` — no waveform history was persisted.

---

## Key Concepts

### 1. isMeteringEnabled Must Go in Two Places

This is a known quirk in \`expo-audio\`. Setting it only in \`useAudioRecorder\` is not enough — it must also be repeated in \`prepareToRecordAsync\`:

\`\`\`tsx
// ✅ both places required
const audioRecorder = useAudioRecorder({
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true, // 1️⃣ here
});

await audioRecorder.prepareToRecordAsync({
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true, // 2️⃣ AND here — without this, metering stays undefined
});
\`\`\`

---

### 2. Bridging Metering to the UI Thread

\`recorderState.metering\` lives on the JS thread. Reanimated worklets run on the UI thread.
A \`useSharedValue\` acts as the bridge:

\`\`\`tsx
const metering = useSharedValue(-160); // UI thread — drives animations

useEffect(() => {
  // Filter -160 spikes (silence artifacts from expo-audio)
  if (recorderState.metering !== undefined && recorderState.metering > -160) {
    metering.value = recorderState.metering;           // → UI thread (animations)
    setAudioMetering((cur) => [...cur, recorderState.metering!]); // → JS state (waveform data)
  }
  isRecordingValue.value = recorderState.isRecording;
}, [recorderState.metering, recorderState.isRecording]);
\`\`\`

The \`-160\` filter is important — expo-audio emits \`-160\` as a silence sentinel value that would
collapse the wave animation to nothing. We ignore those and hold the last real value instead.

---

### 3. Capture Metering Before stopRecording Resets State

This is a subtle stale closure bug. \`audioMetering\` resets when the recorder stops — so you must
snapshot it before calling \`stop()\`:

\`\`\`tsx
const stopRecording = async () => {
  await audioRecorder.stop();
  const uri = audioRecorder.uri;
  const currentMetering = [...audioMetering]; // ✅ snapshot BEFORE any state changes
  metering.value = -160;

  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

  if (uri) {
    setMemos((existing) => [
      { uri, metering: currentMetering }, // ✅ real metering data preserved
      ...existing,
    ]);
  }
  // ❌ never call listRecordings() here — it would overwrite metering with []
};
\`\`\`

\`listRecordings()\` is only ever called on mount. Calling it after recording would
overwrite the fresh memo's metering data with an empty array.

---

### 4. Record Button Morphing Animation

The button morphs from a circle to a rounded square while recording — driven by a SharedValue:

\`\`\`tsx
const isRecordingValue = useSharedValue(false);

const animatedRecordButton = useAnimatedStyle(() => ({
  width: withTiming(isRecordingValue.value ? "60%" : "100%", { duration: 100 }),
  borderRadius: withTiming(isRecordingValue.value ? 5 : 35, { duration: 100 }),
}));

// Red inner shape — shrinks to a square when recording
<Animated.View style={[styles.redCircle, animatedRecordButton]} />
\`\`\`

---

### 5. Pulsing Wave Ring Around the Record Button

The outer glow ring expands and changes opacity based on real microphone volume:

\`\`\`tsx
const animatedRecordWave = useAnimatedStyle(() => {
  const size = withTiming(
    interpolate(metering.value, [-160, -60, 0], [0, 0, -30]),
    { duration: 100 },
  );
  return {
    top: size,
    bottom: size,
    left: size,
    right: size,
    backgroundColor: \`rgba(255, 45, 0, \${interpolate(
      metering.value,
      [-160, -60, -10],
      [0.7, 0.3, 0.7],
    )})\`,
  };
});

// The wave is positioned absolute around the button with negative insets
// style: { position: "absolute", top: -20, bottom: -20, left: -20, right: -20, borderRadius: 1000 }
\`\`\`

When loud → ring expands outward (negative insets grow more negative) and turns more opaque.
When quiet → ring collapses back to zero and fades out.

---

### 6. Downsampling Metering to 50 Bars

Raw metering arrays can have hundreds of values depending on recording length.
Always downsample to exactly 50 bars using averaging for a consistent, clean waveform:

\`\`\`tsx
const NUM_LINES = 50;

const lines = Array.from({ length: NUM_LINES }, (_, i) => {
  const meteringIndex = Math.floor((i * metering.length) / NUM_LINES);
  const nextMeteringIndex = Math.ceil(((i + 1) * metering.length) / NUM_LINES);

  const values = metering.slice(meteringIndex, nextMeteringIndex);

  return values.length > 0
    ? values.reduce((sum, a) => sum + a, 0) / values.length
    : -50; // fallback height for old recordings with no metering data
});
\`\`\`

This maps each bar to a slice of the array and averages the values in that slice.
A 10-second recording and a 60-second recording both render exactly 50 bars.

---

### 7. Mapping dB to Bar Height — Use Real Speech Range

Real speech sits between \`-50\` and \`-10\` dB — never near \`0\` (that's clipping).
Mapping to the full \`[-160, 0]\` theoretical range makes all bars cluster at the bottom:

\`\`\`tsx
// ❌ theoretical range — bars all look the same height
height: interpolate(db, [-160, 0], [5, 50], "clamp")

// ✅ real speech range — dramatic, visible differences
height: interpolate(db, [-50, -10], [5, 50], "clamp")
\`\`\`

The minimum height of \`5\` ensures bars are always visible even during silence —
a flat line looks better than disappearing bars.

---

### 8. Played vs Unplayed Waveform Color

Use the JS-thread \`progress\` value (not the SharedValue) to split bar colors:

\`\`\`tsx
const progress = durationSeconds > 0 ? currentSeconds / durationSeconds : 0;

{lines.map((db, index) => (
  <View
    key={index}
    style={[
      styles.waveLine,
      {
        height: interpolate(db, [-50, -10], [5, 50], "clamp"),
        backgroundColor: progress > index / NUM_LINES
          ? "#3B82F6"   // ← played portion: blue
          : "gainsboro", // ← unplayed: gray
      },
    ]}
  />
))}
\`\`\`

As playback progresses, bars to the left of the playhead turn blue and bars to the right stay gray —
exactly like WhatsApp voice notes.

---

### 9. 60fps Progress Indicator

\`useAudioPlayerStatus\` only updates every ~100ms — too slow for a smooth scrubber.
Read directly from the \`player\` object on a 16ms interval instead:

\`\`\`tsx
useEffect(() => {
  if (!status.playing) return;

  const interval = setInterval(() => {
    const current = player.currentTime ?? 0;
    const duration = player.duration ?? 0;
    if (duration > 0) {
      progressShared.value = current / duration; // → drives Animated.View position
    }
  }, 16); // ~60fps

  return () => clearInterval(interval);
}, [status.playing]);
\`\`\`

No \`withTiming\` needed here — the 16ms poll is already smooth enough for the eye.

---

### 10. One-at-a-Time Playback

\`activeMemoUri\` lives in the parent \`MemosScreen\` and is passed down.
Each \`MemoItem\` watches it and pauses if it's no longer the active one:

\`\`\`tsx
// In MemosScreen
const [activeMemoUri, setActiveMemoUri] = useState<string | null>(null);

// In MemoItem
const isActive = activeMemoUri === uri;

useEffect(() => {
  if (!isActive && status.playing) {
    player.pause(); // another memo started — pause this one
  }
}, [isActive, status.playing]);

const handlePlayPause = () => {
  if (status.playing) {
    player.pause();
  } else {
    player.play();
    setActiveMemoUri(uri); // ← tells all other items to pause
  }
};
\`\`\`

---

## The Recording Flow

\`\`\`
User taps record button
        ↓
setAudioMetering([])                  ← reset metering array
prepareToRecordAsync({ isMeteringEnabled: true })
audioRecorder.record()
        ↓
Every ~50ms: recorderState.metering updates
        ↓
useEffect bridges to:
  ├── metering.value  (SharedValue → UI thread → animations)
  └── audioMetering   (JS state → collected for waveform)
        ↓
User taps stop
        ↓
currentMetering = [...audioMetering]  ← snapshot before reset
audioRecorder.stop()
        ↓
setMemos([{ uri, metering: currentMetering }, ...existing])
\`\`\`

---

## Key Takeaways

- \`isMeteringEnabled: true\` must appear in BOTH \`useAudioRecorder\` AND \`prepareToRecordAsync\`
- \`-160\` metering values are silence artifacts — filter them out
- Snapshot \`audioMetering\` before \`stop()\` — state resets immediately after
- Never call \`listRecordings()\` after recording — it wipes metering with \`[]\`
- Always downsample to a fixed number of bars — raw array length varies by recording duration
- Map bar heights to \`[-50, -10]\` not \`[-160, 0]\` — real speech never reaches the extremes
- Use a \`useSharedValue\` as a JS → UI thread bridge for metering animations
- \`progress\` from \`status\` (not SharedValue) can be read safely in JSX for bar colors
- 60fps scrubber: poll \`player.currentTime\` every 16ms — don't rely on \`useAudioPlayerStatus\`

> "The wave ring doesn't move because of code. It moves because of your voice." — Reanimated + microphone
`;
