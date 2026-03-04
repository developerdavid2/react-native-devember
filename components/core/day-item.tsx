import { Link, RelativePathString } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface DayItemProps {
  day: number;
}
export default function DayItem({ day }: DayItemProps) {
  return (
    <Link href={`/(days)/day${day + 1}` as RelativePathString} asChild>
      <Pressable style={styles.box}>
        <Text style={styles.text}>{day + 1}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#F9EDE3",
    flex: 1,
    aspectRatio: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#9b4521",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#9b4521",
    fontSize: 50,
    fontFamily: "Inter",
  },
});
