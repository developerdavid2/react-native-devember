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
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function MemosScreen() {
  const [memos, setMemos] = useState<string[]>([]);
  const [activeMemoUri, setActiveMemoUri] = useState<string | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  // 1. Initial Setup: Permissions & Directory Check
  useEffect(() => {
    (async () => {
      // Ensure the "Audio" directory exists so recording doesn't crash
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

      // Initial mode: Playback only
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });
    })();
  }, []);

  // 2. The Fixed Record Function
  const record = async () => {
    try {
      // Stop any active player to release audio focus
      setActiveMemoUri(null);

      // Switch to Recording Mode
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error("Recording failed to start:", err);
      // Fallback: reset mode so speakers work again
      await setAudioModeAsync({ allowsRecording: false });
    }
  };

  // 3. The Fixed Stop Function
  const stopRecording = async () => {
    try {
      await audioRecorder.stop();

      // CRITICAL: Switch back to playback mode so the "Play" buttons work
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      await listRecordings();
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  // 4. Listing & Sorting Logic
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

    // Keep your exact sorting logic
    const sorted = filesWithInfo
      .sort((a, b) => b.modificationTime - a.modificationTime)
      .map((f) => f.uri);

    setMemos(sorted);
  };

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(recorderState.isRecording ? 40 : 50, { duration: 100 }),
    height: withTiming(recorderState.isRecording ? 40 : 50, { duration: 100 }),
    borderRadius: withTiming(recorderState.isRecording ? 10 : 50, {
      duration: 100,
    }),
  }));

  return (
    <View style={styles.container}>
      <FlatList
        data={memos}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <MemoItem
            uri={item}
            activeMemoUri={activeMemoUri}
            setActiveMemoUri={setActiveMemoUri}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={recorderState.isRecording ? stopRecording : record}
          activeOpacity={0.5}
        >
          <View style={styles.recordButton}>
            <Animated.View
              style={[{ backgroundColor: "#e03816" }, animatedStyle]}
            />
          </View>
        </TouchableOpacity>

        {recorderState.isRecording && (
          <Text style={styles.duration}>
            {formatDuration(recorderState.durationMillis)}
          </Text>
        )}
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
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#e03816",
    justifyContent: "center",
    alignItems: "center",
  },
  duration: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "700",
    color: "#e03816",
  },
});
