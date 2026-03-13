import { FeedVideo, formatCount } from "@/constants/days/day12";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEvent, useEventListener } from "expo";
import * as Haptics from "expo-haptics";
import { VideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");

interface FeedItemProps {
  video: FeedVideo;
  player: VideoPlayer | null;
  isActive: boolean;
}

// ─── Shell shown when player hasn't been created yet ─────────────────────────
// useEvent / useEventListener crash if passed null — they call .addListener()
// unconditionally on mount. So we never render the real component with a null
// player; we render this placeholder instead.
function FeedPlaceholder({ video }: { video: FeedVideo }) {
  return (
    <View style={styles.container}>
      <View style={styles.bufferOverlay}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
      {/* Keep the UI chrome visible so the screen doesn't look blank */}
      <View style={styles.gradient} pointerEvents="none" />
      <View style={styles.bottomLeft}>
        <View style={styles.authorRow}>
          <View style={[styles.avatar, { backgroundColor: video.avatar }]}>
            <Text style={styles.avatarText}>{video.author.charAt(0)}</Text>
          </View>
          <Text style={styles.authorName}>{video.author}</Text>
        </View>
        <Text style={styles.handle}>{video.handle}</Text>
        <Text style={styles.caption} numberOfLines={2}>
          {video.caption}
        </Text>
        <View style={styles.songRow}>
          <Ionicons name="musical-notes" size={13} color="#fff" />
          <Text style={styles.songText} numberOfLines={1}>
            {video.song}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Real component — only rendered when player is a valid VideoPlayer ────────
function FeedItemInner({
  video,
  player,
  isActive,
}: {
  video: FeedVideo;
  player: VideoPlayer; // guaranteed non-null here
  isActive: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [followed, setFollowed] = useState(false);
  const [muted, setMuted] = useState(false);
  // Initialize from real player status — if it's already cached and ready,
  // start as false so there's no spinner flash on first render
  const [isBuffering, setIsBuffering] = useState(
    player.status !== "readyToPlay",
  );
  const [showPausePlayIcon, setShowPausePlayIcon] = useState<"pause" | "play">(
    "play",
  );
  const [captionLines, setCaptionLines] = useState(2);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const pauseOpacity = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const captionExpanded = useRef(false);

  // ── Event listeners — safe because player is guaranteed non-null ──
  useEventListener(player, "statusChange", ({ status }) => {
    if (status === "readyToPlay") {
      setIsBuffering(false);
      setDuration(player.duration ?? 0);
    } else if (status === "loading") {
      setIsBuffering(true);
    }
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // ── Snap slider to correct position immediately on activation ──
  // Without this there's a race: the video starts playing from 0 but the
  // slider still shows the last position from the previous visit until the
  // 250ms poll fires. Syncing synchronously on isActive=true removes the jump.
  useEffect(() => {
    if (isActive) {
      setCurrentTime(player.currentTime ?? 0);
      setDuration(player.duration ?? 0);
    }
  }, [isActive, player]);

  // ── Progress polling while playing ──
  useEffect(() => {
    if (!isActive || !isPlaying) return;
    const interval = setInterval(() => {
      if (!isSeeking) {
        setCurrentTime(player.currentTime ?? 0);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isActive, isPlaying, isSeeking, player]);

  // ── Reset playhead UI when video leaves screen ──
  useEffect(() => {
    if (!isActive) {
      // Read directly from player — the pool seeks it to 0 on deactivation,
      // so this will be 0. But reading it (rather than hardcoding 0) means
      // we stay in sync even if the pool behaviour ever changes.
      setCurrentTime(player.currentTime ?? 0);
      setIsSeeking(false);
    }
  }, [isActive, player]);

  // ── Sync isBuffering with actual player status on mount / player change ──
  // When a cached video comes back into the window its status is already
  // "readyToPlay", so we should start with isBuffering=false.
  useEffect(() => {
    setIsBuffering(player.status !== "readyToPlay");
  }, [player]);

  // ── Sync mute ──
  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  const lastTap = useRef(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_MS = 200;
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      // Double tap — cancel pending single tap and trigger like immediately
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      triggerLike();
    } else {
      // Single tap — fire immediately with no delay
      togglePlayPause();
    }
    lastTap.current = now;
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
      setShowPausePlayIcon("pause");
      pauseOpacity.setValue(1);
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(pauseOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setShowPausePlayIcon("play"));
    } else {
      player.play();
      setShowPausePlayIcon("play");
      pauseOpacity.setValue(1);
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(pauseOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => setShowPausePlayIcon("pause"));
    }
  };

  const triggerLike = () => {
    const nowLiked = !liked;
    setLiked(nowLiked);
    setLikeCount((c) => (nowLiked ? c + 1 : c - 1));
    if (nowLiked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.sequence([
        Animated.spring(likeScale, { toValue: 1.4, useNativeDriver: true }),
        Animated.spring(likeScale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {/* Video — plain View with onTouchEnd avoids competing with FlatList
           scroll gestures. Pressable/TouchableX intercept touch start which
           confuses the responder system when FlatList claims the scroll. */}
      <View style={StyleSheet.absoluteFillObject} onTouchEnd={handleTap}>
        <VideoView
          style={StyleSheet.absoluteFillObject}
          player={player}
          nativeControls={false}
          contentFit="cover"
          surfaceType="textureView"
        />
      </View>

      {/* Buffering */}
      {isBuffering && (
        <View style={styles.bufferOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* Pause flash */}
      {showPausePlayIcon === "pause" && (
        <Animated.View
          style={[styles.centeredOverlay, { opacity: pauseOpacity }]}
          pointerEvents="none"
        >
          <Ionicons name="pause" size={64} color="rgba(255,255,255,0.85)" />
        </Animated.View>
      )}

      {showPausePlayIcon === "play" && (
        <Animated.View
          style={[styles.centeredOverlay, { opacity: pauseOpacity }]}
          pointerEvents="none"
        >
          <Ionicons name="play" size={64} color="rgba(255,255,255,0.85)" />
        </Animated.View>
      )}

      {/* Heart burst */}
      <Animated.View
        style={[
          styles.heartBurst,
          { opacity: heartOpacity, transform: [{ scale: heartScale }] },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="heart" size={100} color="#FF2D55" />
      </Animated.View>

      {/* Gradient */}
      <View style={styles.gradient} pointerEvents="none" />

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration > 0 ? duration : 1}
          value={currentTime}
          minimumTrackTintColor="#fff"
          maximumTrackTintColor="rgba(255,255,255,0.3)"
          thumbTintColor="#fff"
          onSlidingStart={() => {
            setIsSeeking(true);
            player.pause();
          }}
          onValueChange={(val) => setCurrentTime(val)}
          onSlidingComplete={(val) => {
            player.currentTime = val;
            setIsSeeking(false);
            player.play();
          }}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Bottom left */}
      <View style={styles.bottomLeft}>
        <View style={styles.authorRow}>
          <View style={[styles.avatar, { backgroundColor: video.avatar }]}>
            <Text style={styles.avatarText}>{video.author.charAt(0)}</Text>
          </View>
          <Text style={styles.authorName}>{video.author}</Text>
          {!followed ? (
            <TouchableOpacity
              style={styles.followBtn}
              onPress={() => {
                setFollowed(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.followingBadge}>
              <Text style={styles.followingBadgeText}>Following</Text>
            </View>
          )}
        </View>

        <Text style={styles.handle}>{video.handle}</Text>

        <TouchableOpacity
          onPress={() => {
            captionExpanded.current = !captionExpanded.current;
            setCaptionLines(captionExpanded.current ? 0 : 2);
          }}
          activeOpacity={0.9}
        >
          <Text style={styles.caption} numberOfLines={captionLines}>
            {video.caption}
          </Text>
          {captionLines === 2 && (
            <Text style={styles.captionMore}>...more</Text>
          )}
        </TouchableOpacity>

        <View style={styles.songRow}>
          <Ionicons name="musical-notes" size={13} color="#fff" />
          <Text style={styles.songText} numberOfLines={1}>
            {video.song}
          </Text>
        </View>
      </View>

      {/* Right sidebar */}
      <View style={styles.rightSide}>
        <View style={styles.actionItem}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <TouchableOpacity onPress={triggerLike}>
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={32}
                color={liked ? "#FF2D55" : "#fff"}
              />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.actionCount}>{formatCount(likeCount)}</Text>
        </View>

        <View style={styles.actionItem}>
          <TouchableOpacity>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{formatCount(video.comments)}</Text>
        </View>

        <View style={styles.actionItem}>
          <TouchableOpacity>
            <Ionicons name="arrow-redo-outline" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{formatCount(video.shares)}</Text>
        </View>

        <TouchableOpacity
          style={styles.muteBtn}
          onPress={() => setMuted((m) => !m)}
        >
          <Ionicons
            name={muted ? "volume-mute" : "volume-high"}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={[styles.disc, { backgroundColor: video.avatar }]}>
          <Ionicons name="musical-note" size={16} color="#fff" />
        </View>
      </View>
    </View>
  );
}

// ─── Public export — gates null player BEFORE hooks run ──────────────────────
export default function FeedItem({ video, player, isActive }: FeedItemProps) {
  if (!player) {
    return <FeedPlaceholder video={video} />;
  }
  return <FeedItemInner video={video} player={player} isActive={isActive} />;
}

const styles = StyleSheet.create({
  container: { width: W, height: H, backgroundColor: "#000" },
  bufferOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  centeredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  heartBurst: {
    position: "absolute",
    top: "35%",
    left: "50%",
    marginLeft: -50,
    marginTop: -50,
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.6,
    backgroundColor: "rgba(0,0,0,0.0)",
  },
  progressWrap: {
    position: "absolute",
    bottom: 155,
    left: 0,
    right: 0,
    paddingHorizontal: 4,
  },
  slider: { width: "100%", height: 24 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: -6,
  },
  timeText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "600",
  },
  bottomLeft: {
    position: "absolute",
    bottom: 90,
    left: 12,
    right: 80,
    gap: 6,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  authorName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  followBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  followingBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  followingBadgeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  handle: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "500" },
  caption: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  captionMore: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  songRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  songText: { color: "#fff", fontSize: 13, fontWeight: "500", opacity: 0.9 },
  rightSide: {
    position: "absolute",
    bottom: 90,
    right: 12,
    alignItems: "center",
    gap: 20,
  },
  actionItem: { alignItems: "center", gap: 4 },
  actionCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  muteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  disc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#222",
  },
});
