import { FontAwesome5 } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

interface MemoItemProps {
  uri: string;
  activeMemoUri: string | null;
  setActiveMemoUri: (uri: string | null) => void;
}

const SPEEDS = [1, 1.5, 2];

const MemoItem = ({ uri, activeMemoUri, setActiveMemoUri }: MemoItemProps) => {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const speedIndex = useRef(0);
  const progressShared = useSharedValue(0);
  const isActive = activeMemoUri === uri;

  // 1. Initialize Player Settings + preload duration
  useEffect(() => {
    if (player) {
      player.shouldCorrectPitch = true;
      player.volume = 1.0;
      player.seekTo(0); // forces metadata load — duration available immediately
    }
  }, [player]);

  // 2. If another memo starts playing, pause this one
  useEffect(() => {
    if (!isActive && status.playing) {
      player.pause();
    }
  }, [isActive, player, status.playing]);

  // 3. Clean Reset Logic
  useEffect(() => {
    if (status.playbackState === "ended") {
      player.pause();
      player.seekTo(0);
      if (isActive) {
        setActiveMemoUri(null);
      }
    }
  }, [status.playbackState, player, isActive, setActiveMemoUri]);

  useEffect(() => {
    if (!status.playing) return;

    const interval = setInterval(() => {
      const current = player.currentTime ?? 0; // read directly from player
      const duration = player.duration ?? 0;
      if (duration > 0) {
        progressShared.value = current / duration;
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [player.currentTime, player.duration, progressShared, status.playing]);

  useEffect(() => {
    if (!status.playing) {
      const duration = player.duration ?? 0;
      const current = player.currentTime ?? 0;
      progressShared.value = duration > 0 ? current / duration : 0;
    }
  }, [
    status.playing,
    status.currentTime,
    player.duration,
    player.currentTime,
    progressShared,
  ]);
  // 4. Playback Calculations
  const durationSeconds = status.duration ?? 0;
  const currentSeconds = status.currentTime ?? 0;

  const animateIndicatorStyle = useAnimatedStyle(() => ({
    left: `${progressShared.value * 100}%`, //  no withTiming needed — already smooth
  }));

  // 5. Interaction Handlers
  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
      setActiveMemoUri(uri);
    }
  };

  const handleSpeedToggle = () => {
    speedIndex.current = (speedIndex.current + 1) % SPEEDS.length;
    const newSpeed = SPEEDS[speedIndex.current];
    player.setPlaybackRate(newSpeed, "high");
  };

  const currentSpeed = SPEEDS[speedIndex.current];

  const formatDuration = (seconds: number) => {
    const totalSeconds = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {/* Play / Pause button */}
      <TouchableOpacity onPress={handlePlayPause} style={styles.playButtonMain}>
        {status.playing ? (
          <FontAwesome5 name={"pause"} size={20} color="gray" />
        ) : (
          <FontAwesome5 name={"play"} size={20} color="gray" />
        )}
      </TouchableOpacity>

      <View style={styles.playbackContainer}>
        {/* Progress Track */}
        <View style={styles.playbackBackground} />
        <Animated.View
          style={[styles.playbackIndicator, animateIndicatorStyle]}
        />
        <Text style={styles.durationText}>
          {status.playing
            ? formatDuration(currentSeconds)
            : formatDuration(durationSeconds)}
        </Text>
      </View>

      {/* Speed toggle */}
      <TouchableOpacity style={styles.speedButton} onPress={handleSpeedToggle}>
        <Text style={styles.speedText}>{currentSpeed}x</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginVertical: 5,
    marginHorizontal: 10,
    gap: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  playButtonMain: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playbackContainer: {
    flex: 1,
    height: 30,
    justifyContent: "center",
    position: "relative",
  },
  playbackBackground: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  playbackIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    position: "absolute",
    transform: [{ translateX: -6 }],
  },
  durationText: {
    position: "absolute",
    left: -5,
    bottom: -10,
    color: "gray",
    fontSize: 11,
  },
  speedButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  speedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4B5563",
  },
});

export default MemoItem;
