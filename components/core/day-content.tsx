// components/core/day-content.tsx
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Markdown from "react-native-markdown-display";
import RenderHtml, { MixedStyleDeclaration } from "react-native-render-html";

interface DayContentProps {
  content: string;
  isHtml?: boolean;
  footer?: React.ReactNode;
}

export default function DayContent({
  content,
  isHtml = false,
  footer,
}: DayContentProps) {
  const { width } = useWindowDimensions();

  // 👇 override the image rule to fix the key spread bug in react-native-markdown-display
  const renderRules = {
    image: (node: any, children: any, parent: any, styles: any) => (
      <Image
        key={node.key} // 👈 pass key directly, not via spread
        source={{ uri: node.attributes.src }}
        accessible={true}
        accessibilityLabel={node.attributes.alt}
        style={styles.image ?? markdownStyles.image}
        resizeMode="cover"
      />
    ),
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {isHtml ? (
        <RenderHtml
          contentWidth={width - 32}
          source={{ html: content }}
          tagsStyles={htmlStyles}
        />
      ) : (
        <Markdown
          style={markdownStyles}
          rules={renderRules} // 👈 pass the fixed rules
          onLinkPress={(url) => {
            Linking.openURL(url);
            return true;
          }}
        >
          {content}
        </Markdown>
      )}
      {footer}
    </ScrollView>
  );
}

const htmlStyles: Record<string, MixedStyleDeclaration> = {
  h1: {
    fontSize: 36,
    fontWeight: "bold" as const,
    color: "#1a1a2e",
    marginBottom: 8,
  },
  h2: {
    fontSize: 26,
    fontWeight: "bold" as const,
    color: "#16213e",
    marginTop: 20,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#0f3460",
    marginTop: 16,
  },
  p: { fontSize: 16, color: "#333", lineHeight: 26 },
  strong: { fontWeight: "bold" as const, color: "#1a1a2e" },
  em: { fontStyle: "italic" as const, color: "#555" },
  a: { color: "#0077cc", textDecorationLine: "underline" as const },
  blockquote: {
    backgroundColor: "#f0f4ff",
    paddingLeft: 16,
    marginVertical: 12,
  },
  code: {
    backgroundColor: "#f4f4f4",
    color: "#e83e8c",
    fontFamily: "monospace",
    fontSize: 14,
  },
  pre: {
    backgroundColor: "#1e1e2e",
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  li: { fontSize: 16, color: "#333", lineHeight: 26 },
};

const markdownStyles = StyleSheet.create({
  heading1: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginTop: 24,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
    lineHeight: 40,
  },
  heading2: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#16213e",
    marginTop: 20,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f3460",
    marginTop: 16,
    marginBottom: 4,
  },
  heading4: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
  },
  body: { fontSize: 16, color: "#333", lineHeight: 26 },
  paragraph: { marginBottom: 12, lineHeight: 26 },
  strong: { fontWeight: "bold", color: "#1a1a2e" },
  em: { fontStyle: "italic", color: "#555" },
  s: { textDecorationLine: "line-through", color: "#999" },
  link: { color: "#0077cc", textDecorationLine: "underline" },
  blockquote: {
    backgroundColor: "#f0f4ff",
    borderLeftWidth: 4,
    borderLeftColor: "#0077cc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 12,
    borderRadius: 4,
  },
  code_inline: {
    backgroundColor: "#f4f4f4",
    color: "#e83e8c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 14,
  },
  fence: {
    backgroundColor: "#1e1e2e",
    color: "#cdd6f4",
    padding: 16,
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 22,
    marginVertical: 12,
  },
  bullet_list: { marginVertical: 8 },
  ordered_list: { marginVertical: 8 },
  list_item: { marginBottom: 6, flexDirection: "row" },
  bullet_list_icon: {
    color: "#0077cc",
    fontSize: 18,
    marginRight: 8,
    lineHeight: 26,
  },
  ordered_list_icon: {
    color: "#0077cc",
    fontWeight: "bold",
    marginRight: 8,
    lineHeight: 26,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginVertical: 12,
    overflow: "hidden",
  },
  thead: { backgroundColor: "#0077cc" },
  th: { color: "#fff", fontWeight: "bold", padding: 10, fontSize: 14 },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
  },
  td: { padding: 10, fontSize: 14, color: "#333" },
  hr: { backgroundColor: "#e0e0e0", height: 1, marginVertical: 16 },
  // 👇 image style used by our custom render rule
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
} as any);

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 16, paddingBottom: 40 },
});
