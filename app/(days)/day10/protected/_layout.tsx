import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Slot, useRouter } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBiometrics } from "../useBiometrics";

type GateState = "checking" | "locked" | "unlocked" | "no_biometric";

export default function BiometricProtectedLayout() {
  const router = useRouter();
  const { capabilities, loading, authenticateSimple } = useBiometrics();
  const [gateState, setGateState] = useState<GateState>("checking");
  const [authError, setAuthError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const triggerAuth = useCallback(
    () => async () => {
      setAuthError("");
      const result = await authenticateSimple(
        "Verify your identity to access this area",
      );

      if (result.success) {
        setGateState("unlocked");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setAuthError(result.error ?? "Authentication failed");
      }
    },
    [attempts, authenticateSimple],
  );

  useEffect(() => {
    if (!loading) {
      if (!capabilities.hasHardware || !capabilities.isEnrolled) {
        setGateState("no_biometric");
      } else {
        setGateState("locked");
        // Auto-trigger on mount
        triggerAuth();
      }
    }
  }, [loading, capabilities.hasHardware, capabilities.isEnrolled, triggerAuth]);

  useEffect(() => {
    if (gateState === "locked" || gateState === "no_biometric") {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }, [fadeAnim, gateState, scaleAnim]);

  if (loading || gateState === "checking") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.checkingText}>Checking security...</Text>
      </View>
    );
  }

  if (gateState === "unlocked") {
    return <Slot />;
  }

  // LOCKED or NO_BIOMETRIC gate screen
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#6B7280" />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.gateContent,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          {gateState === "no_biometric" ? (
            <Ionicons name="lock-closed" size={48} color="#6B7280" />
          ) : capabilities.primaryType === "facial" ? (
            <MaterialCommunityIcons
              name="face-recognition"
              size={48}
              color="#6C63FF"
            />
          ) : (
            <Ionicons name="finger-print" size={56} color="#6C63FF" />
          )}
        </View>

        <Text style={styles.gateTitle}>
          {gateState === "no_biometric"
            ? "Biometrics Not Available"
            : `${capabilities.label} Required`}
        </Text>

        <Text style={styles.gateSubtitle}>
          {gateState === "no_biometric"
            ? capabilities.hasHardware && !capabilities.isEnrolled
              ? `Please enroll ${capabilities.label} in your device Settings → Security to access this area.`
              : "This device does not support biometric authentication."
            : `This area is protected. Use your ${capabilities.label} to continue.`}
        </Text>

        {/* Error feedback */}
        {authError !== "" && (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        {/* Attempts warning */}
        {attempts >= 2 && gateState === "locked" && (
          <View style={styles.warningBox}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#F59E0B"
            />
            <Text style={styles.warningText}>
              Multiple failed attempts. This area will lock after too many
              tries.
            </Text>
          </View>
        )}

        {/* Auth button */}
        {gateState === "locked" && (
          <TouchableOpacity style={styles.authBtn} onPress={triggerAuth}>
            {capabilities.primaryType === "facial" ? (
              <MaterialCommunityIcons
                name="face-recognition"
                size={20}
                color="#fff"
              />
            ) : (
              <Ionicons name="finger-print" size={20} color="#fff" />
            )}
            <Text style={styles.authBtnText}>
              Verify with {capabilities.label}
            </Text>
          </TouchableOpacity>
        )}

        {/* Fallback if no biometric enrolled */}
        {gateState === "no_biometric" && (
          <TouchableOpacity
            style={styles.backToSafetyBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backToSafetyText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8F7FF",
  },
  checkingText: { color: "#6B7280", fontSize: 14 },

  container: { flex: 1, backgroundColor: "#F8F7FF" },
  backBtn: {
    position: "absolute",
    top: 56,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  gateContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  gateTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  gateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    width: "100%",
  },
  errorText: { flex: 1, fontSize: 13, color: "#DC2626" },

  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    width: "100%",
  },
  warningText: { flex: 1, fontSize: 13, color: "#92400E" },

  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  authBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  backToSafetyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  backToSafetyText: { color: "#374151", fontSize: 15, fontWeight: "600" },
});
