import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useState } from "react";

export type BiometricType = "fingerprint" | "facial" | "iris" | "none";

export interface BiometricCapabilities {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  securityLevel: LocalAuthentication.SecurityLevel;
  primaryType: BiometricType;
  label: string; // "Fingerprint", "Face ID", "Iris", etc.
}

export interface AuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

// Map expo AuthenticationType enum → friendly label
const getTypeLabel = (
  types: LocalAuthentication.AuthenticationType[],
): { label: string; primaryType: BiometricType } => {
  if (
    types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
  ) {
    return { label: "Face ID", primaryType: "facial" };
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return { label: "Iris Scanner", primaryType: "iris" };
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return { label: "Fingerprint", primaryType: "fingerprint" };
  }
  return { label: "Biometrics", primaryType: "none" };
};

export const useBiometrics = () => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    hasHardware: false,
    isEnrolled: false,
    supportedTypes: [],
    securityLevel: LocalAuthentication.SecurityLevel.NONE,
    primaryType: "none",
    label: "Biometrics",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    setLoading(true);
    try {
      const [hasHardware, isEnrolled, supportedTypes, securityLevel] =
        await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync(),
          LocalAuthentication.getEnrolledLevelAsync(),
        ]);

      const { label, primaryType } = getTypeLabel(supportedTypes);

      setCapabilities({
        hasHardware,
        isEnrolled,
        supportedTypes,
        securityLevel,
        primaryType,
        label,
      });
    } catch (e) {
      console.error("Failed to check biometric capabilities:", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * SCENARIO 1 — Simple biometric authentication (app unlock, view secrets)
   * Falls back to device PIN/passcode if biometrics fail
   */
  const authenticateSimple = async (reason: string): Promise<AuthResult> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: "Cancel",
        // disableDeviceFallback: false → allows PIN fallback automatically
        disableDeviceFallback: false,
      });

      if (result.success) return { success: true };

      // Handle specific errors
      const err = (result as any)
        .error as LocalAuthentication.LocalAuthenticationError;
      if (err === "user_cancel" || err === "app_cancel") {
        return { success: false, error: "Authentication cancelled" };
      }
      if (err === "lockout") {
        return {
          success: false,
          error: "Too many attempts. Try your PIN instead.",
          warning: "lockout",
        };
      }
      return { success: false, error: "Authentication failed" };
    } catch {
      return { success: false, error: "Authentication error" };
    }
  };

  /**
   * SCENARIO 2 — Payment/transaction authentication
   * Biometric ONLY — if it fails, we handle fallback to custom payment PIN ourselves
   * (like OPay — biometrics OR custom 6-digit payment PIN, NOT phone PIN)
   */
  const authenticateForPayment = async (
    amount: string,
  ): Promise<AuthResult> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Confirm payment of ${amount}`,
        cancelLabel: "Use Payment PIN",
        // disableDeviceFallback: true → WE handle fallback (custom payment PIN)
        disableDeviceFallback: true,
        biometricsSecurityLevel: "strong", // Android: Class 3 only (real fingerprint/face)
      });

      if (result.success) return { success: true };

      const err = (result as any)
        .error as LocalAuthentication.LocalAuthenticationError;

      // user_fallback = tapped "Use Payment PIN" → we show our custom PIN modal
      if (err === "user_cancel") {
        return { success: false, error: "user_fallback" };
      }
      if (err === "lockout") {
        return {
          success: false,
          error: "user_fallback",
          warning: "Too many biometric attempts. Using payment PIN.",
        };
      }
      return { success: false, error: "authentication_failed" };
    } catch {
      return { success: false, error: "error" };
    }
  };

  /**
   * SCENARIO 3 — Silent biometric check (no prompt shown to user)
   * Used to check if biometric is still valid before auto-filling
   */
  const authenticateSilent = async (): Promise<AuthResult> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Verify identity",
        disableDeviceFallback: true,
        cancelLabel: "Cancel",
      });
      return { success: result.success };
    } catch {
      return { success: false };
    }
  };

  /**
   * SCENARIO 4 — Cancel any ongoing authentication (Android only)
   */
  const cancelAuthentication = async () => {
    await LocalAuthentication.cancelAuthenticate();
  };

  return {
    capabilities,
    loading,
    checkCapabilities,
    authenticateSimple,
    authenticateForPayment,
    authenticateSilent,
    cancelAuthentication,
  };
};
