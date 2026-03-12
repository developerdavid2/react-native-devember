export const day11Content = `# Day 11 — Camera App

Today we built a **production-grade camera application** using \`expo-camera\` — covering photo, video, barcode scanning, a media gallery, zoom, flash, torch, and a full settings panel.

---

## What We Built

A full camera experience with:

- Photo and video capture with mode switching
- Tap-to-focus with an animated focus ring
- Pinch-to-zoom + preset zoom level buttons (0.5×, 1×, 2×, 5×)
- Flash cycle (Off → On → Auto) and manual torch toggle
- QR / barcode scanner with animated scan line and URL opener
- Settings panel: video quality, aspect ratio, mirror, mute, shutter animation
- Media gallery with grouped-by-date grid, full screen viewer, multi-select delete
- Recording timer with pulsing shutter button
- Thumbnail preview of last captured media in bottom bar

---

## File Structure

\`\`\`
app/(days)/day11/
└── camera.tsx                ← Main camera screen

components/core/day11/
├── types.ts                  ← Shared types and constants
├── SettingsPanel.tsx         ← Slide-up settings modal
├── BarcodeScanner.tsx        ← QR / barcode scanner view
└── GalleryScreen.tsx         ← Photo/video gallery with viewer
\`\`\`

---

## Libraries Used

| Library | Purpose |
|---|---|
| \`expo-camera\` | Camera, photo, video, barcode |
| \`expo-image\` | Performant image rendering in gallery |
| \`expo-av\` | Video playback in gallery viewer |
| \`expo-haptics\` | Tactile feedback on shutter press |
| \`expo-file-system/legacy\` | File operations |

---

## Key Concepts

### 1. Two Permissions Required

Camera apps need both camera AND microphone for video recording:

\`\`\`tsx
const [camPermission, requestCamPermission] = useCameraPermissions();
const [micPermission, requestMicPermission] = useMicrophonePermissions();

// Request both together
await requestCamPermission();
await requestMicPermission();
\`\`\`

Always request both upfront — trying to record video without mic permission silently fails on some devices.

---

### 2. Mode Switching — Picture vs Video

The same \`CameraView\` handles both. Swap the \`mode\` prop and change what the shutter button does:

\`\`\`tsx
<CameraView mode={mode} /> // "picture" | "video"

// Shutter press behavior changes based on mode
const handleShutter = () => {
  if (mode === "picture") {
    takePicture();
  } else {
    recording ? stopRecording() : startRecording();
  }
};
\`\`\`

The shutter button also morphs — white circle for photo, red square for recording stop:

\`\`\`tsx
<View style={[
  styles.shutterCore,
  mode === "video" && (recording ? styles.shutterStop : styles.shutterRecord),
]} />
// shutterStop: { borderRadius: 6 }  ← square
// shutterRecord: { backgroundColor: "#FF453A" } ← red circle
\`\`\`

---

### 3. Pinch-to-Zoom with PanResponder

\`CameraView\`'s \`zoom\` prop takes a value from \`0\` (none) to \`1\` (max). Drive it with a PanResponder tracking finger distance:

\`\`\`tsx
const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: (_, gs) => gs.numberActiveTouches === 2,
  onMoveShouldSetPanResponder: (_, gs) => gs.numberActiveTouches === 2,
  onPanResponderMove: (e) => {
    const touches = e.nativeEvent.touches;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (lastDistance.current !== null) {
      const delta = (distance - lastDistance.current) / SCREEN_WIDTH;
      setZoom((z) => Math.min(1, Math.max(0, z + delta)));
    }
    lastDistance.current = distance;
  },
  onPanResponderRelease: () => { lastDistance.current = null; }
});

// Attach to the camera wrapper
<View {...panResponder.panHandlers}>
  <CameraView zoom={zoom} />
</View>
\`\`\`

---

### 4. Tap-to-Focus Indicator

\`expo-camera\` doesn't expose a native focus point API directly — but you can show a visual indicator driven by the tap position and the effect is convincing:

\`\`\`tsx
const handleTap = (e: GestureResponderEvent) => {
  const { locationX, locationY } = e.nativeEvent;
  setFocusPoint({ x: locationX, y: locationY });
  
  // Animate in: scale 1.5 → 1, then fade out
  Animated.parallel([
    Animated.timing(focusScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    Animated.sequence([
      Animated.delay(800),
      Animated.timing(focusOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]),
  ]).start();
};
\`\`\`

---

### 5. Flash vs Torch — Different Things

\`\`\`tsx
// flash — fires when taking a picture
<CameraView flash="on" />    // "off" | "on" | "auto"

// enableTorch — keeps the LED on continuously (like a flashlight)
<CameraView enableTorch={true} />
\`\`\`

Flash only fires during capture. Torch stays on — useful for video recording in dark environments. Both can be on simultaneously.

---

### 6. Barcode Scanner

Enable barcode scanning by adding \`barcodeScannerSettings\` and an \`onBarcodeScanned\` callback:

\`\`\`tsx
<CameraView
  barcodeScannerSettings={{
    barcodeTypes: ["qr", "ean13", "code128", "pdf417", ...],
  }}
  onBarcodeScanned={(result) => {
    // result.type — "qr", "ean13", etc.
    // result.data — the decoded string content
    console.log(result.data);
  }}
/>
\`\`\`

Guard against duplicate scans with a \`scanned\` boolean flag — \`onBarcodeScanned\` fires continuously while a code is in frame:

\`\`\`tsx
const handleBarcodeScanned = (result: BarcodeScanningResult) => {
  if (scanned) return; // ← ignore after first hit
  setScanned(true);
  setResult(result);
};
\`\`\`

---

### 7. Recording Timer

Drive a seconds counter with \`setInterval\` tied to the recording state:

\`\`\`tsx
useEffect(() => {
  if (recording) {
    setRecordDuration(0);
    timerRef.current = setInterval(() => setRecordDuration((d) => d + 1), 1000);
  } else {
    clearInterval(timerRef.current);
  }
  return () => clearInterval(timerRef.current);
}, [recording]);

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return \`\${String(m).padStart(2, "0")}:\${String(sec).padStart(2, "0")}\`;
};
\`\`\`

---

### 8. Gallery — Group Media by Date

Reduce the flat media array into a date-keyed object for sectioned display:

\`\`\`tsx
const grouped = media.reduce<Record<string, CapturedMedia[]>>((acc, item) => {
  const key = formatDate(item.timestamp); // "12 Mar 2026"
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {});

const sections = Object.entries(grouped);
// [["12 Mar 2026", [photo1, video1]], ["11 Mar 2026", [photo2]]]
\`\`\`

---

### 9. Multi-Select Delete

Track selected URIs in a \`Set\` — checking and toggling is O(1):

\`\`\`tsx
const [selectedUris, setSelectedUris] = useState<Set<string>>(new Set());

const toggleSelect = (uri: string) => {
  const next = new Set(selectedUris);
  if (next.has(uri)) next.delete(uri);
  else next.add(uri);
  setSelectedUris(next);
};

// Long press enters selection mode
const handleLongPress = (item) => {
  setSelectionMode(true);
  toggleSelect(item.uri);
};
\`\`\`

---

## CameraView Props Summary

| Prop | Type | Purpose |
|---|---|---|
| \`mode\` | \`"picture" \\| "video"\` | Switch capture mode |
| \`facing\` | \`"front" \\| "back"\` | Camera direction |
| \`flash\` | \`"off" \\| "on" \\| "auto"\` | Photo flash |
| \`enableTorch\` | \`boolean\` | Continuous LED light |
| \`zoom\` | \`0–1\` | Zoom percentage |
| \`mirror\` | \`boolean\` | Mirror front camera |
| \`mute\` | \`boolean\` | Silent video recording |
| \`animateShutter\` | \`boolean\` | Shutter click animation |
| \`videoQuality\` | \`"2160p" \\| "1080p"...\` | Recording resolution |
| \`barcodeScannerSettings\` | \`BarcodeSettings\` | Enable barcode detection |
| \`onBarcodeScanned\` | \`callback\` | Barcode result handler |
| \`responsiveOrientationWhenOrientationLocked\` | \`boolean\` | iOS landscape in portrait lock |

---

## Key Takeaways

- Always request both \`useCameraPermissions\` AND \`useMicrophonePermissions\` upfront
- \`flash\` fires on capture — \`enableTorch\` stays on continuously — they are independent
- Pinch-to-zoom uses \`PanResponder\` tracking two-finger distance; drive the \`zoom\` prop
- Guard \`onBarcodeScanned\` with a \`scanned\` flag — it fires on every frame
- \`mode\` prop on the same \`CameraView\` handles both picture and video — no component swap needed
- Only one \`CameraView\` can be active at a time — unmount it when navigating away
- \`Set<string>\` for multi-select state — O(1) membership check, easy toggling
- Recording timer is just a \`setInterval\` counter tied to the \`recording\` state

> "The camera doesn't think. It just captures what you point at. Design the experience around the human holding it." — camera UX principle
`;
