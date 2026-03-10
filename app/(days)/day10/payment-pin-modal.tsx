import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

// Simulated stored payment PIN (in a real app, this would be in SecureStore)
const MOCK_PAYMENT_PIN = "123456";

interface PaymentPinModalProps {
  visible: boolean;
  amount?: string;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

const PIN_LENGTH = 6;

export default function PaymentPinModal({
  visible,
  amount,
  onSuccess,
  onCancel,
  title = "Enter Payment PIN",
  subtitle,
}: PaymentPinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(30);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setPin("");
      setError("");
    }
  }, [visible]);

  useEffect(() => {
    if (locked) {
      setLockTimer(30);
      timerRef.current = setInterval(() => {
        setLockTimer((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setLocked(false);
            setAttempts(0);
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [locked]);

  const handleKey = (key: string) => {
    if (locked) return;
    if (pin.length >= PIN_LENGTH) return;
    const newPin = pin + key;
    setPin(newPin);
    setError("");

    if (newPin.length === PIN_LENGTH) {
      validatePin(newPin);
    }
  };

  const handleDelete = () => {
    if (locked) return;
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const validatePin = (enteredPin: string) => {
    if (enteredPin === MOCK_PAYMENT_PIN) {
      setAttempts(0);
      setTimeout(() => {
        setPin("");
        onSuccess();
      }, 200);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      Vibration.vibrate(400);
      shake();

      if (newAttempts >= 3) {
        setLocked(true);
        setError("Too many attempts. Try again in 30s.");
      } else {
        setError(
          `Incorrect PIN. ${3 - newAttempts} attempt${3 - newAttempts === 1 ? "" : "s"} remaining.`,
        );
      }
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const KEYPAD = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.lockIconWrap}>
                <Ionicons name="lock-closed" size={20} color="#6C63FF" />
              </View>
              <Text style={styles.title}>{title}</Text>
              {amount && <Text style={styles.amount}>{amount}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* PIN Dots */}
          <Animated.View
            style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  pin.length > i && styles.dotFilled,
                  error && styles.dotError,
                ]}
              />
            ))}
          </Animated.View>

          {/* Error / Lock message */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : locked ? (
            <Text style={styles.lockText}>
              🔒 Locked — try again in {lockTimer}s
            </Text>
          ) : (
            <Text style={styles.hintText}>
              {PIN_LENGTH - pin.length > 0
                ? `Enter ${PIN_LENGTH}-digit payment PIN`
                : "Verifying..."}
            </Text>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {KEYPAD.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((key, ki) => {
                  if (key === "")
                    return <View key={ki} style={styles.keyEmpty} />;
                  if (key === "del") {
                    return (
                      <TouchableOpacity
                        key={ki}
                        style={styles.keyDel}
                        onPress={handleDelete}
                        disabled={locked}
                      >
                        <Ionicons
                          name="backspace-outline"
                          size={24}
                          color={locked ? "#D1D5DB" : "#374151"}
                        />
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={ki}
                      style={[styles.key, locked && styles.keyDisabled]}
                      onPress={() => handleKey(key)}
                      disabled={locked}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.keyText,
                          locked && styles.keyTextDisabled,
                        ]}
                      >
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <Text style={styles.footHint}>
            Hint: demo PIN is <Text style={{ fontWeight: "700" }}>123456</Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingTop: 8,
  },
  cancelBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  lockIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: "700", color: "#111827" },
  amount: { fontSize: 26, fontWeight: "800", color: "#6C63FF", marginTop: 2 },
  subtitle: { fontSize: 13, color: "#6B7280" },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "transparent",
  },
  dotFilled: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  dotError: { borderColor: "#EF4444" },

  errorText: {
    textAlign: "center",
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 16,
    fontWeight: "500",
  },
  lockText: {
    textAlign: "center",
    color: "#F59E0B",
    fontSize: 13,
    marginBottom: 16,
    fontWeight: "600",
  },
  hintText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 16,
  },

  keypad: { gap: 8 },
  keyRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  key: {
    width: 80,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  keyDisabled: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },
  keyEmpty: { width: 80, height: 64 },
  keyDel: {
    width: 80,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: { fontSize: 24, fontWeight: "600", color: "#111827" },
  keyTextDisabled: { color: "#D1D5DB" },
  footHint: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 16,
  },
});
