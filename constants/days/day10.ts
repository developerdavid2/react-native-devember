export const day10Content = `# Day 10 — Biometric Authentication

Today we built a **comprehensive biometric authentication system** covering every real-world scenario — from app locking to OPay-style payment confirmation with a custom PIN fallback.

---

## What We Built

A full biometric experience covering:

- Device capability detection (hardware, enrollment, security level)
- Settings screen with toggles that **require biometric verification to change**
- Payment flow with biometric → custom PIN fallback (like OPay/Kuda)
- Route-level biometric gate (protected layout)
- Custom 6-digit payment PIN modal with lockout logic

---

## File Structure

\`\`\`
app/(days)/day10/
├── index.tsx              ← Main screen (payments + app lock demo)
├── settings.tsx           ← Biometric settings with toggles
├── useBiometrics.ts       ← Custom hook (all API calls)
├── PaymentPinModal.tsx    ← Custom 6-digit payment PIN modal
└── protected/
    ├── _layout.tsx        ← Biometric gate (blocks route access)
    └── index.tsx          ← Secret content behind the gate
\`\`\`

---

## Libraries Used

| Library | Purpose |
|---|---|
| \`expo-local-authentication\` | Biometric hardware access |
| \`@react-native-async-storage/async-storage\` | Persist biometric settings |
| \`react-native-reanimated\` | Gate screen entrance animations |

---

## Key Concepts

### 1. Always Check Capabilities First

Before showing any biometric UI, check three things in parallel:

\`\`\`tsx
const [hasHardware, isEnrolled, supportedTypes, securityLevel] =
  await Promise.all([
    LocalAuthentication.hasHardwareAsync(),       // does hardware exist?
    LocalAuthentication.isEnrolledAsync(),         // has user set it up?
    LocalAuthentication.supportedAuthenticationTypesAsync(), // fingerprint / face / iris?
    LocalAuthentication.getEnrolledLevelAsync(),   // NONE / SECRET / BIOMETRIC_WEAK / BIOMETRIC_STRONG
  ]);
\`\`\`

Never assume a device has biometrics. Always guard UI with \`hasHardware && isEnrolled\`.

---

### 2. Two Different Auth Strategies

The most important distinction is \`disableDeviceFallback\`:

\`\`\`tsx
// SCENARIO A — App lock / viewing secrets
// disableDeviceFallback: false → system handles fallback to device PIN automatically
await LocalAuthentication.authenticateAsync({
  promptMessage: "Verify your identity",
  disableDeviceFallback: false, // ← OS takes over if biometrics fail
});

// SCENARIO B — Payment confirmation (OPay style)
// disableDeviceFallback: true → WE handle fallback with our own custom PIN
await LocalAuthentication.authenticateAsync({
  promptMessage: "Confirm payment of ₦500",
  cancelLabel: "Use Payment PIN", // ← tapping this returns error: "user_cancel"
  disableDeviceFallback: true,    // ← we catch the cancel and show our own PIN modal
  biometricsSecurityLevel: "strong", // Android only: Class 3 biometrics (real fingerprint)
});
\`\`\`

---

### 3. Reading the Auth Result

\`authenticateAsync\` returns \`{ success: boolean }\` on success, or an error string on failure:

\`\`\`tsx
const result = await LocalAuthentication.authenticateAsync({ ... });

if (result.success) {
  // ✅ authenticated
} else {
  const err = result.error; // LocalAuthenticationError string

  switch (err) {
    case "user_cancel":    // user tapped cancel / "Use Payment PIN"
    case "lockout":        // too many failed attempts → show PIN fallback
    case "not_enrolled":   // biometrics not set up → redirect to device settings
    case "authentication_failed": // wrong finger/face
  }
}
\`\`\`

---

### 4. OPay-Style Payment Flow

\`\`\`
User taps "Pay ₦500"
        ↓
paymentBiometricEnabled? ──NO──→ Show PaymentPinModal directly
        ↓ YES
authenticateAsync({ disableDeviceFallback: true, cancelLabel: "Use Payment PIN" })
        ↓
  result.success ──────────────→ ✅ Transaction confirmed via biometrics
        ↓ failed
  error === "user_cancel" ─────→ Show PaymentPinModal (user chose PIN)
  error === "lockout" ─────────→ Show PaymentPinModal (too many biometric attempts)
  other errors ────────────────→ ❌ Show error message
\`\`\`

The key insight: **your app owns the fallback** when \`disableDeviceFallback: true\`. The OS biometric prompt's cancel button becomes your "Use Payment PIN" trigger.

---

### 5. Protecting a Route with a Biometric Gate

Wrapping a layout with a biometric check means every screen inside is protected:

\`\`\`tsx
// app/(days)/day10/protected/_layout.tsx
export default function BiometricProtectedLayout() {
  const [gateState, setGateState] = useState<"checking" | "locked" | "unlocked">("checking");

  useEffect(() => {
    if (!capabilities.isEnrolled) {
      setGateState("no_biometric"); // show helpful message
    } else {
      triggerAuth(); // auto-trigger on mount
    }
  }, [capabilities]);

  if (gateState === "unlocked") return <Slot />; // ✅ show child screens
  return <LockScreen onRetry={triggerAuth} />;   // 🔒 show gate
}
\`\`\`

Any screen added inside \`/protected/\` is automatically gated — no extra code needed per screen.

---

### 6. Security Settings Need Biometric Verification Too

Toggling security settings should itself require verification — otherwise anyone with the unlocked phone can disable biometrics:

\`\`\`tsx
const handleToggle = async (key: string, value: boolean) => {
  // Verify before allowing the change
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: value ? \`Enable \${label}\` : \`Disable \${label}\`,
  });

  if (result.success) {
    updateSetting(key, value); // only update if verified
  }
};
\`\`\`

---

### 7. Custom Payment PIN — Lockout Pattern

Real payment apps lock after N wrong attempts. Implement with a counter + timer:

\`\`\`tsx
const validatePin = (entered: string) => {
  if (entered === CORRECT_PIN) {
    onSuccess();
  } else {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    Vibration.vibrate(400); // haptic feedback
    shake();                // animation

    if (newAttempts >= 3) {
      setLocked(true);      // lock for 30 seconds
    }
  }
};
\`\`\`

---

## Authentication Types by Device

\`supportedAuthenticationTypesAsync()\` returns an array — devices can support multiple:

| Value | Constant | Biometric |
|---|---|---|
| \`1\` | \`FINGERPRINT\` | Fingerprint / Touch ID |
| \`2\` | \`FACIAL_RECOGNITION\` | Face ID / Face Unlock |
| \`3\` | \`IRIS\` | Iris Scanner |

\`\`\`tsx
// Example: Samsung Galaxy S with both fingerprint and iris
supportedTypes = [1, 3] // FINGERPRINT + IRIS

// iPhone with Face ID
supportedTypes = [2] // FACIAL_RECOGNITION
\`\`\`

---

## Security Level Reference

\`getEnrolledLevelAsync()\` tells you how strong the enrolled authentication is:

| Level | Meaning |
|---|---|
| \`NONE\` | No lock set up at all |
| \`SECRET\` | PIN / Pattern / Password only |
| \`BIOMETRIC_WEAK\` | Class 2 biometrics (camera face unlock) |
| \`BIOMETRIC_STRONG\` | Class 3 biometrics (fingerprint, 3D face) |

For payment apps, you should require at least \`BIOMETRIC_STRONG\` or fall back to your own payment PIN.

---

## Key Takeaways

- Always check \`hasHardware\` AND \`isEnrolled\` before showing biometric UI — never assume
- \`disableDeviceFallback: false\` = OS manages fallback (good for app lock)
- \`disableDeviceFallback: true\` = you manage fallback (good for payments with custom PIN)
- The cancel button label (\`cancelLabel\`) becomes your "Use Payment PIN" trigger
- Protect security toggle changes with biometric verification too
- \`supportedAuthenticationTypesAsync\` returns an array — show the right icon per device
- Wrap routes in a layout gate to protect entire sections of the app

> "The OS shows the biometric prompt. Your app decides what happens when it fails." — the key mental model
`;
