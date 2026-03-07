import DayContent from "@/components/core/day-content";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Tab = "edit" | "preview";

const initialContent = `# Getting Started with React Native

React Native lets you build **mobile apps** using _JavaScript_ and React.

## Why React Native?

- Cross-platform: write once, run on **iOS** and **Android**
- Large ecosystem of libraries
- Hot reloading for fast development

> Always use StyleSheet.create() instead of inline styles.

\`\`\`bash
npx create-expo-app my-app
\`\`\`

This is **bold**, this is _italic_, and this is ~~strikethrough~~.
`;

export default function EditorScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("edit");
  const [content, setContent] = useState(initialContent);

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "edit" && styles.tabActive]}
          onPress={() => setActiveTab("edit")}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={activeTab === "edit" ? "#0077cc" : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "edit" && styles.tabTextActive,
            ]}
          >
            Edit
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "preview" && styles.tabActive]}
          onPress={() => setActiveTab("preview")}
        >
          <Ionicons
            name="eye-outline"
            size={18}
            color={activeTab === "preview" ? "#0077cc" : "#999"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "preview" && styles.tabTextActive,
            ]}
          >
            Preview
          </Text>
        </Pressable>
      </View>

      {/* Edit Tab — plain TextInput, type raw markdown */}
      {activeTab === "edit" && (
        <ScrollView
          style={styles.editorScroll}
          contentContainerStyle={styles.editorContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            placeholder="Write your markdown here..."
            placeholderTextColor="#aaa"
          />
        </ScrollView>
      )}

      {/* Preview Tab — renders markdown */}
      {activeTab === "preview" && (
        <View style={styles.previewContainer}>
          {content ? (
            <DayContent content={content} />
          ) : (
            <View style={styles.emptyPreview}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                Start writing markdown to see a preview
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#0077cc",
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#0077cc",
    fontWeight: "600",
  },
  editorScroll: {
    flex: 1,
    backgroundColor: "#1e1e2e", // 👈 dark background like a code editor
  },
  editorContent: {
    padding: 16,
    flexGrow: 1,
  },
  textInput: {
    flex: 1,
    color: "#cdd6f4", // 👈 light text on dark background
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  previewContainer: {
    flex: 1,
  },
  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
