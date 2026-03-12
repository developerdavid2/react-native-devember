import BarcodeScanner from "@/components/core/day11/barcode-scanner";
import GalleryScreen from "@/components/core/day11/gallery-screen";
import SettingsPanel from "@/components/core/day11/settings-panel";
import {
  CapturedMedia,
  FLASH_CYCLE,
  FLASH_ICONS,
} from "@/components/core/day11/types";
import { Ionicons } from "@expo/vector-icons";
import {
  CameraMode,
  CameraType,
  CameraView,
  FlashMode,
  VideoQuality,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MODES: CameraMode[] = ["picture", "video"];
const MODE_LABELS = { picture: "PHOTO", video: "VIDEO" };

export default function CameraScreen() {
  const router = useRouter();
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const ref = useRef<CameraView>(null);

  // Media
  const [media, setMedia] = useState<CapturedMedia[]>([]);

  // Camera state
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [zoom, setZoom] = useState(0);
  const [recording, setRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  // Settings
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("1080p");
  const [enableTorch, setEnableTorch] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [mute, setMute] = useState(false);
  const [animateShutter, setAnimateShutter] = useState(true);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Animations
  const shutterScale = useRef(new Animated.Value(1)).current;
  const recordingPulse = useRef(new Animated.Value(1)).current;
  const focusOpacity = useRef(new Animated.Value(0)).current;
  const focusScale = useRef(new Animated.Value(1.5)).current;
  const zoomLabelOpacity = useRef(new Animated.Value(0)).current;
  const modeSlide = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (recording) {
      setRecordDuration(0);
      timerRef.current = setInterval(
        () => setRecordDuration((d) => d + 1),
        1000,
      );
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulse, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingPulse.stopAnimation();
      recordingPulse.setValue(1);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording, recordingPulse]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const animateShutterPress = () => {
    Animated.sequence([
      Animated.timing(shutterScale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(shutterScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showFocusIndicator = (x: number, y: number) => {
    setFocusPoint({ x, y });
    focusOpacity.setValue(1);
    focusScale.setValue(1.5);
    Animated.parallel([
      Animated.timing(focusScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(focusOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleTap = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    showFocusIndicator(locationX, locationY);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    // Show zoom label briefly
    zoomLabelOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(1200),
      Animated.timing(zoomLabelOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Pinch-to-zoom via PanResponder
  const lastDistance = useRef<number | null>(null);
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (_, gs) => gs.numberActiveTouches === 2,
    onMoveShouldSetPanResponder: (_, gs) => gs.numberActiveTouches === 2,
    onPanResponderMove: (e) => {
      const touches = e.nativeEvent.touches;
      if (touches.length < 2) return;
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (lastDistance.current !== null) {
        const delta = (distance - lastDistance.current) / SCREEN_WIDTH;
        const newZoom = Math.min(1, Math.max(0, zoom + delta));
        handleZoomChange(newZoom);
      }
      lastDistance.current = distance;
    },
    onPanResponderRelease: () => {
      lastDistance.current = null;
    },
  });

  const takePicture = async () => {
    animateShutterPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const photo = await ref.current?.takePictureAsync({ quality: 0.9 });
    if (photo?.uri) {
      const newMedia: CapturedMedia = {
        uri: photo.uri,
        type: "photo",
        timestamp: Date.now(),
        width: photo.width,
        height: photo.height,
      };
      setMedia((prev) => [newMedia, ...prev]);
      setLastPhoto(photo.uri);
    }
  };

  const toggleRecord = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
    } else {
      setRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const video = await ref.current?.recordAsync({
        maxDuration: 300,
      });
      if (video?.uri) {
        const newMedia: CapturedMedia = {
          uri: video.uri,
          type: "video",
          timestamp: Date.now(),
        };
        setMedia((prev) => [newMedia, ...prev]);
        setLastPhoto(video.uri);
        setRecording(false);
      }
    }
  };

  const cycleFlash = () => {
    const idx = FLASH_CYCLE.indexOf(flash);
    setFlash(FLASH_CYCLE[(idx + 1) % FLASH_CYCLE.length]);
  };

  const switchMode = (newMode: CameraMode) => {
    setMode(newMode);
    Animated.spring(modeSlide, {
      toValue: newMode === "picture" ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const handleDeleteMedia = (uri: string) => {
    setMedia((prev) => prev.filter((m) => m.uri !== uri));
    if (lastPhoto === uri) {
      const remaining = media.filter((m) => m.uri !== uri);
      setLastPhoto(remaining.length > 0 ? remaining[0].uri : null);
    }
  };

  // --- PERMISSIONS ---
  if (!camPermission) return <View style={styles.black} />;

  if (!camPermission.granted) {
    return (
      <View style={styles.permContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="camera-outline" size={64} color="#333" />
        <Text style={styles.permTitle}>Camera Access</Text>
        <Text style={styles.permSubtitle}>
          We need camera access to take photos and videos
        </Text>
        <TouchableOpacity
          style={styles.permBtn}
          onPress={async () => {
            await requestCamPermission();
            await requestMicPermission();
          }}
        >
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- GALLERY ---
  if (showGallery) {
    return <GalleryScreen media={media} onDelete={handleDeleteMedia} />;
  }

  // --- BARCODE ---
  if (showBarcode) {
    return <BarcodeScanner onClose={() => setShowBarcode(false)} />;
  }

  // --- MAIN CAMERA ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Camera */}
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={handleTap}
        {...panResponder.panHandlers}
      >
        <CameraView
          ref={ref}
          style={StyleSheet.absoluteFillObject}
          mode={mode}
          facing={facing}
          flash={flash}
          zoom={zoom}
          enableTorch={enableTorch}
          mirror={mirror}
          mute={mute}
          animateShutter={animateShutter}
          videoQuality={videoQuality}
          responsiveOrientationWhenOrientationLocked
        />
      </Pressable>

      {/* Focus indicator */}
      {focusPoint && (
        <Animated.View
          style={[
            styles.focusRing,
            {
              left: focusPoint.x - 30,
              top: focusPoint.y - 30,
              opacity: focusOpacity,
              transform: [{ scale: focusScale }],
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Zoom label */}
      <Animated.View
        style={[styles.zoomLabel, { opacity: zoomLabelOpacity }]}
        pointerEvents="none"
      >
        <Text style={styles.zoomLabelText}>
          {zoom < 0.01 ? "1×" : zoom < 0.04 ? "2×" : zoom < 0.09 ? "5×" : "10×"}
        </Text>
      </Animated.View>

      {/* Recording timer */}
      {recording && (
        <View style={styles.recordingBadge}>
          <View style={styles.recDot} />
          <Text style={styles.recTimer}>{formatDuration(recordDuration)}</Text>
        </View>
      )}

      {/* TOP BAR */}
      <SafeAreaView style={styles.topBar}>
        <View style={styles.topRow}>
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            {/* Flash */}
            <TouchableOpacity onPress={cycleFlash} style={styles.iconBtn}>
              <Ionicons
                name={FLASH_ICONS[flash] as any}
                size={22}
                color={flash === "on" ? "#FFD60A" : "#fff"}
              />
            </TouchableOpacity>

            {/* Torch */}
            <TouchableOpacity
              onPress={() => setEnableTorch((v) => !v)}
              style={styles.iconBtn}
            >
              <Ionicons
                name="flashlight"
                size={20}
                color={enableTorch ? "#FFD60A" : "#fff"}
              />
            </TouchableOpacity>

            {/* Barcode */}
            <TouchableOpacity
              onPress={() => setShowBarcode(true)}
              style={styles.iconBtn}
            >
              <Ionicons name="qr-code-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Settings */}
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={styles.iconBtn}
          >
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ZOOM BAR */}
      <View style={styles.zoomBar}>
        {[
          { label: "0.5×", zoom: 0 },
          { label: "1×", zoom: 0.0 },
          { label: "2×", zoom: 0.03 },
          { label: "5×", zoom: 0.08 },
        ].map((z) => (
          <TouchableOpacity
            key={z.label}
            onPress={() => handleZoomChange(z.zoom)}
            style={[
              styles.zoomBtn,
              Math.abs(zoom - z.zoom) < 0.01 && styles.zoomBtnActive,
            ]}
          >
            <Text
              style={[
                styles.zoomBtnText,
                Math.abs(zoom - z.zoom) < 0.01 && styles.zoomBtnTextActive,
              ]}
            >
              {z.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTTOM CONTROLS */}
      <View style={styles.bottomArea}>
        {/* Mode selector */}
        <View style={styles.modeRow}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => switchMode(m)}
              style={styles.modeBtn}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  mode === m && styles.modeBtnTextActive,
                ]}
              >
                {MODE_LABELS[m]}
              </Text>
              {mode === m && <View style={styles.modeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Shutter row */}
        <View style={styles.shutterRow}>
          {/* Gallery thumbnail */}
          <TouchableOpacity
            onPress={() => setShowGallery(true)}
            style={styles.thumbBtn}
          >
            {lastPhoto ? (
              <Image
                source={{ uri: lastPhoto }}
                style={styles.thumbPreview}
                contentFit="cover"
              />
            ) : (
              <View style={styles.thumbEmpty}>
                <Ionicons name="images-outline" size={20} color="#555" />
              </View>
            )}
            {media.length > 0 && (
              <View style={styles.mediaCount}>
                <Text style={styles.mediaCountText}>{media.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Shutter */}
          <Animated.View
            style={[
              styles.shutterOuter,
              mode === "video" && recording && styles.shutterOuterRecording,
              {
                transform: [
                  { scale: recording ? recordingPulse : shutterScale },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={mode === "picture" ? takePicture : toggleRecord}
              style={styles.shutterInner}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.shutterCore,
                  mode === "video" &&
                    (recording ? styles.shutterStop : styles.shutterRecord),
                ]}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Flip */}
          <TouchableOpacity
            onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
            style={styles.flipBtn}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </View>

      {/* Settings panel */}
      <SettingsPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        videoQuality={videoQuality}
        setVideoQuality={setVideoQuality}
        enableTorch={enableTorch}
        setEnableTorch={setEnableTorch}
        mirror={mirror}
        setMirror={setMirror}
        mute={mute}
        setMute={setMute}
        animateShutter={animateShutter}
        setAnimateShutter={setAnimateShutter}
        ratio="16:9"
        setRatio={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: "#000" },
  container: { flex: 1, backgroundColor: "#000" },

  // Permissions
  permContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  permTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 16,
  },
  permSubtitle: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  permBtn: {
    backgroundColor: "#FFD60A",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  permBtnText: { color: "#000", fontWeight: "800", fontSize: 15 },

  // Focus
  focusRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#FFD60A",
  },

  // Zoom label
  zoomLabel: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  zoomLabelText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Recording
  recordingBadge: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF453A",
  },
  recTimer: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  // Zoom bar
  zoomBar: {
    position: "absolute",
    bottom: 200,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  zoomBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  zoomBtnActive: {
    backgroundColor: "rgba(255,214,10,0.25)",
    borderWidth: 1,
    borderColor: "#FFD60A",
  },
  zoomBtnText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
  },
  zoomBtnTextActive: { color: "#FFD60A" },

  // Bottom
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingTop: 12,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 20,
  },
  modeBtn: { alignItems: "center", gap: 4 },
  modeBtnText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  modeBtnTextActive: { color: "#FFD60A" },
  modeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFD60A",
  },

  shutterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    marginBottom: 12,
  },

  thumbBtn: { position: "relative" },
  thumbPreview: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  thumbEmpty: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },
  mediaCount: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FFD60A",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaCountText: { color: "#000", fontSize: 10, fontWeight: "800" },

  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  shutterOuterRecording: {
    borderColor: "#FF453A",
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  shutterCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
  },
  shutterRecord: {
    backgroundColor: "#FF453A",
  },
  shutterStop: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#FF453A",
  },

  flipBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
});
