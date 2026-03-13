export type FeedVideo = {
  id: number;
  uri: string;
  author: string;
  handle: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
  avatar: string; // color for mock avatar
};

const BASE_URL =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/vertical-videos";

export const FEED_VIDEOS: FeedVideo[] = [
  {
    id: 1,
    uri: `${BASE_URL}/1.mp4`,
    author: "Adaeze Okafor",
    handle: "@adaeze.creates",
    caption:
      "Lagos sunsets never miss 🌅 This is why I love this city so much #Lagos #Sunset #Nigeria",
    song: "🎵 Essence — Wizkid ft. Tems",
    likes: 284700,
    comments: 3421,
    shares: 8900,
    avatar: "#FF6B6B",
  },
  {
    id: 2,
    uri: `${BASE_URL}/2.mp4`,
    author: "Tunde Fashola",
    handle: "@tundefash",
    caption:
      "POV: You discovered jollof rice for the first time 🍚🔥 #JollofWars #NigerianFood #Foodie",
    song: "🎵 Sungba — Burna Boy",
    likes: 521000,
    comments: 7832,
    shares: 14500,
    avatar: "#4ECDC4",
  },
  {
    id: 3,
    uri: `${BASE_URL}/3.mp4`,
    author: "Amara Nwosu",
    handle: "@amaradances",
    caption:
      "Afrobeats got me like 💃🏾 Can you keep up? Drop a 🔥 if you know this song! #Afrobeats #Dance",
    song: "🎵 Calm Down — Rema ft. Selena Gomez",
    likes: 1200000,
    comments: 15600,
    shares: 43200,
    avatar: "#FFE66D",
  },
  {
    id: 4,
    uri: `${BASE_URL}/4.mp4`,
    author: "Chidi Okeke",
    handle: "@chidi.dev",
    caption:
      "Built this app in 30 days 🚀 React Native is incredible. Follow for more #ReactNative #100DaysOfCode",
    song: "🎵 Higher — Davido",
    likes: 98400,
    comments: 2300,
    shares: 5600,
    avatar: "#A8E6CF",
  },
  {
    id: 5,
    uri: `${BASE_URL}/5.mp4`,
    author: "Ngozi Eze",
    handle: "@ngozi.eats",
    caption:
      "When suya hits different at midnight 🍢😭 Victor's suya spot in Abuja is unmatched #Suya #NigerianFood",
    song: "🎵 Love Damini — Burna Boy",
    likes: 445000,
    comments: 6100,
    shares: 12000,
    avatar: "#C7CEEA",
  },
];

export const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

