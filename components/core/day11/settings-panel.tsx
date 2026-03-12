import { Ionicons } from "@expo/vector-icons";
import { VideoQuality } from "expo-camera";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { VIDEO_QUALITY_OPTIONS } from "./types";

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  // settings state
  videoQuality: VideoQuality;
  setVideoQuality: (q: VideoQuality) => void;
  enableTorch: boolean;
  setEnableTorch: (v: boolean) => void;
  mirror: boolean;
  setMirror: (v: boolean) => void;
  mute: boolean;
  setMute: (v: boolean) => void;
  animateShutter: boolean;
  setAnimateShutter: (v: boolean) => void;
  ratio: string;
  setRatio: (r: string) => void;
}

const RATIOS = ["16:9", "4:3", "1:1"];

export default function SettingsPanel({
  visible,
  onClose,
  videoQuality,
  setVideoQuality,
  enableTorch,
  setEnableTorch,
  mirror,
  setMirror,
  mute,
  setMute,
  animateShutter,
  setAnimateShutter,
  ratio,
  setRatio,
}: SettingsPanelProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.panel}>
        {/* Handle */}
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Camera Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Video Quality */}
          <SectionTitle label="Video Quality" />
          <View style={styles.chipRow}>
            {VIDEO_QUALITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  videoQuality === opt.value && styles.chipActive,
                ]}
                onPress={() => setVideoQuality(opt.value)}
              >
                <Text
                  style={[
                    styles.chipText,
                    videoQuality === opt.value && styles.chipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Aspect Ratio */}
          <SectionTitle label="Aspect Ratio" />
          <View style={styles.chipRow}>
            {RATIOS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, ratio === r && styles.chipActive]}
                onPress={() => setRatio(r)}
              >
                <Text
                  style={[
                    styles.chipText,
                    ratio === r && styles.chipTextActive,
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Toggle settings */}
          <SectionTitle label="Options" />

          <ToggleRow
            label="Torch"
            icon="flashlight"
            value={enableTorch}
            onToggle={setEnableTorch}
          />
          <ToggleRow
            label="Mirror Front Camera"
            icon="camera-reverse"
            value={mirror}
            onToggle={setMirror}
          />
          <ToggleRow
            label="Mute Video"
            icon="mic-off"
            value={mute}
            onToggle={setMute}
          />
          <ToggleRow
            label="Shutter Animation"
            icon="aperture"
            value={animateShutter}
            onToggle={setAnimateShutter}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const SectionTitle = ({ label }: { label: string }) => (
  <Text style={styles.sectionTitle}>{label}</Text>
);

const ToggleRow = ({
  label,
  icon,
  value,
  onToggle,
}: {
  label: string;
  icon: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleLeft}>
      <Ionicons name={icon as any} size={18} color="#aaa" />
      <Text style={styles.toggleLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#333", true: "#FFD60A" }}
      thumbColor={value ? "#fff" : "#666"}
    />
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  panel: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "70%",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#444",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#666",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#333",
  },
  chipActive: {
    backgroundColor: "#FFD60A",
    borderColor: "#FFD60A",
  },
  chipText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#000",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLabel: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "500",
  },
});
