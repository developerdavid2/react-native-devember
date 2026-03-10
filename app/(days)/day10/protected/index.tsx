import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function ProtectedScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.unlockedBadge}>
        <Ionicons name="shield-checkmark" size={20} color="#10B981" />
        <Text style={styles.unlockedText}>Identity Verified</Text>
      </View>

      <Text style={styles.title}>🔓 Protected Area</Text>
      <Text style={styles.subtitle}>
        You successfully passed biometric verification!
      </Text>

      <View style={styles.card}>
        <Row label="Account Number" value="****  ****  4321" />
        <Row label="Balance" value="₦420,690.00" highlight />
        <Row label="BVN" value="*****3456" />
        <Row label="Card PIN" value="• • • •" />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={16} color="#3B82F6" />
        <Text style={styles.infoText}>
          This screen is only accessible after biometric verification via the
          protected layout gate. Re-entering requires re-authentication.
        </Text>
      </View>
    </View>
  );
}

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
    padding: 20,
    paddingTop: 80,
  },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  unlockedText: { fontSize: 13, fontWeight: "700", color: "#065F46" },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowLabel: { fontSize: 13, color: "#6B7280" },
  rowValue: { fontSize: 15, fontWeight: "600", color: "#1F2937" },
  rowValueHighlight: { color: "#6C63FF", fontSize: 18, fontWeight: "800" },

  infoBox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoText: { flex: 1, fontSize: 12, color: "#1E40AF", lineHeight: 18 },
});