export const day12Content = `# Day 12 — TikTok Feed 🎵

Today we built a **pixel-perfect TikTok/Shorts-style vertical video feed** using \`expo-video\` — covering a windowed player pool, video caching, preloading, a progress scrubber, smart buffering detection, and all the social interactions.

---

## What We Built

A full short-video feed experience with:

- Windowed player pool — exactly 3 players alive at any time, regardless of feed size
- Built-in disk caching so videos load instantly after first play
- Next video preloads silently in the background before you scroll to it
- Resume from position — scroll away and back, video continues where it paused
- Progress scrubber with draggable slider and current time / total duration
- Smart buffering spinner — only shows when actually buffering, never on cached return visits
- Double-tap to like with heart burst animation and haptic feedback
- Single-tap play/pause with pause icon flash, no delay
- Follow / Unfollow per video with haptic confirmation
- Expandable captions with "...more" tap
- Per-video mute toggle
- TikTok-style top tab bar (Following / For You) and bottom navigation bar

---

## File Structure

\`\`\`
app/(days)/day12/
└── feed.tsx                     ← Feed screen + windowed player pool

components/core/day12/
└── feed-item.tsx                ← FeedPlaceholder + FeedItemInner

constants/days/
└── day12.ts                     ← FEED_VIDEOS array + formatCount helper
\`\`\`

---

## Libraries Used

| Library | Purpose |
|---|---|
| \`expo-video\` | Video playback, player lifecycle, caching |
| \`expo-haptics\` | Tactile feedback on like and follow |
| \`@react-native-community/slider\` | Progress scrubber |

---

## Key Concepts

### 1. Windowed Player Pool

The single most important architectural decision. Instead of creating one player per video (which would exhaust memory and crash with a large feed), we maintain a \`Map\` of exactly 3 players — previous, current, and next.

\`\`\`
activeIndex = 2

Pool Map:  { 1 → player (paused),  2 → player (playing),  3 → player (buffering) }

Scroll to index 3:
  → release index 1  (left the window, memory freed)
  → create index 4   (entered the window, starts buffering)
  → play index 3, pause 2 and 4
\`\`\`

**Why \`Map\` instead of an array?**

A JavaScript \`Map\` uses numeric keys natively — no string coercion like plain objects \`{}\`. It supports \`.has()\`, \`.get()\`, \`.set()\`, \`.delete()\`, and iteration via \`.entries()\`, all O(1). Perfect for a keyed pool where the key is the video index.

**Why \`Set\` for the window?**

\`\`\`javascript
const keep = new Set()
keep.add(activeIndex - 1)  // prev
keep.add(activeIndex)      // current
keep.add(activeIndex + 1)  // next

// O(1) membership check — did this index fall out of the window?
if (!keep.has(idx)) player.release()
\`\`\`

A \`Set\` guarantees uniqueness (no duplicate entries) and \`.has()\` is O(1) vs O(n) for \`Array.includes()\`.

---

### 2. \`createVideoPlayer\` vs \`useVideoPlayer\`

\`useVideoPlayer\` is a React hook — it **cannot** be called in a loop or conditionally (Rules of Hooks):

\`\`\`javascript
// ❌ Breaks Rules of Hooks — hooks must never be in loops
for (const video of videos) {
  const player = useVideoPlayer(video.uri)
}
\`\`\`

\`createVideoPlayer\` is an imperative function — call it anywhere, any time, store the result in a \`Map\`. You manage the lifecycle manually: create when needed, \`.release()\` when done.

\`\`\`javascript
// ✅ Imperative — no hook rules apply
const p = createVideoPlayer({ uri: video.uri, useCaching: true })
p.loop = true
pool.set(index, p)

// Later, when the video leaves the window:
p.release()
pool.delete(index)
\`\`\`

---

### 3. Built-in Video Caching

No third-party caching library needed. \`expo-video\` handles it natively:

\`\`\`javascript
createVideoPlayer({
  uri: "https://.../video.mp4",
  useCaching: true,   // ← cached to device storage after first load
})
\`\`\`

First play fetches from network. Every subsequent play — even after closing and reopening the app — loads from local cache instantly.

---

### 4. The Null Guard Pattern

\`useEvent\` and \`useEventListener\` from expo call \`player.addListener()\` unconditionally on mount. Passing \`null\` crashes immediately:

\`\`\`javascript
// Inside useEvent (simplified):
useEffect(() => {
  player.addListener(eventName, handler)  // TypeError: Cannot read property of null
}, [])
\`\`\`

The fix is to split into two components so hooks only run when player is a real object:

\`\`\`javascript
export default function FeedItem({ player, video, isActive }) {
  if (!player) {
    return <FeedPlaceholder video={video} />   // no hooks — safe
  }
  return <FeedItemInner player={player} ... />  // hooks run, player guaranteed non-null
}
\`\`\`

The player is \`null\` for about one render cycle when a video first enters the FlatList window, before \`useWindowedPlayers\` creates its player. The placeholder shows a spinner during that moment.

---

### 5. Smart Buffering State

\`isBuffering\` is a **mirror** of \`player.status\` — never set independently:

\`\`\`javascript
// Initialize from actual player status — not hardcoded true
const [isBuffering, setIsBuffering] = useState(player.status !== "readyToPlay")

// Only the statusChange event drives changes
useEventListener(player, "statusChange", ({ status }) => {
  if (status === "readyToPlay") setIsBuffering(false)
  if (status === "loading")     setIsBuffering(true)
})

// Re-sync when the player object itself changes (e.g. windowed pool swap)
useEffect(() => {
  setIsBuffering(player.status !== "readyToPlay")
}, [player])
\`\`\`

Player status flows: \`"idle"\` → \`"loading"\` → \`"readyToPlay"\`. Seeking past the buffered section sends it back to \`"loading"\` — the spinner reappears automatically.

---

### 6. Progress Polling

\`player.currentTime\` is a native property — React cannot observe it changing. Putting it in a \`useEffect\` dependency array does nothing useful. The solution is a 250ms interval:

\`\`\`javascript
useEffect(() => {
  if (!isActive || !isPlaying) return  // only poll the active, playing video

  const interval = setInterval(() => {
    if (!isSeeking) setCurrentTime(player.currentTime ?? 0)
  }, 250)  // 4 updates/second — smooth enough for a scrubber

  return () => clearInterval(interval)  // cleanup when paused, inactive, or unmounted
}, [isActive, isPlaying, isSeeking, player])
\`\`\`

---

### 7. Double-Tap Detection

No \`setTimeout\` delay — single tap fires **immediately**:

\`\`\`javascript
const lastTap = useRef(0)  // useRef so updates don't trigger re-renders

const handleTap = () => {
  const now = Date.now()
  if (now - lastTap.current < 200) {
    triggerLike()       // second tap within 200ms = double tap
  } else {
    togglePlayPause()   // first tap = single tap, fires instantly
  }
  lastTap.current = now
}
\`\`\`

\`useRef\` is used instead of \`useState\` because updating the timestamp must not cause a re-render — it's only a memo value between taps.

---

### 8. Touch Events — \`onTouchEnd\` vs \`Pressable\`

\`Pressable\` and \`TouchableOpacity\` register as **responders** at \`touchstart\` — they claim ownership of the touch event. \`FlatList\` does the same to detect scrolling. Two components competing for the same touch produces the warning \`Cannot record touch end without a touch start\` and dropped taps.

\`onTouchEnd\` on a plain \`View\` is **passive** — it observes the event after it's settled, without competing for ownership:

\`\`\`javascript
// ❌ Competes with FlatList for touch ownership → dropped events + warnings
<Pressable onPress={handleTap}>

// ✅ Passive — FlatList scrolls freely, taps still register cleanly
<View onTouchEnd={handleTap}>
\`\`\`

---

### 9. \`removeClippedSubviews={false}\`

This FlatList prop must be \`false\`. When \`true\`, React Native destroys the native view of off-screen items to save memory. For a \`VideoView\`, destroying the native view kills the player's rendering surface — scrolling back to that video produces a black screen. Keeping it \`false\` means the surface stays alive and return visits are instant.

---

## VideoPlayer Events Summary

| Event | When it fires | Used for |
|---|---|---|
| \`statusChange\` | \`"idle"\` → \`"loading"\` → \`"readyToPlay"\` | Buffering spinner, reading duration |
| \`playingChange\` | Play / pause state changes | Controlling pause icon, polling gate |

---

## Data Flow

\`\`\`
FEED_VIDEOS[0..4]
       ↓
activeIndex (useState) — changes on scroll via onViewableItemsChanged
       ↓
useWindowedPlayers(activeIndex)
       ↓
  Map<index, VideoPlayer> — 3 players max
  • release players outside ±1 window
  • create players for new indexes in window
  • play current, pause prev and next
       ↓
getPlayer(index) → VideoPlayer | null
       ↓
FeedItem
  • null   →  FeedPlaceholder  (spinner + static author info)
  • real   →  FeedItemInner    (full interactive video + controls)
\`\`\`

---

## Android-Specific Notes

- \`surfaceType="textureView"\` on \`VideoView\` is required on Android. The default \`surfaceView\` causes a rendering bug where overlapping video surfaces render out of bounds when \`contentFit="cover"\`.
- \`nativeControls={false}\` must be set — native controls and custom React Native overlays compete for touch events on Android.

---

## Key Takeaways

- Never create one player per video — use a windowed pool of 3 with \`createVideoPlayer\`
- \`useVideoPlayer\` is a hook and obeys Rules of Hooks; \`createVideoPlayer\` is imperative and does not
- \`useCaching: true\` gives free disk caching with zero extra libraries
- Always guard \`useEvent\` / \`useEventListener\` hooks behind a null check — split into two components
- \`isBuffering\` must mirror \`player.status\` — never set it manually from scroll or navigation events
- \`player.currentTime\` is a native property; poll it with \`setInterval\`, never put it in \`useEffect\` deps
- \`onTouchEnd\` on a plain \`View\` is passive — it won't fight \`FlatList\` for touch ownership
- \`removeClippedSubviews={false}\` is mandatory — clipping destroys \`VideoView\` surfaces → black screen

> "The best feed is the one you forget is loading." — the goal of every preloading strategy
`;
