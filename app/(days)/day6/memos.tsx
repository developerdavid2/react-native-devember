import MemoItem from "@/components/core/day6/memos-list-item";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Memo = {
  uri: string;
  metering: number[];
};

export default function MemosScreen() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [activeMemoUri, setActiveMemoUri] = useState<string | null>(null);
  const [audioMetering, setAudioMetering] = useState<number[]>([]);

  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder, 50);

  const metering = useSharedValue(-160);
  const isRecordingValue = useSharedValue(false);

  useEffect(() => {
    (async () => {
      const dir = FileSystem.cacheDirectory + "Audio/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      await listRecordings();
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission denied", "Microphone access is required.");
        return;
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    })();
  }, []);

  useEffect(() => {
    if (recorderState.metering !== undefined && recorderState.metering > -160) {
      metering.value = recorderState.metering;
      setAudioMetering((cur) => [...cur, recorderState.metering!]);
    }
    isRecordingValue.value = recorderState.isRecording;
  }, [
    recorderState.metering,
    recorderState.isRecording,
    isRecordingValue,
    metering,
  ]);

  const record = async () => {
    try {
      setAudioMetering([]);
      setActiveMemoUri(null);
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      audioRecorder.record();
    } catch (err) {
      console.error("Recording failed to start:", err);
      await setAudioModeAsync({ allowsRecording: false });
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      const currentMetering = [...audioMetering];
      metering.value = -160;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (uri) {
        setMemos((existing) => [
          { uri, metering: currentMetering },
          ...existing,
        ]);
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  // only called on mount — old files have no metering data
  const listRecordings = async () => {
    const dir = FileSystem.cacheDirectory + "Audio/";
    const files = await FileSystem.readDirectoryAsync(dir);
    if (files.length === 0) return;

    const filesWithInfo = await Promise.all(
      files.map(async (file) => {
        const uri = dir + file;
        const info = await FileSystem.getInfoAsync(uri);
        return {
          uri,
          modificationTime: info.exists ? info.modificationTime : 0,
        };
      }),
    );

    const sorted = filesWithInfo
      .sort((a, b) => b.modificationTime - a.modificationTime)
      .map((f) => ({ uri: f.uri, metering: [] as number[] }));

    setMemos(sorted);
  };

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const animatedRecordButton = useAnimatedStyle(() => ({
    width: withTiming(isRecordingValue.value ? "60%" : "100%", {
      duration: 100,
    }),
    borderRadius: withTiming(isRecordingValue.value ? 5 : 35, {
      duration: 100,
    }),
  }));

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
      backgroundColor: `rgba(255, 45, 0, ${interpolate(
        metering.value,
        [-160, -60, -10],
        [0.7, 0.3, 0.7],
      )})`,
    };
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={memos}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <MemoItem
            uri={item.uri}
            metering={item.metering}
            activeMemoUri={activeMemoUri}
            setActiveMemoUri={setActiveMemoUri}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.footer}>
        <Text style={styles.duration}>
          {recorderState.isRecording
            ? formatDuration(recorderState.durationMillis)
            : " "}
        </Text>

        <View>
          <Animated.View style={[styles.recordWave, animatedRecordWave]} />
          <TouchableOpacity
            style={styles.recordButton}
            onPress={recorderState.isRecording ? stopRecording : record}
            activeOpacity={0.7}
          >
            <Animated.View style={[styles.redCircle, animatedRecordButton]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF0F1",
  },
  footer: {
    backgroundColor: "#fff",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    gap: 12,
  },
  duration: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e03816",
    height: 28,
    textAlign: "center",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "orangered",
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  recordWave: {
    position: "absolute",
    top: -20,
    bottom: -20,
    left: -20,
    right: -20,
    borderRadius: 1000,
    backgroundColor: "#e0381615",
    shadowColor: "#e03816",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  redCircle: {
    backgroundColor: "orangered",
    aspectRatio: 1,
    borderRadius: 35,
  },
});
