import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBiometrics } from "./useBiometrics";

const STORAGE_KEY = "biometric_settings";

interface BiometricSettings {
  appLockEnabled: boolean;
  paymentBiometricEnabled: boolean;
  autoLockEnabled: boolean;
}

const defaultSettings: BiometricSettings = {
  appLockEnabled: false,
  paymentBiometricEnabled: false,
  autoLockEnabled: false,
};

export default function BiometricSettingsScreen() {
  const { capabilities, loading, checkCapabilities } = useBiometrics();
  const [settings, setSettings] = useState<BiometricSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(defaultSettings),
        );
        setSettings(defaultSettings);
        return;
      }

      setSettings(JSON.parse(stored));
    };
    loadSettings();
  }, [setSettings]);

  const saveSettings = async (newSettings: BiometricSettings) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Toggling requires the user to verify biometrics first (so someone can't just turn it off)
  const handleToggle = async (key: keyof BiometricSettings, value: boolean) => {
    if (!capabilities.hasHardware) {
      Alert.alert(
        "Not Available",
        "This device does not have biometric hardware.",
      );
      return;
    }

    if (!capabilities.isEnrolled) {
      Alert.alert(
        `No ${capabilities.label} Enrolled`,
        `Please set up ${capabilities.label} in your device settings first.`,
        [{ text: "OK" }],
      );
      return;
    }

    setSaving(true);
    // Always authenticate before changing security settings
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: value
        ? `Enable ${getSettingLabel(key)}`
        : `Disable ${getSettingLabel(key)}`,
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });

    setSaving(false);

    if (result.success) {
      const updated = { ...settings, [key]: value };
      setSettings(updated);
      await saveSettings(updated);
    } else {
      Alert.alert(
        "Authentication Required",
        "Please verify your identity to change security settings.",
      );
    }
  };

  const getSettingLabel = (key: keyof BiometricSettings): string => {
    const labels: Record<keyof BiometricSettings, string> = {
      appLockEnabled: `${capabilities.label} App Lock`,
      paymentBiometricEnabled: `${capabilities.label} for Payments`,
      autoLockEnabled: "Auto-Lock",
    };
    return labels[key];
  };

  // Icon per biometric type
  const BiometricIcon = () => {
    if (capabilities.primaryType === "facial") {
      return (
        <MaterialCommunityIcons
          name="face-recognition"
          size={28}
          color="#6C63FF"
        />
      );
    }
    if (capabilities.primaryType === "iris") {
      return (
        <MaterialCommunityIcons name="eye-outline" size={28} color="#6C63FF" />
      );
    }
    return <Ionicons name="finger-print" size={28} color="#6C63FF" />;
  };

  const SecurityLevelBadge = () => {
    const levels: Record<number, { label: string; color: string }> = {
      [LocalAuthentication.SecurityLevel.NONE]: {
        label: "None",
        color: "#EF4444",
      },
      [LocalAuthentication.SecurityLevel.SECRET]: {
        label: "PIN/Pattern",
        color: "#F59E0B",
      },
      [LocalAuthentication.SecurityLevel.BIOMETRIC_WEAK]: {
        label: "Weak Biometric",
        color: "#3B82F6",
      },
      [LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG]: {
        label: "Strong Biometric",
        color: "#10B981",
      },
    };
    const level = levels[capabilities.securityLevel] ?? {
      label: "Unknown",
      color: "#6B7280",
    };
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: level.color + "20", borderColor: level.color },
        ]}
      >
        <View style={[styles.badgeDot, { backgroundColor: level.color }]} />
        <Text style={[styles.badgeText, { color: level.color }]}>
          {level.label}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Checking device capabilities...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Device Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <BiometricIcon />
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{capabilities.label}</Text>
            <SecurityLevelBadge />
          </View>
          <TouchableOpacity
            onPress={checkCapabilities}
            style={styles.refreshBtn}
          >
            <Ionicons name="refresh" size={18} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusGrid}>
          <StatusItem
            icon={
              capabilities.hasHardware ? "checkmark-circle" : "close-circle"
            }
            color={capabilities.hasHardware ? "#10B981" : "#EF4444"}
            label="Hardware"
            value={capabilities.hasHardware ? "Available" : "Not found"}
          />
          <StatusItem
            icon={capabilities.isEnrolled ? "checkmark-circle" : "close-circle"}
            color={capabilities.isEnrolled ? "#10B981" : "#EF4444"}
            label="Enrolled"
            value={capabilities.isEnrolled ? "Yes" : "Not set up"}
          />
        </View>

        {/* Supported types */}
        {capabilities.supportedTypes.length > 0 && (
          <View style={styles.typesRow}>
            <Text style={styles.typesLabel}>Supported methods: </Text>
            {capabilities.supportedTypes.map((t) => (
              <View key={t} style={styles.typeChip}>
                <Text style={styles.typeChipText}>
                  {t === LocalAuthentication.AuthenticationType.FINGERPRINT &&
                    "Fingerprint"}
                  {t ===
                    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION &&
                    "Face ID"}
                  {t === LocalAuthentication.AuthenticationType.IRIS && "Iris"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!capabilities.hasHardware && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={16} color="#F59E0B" />
            <Text style={styles.warningText}>
              This device has no biometric hardware. All toggles are disabled.
            </Text>
          </View>
        )}

        {capabilities.hasHardware && !capabilities.isEnrolled && (
          <View style={styles.warningBanner}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#3B82F6"
            />
            <Text style={styles.warningText}>
              No {capabilities.label} enrolled. Go to device Settings → Security
              to set up.
            </Text>
          </View>
        )}
      </View>

      {/* Settings Toggles */}
      <Text style={styles.sectionTitle}>Security Settings</Text>

      <View style={styles.settingsCard}>
        <SettingRow
          icon={
            <Ionicons name="lock-closed-outline" size={22} color="#6C63FF" />
          }
          title={`${capabilities.label} App Lock`}
          subtitle="Require biometric verification to open the app"
          value={settings.appLockEnabled}
          disabled={
            !capabilities.hasHardware || !capabilities.isEnrolled || saving
          }
          onToggle={(v) => handleToggle("appLockEnabled", v)}
        />

        <View style={styles.divider} />

        <SettingRow
          icon={
            <FontAwesome5 name="money-bill-wave" size={18} color="#10B981" />
          }
          title={`${capabilities.label} for Payments`}
          subtitle="Confirm transactions with your biometrics instead of payment PIN"
          value={settings.paymentBiometricEnabled}
          disabled={
            !capabilities.hasHardware || !capabilities.isEnrolled || saving
          }
          onToggle={(v) => handleToggle("paymentBiometricEnabled", v)}
        />

        <View style={styles.divider} />

        <SettingRow
          icon={<Ionicons name="timer-outline" size={22} color="#F59E0B" />}
          title="Auto-Lock After Inactivity"
          subtitle="Lock app after 30 seconds of inactivity"
          value={settings.autoLockEnabled}
          disabled={
            !capabilities.hasHardware || !capabilities.isEnrolled || saving
          }
          onToggle={(v) => handleToggle("autoLockEnabled", v)}
        />
      </View>

      <Text style={styles.footnote}>
        Changing any security setting requires biometric verification to prevent
        unauthorized changes.
      </Text>
    </ScrollView>
  );
}

// Sub-components
const StatusItem = ({
  icon,
  color,
  label,
  value,
}: {
  icon: string;
  color: string;
  label: string;
  value: string;
}) => (
  <View style={styles.statusItem}>
    <Ionicons name={icon as any} size={20} color={color} />
    <Text style={styles.statusItemLabel}>{label}</Text>
    <Text style={[styles.statusItemValue, { color }]}>{value}</Text>
  </View>
);

const SettingRow = ({
  icon,
  title,
  subtitle,
  value,
  disabled,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  disabled: boolean;
  onToggle: (v: boolean) => void;
}) => (
  <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
    <View style={styles.settingIcon}>{icon}</View>
    <View style={styles.settingText}>
      <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
        {title}
      </Text>
      <Text style={styles.settingSubtitle}>{subtitle}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ false: "#E5E7EB", true: "#A78BFA" }}
      thumbColor={value ? "#6C63FF" : "#9CA3AF"}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F7FF" },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: "#6B7280", fontSize: 14 },

  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  statusInfo: { flex: 1, gap: 6 },
  statusTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "600" },

  statusGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statusItem: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statusItemLabel: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  statusItemValue: { fontSize: 12, fontWeight: "600" },

  typesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  typesLabel: { fontSize: 12, color: "#6B7280" },
  typeChip: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeChipText: { fontSize: 11, color: "#6C63FF", fontWeight: "600" },

  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: { flex: 1, fontSize: 12, color: "#92400E" },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
  },

  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  settingRowDisabled: { opacity: 0.45 },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: { flex: 1 },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingSubtitle: { fontSize: 12, color: "#6B7280", lineHeight: 16 },
  disabledText: { color: "#9CA3AF" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginHorizontal: 16 },

  footnote: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});
