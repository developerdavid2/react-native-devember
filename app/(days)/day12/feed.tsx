import FeedItem from "@/components/core/day12/feed-item";
import { FEED_VIDEOS } from "@/constants/days/day12";
import { Ionicons } from "@expo/vector-icons";
import { createVideoPlayer, VideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const { height: H } = Dimensions.get("window");

/**
 * WINDOWED PLAYER POOL — 3 players max, regardless of feed size
 * ─────────────────────────────────────────────────────────────
 * Why not useVideoPlayer in a loop or useFeedPlayers()?
 *  - Hooks must be called unconditionally — no loops, no dynamic counts
 *  - Creating 1000 players upfront would exhaust memory and decoders
 *  - createVideoPlayer() gives us imperative control with manual lifecycle
 *
 * The pool keeps:
 *  - players[activeIndex - 1]  → prev  (paused, loaded)
 *  - players[activeIndex]      → current (playing)
 *  - players[activeIndex + 1]  → next  (buffering silently)
 *
 * When you scroll, players outside the ±1 window are .release()d.
 * Players inside get promoted (prev↔current↔next) without re-creating
 * them if they're already loaded — this is why scrolling back is instant.
 */
function useWindowedPlayers(activeIndex: number) {
  // Map of videoIndex → VideoPlayer instance
  const poolRef = useRef<Map<number, VideoPlayer>>(new Map());
  // Trigger re-render so FeedItem gets the updated player ref
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const pool = poolRef.current;
    const total = FEED_VIDEOS.length;

    // Indexes that should be alive
    const keep = new Set<number>();
    if (activeIndex > 0) keep.add(activeIndex - 1);
    keep.add(activeIndex);
    if (activeIndex < total - 1) keep.add(activeIndex + 1);

    // Release players that fell out of the window
    for (const [idx, player] of pool.entries()) {
      if (!keep.has(idx)) {
        player.release();
        pool.delete(idx);
      }
    }

    // Create players for indexes in the window that don't have one yet
    for (const idx of keep) {
      if (!pool.has(idx)) {
        const p = createVideoPlayer({
          uri: FEED_VIDEOS[idx].uri,
          useCaching: true,
        });
        p.loop = true;
        pool.set(idx, p);
      }
    }

    // Play current, pause everything else
    for (const [idx, player] of pool.entries()) {
      if (idx === activeIndex) {
        player.play();
      } else {
        player.pause();
        // Don't reset currentTime — resume from where it was paused
      }
    }

    // Notify FeedItems that pool changed
    setTick((t) => t + 1);
  }, [activeIndex]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      for (const player of poolRef.current.values()) {
        player.release();
      }
      poolRef.current.clear();
    };
  }, []);

  const getPlayer = useCallback(
    (index: number): VideoPlayer | null => {
      return poolRef.current.get(index) ?? null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick], // re-evaluate when pool changes
  );

  return { getPlayer };
}

export default function TikTokFeed() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"following" | "for-you">(
    "for-you",
  );
  const flatListRef = useRef<FlatList>(null);

  const { getPlayer } = useWindowedPlayers(activeIndex);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index ?? 0;
        setActiveIndex(newIndex);
      }
    },
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof FEED_VIDEOS)[0]; index: number }) => {
      const player = getPlayer(index);
      return (
        <FeedItem
          video={item}
          player={player}
          isActive={index === activeIndex}
        />
      );
    },
    [activeIndex, getPlayer],
  );

  const keyExtractor = useCallback(
    (item: (typeof FEED_VIDEOS)[0]) => `video-${item.id}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: H,
      offset: H * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <FlatList
        ref={flatListRef}
        data={FEED_VIDEOS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={H}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        windowSize={3}
        maxToRenderPerBatch={1}
        initialNumToRender={1}
        // Must be false — clipping destroys VideoView surfaces → black screen
        removeClippedSubviews={false}
      />

      {/* ── TOP NAV ── */}
      <View style={styles.topNav} pointerEvents="box-none">
        <TouchableOpacity style={styles.liveBtn}>
          <Ionicons name="radio-outline" size={18} color="#fff" />
          <Text style={styles.liveBtnText}>LIVE</Text>
        </TouchableOpacity>

        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("following")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "following" && styles.tabTextActive,
              ]}
            >
              Following
            </Text>
            {activeTab === "following" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab("for-you")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "for-you" && styles.tabTextActive,
              ]}
            >
              For You
            </Text>
            {activeTab === "for-you" && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM NAV ── */}
      <View style={styles.bottomNav} pointerEvents="box-none">
        <NavItem icon="home" label="Home" active />
        <NavItem icon="compass-outline" label="Discover" />
        <TouchableOpacity style={styles.plusBtn}>
          <View style={styles.plusBtnInner}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
        </TouchableOpacity>
        <NavItem icon="notifications-outline" label="Inbox" />
        <NavItem icon="person-outline" label="Profile" />
      </View>
    </View>
  );
}

const NavItem = ({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <TouchableOpacity style={styles.navItem}>
    <Ionicons
      name={icon as any}
      size={24}
      color={active ? "#fff" : "rgba(255,255,255,0.55)"}
    />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  topNav: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  liveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  liveBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  tabs: { flexDirection: "row", gap: 20 },
  tabText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingBottom: 4,
  },
  tabTextActive: { color: "#fff", fontWeight: "800" },
  tabIndicator: {
    height: 2,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 1,
    marginTop: 2,
  },
  searchBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  navItem: { alignItems: "center", gap: 3, flex: 1 },
  navLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: "500",
  },
  navLabelActive: { color: "#fff", fontWeight: "700" },
  plusBtn: { flex: 1, alignItems: "center" },
  plusBtnInner: {
    width: 44,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FF2D55",
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderLeftColor: "#00F2EA",
    borderRightColor: "#FF2D55",
  },
});
