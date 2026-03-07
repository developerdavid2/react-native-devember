// constants/days/day3.ts
export const day3Content = `# Day 3 — Markdown Rendering

Today we explored rendering **Markdown** in React Native using \`react-native-markdown-display\`.

---

## What We Built

A fully styled markdown renderer that handles every possible markdown element — headings, lists, tables, code blocks, images, links and more.

![React Native Logo](https://reactnative.dev/img/tiny_logo.png)

---

## Libraries Used

| Library | Purpose |
|---|---|
| \`react-native-markdown-display\` | Render markdown |
| \`Linking\` | Open URLs from links |

---

## Every Markdown Element

### Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading

---

### Text Formatting

This is **bold**, this is _italic_, and this is ~~strikethrough~~.

This is **_bold and italic_** combined.

This is \`inline code\` inside a sentence.

---

### Blockquotes

> This is a blockquote. Great for highlighting important notes.

> **Nested:**
>> This is nested inside the blockquote.

---

### Lists

Unordered:

- Item one
- Item two
  - Nested item A
  - Nested item B
    - Deeply nested

Ordered:

1. First step
   1. Sub step one
   2. Sub step two
2. Second step
3. Third step

---

### Code Blocks

\`\`\`tsx
import { Text, View } from "react-native";

export default function App() {
  return (
    <View>
      <Text>Hello World</Text>
    </View>
  );
}
\`\`\`

\`\`\`bash
npx create-expo-app my-app
cd my-app
npx expo start
\`\`\`

---

### Tables

| Component | Description |
|---|---|
| \`View\` | Basic container, like a div |
| \`Text\` | Displays text |
| \`Image\` | Displays images |
| \`ScrollView\` | Scrollable container |
| \`FlatList\` | Performant list rendering |

---

### Images

![Expo Banner](https://docs.expo.dev/static/images/og.png)

---

### Links

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated)
- [Markdown Display](https://github.com/nickcoutsos/react-native-markdown-display)

---

## Key Concepts

### Escaping Backticks in Template Literals

\`\`\`tsx
// ❌ Breaks the string
const copy = \`Use \`\`\`bash to start a code block\`\`\`\`;

// ✅ Escape backticks with backslash
const copy = \`Use \\\`\\\`\\\`bash to start a code block\\\`\\\`\\\`\`;
\`\`\`

### Handling Link Presses

\`\`\`tsx
<Markdown
  onLinkPress={(url) => {
    Linking.openURL(url);
    return true;   // return true to indicate you handled it
  }}
>
  {content}
</Markdown>
\`\`\`

### Styling Markdown Elements

\`\`\`tsx
const markdownStyles = StyleSheet.create({
  heading1: { fontSize: 36, fontWeight: "bold" },
  code_inline: { backgroundColor: "#f4f4f4", color: "#e83e8c" },
  fence: { backgroundColor: "#1e1e2e", color: "#cdd6f4" },
  blockquote: { borderLeftWidth: 4, borderLeftColor: "#0077cc" },
} as any); // 'as any' needed due to incomplete TS types
\`\`\`

---

## Key Takeaways

- Escape backticks with \`\\\`\` inside template literals
- Use \`ScrollView\` not \`View\` — markdown content is always long
- \`onLinkPress\` must return \`true\` to prevent default behaviour
- Cast markdown styles \`as any\` to avoid TypeScript complaints
- Every markdown element has a corresponding style key you can override

> "Plain text is powerful. Markdown makes it beautiful."
`;
