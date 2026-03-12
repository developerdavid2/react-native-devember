import { Ionicons } from "@expo/vector-icons";
import {
  BarcodeScanningResult,
  BarcodeType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

interface BarcodeScannerProps {
  onClose: () => void;
}

const BARCODE_TYPES: BarcodeType[] = [
  "qr",
  "ean13",
  "ean8",
  "code128",
  "code39",
  "pdf417",
  "aztec",
  "datamatrix",
  "upc_e",
];

export default function BarcodeScanner({ onClose }: BarcodeScannerProps) {
  const [permission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<BarcodeScanningResult | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Animate scan line
  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const handleBarcodeScanned = (res: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setResult(res);
    Vibration.vibrate(100);
  };

  const handleOpenUrl = (url: string) => {
    Linking.canOpenURL(url).then((can) => {
      if (can) Linking.openURL(url);
      else Alert.alert("Cannot Open", "This URL cannot be opened.");
    });
  };

  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permText}>Camera permission required</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
          onCameraReady={startScanAnimation}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}

      {/* Dark overlay with cutout feel */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanBox}>
            {/* Corner markers */}
            {["tl", "tr", "bl", "br"].map((corner) => (
              <View
                key={corner}
                style={[
                  styles.corner,
                  corner.includes("t") ? styles.cornerTop : styles.cornerBottom,
                  corner.includes("l") ? styles.cornerLeft : styles.cornerRight,
                ]}
              />
            ))}
            {/* Scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 220],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Scan Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.hint}>
        {scanned ? "" : "Align the code inside the frame"}
      </Text>

      {/* Result card */}
      {scanned && result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultTypeBadge}>
              <Text style={styles.resultTypeText}>
                {result.type.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setScanned(false);
                setResult(null);
              }}
              style={styles.rescanBtn}
            >
              <Ionicons name="refresh" size={18} color="#FFD60A" />
              <Text style={styles.rescanText}>Scan again</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.resultData} selectable>
            {result.data}
          </Text>

          {isUrl(result.data) && (
            <TouchableOpacity
              style={styles.openUrlBtn}
              onPress={() => handleOpenUrl(result.data)}
            >
              <Ionicons name="open-outline" size={16} color="#000" />
              <Text style={styles.openUrlText}>Open URL</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const BOX_SIZE = 240;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permText: { color: "#fff", textAlign: "center", marginTop: 100 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  overlayMiddle: {
    flexDirection: "row",
    height: BOX_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  overlayBottom: {
    flex: 2,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  scanBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    position: "relative",
    overflow: "hidden",
  },

  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#FFD60A",
    borderWidth: 3,
  },
  cornerTop: { top: 0 },
  cornerBottom: { bottom: 0 },
  cornerLeft: {
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerRight: {
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },

  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#FFD60A",
    shadowColor: "#FFD60A",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },

  topBar: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  hint: {
    position: "absolute",
    bottom: "42%",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },

  resultCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTypeBadge: {
    backgroundColor: "#FFD60A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultTypeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  rescanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rescanText: { color: "#FFD60A", fontSize: 13, fontWeight: "600" },
  resultData: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  openUrlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFD60A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  openUrlText: { color: "#000", fontSize: 14, fontWeight: "700" },
});
