import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CapturedMedia } from "./types";

const { width } = Dimensions.get("window");
const THUMB_SIZE = (width - 4) / 3;

interface GalleryScreenProps {
  media: CapturedMedia[];
  onDelete: (uri: string) => void;
}

export default function GalleryScreen({ media, onDelete }: GalleryScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<CapturedMedia | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedUris, setSelectedUris] = useState<Set<string>>(new Set());

  const toggleSelect = (uri: string) => {
    const next = new Set(selectedUris);
    if (next.has(uri)) next.delete(uri);
    else next.add(uri);
    setSelectedUris(next);
    if (next.size === 0) setSelectionMode(false);
  };

  const handleLongPress = (item: CapturedMedia) => {
    setSelectionMode(true);
    toggleSelect(item.uri);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      "Delete",
      `Delete ${selectedUris.size} item${selectedUris.size > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            selectedUris.forEach((uri) => onDelete(uri));
            setSelectedUris(new Set());
            setSelectionMode(false);
          },
        },
      ],
    );
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Group by date
  const grouped = media.reduce<Record<string, CapturedMedia[]>>((acc, item) => {
    const key = formatDate(item.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const sections = Object.entries(grouped);

  if (media.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          onBack={() => router.back()}
          selectionMode={false}
          selectedCount={0}
          onDeleteSelected={() => {}}
          onCancelSelection={() => {}}
        />
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={64} color="#333" />
          <Text style={styles.emptyTitle}>No Photos or Videos</Text>
          <Text style={styles.emptySubtitle}>
            Start capturing to see your media here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Header
        onBack={() => router.back()}
        selectionMode={selectionMode}
        selectedCount={selectedUris.size}
        onDeleteSelected={handleDeleteSelected}
        onCancelSelection={() => {
          setSelectionMode(false);
          setSelectedUris(new Set());
        }}
      />

      <FlatList
        data={sections}
        keyExtractor={([date]) => date}
        renderItem={({ item: [date, items] }) => (
          <View>
            <Text style={styles.dateLabel}>{date}</Text>
            <View style={styles.grid}>
              {items.map((m) => {
                const isSelected = selectedUris.has(m.uri);
                return (
                  <TouchableOpacity
                    key={m.uri}
                    style={[styles.thumb, isSelected && styles.thumbSelected]}
                    onPress={() => {
                      if (selectionMode) toggleSelect(m.uri);
                      else setSelected(m);
                    }}
                    onLongPress={() => handleLongPress(m)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: m.uri }}
                      style={styles.thumbImage}
                      contentFit="cover"
                    />
                    {/* Video badge */}
                    {m.type === "video" && (
                      <View style={styles.videoBadge}>
                        <Ionicons name="play" size={10} color="#fff" />
                      </View>
                    )}
                    {/* Selection overlay */}
                    {selectionMode && (
                      <View
                        style={[
                          styles.selectOverlay,
                          isSelected && styles.selectOverlayActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#FFD60A"
                          />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      />

      {/* Full screen viewer */}
      <Modal
        visible={!!selected}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.viewer}>
          <SafeAreaView style={styles.viewerHeader}>
            <TouchableOpacity
              onPress={() => setSelected(null)}
              style={styles.viewerClose}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (selected) {
                  Alert.alert("Delete", "Delete this item?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        onDelete(selected.uri);
                        setSelected(null);
                      },
                    },
                  ]);
                }
              }}
              style={styles.viewerDelete}
            >
              <Ionicons name="trash-outline" size={22} color="#FF453A" />
            </TouchableOpacity>
          </SafeAreaView>

          {selected?.type === "photo" ? (
            <Image
              source={{ uri: selected.uri }}
              style={styles.viewerImage}
              contentFit="contain"
            />
          ) : selected?.uri ? (
            <Video
              source={{ uri: selected.uri }}
              style={styles.viewerImage}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          ) : null}

          <View style={styles.viewerFooter}>
            <Text style={styles.viewerMeta}>
              {selected ? formatDate(selected.timestamp) : ""}
            </Text>
            <View style={styles.viewerTypeBadge}>
              <Ionicons
                name={selected?.type === "video" ? "videocam" : "camera"}
                size={12}
                color="#FFD60A"
              />
              <Text style={styles.viewerTypeText}>
                {selected?.type === "video" ? "Video" : "Photo"}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const Header = ({
  onBack,
  selectionMode,
  selectedCount,
  onDeleteSelected,
  onCancelSelection,
}: {
  onBack: () => void;
  selectionMode: boolean;
  selectedCount: number;
  onDeleteSelected: () => void;
  onCancelSelection: () => void;
}) => (
  <View style={styles.headerRow}>
    {selectionMode ? (
      <>
        <TouchableOpacity onPress={onCancelSelection}>
          <Text style={styles.headerCancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedCount} selected</Text>
        <TouchableOpacity
          onPress={onDeleteSelected}
          disabled={selectedCount === 0}
        >
          <Ionicons
            name="trash-outline"
            size={22}
            color={selectedCount > 0 ? "#FF453A" : "#444"}
          />
        </TouchableOpacity>
      </>
    ) : (
      <>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gallery</Text>
        <View style={{ width: 40 }} />
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  emptySubtitle: { color: "#555", fontSize: 14 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#111",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerCancel: { color: "#FFD60A", fontSize: 15, fontWeight: "500" },
  backBtn: { padding: 4 },

  dateLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    paddingHorizontal: 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    position: "relative",
  },
  thumbSelected: { opacity: 0.7 },
  thumbImage: { width: "100%", height: "100%" },
  videoBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 4,
  },
  selectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 6,
  },
  selectOverlayActive: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  // Viewer
  viewer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  viewerHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  viewerClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerDelete: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: { width: "100%", height: "100%" },
  viewerFooter: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  viewerMeta: { color: "#888", fontSize: 13 },
  viewerTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  viewerTypeText: { color: "#FFD60A", fontSize: 12, fontWeight: "600" },
});
