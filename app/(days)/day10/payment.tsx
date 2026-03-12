import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RelativePathString, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useBiometrics } from "./useBiometrics";
import PaymentPinModal from "./payment-pin-modal";

const STORAGE_KEY = "biometric_settings";

type TransactionState = "idle" | "authenticating" | "success" | "failed";

const MOCK_TRANSACTIONS = [
  {
    id: "1",
    label: "Buy Airtime",
    amount: "₦500.00",
    icon: "phone",
    color: "#6C63FF",
  },
  {
    id: "2",
    label: "Pay Electricity",
    amount: "₦3,500.00",
    icon: "bolt",
    color: "#F59E0B",
  },
  {
    id: "3",
    label: "Transfer Money",
    amount: "₦10,000.00",
    icon: "exchange-alt",
    color: "#10B981",
  },
  {
    id: "4",
    label: "Buy Data",
    amount: "₦1,000.00",
    icon: "wifi",
    color: "#3B82F6",
  },
];

export default function Payment() {
  const router = useRouter();
  const { capabilities, authenticateForPayment, authenticateSimple } =
    useBiometrics();
  const [_, setTxState] = useState<TransactionState>("idle");
  const [selectedTx, setSelectedTx] = useState<
    (typeof MOCK_TRANSACTIONS)[0] | null
  >(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinWarning, setPinWarning] = useState("");
  const [paymentBiometricEnabled, setPaymentBiometricEnabled] = useState(false);
  const [lastAction, setLastAction] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // seed defaults so subsequent reads always find something
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            appLockEnabled: false,
            paymentBiometricEnabled: false,
            autoLockEnabled: false,
          }),
        );
        return;
      }
      const s = JSON.parse(stored);
      console.log(stored);
      setPaymentBiometricEnabled(s.paymentBiometricEnabled ?? false);
    };
    loadSettings();
  }, [setPaymentBiometricEnabled]);

  const handleTransaction = async (tx: (typeof MOCK_TRANSACTIONS)[0]) => {
    setSelectedTx(tx);
    setTxState("authenticating");
    setPinWarning("");

    // If payment biometrics is ON → try biometrics first, fallback to custom PIN
    if (
      paymentBiometricEnabled &&
      capabilities.hasHardware &&
      capabilities.isEnrolled
    ) {
      const result = await authenticateForPayment(tx.amount);

      if (result.success) {
        setTxState("success");
        setLastAction(
          `${tx.label} of ${tx.amount} confirmed via ${capabilities.label}`,
        );
        setTimeout(() => setTxState("idle"), 3000);
        return;
      }

      // user tapped "Use Payment PIN" OR lockout → show our custom PIN
      if (result.error === "user_fallback") {
        setPinWarning(result.warning ?? "");
        setTxState("idle");
        setShowPinModal(true);
        return;
      }

      // Other errors
      setTxState("failed");
      setLastAction(`❌ ${tx.label} authentication failed`);
      setTimeout(() => setTxState("idle"), 2000);
      return;
    }

    // Payment biometrics OFF → go straight to payment PIN
    setTxState("idle");
    setShowPinModal(true);
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    setTxState("success");
    setLastAction(
      `✅ ${selectedTx?.label} of ${selectedTx?.amount} confirmed via Payment PIN`,
    );
    setTimeout(() => setTxState("idle"), 3000);
  };

  // Demo: view "secret info" screen (app lock scenario)
  const handleViewSecret = async () => {
    const result = await authenticateSimple(
      "Verify your identity to view secret info",
    );
    if (result.success) {
      Alert.alert(
        "🔓 Secret Unlocked!",
        "Your secret info:\n\nAccount: ****4321\nBalance: ₦420,690.00",
      );
    } else if (result.warning === "lockout") {
      Alert.alert("Locked Out", result.error);
    } else {
      Alert.alert("Access Denied", result.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.name}>Biometrics Demo</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/(days)/day10/settings" as any)}
        >
          <Ionicons name="settings-outline" size={22} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      {/* Biometric Status Banner */}
      <View
        style={[
          styles.banner,
          !capabilities.hasHardware && styles.bannerWarning,
        ]}
      >
        <View style={styles.bannerIcon}>
          {capabilities.primaryType === "facial" ? (
            <MaterialCommunityIcons
              name="face-recognition"
              size={22}
              color={capabilities.hasHardware ? "#6C63FF" : "#F59E0B"}
            />
          ) : (
            <Ionicons
              name="finger-print"
              size={22}
              color={capabilities.hasHardware ? "#6C63FF" : "#F59E0B"}
            />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>
            {capabilities.hasHardware
              ? `${capabilities.label} ${capabilities.isEnrolled ? "Ready" : "Not Enrolled"}`
              : "No Biometric Hardware"}
          </Text>
          <Text style={styles.bannerSub}>
            {paymentBiometricEnabled && capabilities.isEnrolled
              ? `Payments use ${capabilities.label} → PIN fallback`
              : "Payments use Payment PIN only"}
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                capabilities.hasHardware && capabilities.isEnrolled
                  ? paymentBiometricEnabled
                    ? "#10B981"
                    : "#6C63FF"
                  : "#F59E0B",
            },
          ]}
        />
      </View>

      {/* Last action feedback */}
      {lastAction !== "" && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{lastAction}</Text>
        </View>
      )}

      {/* Payments Section */}
      <Text style={styles.sectionTitle}>Quick Payments</Text>
      <Text style={styles.sectionHint}>
        {paymentBiometricEnabled && capabilities.isEnrolled
          ? `Tap a payment → ${capabilities.label} prompt → or tap "Use Payment PIN"`
          : "Tap a payment → enter your 6-digit Payment PIN"}
      </Text>

      <View style={styles.txGrid}>
        {MOCK_TRANSACTIONS.map((tx) => (
          <TouchableOpacity
            key={tx.id}
            style={styles.txCard}
            onPress={() => handleTransaction(tx)}
            activeOpacity={0.75}
          >
            <View style={[styles.txIcon, { backgroundColor: tx.color + "18" }]}>
              <FontAwesome5 name={tx.icon as any} size={20} color={tx.color} />
            </View>
            <Text style={styles.txLabel}>{tx.label}</Text>
            <Text style={styles.txAmount}>{tx.amount}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* App Lock Scenario */}
      <Text style={styles.sectionTitle}>App Lock Demo</Text>

      <TouchableOpacity style={styles.secretCard} onPress={handleViewSecret}>
        <View style={styles.secretLeft}>
          <View style={styles.secretIcon}>
            <Ionicons name="eye-off-outline" size={22} color="#6C63FF" />
          </View>
          <View>
            <Text style={styles.secretTitle}>View Secret Info</Text>
            <Text style={styles.secretSub}>
              Requires{" "}
              {capabilities.isEnrolled ? capabilities.label : "device PIN"} to
              unlock
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Settings shortcut */}
      <TouchableOpacity
        style={styles.settingsShortcut}
        onPress={() => router.push("/(days)/day10/settings" as any)}
      >
        <Ionicons name="shield-checkmark-outline" size={20} color="#6C63FF" />
        <Text style={styles.settingsShortcutText}>
          Manage Biometric Settings
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Settings shortcut */}
      <TouchableOpacity
        style={styles.settingsShortcut}
        onPress={() =>
          router.push("/(days)/day10/protected" as RelativePathString)
        }
      >
        <Ionicons name="shield-checkmark-outline" size={20} color="#6C63FF" />
        <Text style={styles.settingsShortcutText}>Protected Area</Text>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      {/* PIN Modal */}
      <PaymentPinModal
        visible={showPinModal}
        amount={selectedTx?.amount}
        title={selectedTx?.label ?? "Enter Payment PIN"}
        subtitle={pinWarning || undefined}
        onSuccess={handlePinSuccess}
        onCancel={() => {
          setShowPinModal(false);
          setLastAction(`❌ ${selectedTx?.label} cancelled`);
          setTimeout(() => setLastAction(""), 2000);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F7FF" },
  content: { padding: 16, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: { fontSize: 13, color: "#6B7280", marginBottom: 2 },
  name: { fontSize: 22, fontWeight: "800", color: "#111827" },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE9FE",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  bannerWarning: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  bannerSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  feedbackBanner: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  feedbackText: {
    fontSize: 13,
    color: "#065F46",
    fontWeight: "500",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
    marginLeft: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 12,
    marginLeft: 4,
  },

  txGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  txCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8,
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  txLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  txAmount: { fontSize: 16, fontWeight: "800", color: "#111827" },

  secretCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  secretLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  secretIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  secretTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  secretSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  settingsShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  settingsShortcutText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#6C63FF",
  },
});
