import { FontAwesome5 } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

interface MemoItemProps {
  uri: string;
  activeMemoUri: string | null;
  metering: number[];
  setActiveMemoUri: (uri: string | null) => void;
}

const SPEEDS = [1, 1.5, 2];
const NUM_LINES = 50;

const MemoItem = ({
  uri,
  activeMemoUri,
  setActiveMemoUri,
  metering,
}: MemoItemProps) => {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const speedIndex = useRef(0);
  const progressShared = useSharedValue(0);
  const isActive = activeMemoUri === uri;

  useEffect(() => {
    if (player) {
      player.shouldCorrectPitch = true;
      player.volume = 1.0;
      player.seekTo(0);
    }
  }, [player]);

  useEffect(() => {
    if (!isActive && status.playing) {
      player.pause();
    }
  }, [isActive, player, status.playing]);

  useEffect(() => {
    if (status.playbackState === "ended") {
      player.pause();
      player.seekTo(0);
      if (isActive) setActiveMemoUri(null);
    }
  }, [status.playbackState, player, isActive, setActiveMemoUri]);

  useEffect(() => {
    if (!status.playing) return;
    const interval = setInterval(() => {
      const current = player.currentTime ?? 0;
      const duration = player.duration ?? 0;
      if (duration > 0) progressShared.value = current / duration;
    }, 16);
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

  const durationSeconds = status.duration ?? 0;
  const currentSeconds = status.currentTime ?? 0;
  const progress = durationSeconds > 0 ? currentSeconds / durationSeconds : 0;

  const lines = Array.from({ length: NUM_LINES }, (_, i) => {
    const meteringIndex = Math.floor((i * metering.length) / NUM_LINES);
    const nextMeteringIndex = Math.ceil(
      ((i + 1) * metering.length) / NUM_LINES,
    );
    const values = metering.slice(meteringIndex, nextMeteringIndex);
    return values.length > 0
      ? values.reduce((sum, a) => sum + a, 0) / values.length
      : -50; // fallback for old recordings
  });

  const animateIndicatorStyle = useAnimatedStyle(() => ({
    left: `${progressShared.value * 100}%`,
  }));

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
    player.setPlaybackRate(SPEEDS[speedIndex.current], "high");
  };

  const formatDuration = (seconds: number) => {
    const totalSeconds = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlayPause} style={styles.playButtonMain}>
        {status.playing ? (
          <FontAwesome5 name="pause" size={20} color="gray" />
        ) : (
          <FontAwesome5 name="play" size={20} color="gray" />
        )}
      </TouchableOpacity>

      <View style={styles.playbackContainer}>
        <View style={styles.wave}>
          {lines.map((db, index) => (
            <View
              key={index}
              style={[
                styles.waveLine,
                {
                  height: interpolate(db, [-50, -10], [5, 50], "clamp"),
                  backgroundColor:
                    progress > index / NUM_LINES ? "#3B82F6" : "gainsboro",
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[styles.playbackIndicator, animateIndicatorStyle]}
        />

        <Text style={styles.durationText}>
          {status.playing
            ? formatDuration(currentSeconds)
            : formatDuration(durationSeconds)}
        </Text>
      </View>

      <TouchableOpacity style={styles.speedButton} onPress={handleSpeedToggle}>
        <Text style={styles.speedText}>{SPEEDS[speedIndex.current]}x</Text>
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
    height: 60,
    justifyContent: "center",
    position: "relative",
  },
  playbackIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    position: "absolute",
    transform: [{ translateX: -6 }],
  },
  wave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  waveLine: {
    flex: 1,
    borderRadius: 20,
  },
  durationText: {
    position: "absolute",
    right: 0,
    bottom: 0,
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
